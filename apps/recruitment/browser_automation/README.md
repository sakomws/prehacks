# JobHax Browser Automation

Automated job application form filling using the [browser-use](https://github.com/browser-use/browser-use) library. This tool uses AI to intelligently fill out job application forms with your resume data.

## Features

- 🤖 **AI-Powered**: Uses advanced language models to understand and fill forms
- 🌐 **Universal**: Works with any job application website
- 📝 **Smart Filling**: Handles text inputs, dropdowns, radio buttons, checkboxes, and textareas
- 🎯 **Accurate**: Pre-configured with your resume data
- 🔧 **Flexible**: Supports multiple AI providers (Gemini, OpenAI, Claude, Groq)

## Quick Start

### 1. Install Dependencies

```bash
cd apps/recruitment/jobhax/browser_automation
pip install -r requirements.txt
```

### 2. Set Up API Key

Copy the example environment file and add your API key:

```bash
cp env_example.txt .env
```

Edit `.env` and add one of the following API keys:

```bash
# Option 1: Google Gemini (Free tier available)
GEMINI_API_KEY=your_gemini_api_key_here

# Option 2: OpenAI (Paid)
OPENAI_API_KEY=your_openai_api_key_here

# Option 3: Anthropic Claude (Paid)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Option 4: Groq (Free tier available)
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Run the Automation

```bash
# Run with a specific URL
python job_application_automation.py "https://jobs.example.com/apply/123"

# Or run interactively
python job_application_automation.py
```

## How It Works

1. **AI Agent**: The browser-use library creates an AI agent that can control a web browser
2. **Form Understanding**: The AI analyzes the job application form and identifies all fields
3. **Smart Filling**: The AI fills each field with appropriate data from your resume
4. **Validation**: The AI ensures all required fields are completed correctly

## Resume Data

The script is pre-configured with the following resume data:

- **Name**: [REDACTED] [REDACTED]
- **Email**: [REDACTED]
- **Phone**: [REDACTED]
- **Address**: [REDACTED]
- **LinkedIn**: [REDACTED]
- **Website**: [REDACTED]
- **Experience**: 8+ years
- **Title**: Software Engineer

## Supported Form Fields

- ✅ Text inputs (name, email, phone, address)
- ✅ Dropdowns (country, state, experience level)
- ✅ Radio buttons (Yes/No questions)
- ✅ Checkboxes (agreements, preferences)
- ✅ Textareas (cover letters, additional info)
- ✅ Date fields
- ✅ File uploads (resume)

## AI Providers

### Google Gemini (Recommended - Free)
- **Model**: gemini-flash-latest
- **Cost**: Free tier available
- **Setup**: Get API key from [Google AI Studio](https://aistudio.google.com/)

### OpenAI
- **Model**: gpt-4o-mini
- **Cost**: Pay per use
- **Setup**: Get API key from [OpenAI Platform](https://platform.openai.com/)

### Anthropic Claude
- **Model**: claude-3-5-sonnet-20241022
- **Cost**: Pay per use
- **Setup**: Get API key from [Anthropic Console](https://console.anthropic.com/)

### Groq (Free Tier)
- **Model**: llama-3.1-8b-instant
- **Cost**: Free tier available
- **Setup**: Get API key from [Groq Console](https://console.groq.com/)

## Examples

### Basic Usage
```bash
python job_application_automation.py "https://jobs.smartrecruiters.com/company/123/position/456"
```

### Interactive Mode
```bash
python job_application_automation.py
# Enter URL when prompted
```

## Troubleshooting

### Common Issues

1. **No API Key**: Make sure you've set one of the API keys in your `.env` file
2. **Browser Issues**: The script will automatically install Chromium if needed
3. **Form Not Filled**: Some forms may have anti-automation measures
4. **Timeout**: Large forms may take longer to fill

### Debug Mode

To see what the AI is doing, the script will show:
- Form field detection
- Data being filled
- Screenshots of progress
- Error messages

## Advanced Configuration

You can modify the `RESUME_DATA` dictionary in the script to customize your information:

```python
RESUME_DATA = {
    "firstName": "Your First Name",
    "lastName": "Your Last Name",
    "email": "your.email@example.com",
    # ... other fields
}
```

## Security

- All data is processed locally
- No resume data is sent to external services (except the AI provider)
- API keys are stored in local `.env` file
- Browser automation runs in a controlled environment

## License

MIT License - see the main project LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues or questions:
- Check the [browser-use documentation](https://github.com/browser-use/browser-use)
- Create an issue in this repository
- Check the troubleshooting section above

---

**JobHax Browser Automation** - Making job applications faster and easier! 🚀
