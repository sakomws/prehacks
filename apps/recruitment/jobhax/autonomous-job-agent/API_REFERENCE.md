# JHV5 API Reference

## Base URL

```
http://localhost:8080
```

## Authentication

Currently, no authentication is required. All endpoints are publicly accessible.

## Content Types

- **Request**: `application/json`
- **Response**: `application/json`

## Endpoints

### Health Check

#### `GET /health`

Check if the service is running and healthy.

**Response:**
```json
{
  "ok": true,
  "time": "2024-01-27T10:30:00.000Z"
}
```

**Status Codes:**
- `200`: Service is healthy
- `500`: Service is unhealthy

---

### Job Application

#### `POST /apply`

Submit a job application for autonomous processing.

**Request Body:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `job_url` | string (URL) | Yes | - | The URL of the job application to fill |
| `timeout_seconds` | integer | No | 600 | Maximum time to spend on the application |
| `user_data_dir` | string (path) | No | null | Chrome user data directory for persistent sessions |
| `profile_directory` | string | No | "Default" | Chrome profile directory name |
| `cv_path` | string (path) | No | null | Path to CV/Resume PDF file |
| `site_hint` | string | No | null | Site-specific optimization hint |

**Site Hints:**
- `"appcast"`: Optimized for Appcast.io applications
- `"smartrecruiters"`: Optimized for SmartRecruiters applications

**Example Request:**
```json
{
  "job_url": "https://apply.appcast.io/jobs/50590620606/applyboard/apply",
  "timeout_seconds": 600,
  "user_data_dir": "/Users/username/chrome-user-data",
  "profile_directory": "Default",
  "cv_path": "data/cv.pdf",
  "site_hint": "appcast"
}
```

**Response:**

