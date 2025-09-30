# JobHax - Autonomous Job Application Platform

A comprehensive job application automation platform with web UI, AI-powered form filling, and autonomous operation capabilities.

## 🚀 Features

- **Web Interface**: Modern web UI for easy job application management
- **AI-Powered Form Filling**: Intelligent form analysis and data mapping
- **Autonomous Operation**: Fully automated job application processing
- **Multi-Platform Support**: Works with SmartRecruiters, Appcast, and more
- **Real-time Monitoring**: Live progress tracking and status updates
- **CV Processing**: Automatic CV uploads and data extraction

## Architecture

```
jobhax/
├── data/                   # Test data and CV files
├── src/                    # Source code
│   ├── agents/            # AI agents for different tasks
│   ├── core/              # Core system components
│   ├── utils/             # Utility functions
│   └── main.py           # Main application entry point
├── tests/                 # Test files
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## Quick Start

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Place test data in `data/` folder:
   - `test_data.json` - User profile data
   - `cv.pdf` - CV file for upload

3. Run the agent:
```bash
python src/main.py --url "https://jobs.smartrecruiters.com/..."
```

## Supported Job Platforms

- SmartRecruiters
- Appcast.io
- And more (extensible architecture)

## API Keys

The system supports multiple AI providers:
- OpenAI
- Google Gemini
- Anthropic Claude

Configure your API keys in the environment or config file.
