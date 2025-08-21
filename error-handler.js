// Import shared modules using dynamic imports
let ERROR_MESSAGES;

// Initialize modules
(async () => {
  try {
    const constants = await import('./shared-constants.js');
    ERROR_MESSAGES = constants.ERROR_MESSAGES;
  } catch (error) {
    console.error('Failed to initialize error handler dependencies:', error);
    throw error;
  }
})();

class ErrorHandler {
  static handle(error, context = '') {
    // Log the error with context
    console.error(`[${context}]`, error);
    
    // Extract a user-friendly message
    const userMessage = this.getUserFriendlyMessage(error);
    
    // Show error to user (implementation depends on context)
    this.showErrorToUser(userMessage, context);
    
    // Return a standardized error object
    return {
      success: false,
      error: error.message || error.toString(),
      userMessage,
      context,
      timestamp: new Date().toISOString()
    };
  }
  
  static getUserFriendlyMessage(error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    
    // Handle specific error messages
    if (error.message && error.message.includes('not found')) {
      return ERROR_MESSAGES.NOT_FOUND;
    }
    
    // Default to the error message or a generic error
    return error.message || 'An unexpected error occurred';
  }
  
  static showErrorToUser(message, context = '') {
    // In a popup context, show in the UI
    if (context === 'popup') {
      const errorElement = document.getElementById('error-message');
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        // Auto-hide after 5 seconds
        setTimeout(() => {
          errorElement.style.display = 'none';
        }, 5000);
      }
    }
    
    // In background context, could show a notification
    if (context === 'background' && chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'UPC Lookup Error',
        message: message
      });
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
} else if (typeof window !== 'undefined') {
  window.ErrorHandler = ErrorHandler;
}
