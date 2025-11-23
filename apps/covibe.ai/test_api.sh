#!/bin/bash

echo "🧪 Testing Covibe.ai API"
echo "========================"
echo ""

API_URL="http://localhost:8001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${BLUE}Test 1: Health Check${NC}"
echo "GET $API_URL/health"
curl -s "$API_URL/health" | python3 -m json.tool
echo ""
echo ""

# Test 2: Root Endpoint
echo -e "${BLUE}Test 2: Root Endpoint${NC}"
echo "GET $API_URL/"
curl -s "$API_URL/" | python3 -m json.tool
echo ""
echo ""

# Test 3: Chat Endpoint
echo -e "${BLUE}Test 3: Chat with AI${NC}"
echo "POST $API_URL/api/chat"
curl -s -X POST "$API_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I implement a binary search in Python?",
    "context": "I need an efficient search algorithm"
  }' | python3 -m json.tool
echo ""
echo ""

# Test 4: Code Generation
echo -e "${BLUE}Test 4: Generate Code${NC}"
echo "POST $API_URL/api/code/generate"
curl -s -X POST "$API_URL/api/code/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a function to calculate fibonacci numbers",
    "language": "python"
  }' | python3 -m json.tool
echo ""
echo ""

# Test 5: Code Analysis
echo -e "${BLUE}Test 5: Analyze Code${NC}"
echo "POST $API_URL/api/code/analyze"
curl -s -X POST "$API_URL/api/code/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def factorial(n):\n    return n * factorial(n-1)",
    "language": "python"
  }' | python3 -m json.tool
echo ""
echo ""

echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "Visit $API_URL/docs for interactive API documentation"
