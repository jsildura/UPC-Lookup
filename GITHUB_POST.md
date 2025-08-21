# UPC Barcode Lookup Extension

A powerful Chrome browser extension that provides **triple-pane UPC barcode lookup** functionality, fetching comprehensive product information from multiple trusted databases simultaneously.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.1-blue?style=for-the-badge)

## Features

### **Multi-Source Lookup**
- **Triple-pane interface** with side-by-side results from three popular barcode databases
- **BarcodeLookup.com** - Comprehensive product details with pricing and availability
- **UPCItemDB.com** - API-first approach with web scraping fallback
- **Go-UPC.com** - Additional product verification and details

### **Smart Input Handling**
- **Number-only validation** - Accepts UPC codes in any format but filters to numbers only
- **Context menu integration** - Right-click selected numbers to lookup UPC codes instantly
- **Enter key support** - Quick search without clicking buttons

### **Robust Architecture**
- **Cross-origin data fetching** using content scripts and background workers
- **Progressive loading** with fallback mechanisms
- **Centralized error handling** with user-friendly messages
- **Modern Manifest V3** compliance

### **Enhanced User Experience**
- **Clean, responsive design** with loading states
- **Dark & Light Theme** support for comfortable viewing
- **Improved no-results handling** with clear messaging and relevant icons
- **Real-time search feedback** with better error states
- **Modern UI components** with smooth animations

## Screenshots

<img width="717" height="464" alt="Screenshot_4" src="https://github.com/user-attachments/assets/6945b83d-8593-4aa5-8cdd-bed6e7736b45" />
<img width="714" height="361" alt="Screenshot_5" src="https://github.com/user-attachments/assets/c1f048b9-28c4-41fd-88e6-68bc15d64961" />
<img width="715" height="351" alt="Screenshot_6" src="https://github.com/user-attachments/assets/2299f512-abd5-447c-ad2b-5ab4d32cd1b6" />
<img width="720" height="604" alt="Screenshot_7" src="https://github.com/user-attachments/assets/a227bbcd-b1b5-4219-89f3-ba46fb5d6122" />
<img width="719" height="602" alt="Screenshot_8" src="https://github.com/user-attachments/assets/7de4531c-4694-4b8a-acb5-3e29711fd97a" />
<img width="715" height="599" alt="Screenshot_9" src="https://github.com/user-attachments/assets/3cc4c7fc-5154-4d24-8d47-a678a8362ace" />
<img width="717" height="601" alt="Screenshot_10" src="https://github.com/user-attachments/assets/fe30a83c-a884-4096-80d0-1b0e9f85e2a3" />

## Quick Start

### Installation
1. **Download** the extension files to a local folder
2. Open **Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer mode** (toggle in top right)
4. Click **"Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

### Usage
1. **Click the extension icon** in your Chrome toolbar
2. **Enter a UPC barcode** (numbers only)
3. **Press Enter** or click Search
4. **View results** in all three panels simultaneously

**Alternative:** Right-click any selected numbers on a webpage and choose "Lookup UPC" from the context menu

## Technical Architecture

### Core Components
```
UPC_Lookup/
├── manifest.json          # Extension configuration (Manifest V3)
├── popup.html             # Main UI interface
├── popup.js               # Frontend logic & API coordination (121KB)
├── background.js          # Service worker for background tasks
├── content.js             # Content script for cross-origin requests
├── error-handler.js       # Centralized error handling
├── message-bus.js         # Component communication
├── parsing-utils.js       # Data parsing utilities
├── progressive-loader.js  # Progressive data loading
└── styles.css             # Modern UI styling (52KB)
```

### Key Technologies
- **Manifest V3** - Latest Chrome extension standard
- **Service Workers** - Background processing
- **Content Scripts** - Cross-origin data access
- **Progressive Loading** - Enhanced user experience
- **Modern CSS** - Responsive design with animations

## Advanced Features

### Cross-Origin Request Handling
- Chrome extension permissions for reliable cross-origin requests
- Fallback mechanisms for blocked requests
- Content script injection for enhanced scraping capabilities

### Error Handling & Resilience
- Network timeout handling with retry mechanisms
- Graceful degradation when sources fail
- User-friendly error messages with actionable feedback
- Progressive loading with fallback strategies

### Data Processing
- Smart UPC validation and formatting
- Product data normalization across sources
- Image loading with CORS handling
- Size and category information extraction

## Permissions

The extension requires these permissions for full functionality:
- `activeTab` - Content script injection
- `storage` - User preferences and UPC code storage
- `contextMenus` - Right-click context menu integration
- `host_permissions` - Access to barcode lookup services

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| **Chrome** | Full | Native Manifest V3 support |
| **Edge** | Compatible | Chromium-based Edge |
| **Firefox** | Requires conversion | Manifest adaptation needed |

## Recent Updates (v1.1)

### Enhanced User Experience
- **Improved no-results handling** with clear messaging
- **Relevant SVG icons** for better visual feedback
- **Better error states** and user feedback
- **Enhanced edge case handling** in search results

### Technical Improvements
- **Progressive loading** implementation
- **Centralized error handling** system
- **Enhanced message bus** for component communication
- **Modern UI components** with smooth animations

## Troubleshooting

### Common Issues & Solutions

**No results found:**
- Verify UPC code validity (should be 12-13 digits)
- Check internet connection
- Some products may not exist in all databases

**Images not loading:**
- Some images blocked by CORS policies
- Extension shows "No image available" placeholder

**Extension not responding:**
- Ensure Developer mode is enabled
- Check console errors in Chrome DevTools
- Reload extension from `chrome://extensions/`

## Contributing

We welcome contributions! Here's how you can help:

1. **Report Issues** - Found a bug? Let us know!
2. **Suggest Features** - Have ideas for improvements?
3. **Code Contributions** - Submit pull requests
4. **Testing** - Help test new features

### Development Setup
```bash
# Clone the repository
git clone [your-repo-url]

# Load in Chrome for development
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the project folder
```

## Performance

- **Fast lookups** - Parallel API calls to multiple sources
- **Efficient caching** - Reduces redundant requests
- **Minimal footprint** - Optimized for performance
- **Progressive loading** - Better perceived performance

## Roadmap

- **Firefox Add-on** compatibility
- **Additional data sources** integration
- **Bulk lookup** functionality
- **Export results** feature
- **Price tracking** capabilities
- **Barcode scanning** via camera

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **BarcodeLookup.com** - Comprehensive product database
- **UPCItemDB.com** - Reliable API and web scraping source
- **Go-UPC.com** - Additional product verification
- **Chrome Extensions Team** - Excellent documentation and APIs

## Support

- **Issues**: Report bugs and request features via GitHub Issues
- **Documentation**: Check the README.md for detailed information
- **Community**: Join discussions in GitHub Discussions

---

**Star this repository** if you find it useful!

**Made with care for the developer community**
