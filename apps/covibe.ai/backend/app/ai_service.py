"""AI Service for code generation and analysis using Google Gemini with AI Parenting principles"""
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class AIService:
    """Service for AI-powered code operations using Google Gemini with ethical AI parenting approach"""
    
    def __init__(self):
        self.google_api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GOOGLE_AI_API_KEY")
        self.gemini_model = None
        
        if self.google_api_key:
            try:
                import google.generativeai as genai
                from google.generativeai.types import HarmCategory, HarmBlockThreshold
                
                genai.configure(api_key=self.google_api_key)
                self.gemini_model = genai.GenerativeModel('gemini-2.5-flash')
                
                # Safety settings aligned with AI parenting principles
                self.safety_settings = {
                    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                }
                
                print(f"✅ Gemini AI initialized with ethical AI parenting principles")
            except Exception as e:
                print(f"⚠️ Failed to initialize Gemini: {e}")
        else:
            print(f"⚠️ Google API key not found. Please set GOOGLE_API_KEY or GOOGLE_AI_API_KEY in your .env file")
    
    def _build_ai_parenting_prompt(self, base_prompt: str, context: str = "code generation", rulesets: Optional[Dict[str, bool]] = None) -> str:
        """Build prompt incorporating AI parenting metaphor and ethical principles"""
        
        # Default rulesets (all enabled)
        if rulesets is None:
            rulesets = {
                "ethicalFoundation": True,
                "biasAwareness": True,
                "safetyFirst": True,
                "responsibleDesign": True,
            }
        
        principles = []
        
        if rulesets.get("ethicalFoundation", True):
            principles.append("**Ethical Foundation**: Generate code that promotes fairness, transparency, and responsible AI development")
        
        if rulesets.get("biasAwareness", True):
            principles.append("**Bias Awareness**: Be mindful of potential biases that could be inherited by AI systems")
        
        if rulesets.get("safetyFirst", True):
            principles.append("**Safety First**: Prioritize security, error handling, and safe defaults")
        
        # Educational value is always included
        principles.append("**Educational Value**: Include clear documentation and comments that teach best practices")
        
        if rulesets.get("responsibleDesign", True):
            principles.append("**Responsible Design**: Consider the long-term impact of the code on AI systems and users")
        
        principles_text = "\n".join([f"{i+1}. {p}" for i, p in enumerate(principles)])
        
        return f"""You are an expert programmer who understands the responsibility of "parenting AI" - teaching code that will be used to train, guide, or interact with AI systems.

{base_prompt}

**AI Parenting Principles to Apply:**
{principles_text}

**Context**: {context}

Remember: Just as children learn from their environment, AI systems learn from the code and data we provide. Write code that you'd be proud to have an AI "child" learn from."""
        
    async def generate_code(self, prompt: str, language: str = "python", rulesets: Optional[Dict[str, bool]] = None) -> Dict[str, Any]:
        """Generate code based on prompt using Gemini with AI parenting principles"""
        
        if not self.google_api_key or not self.gemini_model:
            return {
                "code": f"# Error: Google Gemini API key not configured\n# Please add GOOGLE_API_KEY or GOOGLE_AI_API_KEY to your .env file",
                "language": language,
                "model": "none",
                "error": "No API key configured"
            }
        
        try:
            base_prompt = f"""You are an expert {language} programmer. Generate clean, efficient, and well-documented code that follows ethical AI development principles.

User request: {prompt}

**Requirements:**
- Follow best practices and include helpful comments
- Consider ethical implications and potential biases
- Include proper error handling and security measures
- Write code that promotes responsible AI development
- Return only the code without markdown formatting unless specifically requested"""
            
            full_prompt = self._build_ai_parenting_prompt(base_prompt, f"generating {language} code", rulesets)
            
            response = self.gemini_model.generate_content(
                full_prompt,
                generation_config={
                    "temperature": 0.7,
                    "max_output_tokens": 2048,
                },
                safety_settings=self.safety_settings
            )
            
            code = response.text.strip()
            
            # Remove markdown code blocks if present
            if code.startswith("```"):
                lines = code.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].strip() == "```":
                    lines = lines[:-1]
                code = "\n".join(lines)
            
            return {
                "code": code,
                "language": language,
                "model": "gemini-2.5-flash",
                "provider": "google",
                "ethical_guidance": True,
                "ai_parenting_principles": "applied"
            }
        except Exception as e:
            error_msg = str(e)
            print(f"Gemini error: {error_msg}")
            
            # Check for quota/rate limit errors
            is_quota_error = "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower()
            
            if is_quota_error:
                quota_message = f"""# ⚠️ Gemini API Quota Exceeded

# Your Google API key has reached its quota limit.
# 
# To resolve this:
# 1. Check your quota at: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
# 2. Wait for the quota to reset (usually hourly or daily)
# 3. Consider upgrading your plan if you need higher limits
# 4. Or use a different API key
#
# Request: {prompt}
# Language: {language}
#
# Here's a template following AI parenting principles:

def example_function():
    \"\"\"
    Example code following ethical AI development principles.
    This is a placeholder - please wait for quota reset or upgrade your API plan.
    \"\"\"
    # Ethical considerations: fairness, transparency, safety
    # Bias awareness: check for potential biases
    # Error handling: proper exception management
    # Documentation: clear comments for AI systems to learn from
    
    return "Quota exceeded - Please wait or upgrade your API plan"

if __name__ == "__main__":
    result = example_function()
    print(result)
"""
                return {
                    "code": quota_message,
                    "language": language,
                    "model": "quota-exceeded",
                    "error": "quota_exceeded",
                    "error_message": "Gemini API quota exceeded. Please wait for quota reset or upgrade your plan.",
                    "help_url": "https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas"
                }
            
            # Demo mode - return example code
            return {
                "code": f"""# Generated {language} code for: {prompt}
# ⚠️ Demo Mode: Gemini API error - {error_msg[:100]}
# This code follows AI parenting principles: ethical, safe, and well-documented

def example_function():
    \"\"\"
    This is a demo response following AI parenting principles.
    To get real AI-generated code, please configure your Google API key:
    - Get API key from: https://makersuite.google.com/app/apikey
    - Add GOOGLE_API_KEY to your .env file
    \"\"\"
    print("Hello from Covibe.ai - Teaching responsible AI development!")
    return "Demo mode - Please configure API key"

# Example usage
if __name__ == "__main__":
    result = example_function()
    print(result)
""",
                "language": language,
                "model": "demo-mode",
                "note": f"⚠️ Demo mode: {error_msg[:200]}"
            }
    
    async def analyze_code(self, code: str, language: str = "python", rulesets: Optional[Dict[str, bool]] = None) -> Dict[str, Any]:
        """Analyze code for issues and improvements using Gemini with AI parenting lens"""
        
        if not self.google_api_key or not self.gemini_model:
            return {
                "analysis": "Error: Google Gemini API key not configured. Please add GOOGLE_API_KEY to your .env file",
                "language": language,
                "model": "none",
                "error": "No API key configured"
            }
        
        try:
            base_prompt = f"""You are a code review expert who understands the "AI parenting" responsibility - code that trains or interacts with AI systems must be held to the highest ethical standards.

Analyze the following {language} code and provide detailed feedback on:

**Technical Analysis:**
1. Bugs and potential errors
2. Performance issues
3. Security vulnerabilities
4. Best practices and code quality
5. Refactoring suggestions

**AI Parenting & Ethical Analysis:**
6. Potential biases that could be inherited by AI systems
7. Ethical implications and responsible AI considerations
8. Safety and fairness concerns
9. Transparency and explainability issues
10. Long-term impact on AI development

Code to analyze:
```{language}
{code}
```

Provide a comprehensive analysis with specific line numbers and actionable recommendations. Frame feedback in the context of "parenting AI" - what would an AI system learn from this code?"""

            full_prompt = self._build_ai_parenting_prompt(base_prompt, f"analyzing {language} code", rulesets)
            
            response = self.gemini_model.generate_content(
                full_prompt,
                generation_config={
                    "temperature": 0.3,
                    "max_output_tokens": 2048,
                },
                safety_settings=self.safety_settings
            )
            
            analysis = response.text.strip()
            
            return {
                "analysis": analysis,
                "language": language,
                "model": "gemini-2.5-flash",
                "provider": "google",
                "ethical_guidance": True,
                "ai_parenting_principles": "applied"
            }
        except Exception as e:
            error_msg = str(e)
            print(f"Gemini error: {error_msg}")
            
            # Check for quota/rate limit errors
            is_quota_error = "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower()
            
            if is_quota_error:
                return {
                    "analysis": f"""📊 **Code Analysis - Quota Exceeded**

**Code Analyzed:**
```{language}
{code[:200]}{'...' if len(code) > 200 else ''}
```

⚠️ **Gemini API Quota Exceeded**

Your Google API key has reached its quota limit.

**To resolve:**
1. Check your quota: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
2. Wait for quota reset (usually hourly or daily)
3. Consider upgrading your plan for higher limits
4. Or use a different API key

**What Analysis Would Include:**
- 🐛 Bug detection and fixes
- 🔒 Security vulnerability scanning
- ⚡ Performance optimization suggestions
- 📚 Best practices recommendations
- 🎯 Code quality metrics
- ♻️ Refactoring opportunities
- 🤖 **AI Parenting Analysis**: Bias detection, ethical implications, responsible AI considerations
- 🌱 **Ethical Guidance**: How this code might influence AI systems that learn from it

Please wait for quota reset or upgrade your API plan to continue. 🚀""",
                    "language": language,
                    "model": "quota-exceeded",
                    "error": "quota_exceeded",
                    "error_message": "Gemini API quota exceeded. Please wait for quota reset or upgrade your plan.",
                    "help_url": "https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas"
                }
            
            # Demo mode analysis
            return {
                "analysis": f"""📊 **Code Analysis (Demo Mode) - AI Parenting Perspective**

**Code Analyzed:**
```{language}
{code[:200]}{'...' if len(code) > 200 else ''}
```

⚠️ **Demo Mode Active**

Gemini API Error: {error_msg[:200]}

To get real AI code analysis with ethical AI parenting principles, please configure your Google API key:
- Get API key from: https://makersuite.google.com/app/apikey
- Add GOOGLE_API_KEY to your .env file
- Restart the backend server

**What Real Analysis Would Include:**
- 🐛 Bug detection and fixes
- 🔒 Security vulnerability scanning
- ⚡ Performance optimization suggestions
- 📚 Best practices recommendations
- 🎯 Code quality metrics
- ♻️ Refactoring opportunities
- 🤖 **AI Parenting Analysis**: Bias detection, ethical implications, responsible AI considerations
- 🌱 **Ethical Guidance**: How this code might influence AI systems that learn from it

The application is fully functional - just add API key to unlock AI features! 🚀""",
                "language": language,
                "model": "demo-mode"
            }
    
    async def chat(self, message: str, context: Optional[str] = None) -> Dict[str, Any]:
        """Chat with AI about coding questions using Gemini with AI parenting guidance"""
        
        if not self.google_api_key or not self.gemini_model:
            return {
                "response": "Error: Google Gemini API key not configured. Please add GOOGLE_API_KEY to your .env file",
                "model": "none",
                "error": "No API key configured"
            }
        
        try:
            base_prompt = """You are an expert programming assistant who understands the responsibility of "parenting AI" - teaching developers to write code that will responsibly guide and interact with AI systems.

Help users with coding questions, debugging, and best practices while:
1. Emphasizing ethical considerations and responsible AI development
2. Teaching best practices that promote fairness, transparency, and safety
3. Using the "AI as child" metaphor when relevant to explain concepts
4. Encouraging code that AI systems can learn from positively
5. Providing clear, concise, and helpful responses

Remember: Just as children learn from their environment, AI systems learn from the code we write. Guide developers to be responsible "AI parents"."""

            if context:
                full_prompt = f"{base_prompt}\n\nContext: {context}\n\nUser question: {message}"
            else:
                full_prompt = f"{base_prompt}\n\nUser question: {message}"
            
            response = self.gemini_model.generate_content(
                full_prompt,
                generation_config={
                    "temperature": 0.7,
                    "max_output_tokens": 2048,
                },
                safety_settings=self.safety_settings
            )
            
            return {
                "response": response.text.strip(),
                "model": "gemini-2.5-flash",
                "provider": "google",
                "ethical_guidance": True,
                "ai_parenting_principles": "applied"
            }
        except Exception as e:
            error_msg = str(e)
            print(f"Gemini error: {error_msg}")
            
            # Check for quota/rate limit errors
            is_quota_error = "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower()
            
            if is_quota_error:
                return {
                    "response": f"""👋 Hello! I'm Covibe.ai, but I'm currently unable to respond due to API quota limits.

Your question: "{message}"

⚠️ **Gemini API Quota Exceeded**

Your Google API key has reached its quota limit.

**To resolve:**
1. Check your quota: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
2. Wait for quota reset (usually hourly or daily)
3. Consider upgrading your plan for higher limits
4. Or use a different API key

**What I Would Normally Provide:**
For questions like yours, I would typically provide:
- Detailed explanations with ethical considerations
- Code examples that follow responsible AI principles
- Best practices for "parenting AI" through code
- Step-by-step guidance with safety and fairness in mind
- Insights on how code influences AI systems

Please wait for quota reset or upgrade your API plan to continue. 🚀""",
                    "model": "quota-exceeded",
                    "error": "quota_exceeded",
                    "error_message": "Gemini API quota exceeded. Please wait for quota reset or upgrade your plan.",
                    "help_url": "https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas"
                }
            
            # Demo mode response
            return {
                "response": f"""👋 Hello! I'm Covibe.ai running in demo mode with AI parenting principles.

Your question: "{message}"

⚠️ **Demo Mode Active**

Gemini API Error: {error_msg[:200]}

To get real AI responses with ethical AI parenting guidance, please configure your Google API key:
- Get API key from: https://makersuite.google.com/app/apikey
- Add GOOGLE_API_KEY to your .env file
- Restart the backend server

**Example Response:**
For coding questions like yours, I would typically provide:
- Detailed explanations with ethical considerations
- Code examples that follow responsible AI principles
- Best practices for "parenting AI" through code
- Step-by-step guidance with safety and fairness in mind
- Insights on how code influences AI systems

The UI is working perfectly - you just need to configure the API key to unlock the AI features! 🚀""",
                "model": "demo-mode",
                "note": f"Demo mode: {error_msg[:200]}"
            }
    
    async def generate_ethical_guidance(self, code: str, language: str = "python") -> Dict[str, Any]:
        """Generate ethical guidance for code from an AI parenting perspective"""
        
        if not self.google_api_key or not self.gemini_model:
            return {
                "guidance": "Error: Google Gemini API key not configured",
                "error": "No API key configured"
            }
        
        try:
            prompt = f"""As an AI ethics educator using the "parenting AI" metaphor, analyze this {language} code and provide ethical guidance:

```{language}
{code}
```

Consider:
1. What would an AI system "learn" from this code?
2. Are there potential biases or unfairness issues?
3. How does this code handle edge cases and errors?
4. Is the code transparent and explainable?
5. What are the long-term implications for AI development?

Provide guidance in a nurturing, educational tone that helps developers understand their role as "AI parents" - responsible for the code that shapes AI systems."""
            
            response = self.gemini_model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.5,
                    "max_output_tokens": 1500,
                },
                safety_settings=self.safety_settings
            )
            
            return {
                "guidance": response.text.strip(),
                "language": language,
                "model": "gemini-2.5-flash",
                "perspective": "AI Parenting"
            }
        except Exception as e:
            error_msg = str(e)
            
            # Check for quota/rate limit errors
            is_quota_error = "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower()
            
            if is_quota_error:
                return {
                    "guidance": f"""⚠️ **Gemini API Quota Exceeded**

Your Google API key has reached its quota limit. Unable to generate ethical guidance at this time.

**To resolve:**
1. Check your quota: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
2. Wait for quota reset (usually hourly or daily)
3. Consider upgrading your plan for higher limits
4. Or use a different API key

**What Ethical Guidance Would Include:**
- Analysis of what AI systems would "learn" from this code
- Potential bias and fairness issues
- Safety and transparency considerations
- Long-term implications for AI development
- Recommendations for responsible AI practices

Please wait for quota reset or upgrade your API plan to continue.""",
                    "error": "quota_exceeded",
                    "error_message": "Gemini API quota exceeded. Please wait for quota reset or upgrade your plan.",
                    "help_url": "https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas"
                }
            
            return {
                "guidance": f"Error generating ethical guidance: {error_msg}",
                "error": error_msg
            }


# Global AI service instance
ai_service = AIService()
