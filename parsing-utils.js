class DOMCache {
  constructor(doc) {
    this.doc = doc;
    this.cache = new Map();
    this.initializeCache();
  }

  initializeCache() {
    // Cache commonly used elements once
    this.cache.set('titles', this.doc.querySelectorAll('h1, h2, h3, h4, .product-title, [itemprop="name"], .item-title, .product-name'));
    this.cache.set('images', this.doc.querySelectorAll('img[src]:not([src*="logo"]):not([src*="icon"])'));
    this.cache.set('descriptions', this.doc.querySelectorAll('.product-description, [class*="description"], .description, .product-info, .product-details, .product-text'));
    this.cache.set('brands', this.doc.querySelectorAll('[itemprop="brand"], .brand, .manufacturer, [class*="brand"], [class*="manufacturer"]'));
    this.cache.set('categories', this.doc.querySelectorAll('.category, [class*="category"], .product-category'));
    this.cache.set('allText', this.doc.querySelectorAll('div, p, span'));
  }

  get(selector) {
    if (this.cache.has(selector)) {
      return this.cache.get(selector);
    }
    
    const elements = this.doc.querySelectorAll(selector);
    this.cache.set(selector, elements);
    return elements;
  }

  cleanup() {
    this.cache.clear();
    this.doc = null;
  }
}

class ProductParser {
  static parseHTML(html, upc, siteType) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const domCache = new DOMCache(doc);
    
