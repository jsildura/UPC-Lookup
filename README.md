# UPC Barcode Lookup Extension

A Chrome browser extension that provides triple-pane UPC barcode lookup functionality, fetching product information from both barcodelookup.com, upcitemdb.com & go-upc.com

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.1-blue?style=for-the-badge)

## Features

- **Triple-pane interface**: Side-by-side results from three popular barcode databases (BarcodeLookup, UPCItemDB, and Go-UPC)
- **Individual provider toggles**: Enable/disable each database provider independently with visual status indicators
- **Smart input validation**: Accepts UPC codes in any format but filters to numbers only with minimum length validation
- **Advanced caching system**: Intelligent result caching with automatic cleanup and cache status indicators
- **Context menu integration**: Right-click selected numbers anywhere on web pages to lookup UPC codes instantly
- **Cross-origin data fetching**: Uses content scripts, background service workers, and proxy services for reliable data retrieval
- **Dark/light theme support**: Automatic system theme detection with manual toggle and smooth transitions
- **Progressive loading**: Individual provider results load independently with real-time status updates
- **License management**: Built-in licensing system.
- **Enhanced error handling**: Comprehensive error reporting with fallback mechanisms and user-friendly messages
- **Image Click to Expand Support**: Click-to-expand product images with full-screen modal display
- **Persistent storage**: Chrome storage API integration for settings, cache, and user preferences

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

### Go-UPC.com
- Additional product verification and details
- Alternative data source for cross-validation
- Enhanced product information coverage
- Backup lookup when primary sources fail

## Screenshots
<img width="717" height="464" alt="Screenshot_4" src="https://github.com/user-attachments/assets/6945b83d-8593-4aa5-8cdd-bed6e7736b45" />
<img width="714" height="361" alt="Screenshot_5" src="https://github.com/user-attachments/assets/c1f048b9-28c4-41fd-88e6-68bc15d64961" />
<img width="715" height="351" alt="Screenshot_6" src="https://github.com/user-attachments/assets/2299f512-abd5-447c-ad2b-5ab4d32cd1b6" />
<img width="720" height="604" alt="Screenshot_7" src="https://github.com/user-attachments/assets/a227bbcd-b1b5-4219-89f3-ba46fb5d6122" />
<img width="719" height="602" alt="Screenshot_8" src="https://github.com/user-attachments/assets/7de4531c-4694-4b8a-acb5-3e29711fd97a" />
<img width="715" height="599" alt="Screenshot_9" src="https://github.com/user-attachments/assets/3cc4c7fc-5154-4d24-8d47-a678a8362ace" />
<img width="717" height="601" alt="Screenshot_10" src="https://github.com/user-attachments/assets/fe30a83c-a884-4096-80d0-1b0e9f85e2a3" />

## Installation Chrome/Edge/Brave/Firefox
```bash
# Clone the repository
git clone https://github.com/jsildura/UPC-Lookup.git
cd UPC-Lookup
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

## Platform Compatibility
This extension is compatible with all major browsers across Windows, macOS, and Linux:

| Platform | Chrome | Brave | Edge | Firefox | Status |
|----------|--------|-------|------|---------|--------|
| **Windows** | ✅ | ✅ | ✅ | ✅ | Full Support |
| **macOS** | ✅ | ✅ | ✅ | ✅ | Full Support |
| **Linux** | ✅ | ✅ | ✅ | ✅ | Full Support |

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
