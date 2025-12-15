# Image Generation Setup Guide

## Overview

Covibe.ai supports multiple image generation services for creating visuals for AI Parenting principles.

## Supported Services

### 1. Google Gemini Image Generation (Recommended) ⭐

**Model**: `gemini-2.5-flash-image`

**Setup**:
```bash
pip install google-genai
```

**Environment Variable**:
```env
GOOGLE_API_KEY=your_google_api_key
```

**Features**:
- Native integration with existing Gemini setup
- High-quality image generation
- No additional API keys needed (uses same key as text generation)

### 2. OpenAI DALL-E 3 (Alternative)

**Setup**:
```bash
pip install openai
```

**Environment Variable**:
```env
OPENAI_API_KEY=your_openai_api_key
```

**Features**:
- High-quality images
- URL-based image delivery

### 3. Stability AI (Stable Diffusion) (Alternative)

**Setup**:
```bash
pip install requests
```

**Environment Variable**:
```env
STABILITY_API_KEY=your_stability_api_key
```

**Features**:
- Open-source model
- Base64 image delivery

## Installation

### For Gemini Image Generation (Recommended)

```bash
cd apps/covibe.ai/backend
pip install google-genai
```

### For All Services

```bash
cd apps/covibe.ai/backend
pip install -r requirements.txt
pip install google-genai  # Additional package for Gemini image generation
```

## Usage

### Via Web UI

1. Navigate to `/images`
2. Select an AI Parenting principle
3. Choose image style
4. Click "Generate Image"
5. Image will be generated automatically if API key is configured

### Via API

```bash
curl -X POST http://localhost:8000/api/image/generate \
  -H "Content-Type: application/json" \
  -d '{
    "principle": "ethicalFoundation",
    "style": "illustration"
  }'
```

## Priority Order

The system tries image generation in this order:

1. **Gemini Image Generation** (if `google-genai` installed and `GOOGLE_API_KEY` set)
2. **OpenAI DALL-E 3** (if `OPENAI_API_KEY` set)
3. **Stability AI** (if `STABILITY_API_KEY` set)
4. **Prompt Only** (if no services available - generates optimized prompts)

## Troubleshooting

### "google-genai not installed"

**Solution**:
```bash
pip install google-genai
```

### "Image generation failed"

**Check**:
1. API key is correctly set in `.env`
2. API key has image generation permissions
3. Quota hasn't been exceeded
4. Network connection is working

### Images not appearing

**Check**:
1. Browser console for errors
2. Backend logs for generation errors
3. API key permissions
4. CORS settings (if accessing from different domain)

## Code Example

```python
from google import genai
from PIL import Image
import base64
import io

client = genai.Client(api_key="your_api_key")

prompt = "Create a picture of AI Parenting concept"

response = client.models.generate_content(
    model="gemini-2.5-flash-image",
    contents=[prompt],
)

for part in response.parts:
    if part.inline_data is not None:
        image = part.as_image()
        image.save("generated_image.png")
```

## Notes

- Gemini image generation requires the newer `google-genai` package (not `google-generativeai`)
- Images are returned as base64 data URLs for easy frontend integration
- Generated images are optimized for AI Parenting principle visualization