    try {
      const product = this.extractProductData(domCache, upc, siteType);
      return product;
    } finally {
      domCache.cleanup();
    }
  }

  static extractProductData(domCache, upc, siteType) {
    const product = {
      title: '',
      image: '',
      description: '',
      brand: '',
      category: '',
      size: '',
      stores: [],
      attributes: []
    };

    // Extract data using cached DOM queries
    product.title = this.extractTitle(domCache, siteType);
    product.image = this.extractImage(domCache, siteType);
    product.description = this.extractDescription(domCache, siteType);
    product.brand = this.extractBrand(domCache);
    product.category = this.extractCategory(domCache);
    
    if (siteType === 'barcodelookup') {
      product.attributes = this.extractAttributes(domCache);
    }
    
    // Extract size from combined text
    const sizeText = `${product.title} ${product.description}`;
    product.size = this.extractSize(sizeText);
    
    product.stores = this.extractStores(domCache);

    return product;
  }

  static extractTitle(domCache, siteType) {
    const titleElements = domCache.get('titles');
    
    // Site-specific title extraction logic
    if (siteType === 'barcodelookup') {
      // BarcodeLookup often uses h4 for product titles
      const h4Elements = Array.from(titleElements).filter(el => el.tagName === 'H4');
      for (const element of h4Elements) {
        const title = this.validateTitle(element.textContent);
        if (title) return title;
      }
    }
    
    // Common title extraction
    for (const element of titleElements) {
      const title = this.validateTitle(element.textContent);
      if (title) return title;
    }
    
    return '';
  }

  static extractImage(domCache, siteType) {
    const imageElements = domCache.get('images');
    
    if (siteType === 'upcitemdb') {
      // UPCItemDB specific selectors
      const specificImages = domCache.get('.main-img img.product, img.product, img[class*="product"]');
      for (const img of specificImages) {
        if (this.isValidImage(img.src)) return img.src;
      }
    }
    
    // Common image extraction
    for (const img of imageElements) {
      if (this.isValidImage(img.src)) return img.src;
    }
    
    return '';
  }

  static extractDescription(domCache, siteType) {
    if (siteType === 'barcodelookup') {
      // BarcodeLookup specific description extraction
      const productLabels = domCache.get('.product-text-label');
      for (const label of productLabels) {
        if (label.textContent.includes('Description:')) {
          const descSpan = label.querySelector('.product-text');
          if (descSpan) {
            return descSpan.textContent.trim();
          }
        }
      }
    }
    
    // Common description extraction
    const descElements = domCache.get('descriptions');
    for (const element of descElements) {
      const desc = this.validateDescription(element.textContent);
      if (desc) return desc;
    }
    
    // Fallback: look for any substantial text
    const allElements = domCache.get('allText');
    for (const element of allElements) {
      const text = element.textContent?.trim();
      if (this.isLongDescription(text)) {
        return text;
      }
    }
    
    return '';
  }

  static extractBrand(domCache) {
    const brandElements = domCache.get('brands');
    for (const element of brandElements) {
      const brand = element.textContent?.trim();
      if (brand && brand.length > 1) return brand;
    }
    return '';
  }

  static extractCategory(domCache) {
    const categoryElements = domCache.get('categories');
    for (const element of categoryElements) {
      const category = element.textContent?.trim();
      if (category && category.length > 1) return category;
    }
    return '';
  }

  static extractAttributes(domCache) {
    const attributes = [];
    const attributeLabels = domCache.get('.product-text-label');
    
    for (const label of attributeLabels) {
      if (label.textContent.includes('Attributes:')) {
        const attributesList = label.querySelector('#product-attributes');
        if (attributesList) {
          const items = attributesList.querySelectorAll('li.product-text span');
          for (const item of items) {
            const attr = item.textContent?.trim();
            if (attr) attributes.push(attr);
          }
          break;
        }
      }
    }
    
    return attributes;
  }

  static extractStores(domCache) {
    const stores = [];
    const storeElements = domCache.get('.store, .retailer, [class*="price"], .store-info, .store-item');
    
    for (const element of storeElements) {
      const storeText = element.textContent?.trim();
      if (storeText && (storeText.includes('$') || storeText.toLowerCase().includes('store'))) {
        stores.push(storeText);
      }
    }
    
    return stores;
  }

  // Validation methods
  static validateTitle(text) {
    if (!text) return null;
    
    const cleaned = text.trim();
    const invalid = [
      'barcode lookup', 'upcitemdb', 'home page', 'search',
      'error', 'edit product', 'write a review'
    ];
    
    if (cleaned.length <= 10 || 
        cleaned.startsWith('UPC ') ||
        invalid.some(term => cleaned.toLowerCase().includes(term))) {
      return null;
    }
    
    return cleaned;
  }

  static isValidImage(src) {
    return src && 
           src.length > 10 &&
           !src.includes('placeholder') &&
           !src.includes('data:image') &&
           src.startsWith('http');
  }

  static validateDescription(text) {
    if (!text) return null;
    
    const cleaned = text.trim();
    if (cleaned.length < 50) return null;
    
    const invalid = ['barcode', 'upc', 'attributes', 'manufacturer'];
    if (invalid.some(term => cleaned.toLowerCase().includes(term))) {
      return null;
    }
    
    const positive = ['nutrition', 'food', 'provide', 'essential', 'complete'];
    if (positive.some(term => cleaned.toLowerCase().includes(term))) {
      return cleaned;
    }
    
    return null;
  }

  static isLongDescription(text) {
    if (!text || text.length < 100 || text.length > 1000) return false;
    
    const positive = ['nutrition', 'puppy', 'food', 'provide', 'essential', 'complete'];
    const negative = ['barcode', 'upc', 'attributes', 'manufacturer'];
    
    return positive.some(term => text.toLowerCase().includes(term)) &&
           !negative.some(term => text.toLowerCase().includes(term));
  }

  static extractSize(text) {
    if (!text) return '';

    // Prioritized size patterns
    const patterns = [
      // Weight units (highest priority)
      /(\d+(?:\.\d+)?)\s*-?\s*(lb|lbs|pound|pounds)\b/gi,
      /(\d+(?:\.\d+)?)\s*-?\s*(oz|ounce|ounces)\b/gi,
      /(\d+(?:\.\d+)?)\s*-?\s*(kg|kilogram|kilograms)\b/gi,
      /(\d+(?:\.\d+)?)\s*-?\s*(g|gram|grams)\b/gi,
      
      // Fluid volume units
      /(\d+(?:\.\d+)?)\s*-?\s*(fl\s*oz|fluid\s*ounce|fl\.?\s*oz\.?)\b/gi,
      /(\d+(?:\.\d+)?)\s*-?\s*(gal|gallon|gallons)\b/gi,
      /(\d+(?:\.\d+)?)\s*-?\s*(pt|pint|pints)\b/gi,
      /(\d+(?:\.\d+)?)\s*-?\s*(qt|quart|quarts)\b/gi,
      
      // Other units
      /(\d+(?:\.\d+)?)\s*-?\s*(ml|milliliter|milliliters)\b/gi,
      /(\d+(?:\.\d+)?)\s*-?\s*(cl|centiliter|centiliters)\b/gi,
      /(\d+(?:\.\d+)?)\s*-?\s*(count|ct|pack|pk)\b/gi,
      /(\d+(?:\.\d+)?)\s*-?\s*(l|liter|liters|litre|litres)\b/gi
    ];

    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        return matches[0][0].trim();
      }
    }

    return '';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProductParser, DOMCache };
} else if (typeof window !== 'undefined') {
  window.ProductParser = ProductParser;
  window.DOMCache = DOMCache;
}
