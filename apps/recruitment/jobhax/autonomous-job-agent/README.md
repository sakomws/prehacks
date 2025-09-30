# JHV5 - Autonomous Job Application Agent

An advanced autonomous job application system that uses AI agents to automatically fill out job application forms, navigate through multi-page applications, and provide real-time monitoring capabilities.

## 🚀 Features

- **Autonomous Form Filling**: AI-powered agent that automatically detects and fills job application forms
- **Multi-Page Navigation**: Intelligently navigates through multi-step application processes
- **Real-Time Monitoring**: WebSocket-based monitoring UI for tracking agent progress
- **Multiple Browser Support**: Works with both simulated and real browser automation
- **Comprehensive Logging**: Detailed action logs and screenshot capture
- **RESTful API**: FastAPI-based API for programmatic access
- **Site-Specific Optimizations**: Accelerated form filling for known job sites

## 🏗️ Architecture

### Core Components

1. **Autonomous Agent** (`autonomous_agent.py`)
   - Main AI agent that controls browser interactions
   - Uses `py_interaction.HostDevice` for browser control
   - Implements intelligent form field detection and mapping

2. **Real Browser Automation** (`real_browser_automation.py`)
   - Selenium-based browser automation for real browser control
   - Screenshot capture and visual feedback
   - WebSocket integration for real-time monitoring

3. **FastAPI Server** (`main.py`)
   - RESTful API endpoints for job application processing
   - Async job processing with timeout handling
   - Comprehensive error handling and logging

4. **Monitoring System** (`monitor_agent.py` + `monitor-ui/`)
   - Real-time WebSocket communication
   - React-based monitoring dashboard
   - Action logging and progress tracking

5. **Demo & Testing** (`demo.py`, `test_*.py`)
   - Comprehensive demonstration scripts
   - Test suites for validation
   - Example usage patterns

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+ (for monitoring UI)
- Chrome/Chromium browser
- OpenAI API key

## 🛠️ Installation

### 1. Clone and Setup Python Environment

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file or set environment variables:

```bash
export OPENAI_API_KEY=sk-your-api-key-here
export AGENT_MODEL=gpt-4.1-mini  # Optional, defaults to gpt-4.1-mini
```

### 3. Setup Monitoring UI (Optional)

```bash
cd monitor-ui
npm install
```

## 🚀 Quick Start

### Basic Usage

1. **Start the FastAPI server:**
```bash
uvicorn main:APP --reload --port 8080
```

2. **Submit a job application:**
```bash
curl -X POST http://localhost:8080/apply \
  -H 'Content-Type: application/json' \
  -d '{
    "job_url": "https://apply.appcast.io/jobs/50590620606/applyboard/apply",
    "timeout_seconds": 600,
    "user_data_dir": "/path/to/chrome/user/data",
    "profile_directory": "Default",
    "cv_path": "data/cv.pdf",
    "site_hint": "appcast"
  }'
```

### With Real-Time Monitoring

1. **Start WebSocket server:**
```bash
cd monitor-ui
npm run websocket
```

2. **Start monitoring UI:**
```bash
cd monitor-ui
npm run dev
```

3. **Run monitored agent:**
```bash
python monitor_agent.py
```

## 📚 API Documentation

### Endpoints

#### `POST /apply`
Submit a job application for autonomous processing.

**Request Body:**
```json
{
  "job_url": "string (required)",
  "timeout_seconds": "integer (default: 600)",
  "user_data_dir": "string (optional)",
  "profile_directory": "string (optional, default: 'Default')",
  "cv_path": "string (optional)",
  "site_hint": "string (optional: 'appcast' | 'smartrecruiters')"
}
```

