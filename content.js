// Request caching
const requestCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cached fetch function
async function fetchWithCache(url, options = {}) {
  const cacheKey = url + JSON.stringify(options);
  const cached = requestCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Using cached response for:', url);
    return cached.data;
  }
  
  const response = await fetch(url, options);
  const data = await response.text();
  
  requestCache.set(cacheKey, { data, timestamp: Date.now() });
  
  // Cleanup old cache entries
  if (requestCache.size > 50) {
    const oldestKey = requestCache.keys().next().value;
    requestCache.delete(oldestKey);
  }
  
  return data;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeBarcodeLookup') {
    scrapeBarcodeLookup(request.upc)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'scrapeUPCItemDB') {
    scrapeUPCItemDB(request.upc)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function scrapeBarcodeLookup(upc) {
  try {
    const url = `https://www.barcodelookup.com/${upc}`;
    console.log(`Fetching BarcodeLookup: ${url}`);
    
    const html = await fetchWithCache(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!html) {
      throw new Error(`No response received from BarcodeLookup`);
    }

    return parseBarcodeLookupHTML(html, upc);
  } catch (error) {
    console.error('BarcodeLookup scraping error:', error);
    throw new Error(`Failed to scrape BarcodeLookup: ${error.message}`);
  }
}

async function scrapeUPCItemDB(upc) {
  console.log(`Searching UPCItemDB for UPC: ${upc}`);
  
  // Try the API first with timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const apiUrl = `https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`;
    console.log(`Trying API: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log('UPCItemDB API response received');
      
      if (data.items && data.items.length > 0) {
        console.log('Found product via API');
        return { source: 'api', data: data.items[0] };
      } else if (data.code === 'INVALID_UPC' || data.message) {
        console.log('API returned invalid UPC or error:', data.message);
        throw new Error(data.message || 'Product not found in UPCItemDB database');
      } else {
        console.log('API returned no items');
        throw new Error('No product information found in UPCItemDB database');
      }
    } else {
      throw new Error(`API request failed: ${response.status}`);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out - UPCItemDB API is not responding');
    }
    if (error.message.includes('Product not found') || error.message.includes('Invalid UPC')) {
      throw error;
    }
    console.log('UPCItemDB API failed, trying web scraping:', error.message);
  }

  // Fallback to web scraping
  try {
    const webUrl = `https://www.upcitemdb.com/upc/${upc}`;
    console.log(`Trying web scraping: ${webUrl}`);
    
    const html = await fetchWithCache(webUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    const parsedData = parseUPCItemDBHTML(html, upc);
    return { source: 'web', data: parsedData };
  } catch (error) {
    if (error.message && (
        error.message.includes('Product not found') || 
        error.message.includes('Invalid UPC') ||
        error.message.includes('No product information found') ||
        error.message.includes('not found in database')
      )) {
      console.info('UPCItemDB: Product not found -', error.message);
    } else {
      console.error('UPCItemDB search error:', error);
    }
    throw new Error(`UPCItemDB lookup failed: ${error.message}`);
  }
}

function parseBarcodeLookupHTML(html, upc) {
  console.log('Parsing BarcodeLookup HTML, length:', html.length);
  
  // Check for explicit error conditions
  const hasExplicitError = html.includes('No product found') || 
                          html.includes('Product does not exist') || 
                          html.includes('Invalid UPC') ||
                          html.includes('Sorry, we could not find any product');
  
  const hasProductData = html.includes('Brand:') || 
                        html.includes('Manufacturer:') ||
                        html.includes('Category:') ||
                        html.includes('Available at:') ||
                        html.includes('Product Information');
  
  if (hasExplicitError && !hasProductData) {
    throw new Error('Product not found in BarcodeLookup database');
  }

  // Use the optimized parser
  try {
    // Load the parsing utilities if not already loaded
    if (typeof ProductParser === 'undefined') {
      // Fallback to basic parsing if utilities not available
      return parseBarcodeLookupBasic(html, upc);
    }
    
    return ProductParser.parseHTML(html, upc, 'barcodelookup');
  } catch (error) {
    console.error('Error using ProductParser, falling back to basic parsing:', error);
    return parseBarcodeLookupBasic(html, upc);
  }
}

function parseUPCItemDBHTML(html, upc) {
  console.log('Parsing UPCItemDB HTML, length:', html.length);
  
  // Check for error messages
  const hasInvalidUPCMessage = html.includes('was incorrect or invalid') || 
                              html.includes('please enter a valid upc number') ||
                              html.includes('currently has no record in our database') ||
                              html.includes('UPC not found');
  
  if (hasInvalidUPCMessage) {
    throw new Error('Product not found in UPCItemDB database');
  }

  const hasRealProduct = html.includes('Product Information') ||
                        html.includes('Brand:') ||
                        html.includes('Category:') ||
                        html.includes('Manufacturer:');
  
  if (!hasRealProduct) {
    throw new Error('Product not found in UPCItemDB database');
  }

  // Use the optimized parser
  try {
    if (typeof ProductParser === 'undefined') {
      return parseUPCItemDBBasic(html, upc);
    }
    
    return ProductParser.parseHTML(html, upc, 'upcitemdb');
  } catch (error) {
    console.error('Error using ProductParser, falling back to basic parsing:', error);
    return parseUPCItemDBBasic(html, upc);
  }
}

// Basic fallback parsers (simplified versions of original logic)
function parseBarcodeLookupBasic(html, upc) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
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
  
  // Basic title extraction
  const titleSelectors = ['h4', 'h1', '.product-title', '[itemprop="name"]'];
  for (const selector of titleSelectors) {
    const element = doc.querySelector(selector);
    if (element && element.textContent.trim().length > 10) {
      product.title = element.textContent.trim();
      break;
    }
  }
  
  // Basic image extraction
  const img = doc.querySelector('img[src*="product"], .product-image img, img[alt*="product"]');
  if (img && img.src) {
    product.image = img.src;
  }
  
  // Basic description extraction
  const desc = doc.querySelector('.product-description, [class*="description"]');
  if (desc) {
    product.description = desc.textContent.trim();
  }
  
  // Extract size
  product.size = extractSizeFromText(product.title + ' ' + product.description);
  
  return product;
}

function parseUPCItemDBBasic(html, upc) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const product = {
    title: '',
    brand: '',
    category: '',
    size: '',
    description: '',
    image: ''
  };
  
  // Basic extraction
  const title = doc.querySelector('h1, .product-title, [class*="title"]');
  if (title) product.title = title.textContent.trim();
  
  const img = doc.querySelector('img.product, img[src*="product"], .product-image img');
  if (img) product.image = img.src;
  
  product.size = extractSizeFromText(product.title);
  
  return product;
}

function extractSizeFromText(text) {
  if (!text) return '';
  
  const patterns = [
    /(\d+(?:\.\d+)?)\s*(lb|lbs|pound|pounds|oz|ounce|ounces|kg|g|gram|grams|fl\s*oz|gal|gallon|ml|l|liter)\b/gi
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  
  return '';
}

// Cleanup cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      requestCache.delete(key);
    }
  }
}, 60000); // Cleanup every minute
