# 🚀 JobHax Chrome Extension - Installation Guide

## Overview
The JobHax Chrome Extension now includes an **Auto Apply** button that captures the current job application URL and starts the autonomous agent to fill out the form automatically.

## Features
- **🚀 Auto Apply Button**: Captures current URL and starts the autonomous agent
- **📊 Real-time Monitoring**: Connects to monitoring dashboard for live progress updates
- **🔄 WebSocket Integration**: Sends progress updates to the monitoring UI
- **📸 Screenshot Tracking**: Monitors agent activity with real-time screenshots

## Installation Steps

### 1. Load the Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome_extension` folder: `/Users/sakom/github/prehacks/apps/recruitment/chrome_extension/`
5. The extension should now appear in your extensions list

### 2. Start Required Services
Make sure these services are running:

```bash
# Terminal 1: Start the autonomous agent server
cd /Users/sakom/github/prehacks/apps/recruitment/jhv5
source .venv/bin/activate
python real_main.py

# Terminal 2: Start the WebSocket server
cd /Users/sakom/github/prehacks/apps/recruitment/jhv5/monitor-ui
node websocket-server.js

# Terminal 3: Start the monitoring UI
cd /Users/sakom/github/prehacks/apps/recruitment/jhv5/monitor-ui
PORT=3001 npm run dev
```

### 3. Test the Extension
1. Open the test page: `file:///Users/sakom/github/prehacks/apps/recruitment/chrome_extension/test_extension.html`
2. Click the JobHax extension icon in your browser toolbar
3. Click the "🚀 Auto Apply" button
4. Watch the monitoring dashboard open at `http://localhost:3001`

## How It Works

### Auto Apply Flow
1. **Capture URL**: Extension gets the current tab's URL
2. **Start Agent**: Sends POST request to `http://localhost:8080/apply` with the job URL
3. **Monitor Progress**: Connects to WebSocket server for real-time updates
4. **Open Dashboard**: Automatically opens monitoring UI at `http://localhost:3001`

### Monitoring Integration
- **WebSocket Connection**: Connects to `ws://localhost:8081`
- **Progress Updates**: Sends real-time status updates to monitoring dashboard
- **Screenshot Tracking**: Monitors agent screenshots and form filling progress

## Supported Job Sites
- SmartRecruiters
- Appcast.io
- Lever
- Greenhouse
- Workday
- Taleo
- Rochester Regional Health
- Most job application forms

## Troubleshooting

### Extension Not Working
- Check that all services are running (agent server, WebSocket, monitoring UI)
- Verify the extension is enabled in Chrome
- Check browser console for errors

### Agent Not Starting
- Ensure the agent server is running on port 8080
- Check that the job URL is supported
- Verify network connectivity to localhost

### Monitoring Dashboard Not Opening
- Ensure the monitoring UI is running on port 3001
- Check that the WebSocket server is running on port 8081
- Verify browser permissions for localhost

## File Structure
```
chrome_extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.js              # Extension logic with Auto Apply
├── content.js            # Content script for form filling
├── background.js         # Background service worker
├── injected.js           # Injected script for form interaction
├── test_extension.html   # Test page for development
└── INSTALLATION_GUIDE.md # This guide
```

## API Endpoints
- **Agent Server**: `http://localhost:8080/apply`
- **Monitoring UI**: `http://localhost:3001`
- **WebSocket Server**: `ws://localhost:8081`

## Next Steps
1. Install the extension following the steps above
2. Navigate to any job application page
3. Click the extension icon and select "🚀 Auto Apply"
4. Watch the autonomous agent fill out the form in real-time!
