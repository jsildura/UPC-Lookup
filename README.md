# UPC Barcode Lookup Extension

A Chrome browser extension that provides dual-pane UPC barcode lookup functionality, fetching product information from both BarcodeLookup.com and UPCItemDB.com.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.1-blue?style=for-the-badge)

## Features

- **Dual-pane interface**: Side-by-side results from two popular barcode databases
- **Number-only input validation**: Accepts UPC codes in any format but filters to numbers only
- **Cross-origin data fetching**: Uses content scripts and background workers for reliable data retrieval
- **Modern UI**: Clean, responsive design with loading states and error handling
- **Context menu integration**: Right-click selected numbers to lookup UPC codes

## Data Sources

### BarcodeLookup.com
- Product title and description
- Product images
- Brand and category information
- Store availability and pricing
- Size information extracted from product data

### UPCItemDB.com
- API-first approach with web scraping fallback
- Comprehensive product details
- Brand and category data
- Product images
- UPC validation and verification


## Installation Chrome/Edge/Brave/Firefox
```bash
# Clone the repository
git clone https://github.com/jsildura/UPC-Lookup.git
```
or
Download Here [Link](https://github.com/user-attachments/files/21915515/UPC_Lookup.v1.1.zip)

Unzip the file

1. Open extensions page:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
   - **Firefox**: `about:debugging#/runtime/this-firefox`
2. **Enable Developer mode** (toggle in top right)
3. Click **"Load unpacked"** (or "Load Temporary Add-on" in Firefox)
4. **Select the project folder**
5. **Pin the extension** to your toolbar for easy access

## Usage

1. **Click the extension icon** in your Chrome toolbar
2. **Enter a UPC barcode** (numbers only)
3. **Click Search** press Enter
4. **View results** in both panels simultaneously

## File Structure

```
UPC_Lookup/
├── manifest.json          # Extension configuration and metadata
├── popup.html             # Main UI interface
├── popup.js               # Frontend logic, UI handling, and API coordination
├── background.js          # Service worker for background tasks and event handling
├── content.js             # Content script for cross-origin requests and DOM interaction
├── build.js               # Build configuration and scripts
├── error-handler.js       # Centralized error handling and logging
├── license.js             # License validation and management
├── message-bus.js         # Message passing between extension components
├── parsing-utils.js       # Utility functions for data parsing and transformation
├── progressive-loader.js  # Handles progressive loading of data
├── shared-constants.js    # Shared constants and configuration
├── styles.css             # Styling for the extension UI
└── icons/                 # Extension icons and assets
    ├── barcode.png        # Barcode icon
    ├── icon16.png         # 16x16 extension icon
    ├── icon32.png         # 32x32 extension icon
    └── icon128.png        # 128x128 extension icon
```
## Technical Details

### Cross-Origin Request Handling
- Uses Chrome extension permissions for cross-origin requests
- Implements fallback mechanisms for blocked requests
- Content scripts inject into target domains for enhanced scraping

### Error Handling
- Network timeout handling
- Graceful degradation when one source fails
- User-friendly error messages
- Retry mechanisms for temporary failures

## Permissions

The extension requires the following permissions:
- `activeTab`: For content script injection
- `storage`: For storing user preferences and selected UPC codes
- `host_permissions`: Access to barcodelookup.com and upcitemdb.com

## Browser Compatibility

- **Chrome**: Fully supported (Manifest V3)
- **Edge**: Compatible with Chromium-based Edge
- **Firefox**: Requires manifest conversion for Firefox Add-ons

## Troubleshooting

### Common Issues

1. **No results found**
   - Verify the UPC code is valid
   - Check internet connection
   - Some products may not be in the databases

2. **Images not loading**
   - Some product images may be blocked by CORS policies
   - Extension will show "No image available" placeholder

3. **Extension not working**
   - Ensure Developer mode is enabled
   - Check for console errors in Chrome DevTools
   - Reload the extension from chrome://extensions/

## Version History

- **v1.1**: Enhanced user experience with improved no-results handling
  - Clear "No results found" messaging with relevant icons
  - Better error states and user feedback
  - Improved handling of edge cases in search results
- **v1.0**: Initial release with dual-pane lookup functionality

## Known Issues

- Some UPC codes may not return results if they're not in the databases
- Image loading may be blocked by strict CORS policies on some websites
- The extension may require page refresh if background processes time out

## Feedback

We're constantly improving the extension! Please report any issues or suggest features.

## Support

For issues or feature requests, please check the extension's error console or contact the developer.
- Contact: sildura.joelito.t@gmail.com
- Report issues: GitHub Issues
