# Hermes Browser Extension

Browser extension for quick prompt enhancement directly from any webpage.

## Features

- **Right-click Enhancement**: Select any text and right-click to enhance with Hermes
- **Floating Button**: Auto-appears when you select text on any page
- **Mini Dashboard**: Quick access popup for prompt optimization
- **Platform Selection**: Choose target platform (ChatGPT, Claude, Midjourney, etc.)
- **Text Injection**: Insert enhanced prompts directly into active text fields
- **Seamless Integration**: Works alongside the main Hermes web app

## Installation

### Development Mode

1. **Build the extension:**
   ```bash
   npm run build:extension
   # or
   node scripts/build-extension.js
   ```

2. **Load in Chrome:**
   - Open `chrome://extensions`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist-extension/` folder

3. **Load in Firefox:**
   - Open `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select any file in the `dist-extension/` folder

### From Package

1. Download `hermes-chrome.zip` or `hermes-firefox.zip`
2. Extract the contents
3. Follow the development mode steps above

## Usage

### Method 1: Text Selection

1. Select any text on a webpage
2. A floating "⚡ Enhance with Hermes" button appears
3. Click to open popup with selected text
4. Choose platform and enhance

### Method 2: Context Menu

1. Select text on any webpage
2. Right-click and choose "Enhance with Hermes"
3. Popup opens with selected text ready to enhance

### Method 3: Extension Popup

1. Click the Hermes extension icon in browser toolbar
2. Type or paste your prompt
3. Select target platform
4. Click "✨ Enhance"
5. Copy or insert the enhanced prompt

## Configuration

The extension connects to your local Hermes instance at `http://localhost:3000`.

To use a different URL, update the host in:
- `extension/manifest.json` (host_permissions)
- `extension/popup/popup.js` (API endpoint)
- `extension/background/background.js` (action handler)

## File Structure

```
extension/
├── manifest.json          # Extension configuration (Manifest V3)
├── popup/
│   ├── popup.html        # Popup interface
│   ├── popup.js          # Popup logic
│   └── popup.css         # (inline in HTML)
├── content/
│   ├── content.js        # Content script for page interaction
│   └── content.css       # Styles for injected elements
├── background/
│   └── background.js     # Service worker
├── icons/
│   ├── icon-16.png       # 16x16 toolbar icon
│   ├── icon-48.png       # 48x48 management icon
│   └── icon-128.png      # 128x128 store icon
└── README.md             # This file
```

## API Endpoints

The extension uses the following Hermes API endpoints:

- `POST /api/enhance` - Enhance a prompt
  ```json
  {
    "prompt": "string",
    "platformId": "string",
    "tone": "professional",
    "fewShotCount": 0
  }
  ```

## Permissions

The extension requires these permissions:

- `activeTab`: Access current tab for text injection
- `contextMenus`: Add right-click menu option
- `storage`: Save user preferences
- `scripting`: Inject content scripts
- `host_permissions`: Connect to Hermes API

## Development

### Testing

1. Make changes to extension files
2. Go to `chrome://extensions` and click "Reload" on Hermes
3. Test on any webpage

### Debugging

- **Popup**: Right-click popup → Inspect
- **Background**: chrome://extensions → Details → Inspect views
- **Content Script**: Open DevTools on any page → Console

## Publishing

### Chrome Web Store

1. Create a developer account
2. Prepare store assets (screenshots, description)
3. Upload `hermes-chrome.zip`
4. Submit for review

### Firefox Add-ons

1. Create a developer account
2. Prepare listing (screenshots, description)
3. Upload `hermes-firefox.zip`
4. Submit for review

## Troubleshooting

### Extension not working

- Check that Hermes web app is running at `http://localhost:3000`
- Reload the extension in `chrome://extensions`
- Check console for errors

### API requests failing

- Ensure CORS is enabled on Hermes API
- Check network tab for request details
- Verify API endpoint URLs

### Text injection not working

- Some sites block content scripts (e.g., Chrome Web Store)
- Try using the copy button instead
- Check if page has contenteditable or input fields

## License

MIT - Same as main Hermes project
