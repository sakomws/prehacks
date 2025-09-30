# Setup Guide

## Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- Chrome/Chromium browser
- Git

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd prehacks/apps/recruitment
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Install Node.js Dependencies (for Chrome Extension)
```bash
cd chrome_extension
npm install
```

## Environment Setup

### 1. Create Environment File
```bash
cp .env.example .env
```

### 2. Configure API Keys
Edit `.env` file with your API keys:
```env
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## Quick Start

### JobHax Platform
```bash
cd jobhax
python -m uvicorn web_ui.app:app --reload
```

### Chrome Extension
1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable Developer mode
4. Load unpacked extension from `chrome_extension/` folder

### Browser Automation
```bash
cd browser_automation
python job_application_automation.py
```

## Troubleshooting

### Common Issues

1. **Chrome Driver Issues**
   - Update Chrome browser
   - Run: `pip install --upgrade webdriver-manager`

2. **API Key Errors**
   - Verify API keys in `.env` file
   - Check API key permissions

3. **Permission Errors**
   - Run with appropriate permissions
   - Check file permissions

### Getting Help

- Check the specific README in each project directory
- Review the logs in `logs/` directory
- Open an issue on GitHub
