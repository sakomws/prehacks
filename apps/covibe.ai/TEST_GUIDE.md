# Covibe.ai Testing Guide

## Quick Start Testing

### 1. Check Services are Running

**Frontend:**
```bash
curl http://localhost:3001
```
Should return HTML content.

**Backend:**
```bash
curl http://localhost:8001/health
```
Should return:
```json
{
  "status": "healthy",
  "service": "covibe-api",
  "ai_services": {
    "openai": "configured",
    "anthropic": "configured"
  }
}
```

---

## API Testing

### Method 1: Using the Test Script (Easiest)

```bash
cd apps/covibe.ai
chmod +x test_api.sh
./test_api.sh
```

This will run all API tests automatically.

---

### Method 2: Manual cURL Commands

#### Test Health Check
```bash
curl http://localhost:8001/health
```

#### Test Chat Endpoint
```bash
curl -X POST http://localhost:8001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I implement a binary search in Python?",
    "context": "I need an efficient search algorithm"
  }'
```

#### Test Code Generation
```bash
curl -X POST http://localhost:8001/api/code/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a function to calculate fibonacci numbers",
    "language": "python"
  }'
```

#### Test Code Analysis
```bash
curl -X POST http://localhost:8001/api/code/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def factorial(n):\n    return n * factorial(n-1)",
    "language": "python"
  }'
```

---

### Method 3: Interactive API Documentation (Best for Exploration)

1. Open your browser to: **http://localhost:8001/docs**
2. You'll see Swagger UI with all endpoints
3. Click "Try it out" on any endpoint
4. Fill in the parameters
5. Click "Execute" to test

**Alternative:** Visit **http://localhost:8001/redoc** for ReDoc documentation.

---

## Frontend Testing

### 1. Browser Testing

Open your browser to: **http://localhost:3001**

You should see:
- Landing page with Covibe.ai branding
- Three feature cards:
  - 🧠 Smart Generation
  - 🔍 Code Analysis
  - 💬 Chat Interface

### 2. Test Frontend API Integration

Open browser console (F12) and run:

```javascript
// Test chat endpoint
fetch('http://localhost:8001/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Hello, can you help me with Python?',
    context: 'Learning Python basics'
  })
})
.then(r => r.json())
.then(console.log);
```

---

## Testing with Python

Create a test file `test_client.py`:

```python
import requests
import json

API_URL = "http://localhost:8001"

def test_health():
    response = requests.get(f"{API_URL}/health")
    print("Health Check:", response.json())

def test_chat():
    response = requests.post(
        f"{API_URL}/api/chat",
        json={
            "message": "How do I reverse a string in Python?",
            "context": "Python programming"
        }
    )
    print("Chat Response:", response.json())

def test_generate_code():
    response = requests.post(
        f"{API_URL}/api/code/generate",
        json={
            "prompt": "Create a function to check if a number is prime",
            "language": "python"
        }
    )
    print("Generated Code:", response.json())

def test_analyze_code():
    response = requests.post(
        f"{API_URL}/api/code/analyze",
        json={
            "code": "def add(a, b):\n    return a + b",
            "language": "python"
        }
    )
    print("Code Analysis:", response.json())

if __name__ == "__main__":
    test_health()
    test_chat()
    test_generate_code()
    test_analyze_code()
```

Run it:
```bash
python test_client.py
```

---

## Testing with Postman

1. Import this collection:

**Covibe.ai API Collection:**
- Base URL: `http://localhost:8001`
- Endpoints:
  - GET `/health`
  - POST `/api/chat`
  - POST `/api/code/generate`
  - POST `/api/code/analyze`

2. Set headers:
   - `Content-Type: application/json`

3. Test each endpoint with sample data

---

## Expected Results

### Chat Endpoint
```json
{
  "response": "To implement binary search in Python...",
  "model": "gpt-4",
  "tokens_used": 150
}
```

### Code Generation
```json
{
  "code": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
  "language": "python",
  "model": "gpt-4",
  "tokens_used": 120
}
```

### Code Analysis
```json
{
  "analysis": "Issues found:\n1. Missing base case - will cause infinite recursion...",
  "language": "python",
  "model": "gpt-4"
}
```

---

## Troubleshooting

### API Key Issues
If you see "OpenAI API key not configured":
1. Check `.env` file exists in `backend/` directory
2. Verify `OPENAI_API_KEY=sk-...` is set
3. Restart the backend server

### CORS Issues
If frontend can't connect to backend:
1. Check CORS origins in `main.py`
2. Ensure frontend URL is in allowed origins
3. Restart backend server

### Port Conflicts
If ports are in use:
- Frontend: Change port in `npm run dev` or use the auto-assigned port
- Backend: Change port in uvicorn command: `--port 8002`

---

## Performance Testing

Test response times:
```bash
time curl -X POST http://localhost:8001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

---

## Next Steps

1. ✅ Test all endpoints work
2. ✅ Verify AI responses are accurate
3. 🔄 Add more test cases
4. 🔄 Implement frontend UI for testing
5. 🔄 Add authentication testing
6. 🔄 Load testing with multiple requests

---

## Useful Commands

**Check if services are running:**
```bash
lsof -i :3001  # Frontend
lsof -i :8001  # Backend
```

**View backend logs:**
```bash
# Logs are in the terminal where you started the backend
```

**Restart services:**
```bash
# Stop: Ctrl+C in the terminal
# Start: npm run dev (frontend) or uvicorn main:app --reload (backend)
```
