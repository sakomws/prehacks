# Autonomous Job Application System

This system implements an autonomous agentic system for filling job applications according to the exact specifications provided.

## Features

- 🤖 **Fully Autonomous**: Operates without human intervention
- 🌐 **Browser Control**: Uses py_interaction library for web browser control
- 📝 **Smart Field Mapping**: Maps form fields to candidate data intelligently
- 📄 **CV Upload**: Automatically handles CV file uploads
- 🔍 **Page Detection**: Detects first vs second page of applications
- 📊 **Comprehensive Logging**: Tracks all detections, actions, and questions
- 🎯 **Specification Compliant**: Follows all provided rules exactly

## Requirements

### Core Requirements Met

✅ **Direct Browser Interaction**: Uses `HostDevice` class from `py_interaction` library  
✅ **Fully Autonomous**: No human intervention required  
✅ **Local Host Control**: Controls web browser on local host  
✅ **Any Model Support**: Can use any closed/open-source model  
✅ **Test Data Integration**: Uses provided `test_data.json`  
✅ **CV Upload Handling**: Automatically uploads candidate CV  
✅ **Processing Flexibility**: Uses HTML analysis and computer vision  
✅ **Library Compliance**: Uses `py_interaction` without modification  
✅ **Data Integrity**: Does not modify user data or CV  

### Task Completion Criteria

✅ **Second Page Detection**: Stops autonomously when reaching second page  
✅ **Mandatory Field Filling**: Fills all required fields for progression  
✅ **Human-Readable Summary**: Provides comprehensive summary of actions  
✅ **Question List**: Returns all questions encountered on the page  

### Bonus Features

✅ **Trace Generation**: Produces traces for model fine-tuning  
✅ **Optional Field Filling**: Fills both mandatory and optional fields  
✅ **Remote Session Support**: Uses `VNCClient` for Docker container control  

## Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Note: py_interaction library needs to be installed separately
# as it's not available on PyPI
```

## Usage

### Basic Usage

```bash
python autonomous_job_applicant.py "https://job-application-url.com"
```

### With Docker/VNC (Bonus Feature)

```bash
# For remote browser control
python autonomous_job_applicant.py "https://job-application-url.com" --remote
```

## How It Works

### 1. Initialization
- Loads candidate data from `test_data.json`
- Initializes browser control using `py_interaction`
- Sets up logging and trace collection

### 2. Page Analysis
- Detects current page type (first, second, etc.)
- Analyzes all form fields using HTML parsing
- Categorizes fields as required/optional

### 3. Field Mapping
- Maps form fields to appropriate candidate data
- Handles various field types (text, select, radio, checkbox, file)
- Provides intelligent fallbacks for unknown fields

### 4. Autonomous Filling
- Fills all detected fields with candidate data
- Uploads CV file if file upload field is present
- Handles Yes/No questions intelligently

### 5. Page Progression
- Proceeds to next page automatically
- Detects when second page is reached
- Stops autonomously as required

### 6. Output Generation
- Creates comprehensive JSON output
- Includes all detections, actions, and questions
- Provides human-readable summary

## Output Format

The system generates a JSON file with the following structure:

```json
{
  "task_completion": {
    "reached_second_page": true,
    "current_page": 2,
    "fields_filled": 15,
    "total_actions": 18
  },
  "detections": [...],
  "actions_performed": [...],
  "questions_encountered": [...],
  "traces": [...],
  "summary": "Human-readable summary..."
}
```

## Field Mapping

The system intelligently maps form fields to candidate data:

### Personal Information
- `first_name` → [REDACTED]
- `last_name` → [REDACTED]
- `email` → [REDACTED]
- `phone` → [REDACTED]
- `address` → [REDACTED]
- `city` → [REDACTED]
- `state` → [REDACTED]
- `zip_code` → [REDACTED]
- `country` → United States

### Professional Information
- `current_title` → Software Engineer
- `current_company` → Tech Corp
- `years_experience` → 5
- `linkedin_url` → https://linkedin.com/in/johndoe
- `github_url` → https://github.com/johndoe
- `salary_expectation` → 120000

### Additional Information
- `cover_letter` → Pre-written cover letter
- `why_interested` → Motivation statement
- `work_authorization` → Authorized to work in the US

## Supported Field Types

- ✅ Text inputs
- ✅ Email fields
- ✅ Phone number fields
- ✅ Select dropdowns
- ✅ Radio buttons
- ✅ Checkboxes
- ✅ Textareas
- ✅ File uploads (CV)
- ✅ Date fields

## Error Handling

- Graceful handling of missing fields
- Fallback strategies for unknown field types
- Comprehensive error logging
- Recovery mechanisms for failed actions

## Logging and Debugging

- Detailed action logging
- Field detection traces
- Error tracking and reporting
- Performance metrics

## Testing

The system can be tested with any job application URL:

```bash
# Test with a specific URL
python autonomous_job_applicant.py "https://example.com/jobs/apply/123"

# Test with verbose logging
python autonomous_job_applicant.py "https://example.com/jobs/apply/123" --verbose
```

## Compliance

This system is designed to meet all specified requirements:

- ✅ Uses `py_interaction` library without modification
- ✅ Operates fully autonomously
- ✅ Controls local host browser
- ✅ Uses provided test data
- ✅ Handles CV upload automatically
- ✅ Stops at second page
- ✅ Generates required output format
- ✅ Provides comprehensive logging

## License

MIT License - see the main project LICENSE file for details.
