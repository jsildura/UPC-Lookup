// Background service worker for UPC Barcode Lookup Extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('UPC Barcode Lookup Extension installed');
  
  // Create context menu item for quick UPC lookup
  try {
    chrome.contextMenus.create({
      id: "lookupUPC",
      title: "Lookup UPC: %s",
      contexts: ["selection"]
    });
  } catch (error) {
    console.log('Context menu creation failed:', error);
  }

  // Create a periodic alarm for cache cleanup (every 1 minute)
  try {
    chrome.alarms.create('cleanupExpiredCache', { periodInMinutes: 1 });
  } catch (e) {
    console.warn('[BG] Failed to create cleanup alarm onInstalled:', e);
  }

  // Set badge background color once
  try { chrome.action.setBadgeBackgroundColor({ color: '#0366d6' }); } catch (_) {}
});

// Also ensure alarm exists on service worker startup
chrome.runtime.onStartup?.addListener(() => {
  try {
    chrome.alarms.create('cleanupExpiredCache', { periodInMinutes: 1 });
  } catch (e) {
    console.warn('[BG] Failed to create cleanup alarm onStartup:', e);
  }
  // Ensure badge background color is set
  try { chrome.action.setBadgeBackgroundColor({ color: '#0366d6' }); } catch (_) {}
});

// Remove expired cache entries when the alarm fires
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'cleanupExpiredCache') return;
  try {
    const now = Date.now();
    const all = await chrome.storage.local.get(null);
    const toRemove = [];
    Object.entries(all).forEach(([key, value]) => {
      if (!key.startsWith('search_')) return;
      const expiredByExpiresAt = value && value.expiresAt && value.expiresAt < now;
      const expiredByTimestamp = value && value.timestamp && (now - value.timestamp) >= (3 * 60 * 1000);
      if (expiredByExpiresAt || expiredByTimestamp) {
        toRemove.push(key);
      }
    });
    if (toRemove.length > 0) {
      await chrome.storage.local.remove(toRemove);
      console.log(`[BG] Removed ${toRemove.length} expired cache entries`);
    }

    // Update extension icon badge based on remaining cache entries
    try {
      const remaining = await chrome.storage.local.get(null);
      const hasAny = Object.keys(remaining).some(k => k.startsWith('search_'));
      await chrome.action.setBadgeText({ text: hasAny ? 'C' : '' });
    } catch (e) {
      console.warn('[BG] Failed to update badge text:', e);
    }
  } catch (e) {
    console.warn('[BG] Error during periodic cache cleanup:', e);
  }
});

// Handle any background tasks if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchData') {
    // Handle cross-origin requests if needed
    fetch(request.url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    .then(response => response.text())
    .then(data => sendResponse({ success: true, data }))
    .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // Keep the message channel open for async response
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "lookupUPC") {
    const selectedText = info.selectionText.replace(/\D/g, ''); // Extract numbers only
    if (selectedText.length >= 8) {
      // Store the UPC to be used by the popup
      chrome.storage.local.set({ 'selectedUPC': selectedText });
      // Note: chrome.action.openPopup() is not available in service workers
      // User will need to click the extension icon manually
    }
  }
});