```json
{
  "run": {
    "meta": {
      "job_url": "https://apply.appcast.io/jobs/50590620606/applyboard/apply",
      "session_mode": "host",
      "start_ts": "2024-01-27T10:30:00.000Z",
      "end_ts": "2024-01-27T10:35:30.000Z",
      "duration_seconds": 330.5
    },
    "page1": {
      "questions": [
        {
          "question_id": "first_name",
          "question_text": "Legal First Name",
          "field_type": "text_input",
          "required": true,
          "filled": true,
          "value": "John"
        }
      ],
      "resume_upload": {
        "attempted": true,
        "success": true,
        "file_path": "data/cv.pdf"
      },
      "advance": {
        "button_found": true,
        "clicked": true,
        "success": true
      }
    },
    "page2_detection": {
      "detected": true,
      "signal": "url_change",
      "details": {
        "new_url": "https://apply.appcast.io/jobs/50590620606/applyboard/apply?page=2",
        "indicators": ["url_change", "new_form_section"]
      }
    },
    "traces": [
      {
        "timestamp": 1706355000.123,
        "action_type": "navigate",
        "url": "https://apply.appcast.io/jobs/50590620606/applyboard/apply",
        "success": true
      }
    ],
    "errors": [],
    "artifact_path": "/path/to/artifacts/application_run_1706355330.json"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `run.meta` | object | Metadata about the application run |
| `run.meta.job_url` | string | The job application URL |
| `run.meta.session_mode` | string | Session mode (always "host") |
| `run.meta.start_ts` | string | Start timestamp (ISO 8601) |
| `run.meta.end_ts` | string | End timestamp (ISO 8601) |
| `run.meta.duration_seconds` | number | Total duration in seconds |
| `run.page1` | object | Page 1 processing results |
| `run.page1.questions` | array | List of questions detected and filled |
| `run.page1.resume_upload` | object | Resume upload attempt details |
| `run.page1.advance` | object | Navigation to next page details |
| `run.page2_detection` | object | Page 2 detection results |
| `run.traces` | array | Detailed action log |
| `run.errors` | array | List of errors encountered |
| `run.artifact_path` | string | Path to saved artifact file |

**Status Codes:**
- `200`: Application processed successfully
- `400`: Invalid request data
- `422`: Validation error
- `500`: Internal server error
- `504`: Request timeout

---

## Error Responses

### Validation Error (422)

```json
{
  "detail": [
    {
      "loc": ["body", "job_url"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### Server Error (500)

```json
{
  "detail": "Internal server error occurred during processing"
}
```

### Timeout Error (504)

```json
{
  "detail": "Request timed out after 600 seconds"
}
```

---

## WebSocket API (Monitoring)

### Connection

Connect to the WebSocket server for real-time monitoring:

```javascript
const socket = io('http://localhost:8081');
```

### Events

#### `connect`
Emitted when successfully connected to the server.

```javascript
socket.on('connect', () => {
  console.log('Connected to monitoring server');
});
```

#### `agent_status`
Real-time agent status updates.

```javascript
socket.on('agent_status', (data) => {
  console.log('Agent status:', data);
  // {
  //   status: 'running' | 'completed' | 'error',
  //   current_page: 1,
  //   progress_percentage: 45,
  //   current_action: 'filling_form_fields'
  // }
});
```

#### `action_log`
Individual action updates.

```javascript
socket.on('action_log', (action) => {
  console.log('Action:', action);
  // {
  //   timestamp: 1706355000.123,
  //   action_type: 'type_text',
  //   question_id: 'first_name',
  //   value: 'John',
  //   success: true
  // }
});
```

#### `screenshot`
Screenshot updates for visual monitoring.

```javascript
socket.on('screenshot', (data) => {
  console.log('Screenshot:', data);
  // {
  //   filename: 'page1_questions_detected_1.png',
  //   timestamp: 1706355000.123,
  //   page: 1,
  //   description: 'questions_detected'
  // }
});
```

#### `question_detected`
Form field detection updates.

```javascript
socket.on('question_detected', (question) => {
  console.log('Question detected:', question);
  // {
  //   question_id: 'first_name',
  //   question_text: 'Legal First Name',
  //   field_type: 'text_input',
  //   required: true,
  //   detected_at: 1706355000.123
  // }
});
```

#### `error`
Error notifications.

```javascript
socket.on('error', (error) => {
  console.error('Error:', error);
  // {
  //   message: 'Failed to fill form field',
  //   details: 'Element not found',
  //   timestamp: 1706355000.123,
  //   recoverable: true
  // }
});
```

---

## Rate Limiting

Currently, no rate limiting is implemented. However, consider the following:

- OpenAI API has its own rate limits
- Browser automation is resource-intensive
- Monitor system resources during high usage

---

## Examples

### cURL Examples

#### Basic Job Application

```bash
curl -X POST http://localhost:8080/apply \
  -H 'Content-Type: application/json' \
  -d '{
    "job_url": "https://example.com/job-apply"
  }'
```

#### Full Configuration

```bash
curl -X POST http://localhost:8080/apply \
  -H 'Content-Type: application/json' \
  -d '{
    "job_url": "https://apply.appcast.io/jobs/50590620606/applyboard/apply",
    "timeout_seconds": 900,
    "user_data_dir": "/Users/username/chrome-user-data",
    "profile_directory": "Default",
    "cv_path": "data/cv.pdf",
    "site_hint": "appcast"
  }'
```

### Python Examples

#### Basic Usage

```python
import requests
import json

url = "http://localhost:8080/apply"
data = {
    "job_url": "https://example.com/job-apply",
    "timeout_seconds": 600
}

response = requests.post(url, json=data)
result = response.json()

print(f"Status: {response.status_code}")
print(f"Duration: {result['run']['meta']['duration_seconds']} seconds")
```

#### With Error Handling

```python
import requests
import json

def submit_job_application(job_url, **kwargs):
    url = "http://localhost:8080/apply"
    data = {
        "job_url": job_url,
        **kwargs
    }
    
    try:
        response = requests.post(url, json=data, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.Timeout:
        print("Request timed out")
        return None
    except requests.exceptions.HTTPError as e:
        print(f"HTTP error: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None

# Usage
result = submit_job_application(
    "https://example.com/job-apply",
    cv_path="data/cv.pdf",
    site_hint="appcast"
)
```

### JavaScript Examples

#### WebSocket Monitoring

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:8081');

socket.on('connect', () => {
  console.log('Connected to monitoring server');
});

socket.on('agent_status', (status) => {
  console.log(`Agent status: ${status.status} (${status.progress_percentage}%)`);
});

socket.on('action_log', (action) => {
  console.log(`Action: ${action.action_type} - ${action.question_id}`);
});

socket.on('error', (error) => {
  console.error(`Error: ${error.message}`);
});
```

---

## Response Schemas

### Question Object

```json
{
  "question_id": "string",
  "question_text": "string",
  "field_type": "text_input | textarea | select | radio | checkbox | date | file | email | phone",
  "required": "boolean",
  "filled": "boolean",
  "value": "string | number | boolean",
  "options": ["string"] // for select/radio fields
}
```

### Trace Object

```json
{
  "timestamp": "number",
  "action_type": "navigate | type | click | select | upload | screenshot | wait",
  "target": "string", // CSS selector or coordinates
  "value": "string | number | boolean",
  "success": "boolean",
  "error": "string" // if success is false
}
```

### Error Object

```json
{
  "message": "string",
  "details": "string",
  "timestamp": "number",
  "recoverable": "boolean",
  "action_type": "string"
}

