"""AI Service for code generation and analysis"""
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class AIService:
    """Service for AI-powered code operations"""
    
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        print(f"🔑 OpenAI Key loaded: {'Yes' if self.openai_key else 'No'}")
        
    async def generate_code(self, prompt: str, language: str = "python") -> Dict[str, Any]:
        """Generate code based on prompt"""
        
        if not self.openai_key:
            return {
                "code": f"# Error: OpenAI API key not configured\n# Please add OPENAI_API_KEY to your .env file",
                "language": language,
                "model": "none",
                "error": "No API key configured"
            }
        
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.openai_key)
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",  # Using cheaper model
                messages=[
                    {
                        "role": "system",
                        "content": f"You are an expert {language} programmer. Generate clean, efficient, and well-documented code."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            code = response.choices[0].message.content
            
            return {
                "code": code,
                "language": language,
                "model": "gpt-3.5-turbo",
                "tokens_used": response.usage.total_tokens
            }
        except Exception as e:
            error_msg = str(e)
            print(f"OpenAI error: {error_msg}")
            
            # Demo mode - return example code
            return {
                "code": f"""# Generated {language} code for: {prompt}
# ⚠️ Demo Mode: OpenAI API error - {error_msg[:100]}

def example_function():
    \"\"\"
    This is a demo response.
    To get real AI-generated code, please add credits to your OpenAI account:
    https://platform.openai.com/account/billing
    \"\"\"
    print("Hello from Covibe.ai!")
    return "Demo mode - Please add API credits"

# Example usage
if __name__ == "__main__":
    result = example_function()
    print(result)
""",
                "language": language,
                "model": "demo-mode",
                "note": f"⚠️ Demo mode: {error_msg[:200]}"
            }
    
    async def analyze_code(self, code: str, language: str = "python") -> Dict[str, Any]:
        """Analyze code for issues and improvements"""
        
        if not self.openai_key:
            return {
                "analysis": "Error: OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file",
                "language": language,
                "model": "none",
                "error": "No API key configured"
            }
        
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.openai_key)
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a code review expert. Analyze the code and provide detailed feedback on bugs, performance, security, and best practices."
                    },
                    {
                        "role": "user",
                        "content": f"Analyze this {language} code:\n\n{code}"
                    }
                ],
                temperature=0.3,
                max_tokens=1500
            )
            
            analysis = response.choices[0].message.content
            
            return {
                "analysis": analysis,
                "language": language,
                "model": "gpt-3.5-turbo"
            }
        except Exception as e:
            error_msg = str(e)
            print(f"OpenAI error: {error_msg}")
            
            # Demo mode analysis
            return {
                "analysis": f"""📊 **Code Analysis (Demo Mode)**

**Code Analyzed:**
```{language}
{code[:200]}{'...' if len(code) > 200 else ''}
```

⚠️ **Demo Mode Active**

OpenAI API Error: {error_msg[:200]}

To get real AI code analysis, please add credits to your OpenAI account:
- Visit: https://platform.openai.com/account/billing
- Purchase credits

**What Real Analysis Would Include:**
- 🐛 Bug detection and fixes
- 🔒 Security vulnerability scanning
- ⚡ Performance optimization suggestions
- 📚 Best practices recommendations
- 🎯 Code quality metrics
- ♻️ Refactoring opportunities

The application is fully functional - just add API credits to unlock AI features! 🚀""",
                "language": language,
                "model": "demo-mode"
            }
    
    async def chat(self, message: str, context: Optional[str] = None) -> Dict[str, Any]:
        """Chat with AI about coding questions"""
        
        if not self.openai_key:
            return {
                "response": "Error: OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file",
                "model": "none",
                "error": "No API key configured"
            }
        
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.openai_key)
            
            messages = [
                {
                    "role": "system",
                    "content": "You are an expert programming assistant. Help users with coding questions, debugging, and best practices."
                }
            ]
            
            if context:
                messages.append({
                    "role": "system",
                    "content": f"Context: {context}"
                })
            
            messages.append({
                "role": "user",
                "content": message
            })
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.7,
                max_tokens=1500
            )
            
            return {
                "response": response.choices[0].message.content,
                "model": "gpt-3.5-turbo",
                "tokens_used": response.usage.total_tokens
            }
        except Exception as e:
            error_msg = str(e)
            print(f"OpenAI error: {error_msg}")
            
            # Demo mode response
            return {
                "response": f"""👋 Hello! I'm Covibe.ai running in demo mode.

Your question: "{message}"

⚠️ **Demo Mode Active**

OpenAI API Error: {error_msg[:200]}

To get real AI responses, please add credits to your OpenAI account:
- Visit: https://platform.openai.com/account/billing
- Purchase credits
- Restart the backend server

**Example Response:**
For coding questions like yours, I would typically provide:
- Detailed explanations
- Code examples
- Best practices
- Step-by-step guidance

The UI is working perfectly - you just need API credits to unlock the AI features! 🚀""",
                "model": "demo-mode",
                "note": f"Demo mode: {error_msg[:200]}"
            }


# Global AI service instance
ai_service = AIService()
