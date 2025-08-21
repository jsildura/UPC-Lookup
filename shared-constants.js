
// API Endpoints
export const API_ENDPOINTS = {
  BARCODE_LOOKUP: 'https://www.barcodelookup.com/',
  UPC_ITEM_DB: 'https://api.upcitemdb.com/prod/trial/lookup',
  // Add other API endpoints here
};

// Message Types
export const MESSAGE_TYPES = {
  FETCH_DATA: 'fetchData',
  SCRAPE_BARCODE_LOOKUP: 'scrapeBarcodeLookup',
  SCRAPE_UPC_ITEM_DB: 'scrapeUPCItemDB',
  SEARCH_HISTORY_UPDATED: 'searchHistoryUpdated',
  // Add other message types here
};

// Cache Settings
export const CACHE_SETTINGS = {
  TTL: 5 * 60 * 1000, // 5 minutes
  MAX_ITEMS: 50,
};

// Validation Rules
export const VALIDATION_RULES = {
  UPC: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 13,
    REGEX: /^\d{8,13}$/,
  },
  // Add other validation rules here
};

// UI Constants
export const UI = {
  MAX_SEARCH_HISTORY: 10,
  IMAGE_ZOOM: {
    MIN_SCALE: 1,
    MAX_SCALE: 3,
  },
  // Add other UI constants here
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_UPC: 'Please enter a valid UPC (8-13 digits)',
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  NOT_FOUND: 'Product not found in database',
  // Add other error messages here
};

// Export for both ES modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    API_ENDPOINTS,
    MESSAGE_TYPES,
    CACHE_SETTINGS,
    VALIDATION_RULES,
    UI,
    ERROR_MESSAGES,
  };
}