**Response:**
```json
{
  "run": {
    "meta": {
      "job_url": "string",
      "session_mode": "host",
      "start_ts": "ISO timestamp",
      "end_ts": "ISO timestamp",
      "duration_seconds": "number"
    },
    "page1": {
      "questions": "array",
      "resume_upload": "object",
      "advance": "object"
    },
    "page2_detection": {
      "detected": "boolean",
      "signal": "string",
      "details": "object"
    },
    "traces": "array",
    "errors": "array"
  }
}
```

#### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "ok": true,
  "time": "ISO timestamp"
}
```

## 🔧 Configuration

### Candidate Data Format

The system expects candidate data in `data/test_data.json`:

```json
{
  "personal_information": {
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "phone": "string",
    "address": {
      "line": "string",
      "city": "string",
      "state": "string",
      "postal_code": "string",
      "country": "string"
    }
  },
  "eligibility": {
    "over_18": "boolean",
    "eligible_to_work_in_us": "boolean",
    "require_sponsorship": "boolean",
    "professional_license": "boolean"
  },
  "motivation": {
    "what_drew_you_to_healthcare": "string"
  },
  "experience": {
    "years_related_role": "string"
  },
  "voluntary_disclosures": {
    "gender": "string",
    "race": "string",
    "hispanic_or_latino": "boolean",
    "veteran_status": "string",
    "disability_status": "string",
    "date": "string"
  }
}
```

### Site Hints

The system supports site-specific optimizations:

- **appcast**: Optimized for Appcast.io job applications
- **smartrecruiters**: Optimized for SmartRecruiters applications

## 🎯 Usage Examples

### Python Script Usage

```python
import asyncio
from autonomous_agent import AutonomousJobApplicationAgent

# Load candidate data
with open("data/test_data.json", "r") as f:
    candidate = json.load(f)

# Initialize agent
agent = AutonomousJobApplicationAgent(
    candidate_data=candidate,
    cv_path="data/cv.pdf"
)

# Run application
result = await agent.run_autonomous_application("https://example.com/job-apply")
print(result["human_readable_summary"])
```

### Real Browser Usage

```python
from real_main import app
import uvicorn

# Start server with real browser automation
uvicorn.run(app, host="0.0.0.0", port=8080)
```

## 📊 Monitoring

The monitoring system provides real-time insights into agent behavior:

- **Action Logging**: Detailed log of all agent actions
- **Screenshot Gallery**: Visual progress tracking
- **Question Detection**: Real-time form field analysis
- **Progress Metrics**: Completion statistics and timing
- **Error Tracking**: Comprehensive error reporting

Access the monitoring UI at `http://localhost:3000` when running.

## 🧪 Testing

### Run Tests

```bash
# Run basic agent test
python test_agent.py

# Run real browser test
python test_real_browser.py

# Run comprehensive demo
python demo.py
```

### Test Data

Ensure you have:
- `data/test_data.json` - Candidate information
- `data/cv.pdf` - Resume file for uploads

## 🔍 Troubleshooting

### Common Issues

1. **Chrome/Chromium not found**
   - Install Chrome or Chromium browser
   - Ensure it's in your PATH

2. **OpenAI API errors**
   - Verify your API key is set correctly
   - Check API quota and billing

3. **WebSocket connection issues**
   - Ensure monitoring server is running
   - Check firewall settings

4. **Form detection failures**
   - Try different site hints
   - Check if the job site structure has changed

### Debug Mode

Enable debug logging by setting:
```bash
export DEBUG=1
```

## 📁 Project Structure

```
jhv5/
├── autonomous_agent.py      # Main autonomous agent
├── real_browser_automation.py  # Real browser automation
├── main.py                  # FastAPI server
├── monitor_agent.py         # Monitored agent
├── demo.py                  # Demonstration script
├── test_*.py               # Test files
├── requirements.txt        # Python dependencies
├── data/                   # Test data and CV
├── artifacts/              # Generated outputs
├── monitor-ui/             # React monitoring dashboard
└── README.md              # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the Prehacks recruitment automation suite.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the test files for examples
3. Open an issue with detailed logs