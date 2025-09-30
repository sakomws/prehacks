# Project Index

## 🎯 Main Projects

### 1. JobHax Platform
**Location**: `./jobhax/`
**Type**: Full-stack web application
**Technology**: Python, FastAPI, Selenium, AI/LLM
**Best for**: Complete job application automation with web interface

**Features**:
- Modern web UI for job application management
- AI-powered form analysis and filling
- Autonomous job application processing
- Real-time progress monitoring
- Multi-platform support (SmartRecruiters, Appcast, etc.)

**Quick Start**:
```bash
cd jobhax
python -m uvicorn web_ui.app:app --reload
```

### 2. Chrome Extension
**Location**: `./chrome_extension/`
**Type**: Browser extension
**Technology**: JavaScript, Chrome APIs
**Best for**: One-click job applications directly in browser

**Features**:
- Auto-fill job application forms
- Smart field detection
- One-click application submission
- Privacy-focused (data stays in browser)
- Works with major job platforms

**Quick Start**:
1. Load extension in Chrome
2. Navigate to job application page
3. Click JobHax button to auto-fill

### 3. Browser Automation
**Location**: `./browser_automation/`
**Type**: Python scripts
**Technology**: Selenium, Python
**Best for**: Programmatic job application automation

**Features**:
- Selenium-based automation
- Cross-platform support
- Configurable automation scripts
- Batch job application processing

**Quick Start**:
```bash
cd browser_automation
python job_application_automation.py
```

### 4. JHV5 System
**Location**: `./jhv5/`
**Type**: Advanced automation system
**Technology**: Python, WebSocket, Next.js
**Best for**: Advanced users needing real-time monitoring

**Features**:
- Real-time WebSocket monitoring
- Advanced autonomous operation
- Next.js monitoring UI
- Comprehensive logging and analytics

**Quick Start**:
```bash
cd jhv5
python start_integrated_system.py
```

## 🔧 Utility Scripts

### Setup Script
**Location**: `./setup.sh`
**Purpose**: Automated setup and installation
**Usage**: `./setup.sh`

### Test Integration
**Location**: `./test_integration.py`
**Purpose**: Integration testing across all systems
**Usage**: `python test_integration.py`

## 📊 Comparison Matrix

| Feature | JobHax | Chrome Ext | Browser Auto | JHV5 |
|---------|--------|------------|--------------|------|
| Web UI | ✅ | ❌ | ❌ | ✅ |
| Browser Integration | ❌ | ✅ | ❌ | ❌ |
| Real-time Monitoring | ✅ | ❌ | ❌ | ✅ |
| AI-Powered | ✅ | ❌ | ❌ | ✅ |
| Easy Setup | ✅ | ✅ | ✅ | ❌ |
| Advanced Features | ✅ | ❌ | ✅ | ✅ |

## 🚀 Getting Started

1. **For Beginners**: Start with Chrome Extension
2. **For Developers**: Use Browser Automation scripts
3. **For Full Control**: Use JobHax Platform
4. **For Advanced Users**: Use JHV5 System

## 📚 Documentation

- [Architecture](./ARCHITECTURE.md)
- [Setup Guide](./SETUP.md)
- [API Reference](../jobhax/API_REFERENCE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
