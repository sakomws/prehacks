# How to Test Multimodality Feature

## Overview
The multimodal feature allows you to upload code screenshots and get AI Parenting analysis directly from images using Google Gemini's vision capabilities.

## Prerequisites
1. Backend server running on `http://localhost:8000`
2. Frontend server running on `http://localhost:3000`
3. Google Gemini API key configured in `.env`

## Testing Steps

### Method 1: Using the Web UI (Recommended)

1. **Navigate to Vision Page**
   - Go to `http://localhost:3000/vision`
   - Or click "Multimodal Analysis" card on the homepage

2. **Prepare a Code Screenshot**
   - Take a screenshot of code from:
     - Your IDE (VS Code, PyCharm, etc.)
     - GitHub repository
     - Stack Overflow
     - Any code editor
   - Supported formats: PNG, JPG, GIF (up to 10MB)

3. **Upload the Image**
   - Click the upload area or drag and drop
   - The image will be displayed in the preview

4. **Choose Analysis Type**
   - **"Analyze Code"**: Extracts code and provides AI Parenting analysis
   - **"Extract & Improve"**: Extracts code and generates improved ethical version

5. **View Results**
   - Extracted code appears in the code panel
   - AI Parenting analysis appears below
   - You can copy the code to clipboard

### Method 2: Using API Directly

#### Test with cURL

```bash
# First, convert your image to base64
IMAGE_BASE64=$(base64 -i path/to/code_screenshot.png)

# Analyze code from image
curl -X POST http://localhost:8000/api/code/analyze-image \
  -H "Content-Type: application/json" \
  -d "{
    \"image\": \"data:image/png;base64,$IMAGE_BASE64\",
    \"language\": \"python\",
    \"rulesets\": {
      \"ethicalFoundation\": true,
      \"biasAwareness\": true,
      \"safetyFirst\": true,
      \"responsibleDesign\": true
    }
  }"

# Extract and improve code from image
curl -X POST http://localhost:8000/api/code/generate-from-image \
  -H "Content-Type: application/json" \
  -d "{
    \"image\": \"data:image/png;base64,$IMAGE_BASE64\",
    \"language\": \"python\"
  }"
```

#### Test with Python

```python
import requests
import base64

# Read and encode image
with open("code_screenshot.png", "rb") as f:
    image_data = base64.b64encode(f.read()).decode()

# Analyze code
response = requests.post(
    "http://localhost:8000/api/code/analyze-image",
    json={
        "image": f"data:image/png;base64,{image_data}",
        "language": "python",
        "rulesets": {
            "ethicalFoundation": True,
            "biasAwareness": True,
            "safetyFirst": True,
            "responsibleDesign": True
        }
    }
)

print(response.json())
```

### Method 3: Test with Sample Code Screenshot

1. **Create a Test Image**
   - Open any code editor
   - Write some code (good or bad example)
   - Take a screenshot (Cmd+Shift+4 on Mac, Win+Shift+S on Windows)

2. **Example Test Cases**

   **Test Case 1: Code with Bias**
   ```python
   def recommend_jobs(user):
       if user.gender == 'female':
           return ['nurse', 'teacher']
       else:
           return ['engineer', 'doctor']
   ```
   - Upload screenshot
   - Should detect bias and suggest improvements

   **Test Case 2: Unsafe Code**
   ```python
   def process_payment(user_id, amount):
       query = f"UPDATE accounts SET balance = balance - {amount} WHERE id = {user_id}"
       db.execute(query)
   ```
   - Upload screenshot
   - Should detect SQL injection vulnerability

   **Test Case 3: Good Code**
   ```python
   def calculate_score(user, criteria):
       score = 0.0
       for attr, weight in criteria.items():
           if attr == 'age':  # Age-neutral
               continue
           score += getattr(user, attr, 0) * weight
       return score
   ```
   - Upload screenshot
   - Should recognize ethical practices

## Expected Results

### Successful Analysis Should Return:
```json
{
  "code": "extracted code here...",
  "analysis": "AI Parenting analysis with scores and recommendations...",
  "language": "python",
  "model": "gemini-2.5-flash",
  "multimodal": true,
  "image_analyzed": true
}
```

### Analysis Should Include:
- Extracted code from the image
- Language detection (if auto)
- AI Parenting principle scores
- Specific improvement suggestions
- Ethical considerations
- Bias detection (if applicable)
- Safety recommendations

## Troubleshooting

### Issue: "Error analyzing image"
- **Check**: Is the image format supported? (PNG, JPG, GIF)
- **Check**: Is the image size under 10MB?
- **Check**: Is the backend server running?

### Issue: "No code found in image"
- The image might not contain readable code
- Try a clearer screenshot with better contrast
- Ensure code is visible and not too small

### Issue: "API key not configured"
- Check `.env` file has `GOOGLE_API_KEY` set
- Restart backend server after adding key

### Issue: "Quota exceeded"
- Google Gemini API quota may be reached
- Wait for quota reset or upgrade plan

## Advanced Testing

### Test Different Image Types:
1. **IDE Screenshots**: VS Code, PyCharm, etc.
2. **GitHub Code**: Screenshot from GitHub repository
3. **Mobile Screenshots**: Code viewed on phone
4. **Printed Code**: Photo of printed code (may have lower accuracy)

### Test Different Languages:
- Python
- JavaScript
- TypeScript
- Java
- C++
- Auto-detect (leave language as "auto")

### Test Ruleset Combinations:
- Enable/disable different AI Parenting principles
- See how analysis changes based on active rulesets

## Performance Notes

- Image processing typically takes 3-10 seconds
- Larger images may take longer
- Multiple images can be processed sequentially
- Results are cached in browser (localStorage)

## Success Criteria

✅ Image uploads successfully
✅ Code is extracted accurately
✅ Analysis includes AI Parenting principles
✅ Improvement suggestions are relevant
✅ Code can be copied to clipboard
✅ Works with different image formats
✅ Handles errors gracefully

## Next Steps

After testing:
1. Try with real code from your projects
2. Compare analysis with manual code review
3. Use improvements to enhance your code
4. Share feedback on accuracy and usefulness
