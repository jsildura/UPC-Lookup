class ProgressiveLoader {
  constructor() {
    this.loadingStates = new Map();
    this.observers = new Map();
    this.loadQueue = new Set();
  }

  showSkeleton(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const skeletonHTML = `
      <div class="progressive-loading" data-stage="skeleton">
        <div class="product-display">
          <div class="product-image-container">
            <div class="skeleton skeleton-image"></div>
          </div>
          <div class="product-details">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width: 80%;"></div>
            <div class="skeleton skeleton-text" style="width: 60%;"></div>
          </div>
        </div>
        <div style="margin-top: 20px;">
          <div class="skeleton skeleton-text" style="width: 90%;"></div>
          <div class="skeleton skeleton-text" style="width: 70%;"></div>
        </div>
      </div>
    `;

    container.innerHTML = skeletonHTML;
    this.loadingStates.set(containerId, 'skeleton');
  }

  // Progressive content rendering
  renderProgressively(containerId, productData, upc, siteType) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear skeleton
    container.innerHTML = '';
    this.loadingStates.set(containerId, 'rendering');

    // Create sections that will load progressively
    const sections = this.createProductSections(productData, upc, siteType);
    
    // Render sections with staggered timing
    this.renderSectionsProgressively(container, sections);
  }

  createProductSections(product, upc, siteType) {
    const sections = [];

    // Header section (highest priority)
    if (siteType === 'barcodelookup') {
      sections.push({
        priority: 1,
        html: `
          <div class="barcode-header product-section">
            <h2 class="upc-title">UPC ${upc}</h2>
          </div>
          ${product.title ? `
          <div class="product-title-section product-section">
            <h3 class="product-title-main">${product.title}</h3>
          </div>
          ` : ''}
        `
      });
    }

    // Main product display (high priority)
    sections.push({
      priority: 2,
      html: this.createMainProductHTML(product, siteType)
    });

    // Description section (medium priority)
    if (product.description) {
      sections.push({
        priority: 3,
        html: this.createDescriptionHTML(product, siteType)
      });
    }

    // Attributes section (low priority)
    if (product.attributes && product.attributes.length > 0) {
      sections.push({
        priority: 4,
        html: this.createAttributesHTML(product.attributes)
      });
    }

    // Store information (low priority)
    if (product.stores && product.stores.length > 0) {
      sections.push({
        priority: 5,
        html: this.createStoresHTML(product.stores)
      });
    }

    // Footer links (lowest priority)
    sections.push({
      priority: 6,
      html: this.createFooterHTML(upc, siteType)
    });

    return sections.sort((a, b) => a.priority - b.priority);
  }

  createMainProductHTML(product, siteType) {
    const title = siteType === 'barcodelookup' ? '' : `<h3 class="product-title">${product.title}</h3>`;
    
    return `
      <div class="product-display product-section">
        <div class="product-image-container">
          ${product.image ? 
            `<img src="${product.image}" alt="${product.title}" class="product-image" 
                  loading="lazy" 
                  onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <div class="no-image" style="display: none;">No image available</div>` : 
            `<div class="no-image">No image available</div>`}
        </div>
        <div class="product-details${siteType === 'barcodelookup' ? '-right' : ''}">
          ${title}
          <div class="product-meta">
            ${product.brand ? `<div class="meta-item"><span class="meta-label">Brand:</span><span class="meta-value">${product.brand}</span></div>` : ''}
            ${product.category ? `<div class="meta-item"><span class="meta-label">Category:</span><span class="meta-value">${product.category}</span></div>` : ''}
            ${product.size ? `<div class="meta-item"><span class="meta-label">Size:</span><span class="meta-value">${product.size}</span></div>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  createDescriptionHTML(product, siteType) {
    if (siteType === 'barcodelookup') {
      return `
        <div class="info-section product-section">
          <h4 class="section-title">Description:</h4>
          <div class="section-content">
            <div class="product-description-text">${product.description}</div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="product-description product-section">
          <div class="description-title">Description</div>
          <div class="description-text">${product.description}</div>
        </div>
      `;
    }
  }

  createAttributesHTML(attributes) {
    return `
      <div class="info-section product-section">
        <h4 class="section-title">Attributes:</h4>
        <div class="section-content">
          <ul class="attributes-list">
            ${attributes.map(attr => `<li class="attribute-item">${attr}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  createStoresHTML(stores) {
    return `
      <div class="stores-section product-section">
        <div class="stores-title">Available at:</div>
        ${stores.map(store => `
          <div class="store-item">
            <span class="store-name">${store}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  createFooterHTML(upc, siteType) {
    const siteUrl = siteType === 'barcodelookup' ? 
      `https://www.barcodelookup.com/${upc}` : 
      `https://www.upcitemdb.com/upc/${upc}`;
    const siteName = siteType === 'barcodelookup' ? 'BarcodeLookup.com' : 'UPCItemDB.com';

    return `
      <div class="additional-info product-section">
        <div class="info-item">
          <span class="info-label">Source:</span>
          <span class="info-value">
            <a href="${siteUrl}" target="_blank">View on ${siteName}</a>
          </span>
        </div>
      </div>
    `;
  }

  renderSectionsProgressively(container, sections) {
    let delay = 0;
    const baseDelay = 100; // 100ms between sections

    sections.forEach((section, index) => {
      setTimeout(() => {
        const sectionDiv = document.createElement('div');
        sectionDiv.innerHTML = section.html;
        sectionDiv.className = 'progressive-loading';
        
        container.appendChild(sectionDiv);
        
        // Trigger animation
        requestAnimationFrame(() => {
          sectionDiv.classList.add('loaded');
        });

        // Make images clickable after rendering
        if (section.html.includes('product-image')) {
          this.makeImagesClickable();
        }

        // Update size badge if this section contains size info
        if (section.html.includes('Size:')) {
          this.updateSizeBadge(container, section.html);
        }
      }, delay);
      
      delay += baseDelay;
    });

    // Mark as completed
    setTimeout(() => {
      this.loadingStates.set(container.id, 'completed');
    }, delay + 100);
  }

  updateSizeBadge(container, html) {
    // Extract size from HTML and update badge
    const sizeMatch = html.match(/Size:<\/span><span class="meta-value">([^<]+)</);
    if (sizeMatch) {
      const size = sizeMatch[1];
      const containerId = container.id;
      
      let badgeId;
      if (containerId === 'barcodeLookupContent') {
        badgeId = 'barcodeSize';
      } else if (containerId === 'upcItemDbContent') {
        badgeId = 'upcItemDbSize';
      }
      
      if (badgeId) {
        const badge = document.getElementById(badgeId);
        if (badge) {
          badge.textContent = size;
          badge.style.display = 'block';
        }
      }
    }
  }

  makeImagesClickable() {
    // Add click handlers to all product images that don't have them
    const productImages = document.querySelectorAll('.product-image:not([data-clickable])');
    productImages.forEach(img => {
      img.setAttribute('data-clickable', 'true');
      img.addEventListener('click', function() {
        const caption = this.alt || 'Product Image';
        if (window.openImageModal) {
          window.openImageModal(this.src, caption);
        }
      });
    });
  }

  // Show error with progressive styling
  showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const errorHTML = `
      <div class="progressive-loading" data-stage="error">
        <div class="error fade-in">
          ${message}
        </div>
      </div>
    `;

    container.innerHTML = errorHTML;
    
    // Trigger animation
    requestAnimationFrame(() => {
      const errorDiv = container.querySelector('.progressive-loading');
      if (errorDiv) {
        errorDiv.classList.add('loaded');
      }
    });

    this.loadingStates.set(containerId, 'error');
  }

  // Optimized loading with intersection observer
  observeImageLoading() {
    if (!('IntersectionObserver' in window)) return;

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Load high-res image if available
          const highResSrc = this.getHighResolutionImageUrl(img.src);
          if (highResSrc !== img.src) {
            const highResImg = new Image();
            highResImg.onload = () => {
              img.src = highResSrc;
            };
            highResImg.src = highResSrc;
          }
          
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });

    // Observe all product images
    const images = document.querySelectorAll('.product-image[loading="lazy"]');
    images.forEach(img => imageObserver.observe(img));
    
    this.observers.set('images', imageObserver);
  }

  getHighResolutionImageUrl(thumbnailUrl) {
    if (!thumbnailUrl) return thumbnailUrl;

    // BarcodeLookup images
    if (thumbnailUrl.includes('barcodelookup.com')) {
      return thumbnailUrl
        .replace(/\/thumbs\//, '/images/')
        .replace(/_thb\.jpg$/, '.jpg')
        .replace(/\?.*$/, '');
    }
    
    // eBay images
    if (thumbnailUrl.includes('ebayimg.com')) {
      return thumbnailUrl.replace(/\$_[0-9]+\.jpg$/, '$_57.jpg');
    }
    
    // Generic improvements
    return thumbnailUrl
      .replace(/\/thumbs?\//, '/images/')
      .replace(/_thumb|_small|_sm\./g, '.')
      .replace(/\?.*$/, '');
  }

  // Cleanup method
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.loadingStates.clear();
    this.loadQueue.clear();
  }

  // Get loading state
  getLoadingState(containerId) {
    return this.loadingStates.get(containerId) || 'idle';
  }

  // Check if container is currently loading
  isLoading(containerId) {
    const state = this.getLoadingState(containerId);
    return ['skeleton', 'rendering'].includes(state);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProgressiveLoader;
} else if (typeof window !== 'undefined') {
  window.ProgressiveLoader = ProgressiveLoader;
}
