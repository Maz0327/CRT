# Content Radar Chrome Extension

A powerful Chrome extension for capturing and analyzing web content using the Content Radar Strategic Intelligence platform.

## Features

### 🎯 Smart Content Capture
- **Interactive Element Selection**: Click on any webpage element to capture it
- **Text Selection Capture**: Right-click selected text to capture it
- **Platform Detection**: Automatically detects social media platforms (Twitter, LinkedIn, etc.)
- **Metadata Extraction**: Captures author, engagement metrics, and contextual data

### 🔐 Secure Authentication
- **Token-based Authentication**: Uses secure API tokens instead of passwords
- **Connection Status**: Real-time connection monitoring with visual indicators
- **Settings Management**: Easy setup and configuration through popup interface

### ⚡ Multiple Capture Methods
- **Floating Button**: Always-accessible 📡 button on every page
- **Keyboard Shortcut**: `Ctrl+Shift+C` for quick captures
- **Context Menu**: Right-click → "Capture with Content Radar"
- **Popup Actions**: Direct capture buttons in extension popup

### 🎨 User Experience
- **Visual Feedback**: Hover effects and capture confirmations
- **Element Highlighting**: Live preview of what will be captured
- **Error Handling**: Clear error messages and troubleshooting tips
- **Responsive Design**: Works on desktop and mobile viewports

## Installation

### 1. Get the Extension Files
Download or clone the `chrome-extension/` folder from your Content Radar project.

### 2. Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension/` folder

### 3. Configure API Connection
1. Click the 📡 extension icon in your browser toolbar
2. Go to the "Settings" tab
3. Enter your Content Radar app URL (e.g., `https://your-app.replit.dev`)
4. Create an API token in your app's Settings → Extensions page
5. Enter the token and click "Save Settings"
6. Click "Test Connection" to verify setup

## Usage

### Quick Start
1. Navigate to any webpage
2. Use any of these capture methods:
   - Click the floating 📡 button
   - Press `Ctrl+Shift+C`
   - Right-click and select "Capture with Content Radar"
3. Click on the element you want to capture
4. Content is automatically sent to your Content Radar dashboard

### Advanced Features

#### Platform-Specific Capture
The extension automatically detects and optimizes for:
- **Twitter**: Captures tweets with engagement metrics
- **LinkedIn**: Professional posts and author information
- **Reddit**: Posts and comments with community context
- **Medium**: Articles with author and publication data
- **YouTube**: Video metadata and descriptions

#### Metadata Collection
Automatically captures:
- Page title and URL
- Author information
- Publication date
- Engagement metrics (likes, shares, comments)
- Element positioning and styling
- Associated links and media

#### Smart Tag Generation
- Extracts relevant tags from CSS classes
- Identifies data attributes
- Suggests platform-specific categorization

## Troubleshooting

### Connection Issues
- **Red status indicator**: Check your API URL and token
- **Token errors**: Generate a new token in app settings
- **Network errors**: Verify your app is running and accessible

### Capture Problems
- **Nothing happens**: Check if extension is enabled and configured
- **Wrong content captured**: Use the overlay selection mode for precision
- **Missing data**: Some platforms may have limited metadata available

### Browser Compatibility
- **Chrome**: Fully supported (v88+)
- **Edge**: Supported with Chromium engine
- **Firefox**: Not supported (uses different extension format)

## Security & Privacy

### Data Handling
- **No Data Storage**: Extension doesn't store any captured content locally
- **Secure Transmission**: All data sent over HTTPS with token authentication
- **Minimal Permissions**: Only requests necessary browser permissions

### Token Security
- **Hashed Storage**: Tokens are hashed before database storage
- **Revocable**: Tokens can be revoked instantly from app settings
- **Time-stamped**: Usage tracking for security monitoring

## Development

### File Structure
```
chrome-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker and API communication
├── content.js            # Page interaction and element capture
├── content.css           # Styling for capture interface
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
└── icons/                # Extension icons (16, 32, 48, 128px)
```

### API Endpoints Used
- `POST /api/extension/capture` - Submit captured content
- `GET /api/extension/health` - Check connection status
- `POST /api/extension/tokens` - Create new tokens (web app)
- `GET /api/extension/tokens` - List user tokens (web app)
- `DELETE /api/extension/tokens/:id` - Revoke tokens (web app)

### Customization
You can modify the extension by editing:
- **Capture behavior**: Update `content.js`
- **UI styling**: Modify `popup.html` and `content.css`
- **API communication**: Adjust `background.js`

## Changelog

### v1.0.0 (Current)
- Initial release with complete capture functionality
- Token-based authentication system
- Multi-platform content detection
- Interactive element selection
- Real-time connection monitoring
- Professional popup interface

## Support

For issues or feature requests:
1. Check the troubleshooting section above
2. Verify your Content Radar app is running
3. Check browser console for error messages
4. Ensure you have the latest extension version

## License

This extension is part of the Content Radar platform and subject to the same licensing terms.