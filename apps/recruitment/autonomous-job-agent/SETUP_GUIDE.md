# JHV5 Setup Guide

This guide will walk you through setting up the JHV5 autonomous job application system from scratch.

## Prerequisites

### System Requirements

- **Operating System**: macOS, Linux, or Windows
- **Python**: 3.8 or higher
- **Node.js**: 16.0 or higher (for monitoring UI)
- **Chrome/Chromium**: Latest version
- **Memory**: At least 4GB RAM (8GB recommended)
- **Storage**: At least 2GB free space

### Required Accounts

- **OpenAI Account**: For AI agent capabilities
  - Sign up at [OpenAI](https://platform.openai.com/)
  - Generate an API key
  - Ensure you have sufficient credits

## Installation Steps

### Step 1: Clone the Repository

```bash
# Navigate to your desired directory
cd /path/to/your/projects

# Clone the repository (if not already done)
git clone <repository-url>
cd prehacks/apps/recruitment/jhv5
```

### Step 2: Python Environment Setup

#### Create Virtual Environment

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On macOS/Linux:
source .venv/bin/activate

# On Windows:
.venv\Scripts\activate
```

#### Install Python Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt
```

### Step 3: Environment Configuration

#### Create Environment File

Create a `.env` file in the project root:

```bash
# Create .env file
touch .env
```

#### Add Environment Variables

Edit the `.env` file with your configuration:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here
AGENT_MODEL=gpt-4.1-mini

# Optional: Debug mode
DEBUG=0

# Optional: Custom paths
CHROME_USER_DATA_DIR=/path/to/chrome/user/data
DEFAULT_CV_PATH=data/cv.pdf
```

#### Alternative: Export Environment Variables

```bash
# Set environment variables (temporary)
export OPENAI_API_KEY="sk-your-api-key-here"
export AGENT_MODEL="gpt-4.1-mini"

# Make permanent (add to ~/.bashrc or ~/.zshrc)
echo 'export OPENAI_API_KEY="sk-your-api-key-here"' >> ~/.bashrc
echo 'export AGENT_MODEL="gpt-4.1-mini"' >> ~/.bashrc
```

### Step 4: Test Data Setup

#### Create Data Directory

```bash
# Ensure data directory exists
mkdir -p data
```

#### Add Test Data

Create `data/test_data.json` with your candidate information:

```json
{
  "personal_information": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1 555-123-4567",
    "address": {
      "line": "123 Main Street",
      "city": "[REDACTED]",
      "state": "California",
      "postal_code": "94105",
      "country": "United States"
    }
  },
  "eligibility": {
    "over_18": true,
    "eligible_to_work_in_us": true,
    "require_sponsorship": false,
    "professional_license": false
  },
  "motivation": {
    "what_drew_you_to_healthcare": "I am passionate about improving healthcare outcomes and making a positive impact on patients' lives through technology and innovation."
  },
  "experience": {
    "years_related_role": "8+ years"
  },
  "voluntary_disclosures": {
    "gender": "Male",
    "race": "White",
    "hispanic_or_latino": false,
    "veteran_status": "Not a veteran",
    "disability_status": "No",
    "date": "2024-01-27"
  }
}
```

#### Add CV/Resume

Place your CV/Resume PDF in the data directory:

```bash
# Copy your CV to the data directory
cp /path/to/your/cv.pdf data/cv.pdf
```

### Step 5: Chrome/Chromium Setup

#### Install Chrome/Chromium

**macOS (using Homebrew):**
```bash
brew install --cask google-chrome
```

**Ubuntu/Debian:**
```bash
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt-get update
sudo apt-get install google-chrome-stable
```

**Windows:**
Download and install from [Google Chrome](https://www.google.com/chrome/)

#### Verify Installation

```bash
# Check Chrome version
google-chrome --version
# or
chromium --version
```

### Step 6: Monitoring UI Setup (Optional)

#### Install Node.js Dependencies

```bash
# Navigate to monitor-ui directory
cd monitor-ui

# Install dependencies
npm install

# Or using yarn
yarn install
```

#### Verify Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version
```

## Verification

### Step 1: Test Python Environment

```bash
# Activate virtual environment
source .venv/bin/activate

# Test Python imports
python -c "import fastapi, uvicorn, browser_use, py_interaction; print('All imports successful')"
```

### Step 2: Test OpenAI API

```bash
# Test OpenAI API key
python -c "
import os
from openai import OpenAI
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
print('OpenAI API key is valid')
"
```

### Step 3: Test Basic Functionality

```bash
# Run basic test
python test_agent.py

# Run real browser test
python test_real_browser.py
```

### Step 4: Test API Server

```bash
# Start the server
uvicorn main:APP --reload --port 8080

# In another terminal, test the API
curl http://localhost:8080/health
```

Expected response:
```json
{
  "ok": true,
  "time": "2024-01-27T10:30:00.000Z"
}
```

