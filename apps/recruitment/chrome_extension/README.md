# JobHax Chrome Extension

A powerful Chrome extension for automated job application form filling with intelligent field detection and one-click application submission.

## 🚀 Features

- **Auto-Fill Forms**: Automatically detects and fills job application forms
- **Smart Field Detection**: Uses multiple selectors to find form fields
- **Platform Optimized**: Works with SmartRecruiters, Appcast.io, and more
- **Resume Data Management**: Pre-configured with your resume information
- **Privacy Focused**: All data stays in your browser
- **One-Click Apply**: Fill and submit applications with a single click

## Installation

### Method 1: Load as Unpacked Extension (Recommended)

1. **Download the Extension**
   - Download or clone this repository
   - Navigate to the `chrome_extension` folder

2. **Open Chrome Extensions Page**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `chrome_extension` folder
   - The JobHax extension should now appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Pin the JobHax extension for easy access

### Method 2: Install from Chrome Web Store (Coming Soon)

*This extension will be published to the Chrome Web Store soon.*

## Usage

### Basic Auto-Fill

1. **Navigate to a Job Application**
   - Go to any supported job site (SmartRecruiters, Appcast.io, etc.)
   - Find a job you want to apply for
   - Click "Apply" to open the application form

2. **Use the Extension**
   - Click the JobHax extension icon in your toolbar
   - Click "Auto-Fill Current Page"
   - Watch as the form fills automatically!

3. **Review and Submit**
   - Review the filled information
   - Click "Submit" on the job application form
   - Or use "Fill & Submit Application" for one-click applying

### Supported Job Sites

- ✅ SmartRecruiters (jobs.smartrecruiters.com)
- ✅ Appcast.io (apply.appcast.io)
- ✅ Lever (jobs.lever.co)
- ✅ Greenhouse (boards.greenhouse.io)
- ✅ Workday (workday.com)
- ✅ Taleo (taleo.net)
- ✅ Most other job application forms

## Configuration

### Updating Resume Data

The extension comes pre-configured with sample data. To update with your information:

1. **Open Extension Options**
   - Right-click the JobHax extension icon
   - Select "Options" (if available)

2. **Edit Resume Data**
   - Update your personal information
   - Modify professional details
   - Customize cover letter text

### Current Resume Data

```json
{
  "firstName": "[REDACTED]",
  "lastName": "[REDACTED]",
  "email": "[REDACTED]",
  "phone": "[REDACTED]",
  "address": "[REDACTED]",
  "city": "[REDACTED]",
  "state": "[REDACTED]",
  "zipCode": "[REDACTED]",
  "country": "United States",
  "linkedin": "[REDACTED]",
  "website": "[REDACTED]",
  "currentTitle": "Software Engineer",
  "currentCompany": "Tech Corp",
  "yearsExperience": "8+"
}
```

## How It Works

### Smart Field Detection

The extension uses multiple strategies to find form fields:

1. **Attribute Matching**: Looks for `name`, `id`, `placeholder`, `aria-label`, `data-testid`
2. **Type Detection**: Identifies `email`, `tel`, `text`, `file` input types
3. **Content Analysis**: Analyzes field labels and context
4. **Platform-Specific**: Uses selectors optimized for each job platform

### Form Filling Process

1. **Page Analysis**: Scans the page for job application forms
2. **Field Mapping**: Maps detected fields to resume data
3. **Smart Filling**: Fills fields using appropriate methods (input, select, textarea)
4. **Event Triggering**: Triggers necessary events for form validation
5. **Verification**: Checks that fields were filled correctly

### Submit Button Detection

The extension intelligently finds submit buttons while avoiding:
- Cookie consent buttons
- Privacy policy buttons
- Settings buttons
- Navigation buttons

## Troubleshooting

### Extension Not Working

1. **Check Site Support**
   - Ensure you're on a supported job site
   - Look for the JobHax notification on the page

2. **Refresh the Page**
   - Sometimes a page refresh helps
   - Try disabling and re-enabling the extension

3. **Check Console**
   - Open Developer Tools (F12)
   - Look for JobHax logs in the console

### Fields Not Filling

1. **Manual Field Detection**
   - Some forms use non-standard field names
   - Try filling manually and note the field names

2. **Report Issues**
   - Submit an issue with the job site URL
   - Include screenshots of the form

### Submit Button Issues

1. **Manual Submission**
   - If auto-submit fails, click submit manually
   - The extension will still fill the form

2. **Multi-Step Forms**
   - Some forms have multiple steps
   - Use "Auto-Fill Current Page" for each step

## Privacy & Security

- **No Data Collection**: The extension doesn't collect or transmit your data
- **Local Storage**: All resume data is stored locally in your browser
- **No Tracking**: No analytics or tracking of your job applications
- **Open Source**: Full source code is available for review

## Development

### Building from Source

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd jobhax/chrome_extension
   ```

2. **Load in Chrome**
   - Follow installation Method 1 above
   - Make changes to source files
   - Reload extension in Chrome

### Contributing

1. **Fork the Repository**
2. **Create Feature Branch**
3. **Make Changes**
4. **Test Thoroughly**
5. **Submit Pull Request**

## License

MIT License - see LICENSE file for details.

## Support

For issues, questions, or feature requests:
- Create an issue in the repository
- Contact: [your-email@example.com]

---

**JobHax** - Making job applications faster and easier! 🚀

