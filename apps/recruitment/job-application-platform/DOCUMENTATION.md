# JobHax - Autonomous Job Application Agent

## Overview

JobHax is an advanced agentic system that fully autonomously processes job application pages on real websites. It intelligently fills in all required input fields and proceeds through the entire application process without human intervention.

## Key Features

- **🤖 Fully Autonomous**: Processes job applications without human intervention
- **🧠 AI-Powered**: Uses multiple AI providers (OpenAI, Gemini, Anthropic) for intelligent form analysis
- **🌐 Multi-Platform Support**: Works with various job application platforms (SmartRecruiters, Appcast, etc.)
- **📄 CV Processing**: Automatically handles CV uploads and data extraction
- **🔍 Smart Form Analysis**: Uses AI to understand form structure and field requirements
- **🎯 Intelligent Mapping**: Maps user data to form fields using AI and pattern matching
- **📸 Screenshot Capture**: Takes screenshots at each step for verification
- **🔄 Error Handling**: Robust error handling and retry mechanisms

## Architecture

```
jobhax/
├── src/                    # Source code
│   ├── core/              # Core system components
│   │   ├── config.py      # Configuration management
│   │   ├── models.py      # Data models and types
│   │   └── job_application_agent.py  # Main orchestrator
│   ├── agents/            # AI agents
│   │   ├── ai_client.py   # AI provider client
│   │   ├── form_analyzer.py  # Form analysis agent
│   │   └── form_filler.py    # Form filling agent
│   ├── utils/             # Utility functions
│   │   ├── browser_manager.py  # Browser automation
│   │   ├── data_loader.py      # Data loading utilities
│   │   ├── pdf_processor.py    # PDF processing
│   │   └── docx_processor.py   # DOCX processing
│   └── main.py            # Main entry point
├── data/                  # Test data and CV files
├── tests/                 # Test files
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd jobhax
```

2. **Run setup script**:
```bash
python setup.py
```

3. **Install dependencies manually** (if needed):
```bash
pip install -r requirements.txt
```

## Configuration

### API Keys

The system supports multiple AI providers. Configure your API keys in the `.env` file:

```env
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### Environment Variables

```env
# Browser Configuration
HEADLESS=false
BROWSER_TIMEOUT=30

# Job Application Configuration
MAX_RETRIES=3
FORM_FILL_DELAY=1.0
```

## Usage

### Basic Usage

```bash
python src/main.py --url "https://jobs.smartrecruiters.com/company/job-application"
```

### Advanced Usage

```bash
python src/main.py \
  --url "https://example.com/job-application" \
  --data-file "data/my_data.json" \
  --cv-file "data/my_cv.pdf" \
  --ai-provider "openai" \
  --headless \
  --debug
```

### Command Line Options

- `--url`: Job application URL (required)
- `--data-file`: Path to user data JSON file (default: data/test_data.json)
- `--cv-file`: Path to CV file (default: data/cv.pdf)
- `--headless`: Run browser in headless mode
- `--debug`: Enable debug logging
- `--ai-provider`: AI provider to use (openai, gemini, anthropic)

## Data Format

### User Data Structure

The system expects user data in the following JSON format:

```json
{
  "personal_info": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@email.com",
    "phone": "+1-555-123-4567",
    "address": {
      "street": "123 Main Street",
      "city": "[REDACTED]",
      "state": "CA",
      "zip_code": "94105",
      "country": "United States"
    }
  },
  "professional_info": {
    "current_title": "Software Engineer",
    "current_company": "Tech Corp",
    "years_experience": 5,
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "github_url": "https://github.com/johndoe"
  },
  "education": [...],
  "work_experience": [...],
  "skills": {...},
  "certifications": [...],
  "references": [...],
  "additional_info": {...}
}
```

### CV Support

The system supports CV files in the following formats:
- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- Plain text (.txt)

## How It Works

### 1. Form Analysis
- Uses AI to analyze the job application form structure
- Identifies all input fields, their types, and requirements
- Maps form fields to user data fields

### 2. Data Mapping
- Intelligently maps user data to form fields
- Uses pattern matching and AI suggestions
- Handles various field naming conventions

### 3. Form Filling
- Fills text fields with appropriate user data
- Handles dropdowns, checkboxes, and radio buttons
- Manages file uploads (CV, cover letter)

### 4. Submission
- Submits the completed application
- Handles multi-step application processes
- Takes screenshots for verification

## Supported Job Platforms

- **SmartRecruiters**: Full support
- **Appcast.io**: Full support
- **Generic Forms**: AI-powered analysis for any HTML form
- **Custom Platforms**: Extensible architecture

## AI Providers

### OpenAI (GPT-4)
- Best for complex form analysis
- Excellent at understanding context
- Recommended for most use cases

### Google Gemini
- Good performance for form analysis
- Cost-effective option
- Fast response times

### Anthropic Claude
- Excellent for reasoning tasks
- Good at understanding complex forms
- Strong safety features

## Error Handling

The system includes comprehensive error handling:

- **Retry Logic**: Automatically retries failed operations
- **Screenshot Capture**: Takes screenshots on errors
- **Detailed Logging**: Comprehensive logging for debugging
- **Graceful Degradation**: Continues processing when possible

## Testing

### Run Tests

```bash
python test_jobhax.py
```

### Test URLs

The system includes test URLs for validation:
- SmartRecruiters: Hollister Assistant Manager
- Appcast.io: ApplyBoard Application

## Screenshots and Results

The system automatically captures screenshots at each step:
- Initial page load
- Form analysis
- After form filling
- After submission
- Final confirmation

Results are saved in the `results/` directory with:
- Application summary
- Individual result files
- Screenshots
- Processing logs

## Troubleshooting

### Common Issues

1. **Browser Not Starting**
   - Check if Chrome/Chromium is installed
   - Verify py_interaction library is working
   - Try running in non-headless mode

2. **Form Not Detected**
   - Check if the URL is accessible
   - Verify the page loads completely
   - Enable debug logging for details

3. **AI API Errors**
   - Verify API keys are correct
   - Check API quota and limits
   - Try switching AI providers

### Debug Mode

Enable debug logging for detailed information:

```bash
python src/main.py --url "..." --debug
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

## Roadmap

- [ ] Support for more job platforms
- [ ] Enhanced CV parsing
- [ ] Multi-language support
- [ ] Web dashboard
- [ ] Batch processing
- [ ] Advanced analytics