## Running the System

### Basic Usage

#### Start the API Server

```bash
# Activate virtual environment
source .venv/bin/activate

# Start server
uvicorn main:APP --reload --port 8080
```

#### Submit a Job Application

```bash
curl -X POST http://localhost:8080/apply \
  -H 'Content-Type: application/json' \
  -d '{
    "job_url": "https://apply.appcast.io/jobs/50590620606/applyboard/apply",
    "timeout_seconds": 600,
    "cv_path": "data/cv.pdf",
    "site_hint": "appcast"
  }'
```

### With Real-Time Monitoring

#### Terminal 1: Start WebSocket Server

```bash
cd monitor-ui
npm run websocket
```

#### Terminal 2: Start Monitoring UI

```bash
cd monitor-ui
npm run dev
```

#### Terminal 3: Start API Server

```bash
source .venv/bin/activate
uvicorn main:APP --reload --port 8080
```

#### Terminal 4: Run Monitored Agent

```bash
source .venv/bin/activate
python monitor_agent.py
```

Access the monitoring dashboard at `http://localhost:3000`

## Troubleshooting

### Common Issues

#### 1. Python Import Errors

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
# Ensure virtual environment is activated
source .venv/bin/activate

# Reinstall requirements
pip install -r requirements.txt
```

#### 2. OpenAI API Errors

**Error**: `AuthenticationError: Invalid API key`

**Solution**:
```bash
# Check API key is set
echo $OPENAI_API_KEY

# Verify in .env file
cat .env

# Test API key
python -c "
import os
from openai import OpenAI
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
print('API key is valid')
"
```

#### 3. Chrome/Chromium Not Found

**Error**: `WebDriverException: 'chromedriver' executable needs to be in PATH`

**Solution**:
```bash
# Install ChromeDriver
pip install webdriver-manager

# Or install ChromeDriver manually
# Download from https://chromedriver.chromium.org/
# Add to PATH
```

#### 4. Permission Errors

**Error**: `PermissionError: [Errno 13] Permission denied`

**Solution**:
```bash
# Fix file permissions
chmod +x *.py

# Fix directory permissions
chmod -R 755 .
```

#### 5. Port Already in Use

**Error**: `OSError: [Errno 48] Address already in use`

**Solution**:
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or use a different port
uvicorn main:APP --reload --port 8081
```

### Debug Mode

Enable debug logging for troubleshooting:

```bash
# Set debug environment variable
export DEBUG=1

# Run with debug output
python main.py
```

### Log Files

Check log files for detailed error information:

```bash
# Check application logs
tail -f artifacts/*.log

# Check system logs
tail -f /var/log/syslog  # Linux
tail -f /var/log/system.log  # macOS
```

## Configuration Options

### Advanced Configuration

#### Custom Chrome Profile

```bash
# Create custom Chrome profile
mkdir -p ~/chrome-profiles/jhv5

# Use custom profile
export CHROME_USER_DATA_DIR=~/chrome-profiles/jhv5
```

#### Custom Timeouts

```bash
# Set custom timeouts
export DEFAULT_TIMEOUT=900  # 15 minutes
export FORM_TIMEOUT=300    # 5 minutes
export NAVIGATION_TIMEOUT=60  # 1 minute
```

#### Custom Model

```bash
# Use different OpenAI model
export AGENT_MODEL=gpt-4-turbo-preview
```

## Performance Optimization

### System Optimization

#### Memory Settings

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Increase Python memory limit
export PYTHONHASHSEED=0
```

#### Chrome Optimization

```bash
# Chrome flags for better performance
export CHROME_FLAGS="--no-sandbox --disable-dev-shm-usage --disable-gpu"
```

### Monitoring Optimization

#### Reduce Screenshot Frequency

Edit `monitor_agent.py`:
```python
# Reduce screenshot frequency
SCREENSHOT_INTERVAL = 10  # seconds
```

#### Optimize Logging

Edit `main.py`:
```python
# Reduce log verbosity
logging.basicConfig(level=logging.WARNING)
```

## Security Considerations

### API Key Security

- Never commit API keys to version control
- Use environment variables or secure key management
- Rotate API keys regularly
- Monitor API usage

### Data Privacy

- All data is processed locally
- No data is sent to external services except OpenAI
- Screenshots and logs are stored locally
- PII is masked in logs

### Network Security

- Use HTTPS in production
- Implement proper authentication
- Use firewall rules to restrict access
- Monitor network traffic

## Next Steps

After successful setup:

1. **Read the [API Reference](API_REFERENCE.md)** for detailed API documentation
2. **Review the [Architecture](ARCHITECTURE.md)** for system understanding
3. **Run the [Demo](demo.py)** to see the system in action
4. **Customize the configuration** for your specific needs
5. **Set up monitoring** for production use

## Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review the logs for error details
3. Test with the provided examples
4. Check system requirements
5. Open an issue with detailed information

