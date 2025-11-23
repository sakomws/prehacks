# Covibe.ai API Documentation

## Base URL
- Development: `http://localhost:8000`
- Production: `https://api.covibe.ai`

## Authentication
All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Health Check
```http
GET /health
```
Returns the health status of the API.

**Response:**
```json
{
  "status": "healthy",
  "service": "covibe-api"
}
```

---

### Chat

#### Send Message
```http
POST /api/chat
```
Send a message to the AI coding agent.

**Request Body:**
```json
{
  "message": "How do I implement a binary search in Python?",
  "context": {
    "language": "python",
    "framework": null
  }
}
```

**Response:**
```json
{
  "id": "msg_123",
  "response": "Here's how to implement binary search...",
  "code": "def binary_search(arr, target):\n    ...",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### Get Chat History
```http
GET /api/chat/history?limit=50&offset=0
```
Retrieve chat history.

---

### Code Analysis

#### Analyze Code
```http
POST /api/code/analyze
```
Analyze code for bugs, performance issues, and improvements.

**Request Body:**
```json
{
  "code": "def factorial(n):\n    return n * factorial(n-1)",
  "language": "python"
}
```

**Response:**
```json
{
  "issues": [
    {
      "type": "bug",
      "severity": "high",
      "line": 2,
      "message": "Missing base case - will cause infinite recursion",
      "suggestion": "Add base case: if n <= 1: return 1"
    }
  ],
  "metrics": {
    "complexity": 2,
    "maintainability": 65
  }
}
```

#### Explain Code
```http
POST /api/code/explain
```
Get a detailed explanation of code.

#### Refactor Code
```http
POST /api/code/refactor
```
Get refactoring suggestions.

---

### AI Completion

#### Code Completion
```http
POST /api/ai/complete
```
Get AI-powered code completions.

**Request Body:**
```json
{
  "code": "def calculate_",
  "language": "python",
  "context": "Building a calculator app"
}
```

**Response:**
```json
{
  "completions": [
    {
      "text": "sum(numbers):\n    return sum(numbers)",
      "confidence": 0.95
    }
  ]
}
```

---

### Projects

#### List Projects
```http
GET /api/projects
```

#### Create Project
```http
POST /api/projects
```

#### Get Project
```http
GET /api/projects/{id}
```

#### Update Project
```http
PUT /api/projects/{id}
```

#### Delete Project
```http
DELETE /api/projects/{id}
```

---

## WebSocket

### Chat WebSocket
```
ws://localhost:8000/ws/chat
```
Real-time chat with the AI agent.

**Message Format:**
```json
{
  "type": "message",
  "content": "Your message here"
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Common Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error
