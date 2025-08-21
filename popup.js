window.addEventListener('error', (event) => {
  try {
    const { message, filename, lineno, colno, error } = event;
    console.error('[GLOBAL ERROR][popup]', {
      message,
      filename,
      lineno,
      colno,
      stack: error && error.stack ? error.stack : '(no stack)'
    });
  } catch {}
});

window.addEventListener('unhandledrejection', (event) => {
  try {
    const reason = event.reason || {};
    console.error('[UNHANDLED REJECTION][popup]', {
      message: reason.message || String(reason),
      stack: reason.stack || '(no stack)',
      reason
    });
  } catch {}
});

try {
  window.addEventListener('error', (event) => {
    const { message, filename, lineno, colno, error } = event;
    console.error('[GLOBAL ERROR][popup]', {
      message,
      filename,
      lineno,
      colno,
      stack: error && error.stack ? error.stack : '(no stack)'
    });
  });
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason || {};
    console.error('[UNHANDLED REJECTION][popup]', {
      message: reason.message || String(reason),
      stack: reason.stack || '(no stack)',
      reason
    });
  });
} catch {}

document.addEventListener('DOMContentLoaded', () => {
  (function() {
    const _0x4a2b = [
      String.fromCharCode(74, 111, 101, 108, 105, 116, 111),
      String.fromCharCode(83, 105, 108, 100, 117, 114, 97),
      String.fromCharCode(67, 114, 101, 97, 116, 101, 100, 32, 98, 121, 32),
      'authorInfo',
      'textContent',
      'getElementById'
    ];
    
    try {
      const authorName = _0x4a2b[0] + ' ' + _0x4a2b[1];
      document[_0x4a2b[5]](_0x4a2b[3])[_0x4a2b[4]] = _0x4a2b[2] + authorName;
    } catch (e) {}
  })();

  // Theme: initialization and toggle
  (function() {
    const THEME_KEY = 'themePreference';

    const getSystemTheme = () => (
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark' : 'light'
    );

    const applyTheme = (theme, animate = false) => {
      const t = theme === 'dark' ? 'dark' : 'light';
      const root = document.documentElement;

      // Graceful animated transition
      if (animate) {
        root.classList.add('theme-transition');
        requestAnimationFrame(() => {
          root.setAttribute('data-theme', t);
          // Cleanup after animation
          clearTimeout(window.__themeTransitionTimer);
          window.__themeTransitionTimer = setTimeout(() => {
            root.classList.remove('theme-transition');
          }, 450);
        });
      } else {
        root.setAttribute('data-theme', t);
      }

      const btn = document.getElementById('themeToggleBtn');
      if (btn) btn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
    };

    const getSavedTheme = () => new Promise(resolve => {
      try {
        chrome.storage?.local?.get([THEME_KEY], (result) => resolve(result?.[THEME_KEY] || null));
      } catch {
        resolve(null);
      }
    });

    const saveTheme = (theme) => {
      try { chrome.storage?.local?.set?.({ [THEME_KEY]: theme }); } catch {}
    };

    async function initTheme() {
      const saved = await getSavedTheme();

      const initial = saved || 'light';

      applyTheme(initial, false);
      if (!saved) saveTheme(initial);

      const btn = document.getElementById('themeToggleBtn');
      if (btn) {
        btn.addEventListener('click', () => {
          const current = document.documentElement.getAttribute('data-theme') || getSystemTheme();
          const next = current === 'dark' ? 'light' : 'dark';
          applyTheme(next, true);
          saveTheme(next);
        });
      }

      if (!saved && window.matchMedia) {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (e) => applyTheme(e.matches ? 'dark' : 'light', true);
        try { mql.addEventListener('change', onChange); } catch { mql.addListener(onChange); }
      }
    }

    initTheme();
  })();

  // Modal Image Viewer Functions with Enhanced Zoom
  function initializeImageModal() {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    const closeBtn = document.querySelector('.modal-close');

    let isZooming = false;
    let currentScale = 1;
    let maxScale = 3;
    let minScale = 1;
    let zoomListenersAdded = false;

    // Store event listener references for cleanup
    let mouseMoveHandler, clickHandler, wheelHandler, dblClickHandler;

    // Function to open modal with image
    window.openImageModal = async function(imageSrc, caption) {
      modal.style.display = 'flex';
      modalImage.style.display = 'none';
      modalImage.classList.add('loading');
      modalCaption.textContent = 'Loading full resolution...';

      currentScale = 1;
      isZooming = false;
      

      document.body.style.overflow = 'hidden';
      
      try {
      
        const fullImageUrl = await getFullResolutionImageUrl(imageSrc);
        
        const img = new Image();
        img.onload = () => {
          modalImage.src = fullImageUrl;
          modalImage.style.display = 'block';
          modalImage.classList.remove('loading');
          modalCaption.textContent = caption || 'Product Image';
          setupImageZoom();
        };
        img.onerror = () => {
          modalImage.src = imageSrc;
          modalImage.style.display = 'block';
          modalImage.classList.remove('loading');
          modalCaption.textContent = caption || 'Product Image';
          setupImageZoom();
        };
        img.src = fullImageUrl;
      } catch (error) {
        console.error('Error loading full resolution image:', error);
        modalImage.src = imageSrc;
        modalImage.style.display = 'block';
        modalImage.classList.remove('loading');
        modalCaption.textContent = caption || 'Product Image';
        setupImageZoom();
      }
    };

    // Enhanced zoom functionality
    function setupImageZoom() {
      if (zoomListenersAdded) {
        modalImage.removeEventListener('mousemove', mouseMoveHandler);
        modalImage.removeEventListener('click', clickHandler);
        modalImage.removeEventListener('wheel', wheelHandler);
        modalImage.removeEventListener('dblclick', dblClickHandler);
      }

      modalImage.style.cursor = 'zoom-in';
      modalImage.style.transition = 'transform 0.3s ease, cursor 0.1s';
      modalImage.style.transformOrigin = 'center center';

      mouseMoveHandler = function(e) {
        if (!isZooming) return;
        
        const rect = modalImage.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        modalImage.style.transformOrigin = `${x}% ${y}%`;
        modalImage.style.transform = `scale(${currentScale})`;
      };

      clickHandler = function(e) {
        e.stopPropagation();
        
        if (currentScale === minScale) {
          // Zoom in to mouse position
          const rect = modalImage.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          
          currentScale = maxScale;
          isZooming = true;
          modalImage.style.cursor = 'zoom-out';
          modalImage.style.transformOrigin = `${x}% ${y}%`;
          modalImage.style.transform = `scale(${currentScale})`;
        } else {
          // Zoom out
          currentScale = minScale;
          isZooming = false;
          modalImage.style.cursor = 'zoom-in';
          modalImage.style.transformOrigin = 'center center';
          modalImage.style.transform = `scale(${currentScale})`;
        }
      };

      wheelHandler = function(e) {
        e.preventDefault();
        
        const rect = modalImage.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        const zoomSpeed = 0.1;
        const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
        
        currentScale = Math.max(minScale, Math.min(maxScale, currentScale + delta));
        
        if (currentScale > minScale) {
          isZooming = true;
          modalImage.style.cursor = 'zoom-out';
          modalImage.style.transformOrigin = `${x}% ${y}%`;
        } else {
          isZooming = false;
          modalImage.style.cursor = 'zoom-in';
          modalImage.style.transformOrigin = 'center center';
        }
        
        modalImage.style.transform = `scale(${currentScale})`;
      };

      dblClickHandler = function(e) {
        e.stopPropagation();
        
        const rect = modalImage.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        if (currentScale === minScale) {
          currentScale = maxScale;
          isZooming = true;
          modalImage.style.cursor = 'zoom-out';
          modalImage.style.transformOrigin = `${x}% ${y}%`;
        } else {
          currentScale = minScale;
          isZooming = false;
          modalImage.style.cursor = 'zoom-in';
          modalImage.style.transformOrigin = 'center center';
        }
        
        modalImage.style.transform = `scale(${currentScale})`;
      };

      // Add event listeners
      modalImage.addEventListener('mousemove', mouseMoveHandler);
      modalImage.addEventListener('click', clickHandler);
      modalImage.addEventListener('wheel', wheelHandler);
      modalImage.addEventListener('dblclick', dblClickHandler);
      
      zoomListenersAdded = true;
    }
    
    // Function to get full resolution image URL
    async function getFullResolutionImageUrl(thumbnailUrl) {
      // For BarcodeLookup images
      if (thumbnailUrl.includes('barcelookup.com')) {
        return thumbnailUrl
          .replace(/\/thumbs\//, '/images/')
          .replace(/_thb\.jpg$/, '.jpg')
          .replace(/\?.*$/, '');
      }
      
      if (thumbnailUrl.includes('ebayimg.com')) {
        return thumbnailUrl.replace(/\$_[0-9]+\.jpg$/, '$_57.jpg');
      }
      
      return thumbnailUrl
        .replace(/\/thumbs?\//, '/images/')
        .replace(/_thumb|_small|_sm\./g, '.')
        .replace(/\?.*$/, '');
    }

    // Function to close modal
    function closeModal() {
      modal.style.display = 'none';
      modalImage.src = ''; // Clear the image source
      modalImage.style.transform = 'scale(1)';
      modalImage.style.transformOrigin = 'center center';
      modalImage.style.cursor = 'zoom-in';
      currentScale = 1;
      isZooming = false;
      
      // Clean up event listeners
      if (zoomListenersAdded) {
        modalImage.removeEventListener('mousemove', mouseMoveHandler);
        modalImage.removeEventListener('click', clickHandler);
        modalImage.removeEventListener('wheel', wheelHandler);
        modalImage.removeEventListener('dblclick', dblClickHandler);
        zoomListenersAdded = false;
      }
      
      document.body.style.overflow = 'auto';
    }

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function(event) {
      if (event.target === modal) {
        closeModal();
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
      }
    });
  }

  // Function to make images clickable
  function makeImagesClickable() {
    const productImages = document.querySelectorAll('.product-image');
    productImages.forEach(img => {
      if (!img.hasAttribute('data-clickable')) {
        img.setAttribute('data-clickable', 'true');
        img.addEventListener('click', function() {
          const caption = this.alt || 'Product Image';
          openImageModal(this.src, caption);
        });
      }
    });
  }

    // Initialize the extension
  async function initializeExtension() {
    console.log('[INIT] Starting extension initialization...');
    
    // Initialize UI components
    initializeImageModal();
    makeImagesClickable();
    
    // Clean up expired cache entries
    console.log('[INIT] Cleaning up expired cache entries...');
    await cleanupExpiredCache();
    
    const upc = upcInput.value.trim();
    if (upc.length >= 8) {
      console.log(`[INIT] Found UPC in input field: ${upc}. Attempting to load cache only...`);
      const hasCachedResults = await loadCachedResults(upc);
      if (!hasCachedResults) {
        console.log('[INIT] No cached results found. Clearing input and waiting for user action.');
        upcInput.value = '';
        currentUPC = '';
      }
    } else {
      console.log('[INIT] No valid UPC in input field');
    }
    
    console.log('[INIT] Extension initialization complete');
  }

  // Pane state management - moved here to be available during initialization
  const PANE_STATE_KEY = 'paneStates';
  let paneStates = {
    'barcode-lookup': true,
    'upc-itemdb': true,
    'go-upc': true
  };

  // Load saved pane states
  async function loadPaneStates() {
    try {
      const result = await chrome.storage.local.get([PANE_STATE_KEY]);
      if (result[PANE_STATE_KEY]) {
        paneStates = { ...paneStates, ...result[PANE_STATE_KEY] };
      }
    } catch (error) {
      console.warn('[PANE] Failed to load pane states:', error);
    }
  }

  // Save pane states
  async function savePaneStates() {
    try {
      await chrome.storage.local.set({ [PANE_STATE_KEY]: paneStates });
    } catch (error) {
      console.warn('[PANE] Failed to save pane states:', error);
    }
  }

  // Check if a pane is enabled
  function isPaneEnabled(pane) {
    return paneStates[pane] !== false;
  }

  // Toggle pane state
  async function togglePane(pane) {
    paneStates[pane] = !paneStates[pane];
    await savePaneStates();
    updatePaneUI(pane);
  }

  // Update pane UI based on state
  function updatePaneUI(pane) {
    const panel = document.querySelector(`[data-panel="${pane}"]`);
    const toggleBtn = document.getElementById(`toggle-${pane}`);
    const statusDot = pane === 'barcode-lookup' ? statusBarcode
                   : pane === 'upc-itemdb' ? statusUpcItemDb
                   : pane === 'go-upc' ? statusGoUpc
                   : null;

    if (!panel || !toggleBtn) return;

    const isEnabled = isPaneEnabled(pane);
    
    if (isEnabled) {
      // Enable pane - restore full functionality
      panel.classList.remove('pane-disabled');
      toggleBtn.classList.remove('disabled');
      toggleBtn.setAttribute('aria-label', `Disable ${pane}`);
      toggleBtn.title = `Disable ${pane}`;
      
      // Clear disabled content and restore empty state
      const contentEl = pane === 'barcode-lookup' ? document.getElementById('barcodeLookupContent')
                      : pane === 'upc-itemdb' ? document.getElementById('upcItemDbContent')
                      : pane === 'go-upc' ? document.getElementById('goUpcContent')
                      : null;
      
      if (contentEl) {
        // Restore to proper empty state HTML based on pane type
        const emptyStateHTML = getEmptyStateHTML(pane, false); // false = not disabled
        contentEl.innerHTML = emptyStateHTML;
      }
      
      // Reset status dot to idle (enabled state)
      if (statusDot) {
        statusDot.classList.remove('status-loading', 'status-success', 'status-error');
        statusDot.classList.add('status-idle');
      }
      
      // If there's a current UPC and cached data, reload it for this pane
      if (currentUPC) {
        loadCachedResultsForPane(pane, currentUPC);
      }
    } else {
      // Disable pane - remove all functionality
      panel.classList.add('pane-disabled');
      toggleBtn.classList.add('disabled');
      toggleBtn.setAttribute('aria-label', `Enable ${pane}`);
      toggleBtn.title = `Enable ${pane}`;
      
      // Clear content and show disabled state
      const contentEl = pane === 'barcode-lookup' ? document.getElementById('barcodeLookupContent')
                      : pane === 'upc-itemdb' ? document.getElementById('upcItemDbContent')
                      : pane === 'go-upc' ? document.getElementById('goUpcContent')
                      : null;
      
      if (contentEl) {
        const emptyStateHTML = getEmptyStateHTML(pane, true); // true = disabled
        contentEl.innerHTML = emptyStateHTML;
      }
      
      // Reset status dot to idle (disabled state)
      if (statusDot) {
        statusDot.classList.remove('status-loading', 'status-success', 'status-error');
        statusDot.classList.add('status-idle');
      }
    }
  }

  // Get appropriate empty state HTML for pane
  function getEmptyStateHTML(pane, isDisabled = false) {
    if (isDisabled) {
      if (pane === 'upc-itemdb') {
        // UPCItemDB uses same layout as BarcodeLookup when disabled
        return `
          <div class="empty-state">
            <img src="" alt="UPCItemDB" class="provider-logo" style="opacity: 0.5;">
            <p>Provider disabled</p>
          </div>
        `;
      } else {
        // Default disabled layout for other providers
        const providerName = pane === 'barcode-lookup' ? 'BarcodeLookup'
                           : pane === 'go-upc' ? 'Go-UPC'
                           : 'Provider';
          
        const logoSrc = pane === 'barcode-lookup' ? ''
                      : pane === 'go-upc' ? ''
                      : '';
          
        return `
          <div class="empty-state">
            <img src="${logoSrc}" alt="${providerName}" class="provider-logo" style="opacity: 0.5;">
            <p>Provider disabled</p>
          </div>
        `;
      }
    } else {
      // Regular empty state based on pane type
      if (pane === 'barcode-lookup') {
        return `
          <div class="empty-state">
            <div class="empty-icon barcode-lookup-empty">
              <img src="https://www.barcodelookup.com/assets/images/barcode-lookup-logo.webp" width="48" height="32" alt="Barcode Lookup logo">
              <div class="barcode-text-container">
                <span class="barcode-logo">&nbsp;BARCODE</span>
                <span class="lookup-logo">&nbsp;LOOKUP</span>
              </div>
            </div>
            <div class="empty-text">Enter a UPC to search</div>
          </div>
        `;
      } else if (pane === 'upc-itemdb') {
        return `
          <div class="empty-state">
            <div class="empty-icon upcitemdb-empty">
              <img src="https://i.imgur.com/UvqpcSG.png" width="100" height="auto" alt="UPCItemDB logo">
            </div>
            <div class="empty-text">Enter a UPC to search</div>
          </div>
        `;
      } else if (pane === 'go-upc') {
        return `
          <div class="empty-state">
            <div class="empty-icon go-upc-empty">
              <img src="https://go-upc.com/img/logo.svg" width="100" height="auto" alt="Go-UPC logo">
            </div>
            <div class="empty-text">Enter a UPC to search</div>
          </div>
        `;
      }
      return '<div class="empty-state"><div class="empty-text">Enter a UPC to search</div></div>';
    }
  }

  // Load cached results for a specific pane when re-enabled
  async function loadCachedResultsForPane(pane, upc) {
    if (!isPaneEnabled(pane)) return;
    
    try {
      const cached = await getCachedResult(upc);
      if (!cached) return;
      
      const contentEl = pane === 'barcode-lookup' ? document.getElementById('barcodeLookupContent')
                      : pane === 'upc-itemdb' ? document.getElementById('upcItemDbContent')
                      : pane === 'go-upc' ? document.getElementById('goUpcContent')
                      : null;
      
      if (!contentEl) return;
      
      // Display cached results for this specific pane
      if (pane === 'barcode-lookup' && cached.barcodeLookup) {
        displayBarcodeLookupResults(cached.barcodeLookup, upc);
        setProviderStatus('barcode-lookup', 'success');
      } else if (pane === 'upc-itemdb' && cached.upcItemDb) {
        displayUPCItemDBResults(cached.upcItemDb, upc);
        setProviderStatus('upc-itemdb', 'success');
      } else if (pane === 'go-upc' && cached.goUpc) {
        displayGoUpcResults(cached.goUpc, upc);
        setProviderStatus('go-upc', 'success');
      }
    } catch (error) {
      console.warn(`[CACHE] Failed to load cached results for ${pane}:`, error);
    }
  }

  // Initialize pane toggle event listeners
  function initializePaneToggles() {
    const toggleButtons = [
      { id: 'toggle-barcode-lookup', pane: 'barcode-lookup' },
      { id: 'toggle-upc-itemdb', pane: 'upc-itemdb' },
      { id: 'toggle-go-upc', pane: 'go-upc' }
    ];

    toggleButtons.forEach(({ id, pane }) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => togglePane(pane));
      }
    });
  }
  
  // Initialize pane states and UI
  async function initializePanes() {
    await loadPaneStates();
    initializePaneToggles();
    
    // Update UI for all panes based on saved states
    ['barcode-lookup', 'upc-itemdb', 'go-upc'].forEach(pane => {
      updatePaneUI(pane);
    });
  }

  // Start the extension initialization
  initializeExtension().catch(error => {
    console.error('[INIT] Error during extension initialization:', error);
  });
  
  // Initialize panes
  initializePanes().catch(error => {
    console.error('[INIT] Error during pane initialization:', error);
  });

  // Get DOM elements
  const upcInput = document.getElementById('upcInput');
  const searchBtn = document.getElementById('searchBtn'); // may be null (button removed)
  const barcodeLookupContent = document.getElementById('barcodeLookupContent');
  const upcItemDbContent = document.getElementById('upcItemDbContent');
  const goUpcContent = document.getElementById('goUpcContent');
  const barcodeSizeBadge = document.getElementById('barcodeSize');
  const upcItemDbSizeBadge = document.getElementById('upcItemDbSize');
  const goUpcSizeBadge = document.getElementById('goUpcSize');
  const cacheBadge = document.getElementById('cacheBadge');
  const searchInputWrapper = document.querySelector('.search-input-wrapper');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const statusBarcode = document.getElementById('status-barcode-lookup');
  const statusUpcItemDb = document.getElementById('status-upc-itemdb');
  const statusGoUpc = document.getElementById('status-go-upc');
  
  // Pane toggle buttons
  const toggleBarcodeLookup = document.getElementById('toggle-barcode-lookup');
  const toggleUpcItemDb = document.getElementById('toggle-upc-itemdb');
  const toggleGoUpc = document.getElementById('toggle-go-upc');

  // Provider status helpers
  function setProviderStatus(provider, state) {
    const el = provider === 'barcode-lookup' ? statusBarcode
             : provider === 'upc-itemdb' ? statusUpcItemDb
             : provider === 'go-upc' ? statusGoUpc
             : null;
    if (!el) return;
    // remove all states
    el.classList.remove('status-idle', 'status-loading', 'status-success', 'status-error');
    // add new state and title
    const titleMap = {
      idle: 'Ready',
      loading: 'Searching...',
      success: 'Results found',
      error: 'Error or no results'
    };
    switch (state) {
      case 'loading': el.classList.add('status-loading'); break;
      case 'success': el.classList.add('status-success'); break;
      case 'error': el.classList.add('status-error'); break;
      default: el.classList.add('status-idle'); break;
    }
    el.title = titleMap[state] || titleMap.idle;
    el.setAttribute('aria-label', `${provider} ${el.title}`);
  }



  // Initialize all providers to idle at startup
  setProviderStatus('barcode-lookup', 'idle');
  setProviderStatus('upc-itemdb', 'idle');
  setProviderStatus('go-upc', 'idle');

  // Reset provider dots on Clear button
  try {
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        setProviderStatus('barcode-lookup', 'idle');
        setProviderStatus('upc-itemdb', 'idle');
        setProviderStatus('go-upc', 'idle');
      });
    }
  } catch {}

  async function updateExtensionBadgeBasedOnCache() {
    try {
      const all = await chrome.storage.local.get(null);
      const hasAny = Object.keys(all).some(k => k.startsWith('search_'));
      if (hasAny) {
        chrome.action.setBadgeBackgroundColor({ color: '#0366d6' });
        chrome.action.setBadgeText({ text: 'C' });
      } else {
        chrome.action.setBadgeText({ text: '' });
      }
    } catch (e) {
      console.warn('[BADGE] Failed to update extension badge:', e);
    }
  }

  chrome.storage.local.get(['selectedUPC'], async (result) => {
    if (result.selectedUPC) {
      const upc = String(result.selectedUPC).trim();
      console.log('[INIT] selectedUPC found. Loading cache only...');
      const hasCached = await loadCachedResults(upc);
      if (!hasCached) {
        upcInput.value = '';
        currentUPC = '';
      }
      chrome.storage.local.remove(['selectedUPC']);
    } else if (upcInput.value.trim().length >= 8) {
      const upc = upcInput.value.trim();
      const hasCached = await loadCachedResults(upc);
      if (!hasCached) {
        upcInput.value = '';
        currentUPC = '';
      }
    }
  });

  // Validate input to accept only numbers
  upcInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  // Allow Enter key to trigger search (buttonless)
  upcInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      initiateSearchFromInput();
    }
  });

  function initiateSearchFromInput() {
    const upc = upcInput.value.trim();
    // Clear previous results if this is a new search
    if (currentUPC && currentUPC !== upc) {
      if (barcodeLookupContent) barcodeLookupContent.innerHTML = '';
      if (upcItemDbContent) upcItemDbContent.innerHTML = '';
      if (goUpcContent) goUpcContent.innerHTML = '';
    }
    // Validate UPC length before calling searchUPC (searchUPC will re-validate)
    if (!upc || upc.length < 8) {
      showError('Please enter a valid UPC', document.getElementById('barcodeLookupContent'));
      showError('Please enter a valid UPC', document.getElementById('upcItemDbContent'));
      showError('Please enter a valid UPC', document.getElementById('goUpcContent'));
      return;
    }
    searchUPC(upc);
  }

  if (searchBtn) searchBtn.addEventListener('click', async function() {
    const upc = upcInput.value.trim();
    
    // Clear previous results if this is a new search
    if (currentUPC && currentUPC !== upc) {
      const barcodeLookupContent = document.getElementById('barcodeLookupContent');
      const upcItemDbContent = document.getElementById('upcItemDbContent');
      
      if (barcodeLookupContent) barcodeLookupContent.innerHTML = '';
      if (upcItemDbContent) upcItemDbContent.innerHTML = '';
      if (goUpcContent) goUpcContent.innerHTML = '';
    }
    
    // Validate UPC before proceed
    if (!upc || upc.length < 8) {
      showError('Please enter a valid UPC', document.getElementById('barcodeLookupContent'));
      showError('Please enter a valid UPC', document.getElementById('upcItemDbContent'));
      showError('Please enter a valid UPC', document.getElementById('goUpcContent'));
      return;
    }
    
    // Update current UPC and perform search
    setProviderStatus('barcode-lookup', 'loading');
    setProviderStatus('upc-itemdb', 'loading');
    setProviderStatus('go-upc', 'loading');
    currentUPC = upc;
    await searchUPC(upc);
  });

  // Cache for storing previous search results in chrome.storage.local
  const CACHE_TTL = 3 * 60 * 1000; // 3 minutes cache TTL
  let currentUPC = ''; // Track the current UPC being viewed
  let cacheExpiryTimer = null; // Timer to auto-expire currently displayed cached data
  
  // Load cached results for the current UPC
  async function getCachedResult(upc) {
    if (!upc) {
      console.error('[CACHE] Cannot get cached result: No UPC provided');
      return null;
    }
    
    const cacheKey = `search_${upc}`;
    console.log(`[CACHE] Checking cache for key: ${cacheKey}`);
    
    try {
      // Get all keys for debugging
      const allKeys = await chrome.storage.local.get(null);
      console.log('[CACHE] All cache keys:', Object.keys(allKeys));
      
      // Get the specific cache entry
      const result = await chrome.storage.local.get(cacheKey);
      console.log('[CACHE] Cache get result for', cacheKey, ':', result);
      
      if (!result || !result[cacheKey]) {
        console.log(`[CACHE] No cache entry found for key: ${cacheKey}`);
        return null;
      }
      
      const cached = result[cacheKey];
      const now = Date.now();
      const age = now - cached.timestamp;
      const ageSeconds = Math.floor(age / 1000);
      const ttlSeconds = CACHE_TTL / 1000;
      
      console.log(`[CACHE] Entry timestamp: ${new Date(cached.timestamp).toISOString()}`);
      console.log(`[CACHE] Current time: ${new Date(now).toISOString()}`);
      console.log(`[CACHE] Cache entry found, age: ${ageSeconds}s, TTL: ${ttlSeconds}s`);
      
      if (age < CACHE_TTL) {
        console.log(`[CACHE] Cache HIT for ${cacheKey}`);
        console.log(`[CACHE] Cached data:`, cached.data);
        return cached.data;
      } else {
        console.log(`[CACHE] Cache entry EXPIRED (${ageSeconds}s > ${ttlSeconds}s)`);
        // Remove expired cache entry
        try {
          await chrome.storage.local.remove(cacheKey);
          console.log(`[CACHE] Removed expired cache entry for ${cacheKey}`);
        } catch (removeError) {
          console.error(`[CACHE] Error removing expired cache entry:`, removeError);
        }
        return null;
      }
      
    } catch (error) {
      console.error('[CACHE] Error accessing cache:', error);
      return null;
    }
    
    return null;
  }
  
  // Save results to cache
  async function cacheResult(upc, data) {
    if (!upc || !data) {
      console.error('[CACHE] Cannot cache: missing upc or data');
      return false;
    }
    
    const cacheKey = `search_${upc}`;
    const now = Date.now();
    
    console.log(`[CACHE] Attempting to cache results for UPC: ${upc}`);
    console.log('[CACHE] Data to cache:', JSON.stringify(data, null, 2));
    
    try {
      // Get existing cache first to preserve any existing data
      const existingCache = await chrome.storage.local.get(cacheKey);
      console.log('[CACHE] Existing cache data:', existingCache);
      
      const existingData = existingCache[cacheKey]?.data || {};
      
      // Merge new data with existing data (do not include timestamp inside data)
      const mergedData = {
        ...existingData,
        ...data
      };
      
      const cacheData = {
        [cacheKey]: {
          data: mergedData,
          timestamp: now,
          expiresAt: now + CACHE_TTL
        }
      };
      
      console.log(`[CACHE] Saving to cache with key: ${cacheKey}`, cacheData);
      
      await chrome.storage.local.set(cacheData);
      // Persist last searched UPC for next popup session
      await chrome.storage.local.set({ lastUPC: upc });
      console.log('[CACHE] Successfully saved to cache');
      
      // Verify the data was saved
      const verify = await chrome.storage.local.get(cacheKey);
      console.log('[CACHE] Cache verification:', verify[cacheKey] ? 'Success' : 'Failed');
      // Update extension icon badge after save
      updateExtensionBadgeBasedOnCache();
      
      return true;
    } catch (error) {
      console.error('[CACHE] Error saving to cache:', error);
      return false;
    }
  }
  
  // Clean up expired cache entries
  async function cleanupExpiredCache() {
    console.log('[CACHE] Cleaning up expired cache entries...');
    try {
      const now = Date.now();
      const cache = await chrome.storage.local.get(null);
      const toRemove = [];
      
      // Find all expired cache entries
      Object.entries(cache).forEach(([key, value]) => {
        if (!key.startsWith('search_')) return;
        const expiredByExpiresAt = value.expiresAt && value.expiresAt < now;
        const expiredByTimestamp = value.timestamp && (now - value.timestamp) >= CACHE_TTL;
        if (expiredByExpiresAt || expiredByTimestamp) {
          toRemove.push(key);
        }
      });
      
      // Remove expired entries in batches to avoid quota limits
      if (toRemove.length > 0) {
        await chrome.storage.local.remove(toRemove);
        console.log(`[CACHE] Removed ${toRemove.length} expired cache entries`);
      } else {
        console.log('[CACHE] No expired cache entries to remove');
      }
    } catch (error) {
      console.error('[CACHE] Error cleaning up cache:', error);
    }
  }
  
  // Load cached results for the specified UPC or currentUPC
  async function loadCachedResults(upc) {
    const targetUPC = upc || currentUPC;
    if (!targetUPC) {
      console.log('[CACHE] No UPC provided to load cached results');
      return false;
    }

    console.log(`[CACHE] Loading cached results for UPC: ${targetUPC}`);
    try {
      const cached = await getCachedResult(targetUPC);
      
      if (cached) {
        console.log('[CACHE] Found cached results, displaying...');
        let hasResults = false;
        
        // Display BarcodeLookup results if available and enabled
        if (cached.barcodeLookup && barcodeLookupContent && isPaneEnabled('barcode-lookup')) {
          try {
            displayBarcodeLookupResults(cached.barcodeLookup, targetUPC);
            hasResults = true;
            try { setProviderStatus('barcode-lookup', 'success'); } catch {}
          } catch (err) {
            console.error('[CACHE] Error displaying BarcodeLookup results from cache:', err);
            showError('Failed to display cached BarcodeLookup results', barcodeLookupContent);
            try { setProviderStatus('barcode-lookup', 'error'); } catch {}
          }
        } else {
          try { setProviderStatus('barcode-lookup', 'idle'); } catch {}
        }
        
        // Display UPCItemDB results if available and enabled
        if (cached.upcItemDb && upcItemDbContent && isPaneEnabled('upc-itemdb')) {
          try {
            displayUPCItemDBResults(cached.upcItemDb, targetUPC);
            hasResults = true;
            try { setProviderStatus('upc-itemdb', 'success'); } catch {}
          } catch (err) {
            console.error('[CACHE] Error displaying UPCItemDB results from cache:', err);
            showError('Failed to display cached UPCItemDB results', upcItemDbContent);
            try { setProviderStatus('upc-itemdb', 'error'); } catch {}
          }
        } else {
          try { setProviderStatus('upc-itemdb', 'idle'); } catch {}
        }
        
        // Display Go-UPC results if available and enabled
        if (cached.goUpc && goUpcContent && isPaneEnabled('go-upc')) {
          try {
            displayGoUpcResults(cached.goUpc, targetUPC);
            hasResults = true;
            try { setProviderStatus('go-upc', 'success'); } catch {}
          } catch (err) {
            console.error('[CACHE] Error displaying Go-UPC results from cache:', err);
            showError('Failed to display cached Go-UPC results', goUpcContent);
            try { setProviderStatus('go-upc', 'error'); } catch {}
          }
        } else {
          try { setProviderStatus('go-upc', 'idle'); } catch {}
        }
        
        if (hasResults) {
          upcInput.value = targetUPC;
          currentUPC = targetUPC; // Ensure currentUPC is in sync

          // Show 'Loaded from cache' UI badge and update dot icon state
          if (cacheBadge) {
            cacheBadge.style.display = 'inline-flex';
          }

          // Set a timer to auto-expire the currently displayed cached data
          try {
            const cacheKey = `search_${targetUPC}`;
            const wrapper = await chrome.storage.local.get(cacheKey);
            const expiresAt = wrapper?.[cacheKey]?.expiresAt;
            if (expiresAt) {
              const remaining = Math.max(0, expiresAt - Date.now());
              console.log(`[CACHE] Setting UI expiry timer in ${Math.ceil(remaining/1000)}s for UPC ${targetUPC}`);
              if (cacheExpiryTimer) clearTimeout(cacheExpiryTimer);
              cacheExpiryTimer = setTimeout(async () => {
                if (currentUPC === targetUPC) {
                  console.log('[CACHE] TTL reached, clearing cached UI and entry for', targetUPC);
                  if (barcodeLookupContent) barcodeLookupContent.innerHTML = '<div class="loading">Cache expired. Please search again.</div>';
                  if (upcItemDbContent) upcItemDbContent.innerHTML = '<div class="loading">Cache expired. Please search again.</div>';
                  if (goUpcContent) goUpcContent.innerHTML = '<div class="loading">Cache expired. Please search again.</div>';
                  if (barcodeSizeBadge) barcodeSizeBadge.style.display = 'none';
                  if (upcItemDbSizeBadge) upcItemDbSizeBadge.style.display = 'none';
                  if (goUpcSizeBadge) goUpcSizeBadge.style.display = 'none';
                  if (cacheBadge) cacheBadge.style.display = 'none';
                  try { await chrome.storage.local.remove(cacheKey); } catch (e) { console.warn('[CACHE] Failed to remove expired cache key:', e); }
                  // Update extension icon badge
                  updateExtensionBadgeBasedOnCache();
                  // Clear input and current UPC when cache expires
                  upcInput.value = '';
                  currentUPC = '';
                  try {
                    setProviderStatus('barcode-lookup', 'idle');
                    setProviderStatus('upc-itemdb', 'idle');
                    setProviderStatus('go-upc', 'idle');
                  } catch {}
                }
              }, remaining);
            }
          } catch (e) {
            console.warn('[CACHE] Could not schedule UI expiry timer:', e);
          }
          return true;
        }
      } else {
        console.log('[CACHE] No cache entry found for UPC:', targetUPC);
        try {
          setProviderStatus('barcode-lookup', 'idle');
          setProviderStatus('upc-itemdb', 'idle');
          setProviderStatus('go-upc', 'idle');
        } catch {}
      }
    } catch (error) {
      console.error('[CACHE] Error loading cached results:', error);
    }
    
    console.log('[CACHE] No valid cached results found for UPC:', targetUPC);
    return false;
  }
  
  // Run cleanup on startup and load any cached results
  (async function init() {
    console.log('Initializing popup...');
    
    // First, clean up expired cache entries
    await cleanupExpiredCache();

    // Initialize extension badge state
    updateExtensionBadgeBasedOnCache();

    // Periodically cleanup while popup is open
    if (window.__cacheCleanupInterval) clearInterval(window.__cacheCleanupInterval);
    window.__cacheCleanupInterval = setInterval(() => {
      cleanupExpiredCache();
    }, 60 * 1000);
    
    // Check for selected UPC from context menu, lastUPC, or input field
    chrome.storage.local.get(['selectedUPC', 'lastUPC'], async (result) => {
      let upc = '';
      
      if (result.selectedUPC) {
        // Use the UPC from context menu selection
        upc = String(result.selectedUPC).trim();
        chrome.storage.local.remove(['selectedUPC']);
      } else if (upcInput.value.trim().length >= 8) {
        // Start with the UPC from input field
        upc = upcInput.value.trim();
      } else if (result.lastUPC && String(result.lastUPC).trim().length >= 8) {
        // Fallback to last searched UPC
        upc = String(result.lastUPC).trim();
      }
      
      console.log('Current UPC input value:', upc);
      
      if (upc.length >= 8) {
        console.log('Found valid UPC, attempting to load cached results only...');
        const hasCachedResults = await loadCachedResults(upc);
        console.log('Cached results loaded:', hasCachedResults);
        if (!hasCachedResults) {
          upcInput.value = '';
          currentUPC = '';
        }
      } else {
        console.log('No valid UPC found in input field or context menu');
      }
    });
  })();

  async function searchUPC(upc) {
    // Validate UPC before proceeding
    if (!upc || upc.length < 8) {
      showError('Please enter a valid UPC code', barcodeLookupContent);
      return;
    }

    console.log(`[SEARCH] Starting search for UPC: ${upc}`);
    
    // Set current UPC
    currentUPC = upc;
    upcInput.value = upc;

    // Provider dots: set to loading
    try {
      setProviderStatus('barcode-lookup', 'loading');
      setProviderStatus('upc-itemdb', 'loading');
      setProviderStatus('go-upc', 'loading');
    } catch {}

    // Clear any pending cache expiry timer for previous UPC
    if (cacheExpiryTimer) {
      clearTimeout(cacheExpiryTimer);
      cacheExpiryTimer = null;
    }

    // Hide 'Loaded from cache' badge on new search
    if (cacheBadge) cacheBadge.style.display = 'none';
    
    // Show loading state for enabled panes only
    console.log('[SEARCH] Showing loading states for enabled panes...');
    if (barcodeLookupContent && isPaneEnabled('barcode-lookup')) showLoading(barcodeLookupContent);
    if (upcItemDbContent && isPaneEnabled('upc-itemdb')) showLoading(upcItemDbContent);
    if (goUpcContent && isPaneEnabled('go-upc')) showLoading(goUpcContent);
    
    // Hide size badges for available elements
    console.log('[SEARCH] Hiding size badges...');
    if (barcodeSizeBadge) barcodeSizeBadge.style.display = 'none';
    if (upcItemDbSizeBadge) upcItemDbSizeBadge.style.display = 'none';
    if (goUpcSizeBadge) goUpcSizeBadge.style.display = 'none';
    
    // Disable search button and update text
    const originalBtnText = searchBtn ? searchBtn.textContent : '';
    if (searchBtn) {
      searchBtn.disabled = true;
      searchBtn.textContent = 'Searching...';
    }
    startSearchVisuals();

    try {
      // Clear previous cached entry for this UPC so new results fully replace it
      try { await chrome.storage.local.remove(`search_${upc}`); } catch (e) { console.warn('[CACHE] Failed to clear previous cache before search:', e); }
      console.log('[SEARCH] Starting API searches in parallel...');
      // Search only enabled APIs in parallel
      const searchPromises = [];
      const enabledProviders = [];
      
      if (isPaneEnabled('barcode-lookup')) {
        searchPromises.push(searchBarcodeLookup(upc));
        enabledProviders.push('barcode-lookup');
      }
      
      if (isPaneEnabled('upc-itemdb')) {
        searchPromises.push(searchUPCItemDB(upc));
        enabledProviders.push('upc-itemdb');
      }
      
      if (isPaneEnabled('go-upc')) {
        searchPromises.push(searchGoUpc(upc));
        enabledProviders.push('go-upc');
      }
      
      if (searchPromises.length === 0) {
        console.log('[SEARCH] No providers enabled, skipping search');
        return;
      }
      
      // Process results as they arrive for faster UI updates
      const results = {};
      let completedSearches = 0;
      const totalSearches = searchPromises.length;
      
      // Handle each search promise individually for faster response
      searchPromises.forEach((promise, index) => {
        const provider = enabledProviders[index];
        
        promise.then((result) => {
          console.log(`[SEARCH] ${provider} completed successfully`);
          results[provider === 'barcode-lookup' ? 'barcodeLookup' : provider === 'upc-itemdb' ? 'upcItemDb' : 'goUpc'] = result;
          
          // Update UI immediately for this provider
          if (provider === 'barcode-lookup' && barcodeLookupContent && isPaneEnabled('barcode-lookup')) {
            try {
              displayBarcodeLookupResults(result, upc);
              setProviderStatus('barcode-lookup', 'success');
            } catch (err) {
              console.error('[SEARCH] Error displaying BarcodeLookup results:', err);
              showError('Failed to display BarcodeLookup results', barcodeLookupContent);
              setProviderStatus('barcode-lookup', 'error');
            }
          } else if (provider === 'upc-itemdb' && upcItemDbContent && isPaneEnabled('upc-itemdb')) {
            try {
              displayUPCItemDBResults(result, upc);
              setProviderStatus('upc-itemdb', 'success');
            } catch (err) {
              console.error('[SEARCH] Error displaying UPCItemDB results:', err);
              showError('Failed to display UPCItemDB results', upcItemDbContent);
              setProviderStatus('upc-itemdb', 'error');
            }
          } else if (provider === 'go-upc' && goUpcContent && isPaneEnabled('go-upc')) {
            try {
              displayGoUpcResults(result, upc);
              setProviderStatus('go-upc', 'success');
            } catch (err) {
              console.error('[SEARCH] Error displaying Go-UPC results:', err);
              showError('Failed to display Go-UPC results', goUpcContent);
              setProviderStatus('go-upc', 'error');
            }
          }
        }).catch((error) => {
          console.log(`[SEARCH] ${provider} failed:`, error.message);
          
          // Show no results message immediately for this provider
          if (provider === 'barcode-lookup' && barcodeLookupContent && isPaneEnabled('barcode-lookup')) {
            barcodeLookupContent.innerHTML = `
              <div class="empty-state">
                <div class="empty-icon barcode-lookup-empty">
                  <img src="https://www.barcodelookup.com/assets/images/barcode-lookup-logo.webp" width="48" height="32" alt="Barcode Lookup logo">
                  <div class="barcode-text-container">
                    <span class="barcode-logo">&nbsp;BARCODE</span>
                    <span class="lookup-logo">&nbsp;LOOKUP</span>
                  </div>
                </div>
                <div class="empty-text">The UPC ${upc} you were looking for currently has no record in our database.</div>
              </div>
            `;
            setProviderStatus('barcode-lookup', 'error');
          } else if (provider === 'upc-itemdb' && upcItemDbContent && isPaneEnabled('upc-itemdb')) {
            upcItemDbContent.innerHTML = `
              <div class="empty-state">
                <div class="empty-icon upcitemdb-empty">
                  <img src="https://i.imgur.com/UvqpcSG.png" width="100" height="auto" alt="UPCItemDB logo">
                </div>
                <div class="empty-text">The UPC ${upc} you were looking for currently has no record in our database.</div>
              </div>
            `;
            setProviderStatus('upc-itemdb', 'error');
          } else if (provider === 'go-upc' && goUpcContent && isPaneEnabled('go-upc')) {
            goUpcContent.innerHTML = `
              <div class="empty-state">
                <div class="empty-icon go-upc-empty">
                  <img src="https://go-upc.com/img/logo.svg" width="100" height="auto" alt="Go-UPC logo">
                </div>
                <div class="empty-text">Sorry, we were not able to find a product for UPC ${upc}</div>
              </div>
            `;
            setProviderStatus('go-upc', 'error');
          }
        }).finally(() => {
          completedSearches++;
          if (completedSearches === totalSearches) {
            console.log('[SEARCH] All searches completed');
            // Re-enable search button when all searches are done
            if (searchBtn) {
              searchBtn.disabled = false;
              searchBtn.textContent = originalBtnText || 'Search';
            }
            stopSearchVisuals();
          }
        });
      });
      
      // Wait for all searches to complete for caching purposes
      await Promise.allSettled(searchPromises);
      console.log('[SEARCH] All API calls completed, caching results...');
      
      // Cache results if any were found
      let hasResults = Object.keys(results).length > 0;
      
      if (hasResults) {
        console.log('[SEARCH] Caching search results...');
        // Cache the results for future use
        try {
          await chrome.storage.local.set({
            [`search_${upc}`]: {
              results: results,
              timestamp: Date.now()
            }
          });
          console.log('[CACHE] Results cached successfully');
        } catch (error) {
          console.warn('[CACHE] Failed to cache results:', error);
        }
      }

      // Cache results if we have any
      if (hasResults) {
        console.log('Caching search results for UPC:', upc);
        await cacheResult(upc, results);
        
        // Verify cache was saved
        const cached = await getCachedResult(upc);
        console.log('Cache verification after save:', cached ? 'Success' : 'Failed');
      }

    } catch (error) {
      console.error('Search error:', error);
      const errorMsg = error.message || 'An unexpected error occurred';
      showError(errorMsg, barcodeLookupContent);
      showError(errorMsg, upcItemDbContent);
      showError(errorMsg, goUpcContent);
    } finally {
      // Re-enable search button
      if (searchBtn) {
        searchBtn.disabled = false;
        searchBtn.textContent = originalBtnText;
      }
      stopSearchVisuals();
    }
  }

  // Search icon element for animation hooks
  const searchIcon = document.querySelector('.search-icon');

  function startSearchVisuals() {
    try {
      searchInputWrapper?.classList.add('is-searching');
      searchIcon?.classList.add('is-searching');
    } catch {}
  }
  function stopSearchVisuals() {
    try {
      searchInputWrapper?.classList.remove('is-searching');
      searchIcon?.classList.remove('is-searching');
    } catch {}
  }

  async function searchBarcodeLookup(upc) {
    try {
      console.log(`Searching BarcodeLookup for UPC: ${upc}`);
      const productUrl = `https://www.barcodelookup.com/${upc}`;
      console.log(`Fetching: ${productUrl}`);
      
      let html;

      try {
        const directResponse = await fetch(productUrl, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          }
        });
        
        if (directResponse.ok) {
          html = await directResponse.text();
          console.log('Direct fetch successful');
        }
      } catch (directError) {
        console.log('Direct fetch failed, trying background script:', directError.message);
      }

      // Fallback to background script
      if (!html) {
        html = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            { action: 'fetchData', url: productUrl },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else if (response.success) {
                resolve(response.data);
                console.log('Background script fetch successful');
              } else {
                reject(new Error(response.error));
              }
            }
          );
        });
      }

      if (!html) {
        throw new Error('No HTML content received');
      }

      return parseBarcodeLookupHTML(html, upc);
    } catch (error) {
      console.error('BarcodeLookup search error:', error);
      throw new Error(`Failed to fetch from BarcodeLookup: ${error.message}`);
    }
  }

  async function searchUPCItemDB(upc) {
    console.log(`Searching UPCItemDB for UPC: ${upc}`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
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
        console.log('UPCItemDB API response:', data);
        
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

    // Fallback to web scraping with timeout - this simulates accessing the direct URL
    try {
      const webUrl = `https://www.upcitemdb.com/upc/${upc}`;
      console.log(`Trying web scraping: ${webUrl}`);
      
      const html = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Web scraping request timed out'));
        }, 5000); // 5 second timeout
        
        chrome.runtime.sendMessage(
          { action: 'fetchData', url: webUrl },
          (response) => {
            clearTimeout(timeout);
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (response.success) {
              resolve(response.data);
              console.log('Web scraping successful');
            } else {
              reject(new Error(response.error));
            }
          }
        );
      });

      const parsedData = parseUPCItemDBHTML(html, upc);
      
      return { source: 'web', data: parsedData };
    } catch (error) {
      // Only log as error if it's not a "not found" scenario
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

  async function searchGoUpc(upc) {
    console.log(`Searching Go-UPC for UPC: ${upc}`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const searchUrl = `https://go-upc.com/search?q=${upc}`;
      console.log(`Trying Go-UPC search: ${searchUrl}`);
      
      let html = '';
      
      // Try direct fetch first
      try {
        const directResponse = await fetch(searchUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          }
        });
        
        if (directResponse.ok) {
          html = await directResponse.text();
          console.log('Go-UPC direct fetch successful');
        }
      } catch (directError) {
        console.log('Go-UPC direct fetch failed, trying background script:', directError.message);
      }

      // Fallback to background script
      if (!html) {
        html = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            { action: 'fetchData', url: searchUrl },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else if (response.success) {
                resolve(response.data);
                console.log('Go-UPC background script fetch successful');
              } else {
                reject(new Error(response.error));
              }
            }
          );
        });
      }

      clearTimeout(timeoutId);

      if (!html) {
        throw new Error('No HTML content received from Go-UPC');
      }

      return parseGoUpcHTML(html, upc);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out - Go-UPC is not responding');
      }
      // Only log actual errors, not "no results found" cases
      if (error.message && !error.message.includes('Product not found in Go-UPC database')) {
        console.error('Go-UPC search error:', error);
      } else {
        console.info('Go-UPC: Product not found -', error.message);
      }
      throw new Error(`Failed to fetch from Go-UPC: ${error.message}`);
    }
  }

  function parseGoUpcHTML(html, upc) {
    console.log('Parsing Go-UPC HTML, length:', html.length);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const product = {
      title: '',
      image: '',
      description: '',
      brand: '',
      category: '',
      moreInfo: [],
      alert: ''
    };

    // Check for alert messages (invalid UPC warnings)
    const alertElement = doc.querySelector('.alert.alert-info span');
    if (alertElement) {
      // Extract the alert message and format it
      let alertText = alertElement.textContent.trim();
      // Replace the FontAwesome icon with asterisk
      alertText = alertText.replace(/^\s*\*?\s*/, '* ');
      product.alert = alertText;
      console.log('Go-UPC found alert:', alertText);
    }

    // Check for no results indicators
    const hasNoResults = html.includes('No results found') || 
                        html.includes('not found') ||
                        html.includes('no products found') ||
                        doc.querySelector('.no-results, .not-found, [class*="no-result"]');
    
    if (hasNoResults) {
      console.log('Go-UPC: No results found');
      throw new Error('Product not found in Go-UPC database');
    }

    // Get title from h1 with product-name class
    const titleElement = doc.querySelector('h1.product-name');
    if (titleElement) {
      product.title = titleElement.textContent.trim();
      console.log('Go-UPC found title:', product.title);
    }

    // Get image from figure.product-image img
    const imageElement = doc.querySelector('figure.product-image img');
    if (imageElement && imageElement.src) {
      product.image = imageElement.src;
      console.log('Go-UPC found image:', product.image);
    }

    // Get more info from table.table-striped tbody
    const moreInfoTable = doc.querySelector('table.table-striped tbody');
    if (moreInfoTable) {
      const rows = moreInfoTable.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const label = cells[0].textContent.trim();
          const value = cells[1].textContent.trim();
          if (label && value) {
            product.moreInfo.push({ label, value });
            
            // Extract brand if found
            if (label.toLowerCase().includes('brand')) {
              product.brand = value;
            }
            // Extract category if found
            if (label.toLowerCase().includes('category')) {
              product.category = value;
            }
          }
        }
      });
      console.log('Go-UPC found more info:', product.moreInfo);
    }

    // Get description from the description section
    const descriptionSection = doc.querySelector('div h2');
    if (descriptionSection && descriptionSection.textContent.includes('Description')) {
      const descriptionSpan = descriptionSection.parentElement.querySelector('span');
      if (descriptionSpan) {
        product.description = descriptionSpan.textContent.trim();
        console.log('Go-UPC found description:', product.description);
      }
    }

    // Validate that we have at least a title
    if (!product.title) {
      console.log('Go-UPC: No title found, product may not exist');
      throw new Error('Product not found in Go-UPC database');
    }

    console.log('Final Go-UPC product result:', {
      title: product.title,
      image: product.image,
      description: product.description?.substring(0, 100),
      brand: product.brand,
      category: product.category,
      moreInfoCount: product.moreInfo.length
    });

    return product;
  }

  function parseBarcodeLookupHTML(html, upc) {
    console.log('Parsing BarcodeLookup HTML, length:', html.length);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const product = {
      title: '',
      image: '',
      description: '',
      brand: '',
      category: '',
      size: { value: '', unit: '' },
      stores: []
    };

    const editProductBtn = doc.querySelector('a#edit-product-btn[href="#edit-product"]');
    if (editProductBtn && editProductBtn.nextElementSibling?.tagName === 'H4') {
      product.title = editProductBtn.nextElementSibling.textContent.trim();
      console.log('Found title after edit button:', product.title);
    }
    
    const descLabel = Array.from(doc.querySelectorAll('.product-text-label'))
      .find(el => el.textContent.includes('Description:'));
      
    if (descLabel) {
      const descSpan = descLabel.querySelector('.product-text');
      if (descSpan) {
        product.description = descSpan.textContent.trim();
        console.log('Found description:', product.description);
      }
    }
    
    const attributesLabel = Array.from(doc.querySelectorAll('.product-text-label'))
      .find(el => el.textContent.includes('Attributes:'));
      
    if (attributesLabel) {
      const sizeLi = Array.from(attributesLabel.querySelectorAll('li.product-text'))
        .find(li => li.textContent.toLowerCase().includes('size:'));
        
      if (sizeLi) {
        const sizeText = sizeLi.textContent.replace(/\[|\]/g, '').split(':')[1]?.trim();
        if (sizeText) {

          const sizeMatch = sizeText.match(/([\d.]+)\s*([a-zA-Zµ]+)/);
          if (sizeMatch) {
            product.size = {
              value: sizeMatch[1].trim(),
              unit: sizeMatch[2].trim().toLowerCase()
            };
            console.log('Found size:', product.size);
          }
        }
      }
    }
    
    const imageSelectors = [
      'img[itemprop="image"]',
      '.product-image img',
      '.img-responsive',
      '#product-image',
      'img[src*="product"]',
      'img[src*="barcode"]',
      'img[src*="image"]',
      '.product-image img',
      'img[alt*="product"]',
      '.item-image img',
      '.product-photo img',
      'img[class*="product"]',
      'img[class*="item"]',
      'img:not([src*="logo"]):not([src*="icon"]):not([src*="banner"])'
    ];
    
    for (const selector of imageSelectors) {
      const images = doc.querySelectorAll(selector);
      for (const img of images) {
        if (img.src && !img.src.includes('logo') && !img.src.includes('icon') && !img.src.includes('banner')) {
          // Clean up the image URL to get the highest quality version
          let imageUrl = img.src;
          
          // Handle BarcodeLookup's image URLs
          if (imageUrl.includes('barcodelookup.com')) {
            // Remove any size parameters to get the original image
            imageUrl = imageUrl.split('?')[0];
            // Try to get higher resolution if available
            imageUrl = imageUrl.replace('/thumbs/', '/images/')
                             .replace('_thb.', '.')
                             .replace('_thumb', '')
                             .replace('_small', '');
          }
          
          // Only use the image if it's not a placeholder
          if (imageUrl && !imageUrl.includes('placeholder') && imageUrl.length > 10) {
            product.image = imageUrl;
            console.log('Found image with selector', selector, ':', product.image);
            break;
          }
        }
      }
      if (product.image) break;
    }
    
    let brandManufacturerInfo = '';
    const metaData = doc.querySelectorAll('.product-meta-data, .product-info, .product-details');
    metaData.forEach(meta => {
      const metaText = meta.textContent;
      
      const brandMatch = metaText.match(/Brand[\s:]+([^\n<]+)/i);
      if (brandMatch) {
        const brand = brandMatch[1].trim();
        if (brand && !brandManufacturerInfo.includes(brand)) {
          brandManufacturerInfo += (brandManufacturerInfo ? ' ' : '') + brand;
        }
      }
      
      const manufacturerMatch = metaText.match(/Manufacturer[\s:]+([^\n<]+)/i);
      if (manufacturerMatch) {
        const manufacturer = manufacturerMatch[1].trim();
        if (manufacturer && !brandManufacturerInfo.includes(manufacturer)) {
          brandManufacturerInfo += (brandManufacturerInfo ? ' ' : '') + manufacturer;
        }
      }

      if (!product.category) {
        const categoryMatch = metaText.match(/Category[\s:]+([^\n<]+)/i);
        if (categoryMatch) {
          product.category = categoryMatch[1].trim();
        }
      }
    });

    if (brandManufacturerInfo && product.description) {
      product.description = product.description + ' ' + brandManufacturerInfo;
    } else if (brandManufacturerInfo && !product.description) {
      product.description = brandManufacturerInfo;
    }
    
    if (!product.title) {
      const h1 = doc.querySelector('h1');
      if (h1) {
        product.title = h1.textContent.trim();
      } else {
        product.title = doc.title.split('|')[0].trim();
      }
    }
    
    if (!product.title) {
      console.log('No title and no product indicators found');
      throw new Error('Product not found in BarcodeLookup database');
    }
    
    if (!product.title && hasAnyProductInfo) {
      product.title = `Product ${upc}`;
      console.log('Created generic title for product with indicators');
    }

    // Final debug output
    console.log('Final BarcodeLookup product result:', {
      title: product.title,
      image: product.image,
      description: product.description?.substring(0, 100),
      brand: product.brand,
      category: product.category,
      size: product.size,
      storeCount: product.stores.length
    });

    return product;
  }

  function parseUPCItemDBHTML(html, upc) {
    console.log('Parsing UPCItemDB HTML, length:', html.length);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const hasInvalidUPCMessage = html.includes('was incorrect or invalid') || 
                                html.includes('please enter a valid upc number') ||
                                html.includes('currently has no record in our database') ||
                                html.includes('UPC not found') ||
                                doc.querySelector('.error, .invalid, [class*="error"]');
    
    if (hasInvalidUPCMessage) {
      console.log('UPCItemDB: Invalid UPC message detected in HTML');
      throw new Error('Product not found in UPCItemDB database');
    }

    const hasRealProduct = html.includes('Product Information') ||
                          html.includes('More Info') ||
                          html.includes('Category:') ||
                          html.includes('Manufacturer:') ||
                          html.includes('is associated with') ||
                          doc.querySelector('.product-info, .item-details, .product-data, .detail-list');
    
    console.log('UPCItemDB real product indicators:', {
      hasProductInfo: html.includes('Product Information'),
      hasMoreInfo: html.includes('More Info'),
      hasCategory: html.includes('Category:'),
      hasManufacturer: html.includes('Manufacturer:'),
      hasAssociatedWith: html.includes('is associated with'),
      hasDetailList: !!doc.querySelector('.detail-list'),
      hasRealProduct
    });
    
    if (!hasRealProduct) {
      console.log('UPCItemDB: No real product information detected');
      throw new Error('Product not found in UPCItemDB database');
    }

    const product = {
      title: '',
      brand: '',
      category: '',
      size: '',
      description: '',
      image: ''
    };

    // Get title from the specific UPCItemDB structure
    const detailTitleElement = doc.querySelector('p.detailtitle');
    if (detailTitleElement) {
      const boldElement = detailTitleElement.querySelector('b');
      if (boldElement) {
        product.title = boldElement.textContent.trim();
        console.log('UPCItemDB found title in detailtitle:', product.title);
      }
    }
    
    // Fallback title extraction if the above doesn't work
    if (!product.title) {
      const titleSelectors = [
        'h1',
        '.product-title',
        '[class*="title"]',
        '.item-title',
        '.product-name'
      ];
      
      for (const selector of titleSelectors) {
        const element = doc.querySelector(selector);
        if (element && element.textContent.trim()) {
          const text = element.textContent.trim();
          if (!text.includes('UPC') && 
              !text.toLowerCase().includes('upcitemdb') &&
              !text.toLowerCase().includes('error') &&
              text.length > 3) {
            product.title = text;
            console.log('UPCItemDB found fallback title:', text);
            break;
          }
        }
      }
    }

    // Get "More Info" data from the detail table - target specific container
    product.moreInfo = [];
    const contentBoxContent2 = doc.querySelector('div.content-box-content2');
    if (contentBoxContent2) {
      const detailTable = contentBoxContent2.querySelector('table.detail-list');
      if (detailTable) {
        const rows = detailTable.querySelectorAll('tbody tr, tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            const label = cells[0].textContent.trim();
            const value = cells[1].textContent.trim();
            if (label && value) {
              product.moreInfo.push({ label, value });
            }
          }
        });
        console.log('UPCItemDB found more info from content-box-content2:', product.moreInfo);
      } else {
        console.log('UPCItemDB: No table.detail-list found in content-box-content2');
      }
    } else {
      console.log('UPCItemDB: No content-box-content2 container found');
      // Fallback to original selector
      const detailTable = doc.querySelector('table.detail-list');
      if (detailTable) {
        const rows = detailTable.querySelectorAll('tbody tr, tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            const label = cells[0].textContent.trim();
            const value = cells[1].textContent.trim();
            if (label && value) {
              product.moreInfo.push({ label, value });
            }
          }
        });
        console.log('UPCItemDB found more info (fallback):', product.moreInfo);
      }
    }
    
    const brandInfo = product.moreInfo.find(info => info.label.toLowerCase().includes('brand'));
    if (brandInfo) {
      product.brand = brandInfo.value;
    }

    // Get category
    const categorySelectors = [
      '[class*="category"]',
      '.category',
      '.product-category'
    ];
    
    for (const selector of categorySelectors) {
      const element = doc.querySelector(selector);
      if (element && element.textContent.trim()) {
        product.category = element.textContent.trim();
        break;
      }
    }

    console.log('UPCItemDB: Searching for description in div.cont...');
    const contDiv = doc.querySelector('div.cont');
    console.log('UPCItemDB: div.cont found:', !!contDiv);
    
    if (contDiv) {
      console.log('UPCItemDB: div.cont innerHTML:', contDiv.innerHTML.substring(0, 500));
      const productVariationsList = contDiv.querySelector('ol.num');
      console.log('UPCItemDB: ol.num found:', !!productVariationsList);
      
      if (productVariationsList) {
        const listItems = productVariationsList.querySelectorAll('li');
        console.log('UPCItemDB: li elements found:', listItems.length);
        
        if (listItems.length > 0) {
          // Take all variations as description
          const variations = Array.from(listItems)
            .map(li => {
              const text = li.textContent.trim();
              console.log('UPCItemDB: li text:', text);
              return text;
            })
            .filter(text => text.length > 0);
          
          console.log('UPCItemDB: variations extracted:', variations);
          
          if (variations.length > 0) {
            product.description = variations.join('; ');
            console.log('UPCItemDB found description from div.cont ol.num:', product.description);
          }
        }
      } else {
        console.log('UPCItemDB: No ol.num found in div.cont');
      }
    } else {
      console.log('UPCItemDB: No div.cont container found');
      // Fallback to original selector
      const productVariationsList = doc.querySelector('ol.num');
      if (productVariationsList) {
        const listItems = productVariationsList.querySelectorAll('li');
        if (listItems.length > 0) {
          // Take all variations as description
          const variations = Array.from(listItems)
            .map(li => li.textContent.trim())
            .filter(text => text.length > 0);
          
          if (variations.length > 0) {
            product.description = variations.join('; ');
            console.log('UPCItemDB found description from variations (fallback):', product.description);
          }
        }
      }
    }
    
    // Fallback description extraction if the above doesn't work
    if (!product.description) {
      const descriptionSelectors = [
        '.product-description',
        '.description',
        '[class*="desc"]',
        '.product-details',
        '.item-details'
      ];
      
      for (const selector of descriptionSelectors) {
        const element = doc.querySelector(selector);
        if (element && element.textContent.trim()) {
          product.description = element.textContent.trim();
          console.log('UPCItemDB found fallback description:', product.description);
          break;
        }
      }
    }

    const mainImgDiv = doc.querySelector('div.main-img, div[class*="main-img"]');
    if (mainImgDiv) {
      const productImg = mainImgDiv.querySelector('img.product');
      if (productImg && productImg.src && productImg.src.length > 10) {
        product.image = productImg.src;
        console.log('UPCItemDB: Found image in main-img container:', productImg.src);
      }
    }
    
    // If no image found, try fallback selectors
    if (!product.image) {
      const imageSelectors = [
        'img.product',
        '.main-img img.product',
        'div.main-img img.product',
        'img[src*="product"]',
        'img[src*="item"]',
        'img[src*="image"]',
        '.product-image img',
        'img[alt*="product"]',
        '.item-image img',
        '.product-photo img',
        'img[class*="product"]',
        'img[class*="item"]',
        'img:not([src*="logo"]):not([src*="icon"]):not([src*="placeholder"])'
      ];
    
      console.log('UPCItemDB: Searching for images with fallback selectors...');
      
      // Debug: log all images found on the page
      const allImages = doc.querySelectorAll('img');
      console.log('UPCItemDB: All images found:', Array.from(allImages).map(img => ({
        src: img.src,
        alt: img.alt,
        className: img.className,
        outerHTML: img.outerHTML.substring(0, 200)
      })));
      
      // Debug: specifically look for the main-img container
      const mainImgContainers = doc.querySelectorAll('.main-img, div[class*="main-img"]');
      console.log('UPCItemDB: Main image containers found:', Array.from(mainImgContainers).map(container => ({
        className: container.className,
        innerHTML: container.innerHTML.substring(0, 300)
      })));
      
      // Debug: look for product class images
      const productImages = doc.querySelectorAll('img.product, img[class*="product"]');
      console.log('UPCItemDB: Product images found:', Array.from(productImages).map(img => ({
        src: img.src,
        className: img.className,
        outerHTML: img.outerHTML.substring(0, 200)
      })));
      
      for (const selector of imageSelectors) {
        const element = doc.querySelector(selector);
        if (element && element.src && 
            !element.src.includes('placeholder') &&
            !element.src.includes('logo') &&
            !element.src.includes('icon') &&
            element.src.length > 10) {
          product.image = element.src;
          console.log('UPCItemDB: Found image with fallback selector:', selector, 'URL:', element.src);
          break;
        }
      }
    }
    
    if (!product.image && allImages.length > 0) {

      for (const img of allImages) {
        if (img.src && img.src.includes('ebayimg.com')) {
          product.image = img.src;
          console.log('UPCItemDB: Found eBay image:', img.src);
          break;
        }
      }

      if (!product.image) {
        for (const img of allImages) {
          if (img.src && 
              !img.src.includes('logo') &&
              !img.src.includes('icon') &&
              !img.src.includes('placeholder') &&
              !img.src.includes('data:image') &&
              img.src.startsWith('http') &&
              img.src.length > 20) {
            product.image = img.src;
            console.log('UPCItemDB: Found fallback image:', img.src);
            break;
          }
        }
      }
    }

    console.log('UPCItemDB parsed product data:', {
      title: product.title,
      brand: product.brand,
      category: product.category,
      hasRealProduct
    });
    
    if (!product.title && !product.brand && !hasRealProduct) {
      console.log('UPCItemDB: No meaningful product data found');
      throw new Error('No product information found - may be invalid UPC');
    }

    if (product.title && (product.title.toLowerCase().includes('upcitemdb') || 
                         product.title.toLowerCase().includes('unknown') ||
                         product.title.length < 3)) {
      console.log('UPCItemDB: Generic title detected, treating as no results');
      throw new Error('No meaningful product information found');
    }

    return product;
  }


  function switchMainImage(imageUrl, clickedElement) {
    console.log('Switching main image to:', imageUrl);

    const upcItemDbContainer = document.getElementById('upcItemDbContent');
    if (upcItemDbContainer) {
      const mainImage = upcItemDbContainer.querySelector('.product-image');
      if (mainImage) {
        mainImage.src = imageUrl;
      }
      

      const galleryImages = upcItemDbContainer.querySelectorAll('.gallery-image');
      galleryImages.forEach(img => img.classList.remove('active'));
    }
    
    if (clickedElement) {
      clickedElement.classList.add('active');
    }
  }

  // Function to set up gallery click handlers using event delegation (UPCItemDB only)
  function setupGalleryClickHandlers() {
    console.log('Setting up UPCItemDB gallery click handlers');
    

    const upcItemDbContainer = document.getElementById('upcItemDbContent');
    if (!upcItemDbContainer) {
      console.log('UPCItemDB container not found');
      return;
    }
    

    const existingHandler = upcItemDbContainer.querySelector('.image-gallery');
    if (existingHandler) {
      existingHandler.removeEventListener('click', handleGalleryClick);
    }
    

    const gallery = upcItemDbContainer.querySelector('.image-gallery');
    if (gallery) {
      gallery.addEventListener('click', handleGalleryClick);
      console.log('UPCItemDB gallery click handler attached');
    } else {
      console.log('No UPCItemDB gallery found');
    }
  }
  

  function handleGalleryClick(event) {
    if (event.target.classList.contains('gallery-image')) {
      const imageUrl = event.target.getAttribute('data-image-url');
      if (imageUrl) {
        console.log('Gallery image clicked:', imageUrl);
        switchMainImage(imageUrl, event.target);
      }
    }
  }

  // Function to handle image loading errors
  function handleImageError(imgElement) {
    imgElement.style.display = 'none';
    const nextSibling = imgElement.nextElementSibling;
    if (nextSibling && nextSibling.classList.contains('no-image')) {
      nextSibling.style.display = 'flex';
    }
  }

  // Function to set up image error handlers
  function setupImageErrorHandlers() {
    document.querySelectorAll('img.product-image').forEach(img => {
      img.onerror = null;
      img.onerror = function() {
        handleImageError(this);
      };
    });
  }

  // Function to clear all cached data
  async function clearAllCachedData() {
    try {
      console.log('[CACHE] Starting cache clearing process...');
      
      // Get all keys from storage
      const result = await chrome.storage.local.get(null);
      console.log('[CACHE] Current storage keys:', Object.keys(result));
      
      // Find all cache-related keys (both 'cache_' and 'search_' prefixes)
      const cacheKeys = Object.keys(result).filter(key => 
        key.startsWith('cache_') || key.startsWith('search_')
      );
      
      console.log('[CACHE] Found cache keys to remove:', cacheKeys);
      
 
      if (cacheKeys.length > 0) {

        const chunkSize = 10;
        for (let i = 0; i < cacheKeys.length; i += chunkSize) {
          const chunk = cacheKeys.slice(i, i + chunkSize);
          await chrome.storage.local.remove(chunk);
          console.log(`[CACHE] Removed chunk ${i / chunkSize + 1} of ${Math.ceil(cacheKeys.length / chunkSize)}`);
        }
      }
      
      // Clear the fetch cache
      if (typeof fetchCache !== 'undefined' && fetchCache.clear) {
        fetchCache.clear();
        console.log('[CACHE] Cleared in-memory fetch cache');
      }
      
      // Clear the displayed results
      const barcodeLookupContent = document.getElementById('barcodeLookupContent');
      const upcItemDbContent = document.getElementById('upcItemDbContent');
      const goUpcContent = document.getElementById('goUpcContent');
      
      if (barcodeLookupContent) {
        barcodeLookupContent.innerHTML = `
          <div style="text-align: center; color: #615e5e; padding: 40px;">
            <div class="provider-logo-text">
              <img src="https://www.barcodelookup.com/assets/images/barcode-lookup-logo.webp" width="48" height="32" alt="Barcode Lookup logo">
              <span class="barcode-logo">&nbsp;BARCODE</span>
              <span class="lookup-logo">&nbsp;LOOKUP</span>
            </div>
            Enter a UPC code to search for product information
          </div>
        `;
      }
      
      if (upcItemDbContent) {
        upcItemDbContent.innerHTML = `
          <div style="text-align: center; color: #615e5e; padding: 40px;">
            <div class="provider-logo-text upcitemdb-logo-text">
              <img src="logo/upcitemdb.png" width="100" height="auto" alt="UPCItemDB logo">
            </div>
            Enter a UPC code to search for product information
          </div>
        `;
      }
      
      if (goUpcContent) {
        goUpcContent.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon go-upc-empty">
              <img src="https://go-upc.com/img/logo.svg" width="100" height="auto" alt="Go-UPC logo">
            </div>
            <div class="empty-text">Enter a UPC code to search for product information</div>
          </div>
        `;
      }
      
      // Clear any active UPC in the input field
      const upcInput = document.getElementById('upcInput');
      if (upcInput) {
        upcInput.value = '';
      }
      

      await chrome.storage.local.remove('lastUPC');
      

      const afterClear = await chrome.storage.local.get(null);
      console.log('[CACHE] Storage after clearing:', Object.keys(afterClear));
      

      await updateExtensionBadgeBasedOnCache();
      

      
      console.log('[CACHE] All cached data has been cleared');
      return true;
    } catch (error) {
      console.error('[CACHE] Error clearing cache:', error);
      showNotification('Error clearing cache', 'error');
      return false;
    }
  }
  
  // Function to show notification
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after delay
    setTimeout(() => {
      notification.classList.add('show');
      
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          notification.remove();
        }, 300);
      }, 3000);
    }, 100);
  }

  // Make functions globally available
  window.switchMainImage = switchMainImage;
  window.setupGalleryClickHandlers = setupGalleryClickHandlers;
  window.setupImageErrorHandlers = setupImageErrorHandlers;
  
  // Handle search input and clear button

  // Show/hide clear button based on input and cache state
  function updateClearButton(forceShow = false) {
    if (upcInput.value.trim() !== '' || forceShow) {
      searchInputWrapper.classList.add('has-text');
    } else {
      searchInputWrapper.classList.remove('has-text');
    }
  }

  // Function to show empty state with animation
  function showEmptyState() {
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) {
      // Reset animation by removing and re-adding the class
      emptyState.style.animation = 'none';
      // Trigger reflow to ensure the reset takes effect
      void emptyState.offsetWidth;
      // Re-add the animation class
      emptyState.style.animation = 'fadeIn 0.5s ease-out forwards';
      emptyState.style.animationDelay = '0.2s';
    }
  }

  // Handle clear button click
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      

      const barcodePanel = document.getElementById('barcodeLookupContent');
      const upcItemDbPanel = document.getElementById('upcItemDbContent');
      

      if (cacheBadge && window.getComputedStyle(cacheBadge).display !== 'none') {
        cacheBadge.classList.add('fade-out');

        await new Promise(resolve => {
          cacheBadge.addEventListener('animationend', () => {
            cacheBadge.style.display = 'none';
            cacheBadge.classList.remove('fade-out');
            resolve();
          }, { once: true });
        });
      }

      upcInput.value = '';
      searchInputWrapper.classList.remove('has-text');
      

      const originalBtnText = clearSearchBtn.innerHTML;
      clearSearchBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
        </svg>
      `;
      
      try {
        // Show loading state in panels
        if (barcodePanel) {
          barcodePanel.innerHTML = `
            <div class="empty-state">
              Enter a UPC code to search for product information
            </div>
          `;
        }
        
        if (upcItemDbPanel) {
          upcItemDbPanel.innerHTML = `
            <div class="empty-state">
              Enter a UPC code to search for product information
            </div>
          `;
        }
        
        // Trigger the empty state animation
        showEmptyState();
        
        await clearAllCachedData();
      } catch (error) {
        console.error('Error clearing cache:', error);
        showNotification('Error clearing cache', 'error');
      } finally {
        // Restore original icon
        clearSearchBtn.innerHTML = originalBtnText;
      }
    });
  }

  if (upcInput) {
    upcInput.addEventListener('input', () => updateClearButton(false));

    updateClearButton(!!upcInput.value.trim());
  }
  
  // Show clear button when results are loaded from cache
  if (cacheBadge) {
    const observer = new MutationObserver((mutations) => {
      // Check if the cache badge is visible
      const isCached = window.getComputedStyle(cacheBadge).display !== 'none';
      updateClearButton(isCached);
    });
    
    // Observe changes to the cache badge's style attribute
    observer.observe(cacheBadge, { attributes: true, attributeFilter: ['style'] });
    
    // Initial check
    const isCached = window.getComputedStyle(cacheBadge).display !== 'none';
    updateClearButton(isCached);
  }

  function extractSizeFromText(text, priority = 3) {
    if (!text) return { size: '', priority: 0 };

    console.log('Extracting size from text (priority:', priority, '):', text);

    const isValidSize = (size) => {

      const volumeUnitRegex = /(ml|mL|ML|L|l|liter|liters|litre|litres|gal|gallon|gallon|pint|pt|quart|qt|fl\s*oz|oz|ounce|ounces)\b/i;
      if (volumeUnitRegex.test(size)) {

        const numberMatch = size.match(/\d+/g);
        if (numberMatch) {
          for (const num of numberMatch) {
            if (parseFloat(num) > 100000) {
              console.log('Filtering out invalid volume size (number too large):', size);
              return false;
            }
          }
        }
        return true;
      }
      
 
      const numberMatch = size.match(/\d+/g);
      if (numberMatch) {
        for (const num of numberMatch) {

          if (parseFloat(num) > 10000) {
            console.log('Filtering out invalid size (number too large):', size);
            return false;
          }
        }
      }
      return true;
    };
    

    const fractionPatterns = [
      // Matches: 2 - 3/8 oz (with space-hyphen-space)
      /(\d+\s*-\s*\d+\/\d+\s*[a-zA-Z]+)/g,
      // Matches: 2-3/8 oz (with hyphen)
      /(\d+-\d+\/\d+\s*[a-zA-Z]+)/g,
      // Matches: 2 3/8 oz (with space)
      /(\d+\s\d+\/\d+\s*[a-zA-Z]+)/g,
      // Matches: 2.3/8 oz (with decimal)
      /(\d+[\.,]\d+\/\d+\s*[a-zA-Z]+)/g,
      // Matches: 3/8 oz (simple fraction)
      /(\d+\/\d+\s*[a-zA-Z]+)/g,
      // Matches: 2.125 oz (decimal)
      /(\d+\.\d+\s*[a-zA-Z]+)/g,
      // Matches: 2 oz (whole number)
      /(\d+\s*[a-zA-Z]+)/g,
      // Matches: 2 - 3.8 oz (decimal with range)
      /(\d+\s*-\s*\d+\.\d+\s*[a-zA-Z]+)/g,
      // Matches: 2-3.8 oz (decimal with hyphen)
      /(\d+-\d+\.\d+\s*[a-zA-Z]+)/g
    ];
    
    // Try to find fractional sizes first
    for (const pattern of fractionPatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        // Get all matches and find the one with the most digits (most specific)
        const bestMatch = matches.reduce((best, current) => {
          const currentStr = current[0];
          const currentDigits = (currentStr.match(/\d+/g) || []).join('').length;
          const bestDigits = best ? (best[0].match(/\d+/g) || []).join('').length : 0;
          return currentDigits > bestDigits ? current : best;
        }, null);
        
        if (bestMatch) {
          const size = bestMatch[0].trim();
          if (isValidSize(size)) {
            // Boost priority for fractional sizes as they're often more accurate
            const boostedPriority = /\d+[\/\-\.]\d+/.test(size) ? priority - 0.5 : priority;
            return { size, priority: boostedPriority };
          }
        }
      }
    }

    // Prioritized size patterns - liter units first, then other volume units, then weight units
    const prioritizedPatterns = [
      // Liter units (highest priority - often the most accurate for liquid products)
      /\b(\d*\.?\d+)\s*[xX]?\s*(?:\d*\s*)?(?:L|l|liter|liters|litre|litres)\b/gi,
      /\b(\d+)\s*(?:L|l)(?!\w)/gi,  // Matches 1L, 1l, etc.
      
      // Milliliter and centiliter units
      /\b(\d*\.?\d+)\s*(?:ml|mL|ML|milliliter|milliliters)\b/gi,
      /\b(\d*\.?\d+)\s*(?:cl|cL|CL|centiliter|centiliters)\b/gi,
      
      // Fluid ounces (various formats)
      /\b(\d+\.?\d*)\s*(?:fl\s*[oO]z|FL\s*OZ|fl\.?\s*oz\.?|fluid\s*ounce|fluid\s*ounces)\b/gi,
      /\b(\d+\.?\d*)\s*[oO][zZ](?!\w)/gi,  // Matches 12oz, 12OZ, etc.
      
      // Gallon units (various formats)
      /\b(\d+\.?\d*)\s*(?:gal|gallon|gallons|gl)\b/gi,
      /\b(\d+)\s*[gG](?!\w)/gi,  // Matches 1g (gallon), 1G, etc.
      
      // Pint units
      /\b(\d+\.?\d*)\s*(?:pt|pint|pints)\b/gi,
      
      // Quart units
      /\b(\d+\.?\d*)\s*(?:qt|quart|quarts)\b/gi,
      
      // Weight units - kilograms
      /\b(\d+\.?\d*)\s*(?:kg|kilogram|kilograms|kilo|kilos)\b/gi,
      
      // Weight units - grams
      /\b(\d+\.?\d*)\s*(?:g|gram|grams|gm|gr)\b/gi,
      
      // Weight units - pounds
      /\b(\d+\.?\d*)\s*(?:lb|lbs|pound|pounds|#)\b/gi,
      
      // Weight units - ounces
      /\b(\d+\.?\d*)\s*(?:oz|ounce|ounces)\b/gi,
      
      // Count/pack units (with optional pack size)
      /\b(\d+\.?\d*)\s*[xX]?\s*(?:count|ct|pack|pk|bottle|btl)\b/gi,
      
      // Multi-packs with volume/weight units (highest priority for pack sizes)
      // Examples: 12 fl oz x 4 pk, 500ml x 6, 1.75L x 4, 1L x 12, etc.
      /\b(\d*\.?\d+)\s*((?:fl\s*)?[oO][zZ]|[mM][lL]|[cC][lL]|[lL]|[gG](?:ram|rams)?|gal(?:lon)?s?|kg|lb|oz)\s*[xX]\s*(\d+)\s*(?:pack|pk|ct|count|bottle|btl)?\b/gi,
      
      // Unit after pack size: 12x500ml, 4x1.75L, 6x12oz, etc.
      /\b(\d+)\s*[xX]\s*(\d*\.?\d+)\s*((?:fl\s*)?[oO][zZ]|[mM][lL]|[cC][lL]|[lL]|[gG](?:ram|rams)?|gal(?:lon)?s?|kg|lb|oz)\b/gi,
      
      // Simple numeric pack sizes with unit at end: 12x4oz, 4x12pk, etc.
      /\b(\d+)\s*[xX]\s*(\d+)\s*([a-zA-Z]+)\b/gi,
      
      // Simple numeric pack sizes: 12x4, 4x12, etc. (lowest priority)
      /\b(\d+)\s*[xX]\s*(\d+)(?!\d)/gi,
      
      // Simple numeric patterns (lowest priority)
      /\b(\d+\.?\d*)\s*[lLgG]\b/gi,  // Matches 1l, 1L, 1g, 1G, etc.
      /\b(\d+)\s*(?:ml|mL|ML|oz|OZ|fl\s*oz|FL\s*OZ)\b/gi,
      
      // Catch-all for any remaining numeric + unit patterns
      /(\d+\s*[\d\/]*\s*[a-zA-Z]+)/g
    ];

    // Try each pattern in priority order
    for (const pattern of prioritizedPatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        // Find the first valid match
        for (const match of matches) {
          const potentialSize = match[0].trim();
          if (isValidSize(potentialSize)) {
            console.log('Found size match (priority:', priority, '):', potentialSize, 'with pattern:', pattern);
            return { size: potentialSize, priority };
          } else {
            console.log('Skipping invalid size:', potentialSize);
          }
        }
      }
    }

    console.log('No size found in text');
    return { size: '', priority: 0 };
  }

  function displayBarcodeLookupResults(product, upc) {
    if (!product || !product.title) {
      showError('No product information found on BarcodeLookup.com', barcodeLookupContent);
      // Provider-specific status
      try { setProviderStatus('barcode-lookup', 'error'); } catch {}
      return;
    }

    try { setProviderStatus('barcode-lookup', 'success'); } catch {}


    barcodeSizeBadge.style.display = 'none';
    

    if (product) {
      delete product.size;
    }

    const formattedUPC = upc.length === 12 ? 
      `UPC-A ${upc.substring(0,1)} ${upc.substring(1,6)} ${upc.substring(6,11)} ${upc.substring(11)}` :
      `UPC ${upc}`;

    let html = `
      <div class="barcode-header">
        <h2 class="upc-title">UPC ${upc}</h2>
      </div>
      
      ${product.title ? `
      <div class="product-title-section">
        <h3 class="product-title-main">${product.title}</h3>
      </div>
      ` : ''}
      
      <div class="product-display">
        <div class="product-image-container">
          ${product.image ? 
            `<img src="${product.image}" alt="product.title" class="product-image">
             <div class="no-image" style="display: none;">No image available</div>` : 
            `<div class="no-image">No image available</div>`}
        </div>
        
        <div class="product-details-right">
          ${product.description ? `
          <div class="info-section">
            <h4 class="section-title">Description:</h4>
            <div class="section-content">
              <div class="product-description-text">${product.description}</div>
            </div>
          </div>
          ` : ''}
          
          ${product.attributes && product.attributes.length > 0 ? `
          <div class="info-section">
            <h4 class="section-title">Attributes:</h4>
            <div class="section-content">
              <ul class="attributes-list">
                ${product.attributes.map(attr => `<li class="attribute-item">${attr}</li>`).join('')}
              </ul>
            </div>
          </div>
          ` : ''}
          
          ${product.category ? `
          <div class="info-section">
            <h4 class="section-title">Category:</h4>
            <div class="section-content">
              <div class="category-name">${product.category}</div>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `;

    // Add store information if available
    if (product.stores && product.stores.length > 0) {
      html += `
        <div class="stores-section">
          <div class="stores-title">Available at:</div>
          ${product.stores.map(store => `
            <div class="store-item">
              <span class="store-name">${store}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Add link to original page
    html += `
      <div class="additional-info">
        <div class="info-item">
          <span class="info-label">Source:</span>
          <span class="info-value"><a href="https://www.barcodelookup.com/${upc}" target="_blank">View on BarcodeLookup.com</a></span>
        </div>
      </div>
    `;
    // Render into the BarcodeLookup panel
    if (barcodeLookupContent) {
      barcodeLookupContent.innerHTML = html;
      setupImageErrorHandlers();
      makeImagesClickable();
    }
  }

  // Render UPCItemDB results (result: { source, data })
  function displayUPCItemDBResults(result, upc) {
    console.log('Result source:', result?.source);
    console.log('Result data structure:', result?.data);
    
    if (!result || !result.data) {
      console.error('No result data found');
      showError('No product information found on UPCItemDB.com', upcItemDbContent);
      try { setProviderStatus('upc-itemdb', 'error'); } catch {}
      console.groupEnd?.();
      return;
    }

    const product = result.data;
    console.log('Product data:', product);
    try { setProviderStatus('upc-itemdb', 'success'); } catch {}
    
    // Debug: Log all product properties to check for size-related fields
    if (product) {
      console.log('Product properties:', Object.keys(product));
      if (product.size) {
        console.log('Product.size type:', typeof product.size);
        console.log('Product.size value:', product.size);
      }
      if (product.attributes) {
        console.log('Product.attributes:', product.attributes);
      }
    }
    
    if (result.source === 'api') {
      const title = product.title || product.brand || 'Unknown Product';
      const category = product.category || '';
      
      // Extract all titles from API response (main item + offers)
      let allTitles = [];
      let description = product.description || '';
      
      // Detect API data shape
      let apiData = result.items ? result : result.data;
      let itemsArray = null;
      if (apiData && Array.isArray(apiData.items)) {
        itemsArray = apiData.items;
      } else if (apiData && apiData.title) {
        itemsArray = [apiData];
      } else if (Array.isArray(apiData)) {
        itemsArray = apiData;
      }
      
      if (itemsArray && itemsArray.length > 0) {
        itemsArray.forEach(item => {
          if (item.title && item.title.trim()) allTitles.push(item.title.trim());
          if (item.offers && Array.isArray(item.offers)) {
            item.offers.forEach(offer => {
              if (offer.title && offer.title.trim()) allTitles.push(offer.title.trim());
            });
          }
        });
      }
      allTitles = [...new Set(allTitles)];
      
      // Collect images
      let allImages = [];
      if (result.data && Array.isArray(result.data.items)) {
        result.data.items.forEach(item => {
          if (item.images && Array.isArray(item.images)) allImages.push(...item.images);
          if (item.attributes && typeof item.attributes === 'object') {
            Object.values(item.attributes).forEach(value => {
              if (typeof value === 'string' && value.match(/^https?:\/\//)) allImages.push(value);
            });
          }
        });
      }
      if (product.images && Array.isArray(product.images)) allImages.push(...product.images);
      
      if (allImages.length === 0) {
        if (product.image) allImages = [product.image];
        else if (product.image_url) allImages = [product.image_url];
        else if (product.thumb) allImages = [product.thumb];
      }
      allImages = [...new Set(allImages)].filter(img => img && img.startsWith('http'));
      const primaryImage = allImages.length > 0 ? allImages[0] : null;
      
      // Hide size badge and remove size
      upcItemDbSizeBadge.style.display = 'none';
      if (product) delete product.size;

      let html = '';
      html += `
        <div class="barcode-header">
          <h2 class="upc-title">UPC ${upc}</h2>
        </div>
      `;
      if (title) {
        html += `
          <div class="product-title-section">
            <h3 class="product-title-main">${title}</h3>
          </div>
        `;
      }
      html += `
        <div class="product-display">
          <div class="product-image-container">
      `;
      if (allImages.length > 0) {
        html += `
          <div class="main-image">
            <img src="${primaryImage}" alt="${title}" class="product-image">
            <div class="no-image" style="display: none;">No image available</div>
          </div>
          </div>
        `;
      } else {
        html += `
          <div class="no-image">No image available</div>
          </div>
        `;
      }
      html += `
          <div class="product-details-right">
      `;
      if (allTitles.length > 0) {
        const titlesList = allTitles.map(titleText => `<li>${titleText}</li>`).join('');
        html += `
          <div class="info-section">
            <h4 class="section-title">UPC has following Product Name Variations:</h4>
            <div class="section-content">
              <ol class="product-titles-list">
                ${titlesList}
              </ol>
            </div>
          </div>
        `;
      }
      if (description) {
        const country = (product.moreInfo && product.moreInfo.find(info => info.label && info.label.toLowerCase().includes('country')) || {}).value || '';
        html += `
          <div class="info-section">
            <h4 class="section-title">More Info</h4>
            <div class="section-content">
              <table class="detail-list">
                <tbody>
                  <tr><td>UPC-A:</td><td>${upc}</td></tr>
                  <tr><td>EAN-13:</td><td>0 ${upc.substring(0, 6)} ${upc.substring(6)}</td></tr>
                  <tr><td>Country of Registration:</td><td>${country}</td></tr>
                  <tr><td>Brand:</td><td>${product.brand || 'N/A'}</td></tr>
                  <tr><td>Model #:</td><td>${product.model || 'N/A'}</td></tr>
                  <tr><td>Last Scanned:</td><td>${new Date().toLocaleString()}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        `;
      }
      if (product.moreInfo && product.moreInfo.length > 0) {
        const rows = product.moreInfo
          .filter(info => info.label && !info.label.toLowerCase().includes('country'))
          .map(info =>
            `<tr>
               <td class="info-label" style="width: 40%; word-wrap: break-word; overflow-wrap: break-word;">${info.label}</td>
               <td class="info-value" style="width: 50%; word-wrap: break-word; overflow-wrap: break-word;">${info.value}</td>
             </tr>`
          ).join('');
        html += `
          <div class="info-section">
            <h4 class="section-title">Additional Information:</h4>
            <div class="section-content">
               <table class="more-info-table" style="width: 90%; table-layout: fixed; word-wrap: break-word; max-width: 90%; overflow-wrap: break-word;">
                 ${rows}
               </table>
            </div>
          </div>
        `;
      }
      if (category) {
        html += `
          <div class="info-section">
            <h4 class="section-title">Category:</h4>
            <div class="section-content">
              <div class="category-name">${category}</div>
            </div>
          </div>
        `;
      }
      html += `
          </div>
        </div>
      `;
      html += `
        <div class="additional-info">
          <div class="info-item">
            <span class="info-label">Source:</span>
            <span class="info-value"><a href="https://www.upcitemdb.com/upc/${upc}" target="_blank">View on UPCItemDB.com</a></span>
          </div>
        </div>
      `;
      upcItemDbContent.innerHTML = html;
      setupGalleryClickHandlers();
      setupImageErrorHandlers();
      makeImagesClickable();
      console.groupEnd?.();
      return;
    }

    // Web scraping result path
    const title = product.title || 'Unknown Product';
    const category = product.category || '';
    const description = product.description || '';
    if (product) delete product.size;
    upcItemDbSizeBadge.style.display = 'none';
    
    let html = '';
    html += `
      <div class="barcode-header">
        <h2 class="upc-title">UPC ${upc}</h2>
      </div>
    `;
    if (title) {
      html += `
        <div class="product-title-section">
          <h3 class="product-title-main">${title}</h3>
        </div>
      `;
    }
    html += `
      <div class="product-display">
        <div class="product-image-container">
    `;
    if (product.image) {
      html += `
        <img src="${product.image}" alt="${title}" class="product-image">
        <div class="no-image" style="display: none;">No image available</div>
        </div>
      `;
    } else {
      html += `
        <div class="no-image">No image available</div>
        </div>
      `;
    }
    html += `
          <div class="product-details-right">
    `;
    if (description) {
      const country = (product.moreInfo && product.moreInfo.find(info => info.label && info.label.toLowerCase().includes('country')) || {}).value || '';
      html += `
        <div class="info-section">
          <h4 class="section-title">More Info</h4>
          <div class="section-content">
            <table class="detail-list">
              <tbody>
                <tr><td>UPC-A:</td><td>${upc}</td></tr>
                <tr><td>EAN-13:</td><td>0 ${upc.substring(0, 6)} ${upc.substring(6)}</td></tr>
                <tr><td>Country of Registration:</td><td>${country}</td></tr>
                <tr><td>Brand:</td><td>${product.brand || 'N/A'}</td></tr>
                <tr><td>Model #:</td><td>${product.model || 'N/A'}</td></tr>
                <tr><td>Last Scanned:</td><td>${new Date().toLocaleString()}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
    if (product.moreInfo && product.moreInfo.length > 0) {
      const rows = product.moreInfo
        .filter(info => info.label && !info.label.toLowerCase().includes('country'))
        .map(info => (
          `<tr>
             <td class="info-label" style="width: 40%; word-wrap: break-word; overflow-wrap: break-word;">${info.label}</td>
             <td class="info-value" style="width: 50%; word-wrap: break-word; overflow-wrap: break-word;">${info.value}</td>
           </tr>`
        )).join('');
      html += `
        <div class="info-section">
          <h4 class="section-title">Additional Information:</h4>
          <div class="section-content">
             <table class="more-info-table" style="width: 90%; table-layout: fixed; word-wrap: break-word; max-width: 90%; overflow-wrap: break-word;">
               ${rows}
             </table>
          </div>
        </div>
      `;
    }
    if (category) {
      html += `
        <div class="info-section">
          <h4 class="section-title">Category:</h4>
          <div class="section-content">
            <div class="category-name">${category}</div>
          </div>
        </div>
      `;
    }
    html += `
        </div>
      </div>
    `;
    html += `
      <div class="additional-info">
        <div class="info-item">
          <span class="info-label">Source:</span>
          <span class="info-value"><a href="https://www.upcitemdb.com/upc/${upc}" target="_blank">View on UPCItemDB.com</a></span>
        </div>
      </div>
    `;
    upcItemDbContent.innerHTML = html;
    setupImageErrorHandlers();
    makeImagesClickable();
  }

  // Display Go-UPC results
  function displayGoUpcResults(product, upc) {
    if (!product || (!product.title && !product.description && !product.image && (!product.moreInfo || product.moreInfo.length === 0))) {
      showError('No product information found on Go-UPC.com', goUpcContent);
      try { setProviderStatus('go-upc', 'error'); } catch {}
      return;
    }

    try { setProviderStatus('go-upc', 'success'); } catch {}

    // Hide size badge
    if (goUpcSizeBadge) goUpcSizeBadge.style.display = 'none';

    const formattedUPC = upc.length === 12 ? 
      `UPC-A ${upc.substring(0,1)} ${upc.substring(1,6)} ${upc.substring(6,11)} ${upc.substring(11)}` :
      `UPC ${upc}`;

    let html = `
      <div class="barcode-header">
        <h2 class="upc-title">UPC ${upc}</h2>
      </div>
      
      ${product.alert ? `
      <div class="alert-section">
        <div class="alert-message">${product.alert}</div>
      </div>
      ` : ''}
      
      ${product.title ? `
      <div class="product-title-section">
        <h3 class="product-title-main">${product.title}</h3>
      </div>
      ` : ''}
      
      <div class="product-display">
        <div class="product-image-container">
          ${product.image ? 
            `<img src="${product.image}" alt="${product.title}" class="product-image">
             <div class="no-image" style="display: none;">No image available</div>` : 
            `<div class="no-image">No image available</div>`}
        </div>
        
        <div class="product-details-right">
          ${product.description ? `
          <div class="info-section">
            <h4 class="section-title">Description:</h4>
            <div class="section-content">
              <div class="product-description-text">${product.description}</div>
            </div>
          </div>
          ` : ''}
          
          ${product.moreInfo && product.moreInfo.length > 0 ? `
          <div class="info-section">
            <h4 class="section-title">More Info:</h4>
            <div class="section-content">
              <table class="detail-list">
                <tbody>
                  ${product.moreInfo.map(info => 
                    `<tr>
                       <td class="metadata-label">${info.label}</td>
                       <td>${info.value}</td>
                     </tr>`
                  ).join('')}
                </tbody>
              </table>
            </div>
          </div>
          ` : ''}
          
          ${product.category ? `
          <div class="info-section">
            <h4 class="section-title">Category:</h4>
            <div class="section-content">
              <div class="category-name">${product.category}</div>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `;

    // Add link to original page
    html += `
      <div class="additional-info">
        <div class="info-item">
          <span class="info-label">Source:</span>
          <span class="info-value"><a href="https://go-upc.com/search?q=${upc}" target="_blank">View on Go-UPC.com</a></span>
        </div>
      </div>
    `;

    // Render into the Go-UPC panel
    if (goUpcContent) {
      goUpcContent.innerHTML = html;
      setupImageErrorHandlers();
      makeImagesClickable();
    }
  }

  // Show Go-UPC no results message
  function showGoUpcNoResults(container, upc) {
    if (!container) return;
    
    try { setProviderStatus('go-upc', 'error'); } catch {}
    
    const html = `
      <div class="no-results">
        <div class="empty-icon">
          <img src="https://go-upc.com/img/logo.svg" alt="Go-UPC Logo" width="100" height="auto" style="opacity: 0.6;">
        </div>
        <div class="empty-text">Sorry, we were not able to find a product for ${upc}</div>
      </div>
    `;
    
    container.innerHTML = html;
  }

  function showLoading(element) {
    if (!element) {
      console.error('Cannot show loading: element is null');
      return;
    }
    element.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <span>Searching...</span>
      </div>
    `;
  }



  function showError(message, element) {
    if (!element) {
      console.error('Cannot show error: element is null. Message was:', message);
      return;
    }
    element.innerHTML = `
      <div class="error">
        ${message}
      </div>`;
  
    try {
      const id = element.id || '';
      if (id === 'barcodeLookupContent') setProviderStatus('barcode-lookup', 'error');
      else if (id === 'upcItemDbContent') setProviderStatus('upc-itemdb', 'error');
    } catch {}
  }

  // Show UPCItemDB-specific no results message with icon
  function showUPCItemDBNoResults(element, upc) {
    if (!element) {
      console.error('Cannot show UPCItemDB no results: element is null');
      return;
    }
  
    // UPCitemDB Logo
   const logoSrc = 'logo/upcitemdb.png';
  
    element.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">
          <img src="${logoSrc}" 
               alt="UPCItemDB Logo" 
               width="100" 
               height="auto"
               class="upcitemdb-logo"
               style="object-fit: contain;"
               onerror="this.style.display='none';">
        </div>
        <div class="no-results-message">
          The UPC ${upc || 'Code'} you were looking for currently has no record in our database.
        </div>
      </div>`;

    // Set provider status to error for UPCItemDB
    try {
      setProviderStatus('upc-itemdb', 'error');
    } catch {}
  }

  // List of CORS proxy endpoints to try in order
  const PROXY_ENDPOINTS = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://cors-anywhere.herokuapp.com/',
    'https://cors.bridged.cc/',
    'https://thingproxy.freeboard.io/fetch/'
  ].filter((value, index, self) => self.indexOf(value) === index);

  // List of user agents to rotate
  const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
  ];

  // Get a random user agent
  function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  }

  // Optimized fetch with CORS proxy, retries, and caching
  const fetchCache = new Map();
  const FETCH_CACHE_TTL = 2 * 60 * 1000; // 2 minutes cache TTL

  async function fetchWithProxy(url, retryCount = 0, isRetry = false) {
    const maxRetries = 2; // Reduced from 3 to fail faster
    const timeoutDuration = 5000; // 5 seconds timeout (reduced from 8s)
    
    // Check cache first
    const cacheKey = `fetch_${url}`;
    const cached = fetchCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < FETCH_CACHE_TTL) {
      return cached.data;
    }
    
    // Skip proxy for local development
    const isLocal = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';
    
    // Use AbortController for better timeout handling
    const controller = new AbortController();
    let timeoutId;
    
    try {
      // Set timeout
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          controller.abort();
          reject(new Error('Request timed out'));
        }, timeoutDuration);
      });
      
      let response;
      const options = {
        signal: controller.signal,
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      };
      
      // Race between the fetch and the timeout
      const fetchPromise = (async () => {
        if (isLocal) {
          return await fetch(url, options);
        }
        
        // Try direct fetch first (faster if CORS allows)
        try {
          const directResponse = await fetch(url, options);
          if (!directResponse.ok) throw new Error(`HTTP ${directResponse.status}`);
          return directResponse;
        } catch (directError) {
          // Fall back to proxy if direct fetch fails
          const proxyUrl = PROXY_ENDPOINTS[retryCount % PROXY_ENDPOINTS.length] + encodeURIComponent(url);
          console.log(`Using proxy: ${proxyUrl}`);
          return await fetch(proxyUrl, options);
        }
      })();
      
      response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.text();
      
      // Cache successful responses
      fetchCache.set(cacheKey, {
        data,
        timestamp: now
      });
      
      return data;
      
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error(`[fetchWithProxy] Attempt ${retryCount + 1} failed:`, error.message);
      
      // If we have more retries left, recursively try again
      if (retryCount < maxRetries) {
        console.log(`[fetchWithProxy] Retrying with next proxy...`);
        // Add a small delay before retrying
        await new Promise(resolve => setTimeout(resolve, 300));
        return fetchWithProxy(url, retryCount + 1, true);
      }
      
      // If all retries failed, throw the error
      throw new Error('Unable to fetch data. Please try again later.');
    }
  }
});
