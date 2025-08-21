// Import shared modules using dynamic imports
let MESSAGE_TYPES, ErrorHandler;

// Initialize modules
(async () => {
  try {
    const constants = await import('./shared-constants.js');
    MESSAGE_TYPES = constants.MESSAGE_TYPES;
    
    const errorHandlerModule = await import('./error-handler.js');
    ErrorHandler = errorHandlerModule.ErrorHandler;
  } catch (error) {
    console.error('Failed to initialize message bus dependencies:', error);
    throw error;
  }
})();

class MessageBus {
  constructor() {
    this.handlers = new Map();
    this.initializeMessageListeners();
  }

  /**
   * Initialize message listeners for different contexts
   */
  initializeMessageListeners() {
    // Handle messages from popup to background
    if (chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        this.handleMessage(message, sender, sendResponse);
        return true; // Keep the message channel open for async response
      });
    }

    // Handle messages from content scripts
    if (chrome.runtime && chrome.runtime.onMessageExternal) {
      chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
        this.handleMessage(message, sender, sendResponse);
        return true;
      });
    }
  }

  /**
   * Register a message handler
   * @param {string} type - Message type from MESSAGE_TYPES
   * @param {Function} handler - Function to handle the message
   */
  on(type, handler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type).push(handler);
  }

  /**
   * Send a message to a specific target
   * @param {string} target - 'background', 'content', or 'popup'
   * @param {Object} message - Message to send
   * @returns {Promise} Resolves with the response
   */
  send(target, message) {
    return new Promise((resolve, reject) => {
      try {
        if (target === 'background') {
          chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          });
        } else if (target === 'content') {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
              chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
                if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
                } else {
                  resolve(response);
                }
              });
            } else {
              reject(new Error('No active tab found'));
            }
          });
        } else {
          reject(new Error(`Invalid target: ${target}`));
        }
      } catch (error) {
        reject(ErrorHandler.handle(error, 'message-bus'));
      }
    });
  }

  /**
   * Handle incoming messages
   * @private
   */
  async handleMessage(message, sender, sendResponse) {
    try {
      if (!message || !message.type) {
        throw new Error('Invalid message format');
      }

      const handlers = this.handlers.get(message.type) || [];
      
      if (handlers.length === 0) {
        console.warn(`No handlers registered for message type: ${message.type}`);
        sendResponse({ success: false, error: 'No handler for message type' });
        return;
      }

      // Call all handlers for this message type
      const results = await Promise.all(
        handlers.map(handler => 
          Promise.resolve(handler(message, sender))
            .catch(error => ErrorHandler.handle(error, `handler-${message.type}`))
        )
      );

      // Send the last non-error result as the response
      const lastResult = results.filter(r => r && !r.error).pop();
      sendResponse(lastResult || { success: false, error: 'No successful handlers' });
    } catch (error) {
      const errorResponse = ErrorHandler.handle(error, 'message-handler');
      sendResponse(errorResponse);
    }
  }
}

// Create a singleton instance
const messageBus = new MessageBus();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = messageBus;
} else if (typeof window !== 'undefined') {
  window.messageBus = messageBus;
}
