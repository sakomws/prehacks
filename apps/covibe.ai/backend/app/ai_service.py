"""AI Service for code generation and analysis using Google Gemini with AI Parenting principles"""
from typing import Optional, Dict, Any, List, Union
import os
import base64
import io
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class AIService:
    """Service for AI-powered code operations using Google Gemini with ethical AI parenting approach"""
    
    def __init__(self):
        self.google_api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GOOGLE_AI_API_KEY")
        self.gemini_model = None
        self.gemini_image_client = None
        
        if self.google_api_key:
            try:
                import google.generativeai as genai
                from google.generativeai.types import HarmCategory, HarmBlockThreshold
                
                genai.configure(api_key=self.google_api_key)
                self.gemini_model = genai.GenerativeModel('gemini-2.5-flash')
                # Note: Gemini 2.5 Flash supports multimodal (images) by default
                
                # Try to initialize image generation client (new Google GenAI SDK)
                # Note: Requires: pip install google-genai
                self.gemini_image_client = None
                try:
                    # Try importing the new SDK
                    try:
                        from google import genai as genai_client
                        self.gemini_image_client = genai_client.Client(api_key=self.google_api_key)
                        print(f"✅ Gemini image generation client initialized")
                    except (ImportError, AttributeError):
                        # Try alternative import path
                        try:
                            import google.genai as genai_client
                            self.gemini_image_client = genai_client.Client(api_key=self.google_api_key)
                            print(f"✅ Gemini image generation client initialized (alt import)")
                        except (ImportError, AttributeError):
                            print(f"⚠️ New Google GenAI SDK (google-genai) not installed. Install with: pip install google-genai")
                            self.gemini_image_client = None
                except Exception as e:
                    print(f"⚠️ Image generation client initialization error: {e}")
                    self.gemini_image_client = None
                
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
            base_prompt = f"""You are an expert {language} programmer. Generate COMPLETE, working, production-ready code.

User request: {prompt}

**CRITICAL REQUIREMENTS:**
1. Generate COMPLETE, FUNCTIONAL code - NEVER truncate or cut off mid-sentence, mid-function, or mid-statement
2. Include ALL necessary imports at the top
3. Write COMPLETE functions/classes with proper syntax and closing statements
4. Include proper error handling, validation, and security measures
5. Add helpful comments explaining AI parenting principles and ethical considerations
6. Return ONLY the code - no markdown code blocks (```), no explanations before or after the code
7. Ensure the code is syntactically complete, properly indented, and can run
8. If the code is long, make sure ALL functions are complete before ending

**OUTPUT FORMAT:**
- Start directly with imports (if any)
- Then the complete code
- End with complete, closed functions/classes
- NO markdown formatting
- NO explanatory text before or after

**REMEMBER:** The code MUST be complete and runnable. Do not stop until all functions are fully implemented."""
            
            full_prompt = self._build_ai_parenting_prompt(base_prompt, f"generating {language} code", rulesets)
            
            response = self.gemini_model.generate_content(
                full_prompt,
                generation_config={
                    "temperature": 0.7,
                    "max_output_tokens": 4096,  # Increased from 2048
                },
                safety_settings=self.safety_settings
            )
            
            code = response.text.strip()
            
            # Check if response was truncated (common indicators)
            is_truncated = False
            
            # Check for incomplete Python functions
            if language == "python":
                # Count function definitions
                def_count = code.count("def ")
                if def_count > 0:
                    last_def_idx = code.rfind("def ")
                    if last_def_idx != -1:
                        after_def = code[last_def_idx:]
                        # Check if last function is incomplete
                        if ":" in after_def:
                            colon_idx = after_def.find(":")
                            after_colon = after_def[colon_idx + 1:].strip()
                            # If after colon there's nothing meaningful, it's incomplete
                            if not after_colon or (after_colon.startswith("#") and "\n" not in after_colon):
                                is_truncated = True
                            # Check if code ends mid-statement (no proper function body)
                            elif not any(line.strip() and not line.strip().startswith("#") for line in after_colon.split("\n")[:3]):
                                is_truncated = True
                        else:
                            is_truncated = True
            else:
                # For other languages, check bracket/brace balance
                is_truncated = (
                    code.count("(") > code.count(")") or
                    code.count("{") > code.count("}") or
                    code.count("[") > code.count("]")
                )
            
            # If truncated, try to get continuation
            if is_truncated:
                try:
                    # Get the last 300 chars for context
                    context = code[-300:] if len(code) > 300 else code
                    continuation_prompt = f"""The following {language} code was cut off mid-generation. Complete it by:
1. Finishing any incomplete function/class
2. Adding proper closing statements
3. Ensuring all code blocks are complete
4. Return ONLY the continuation code (no explanations, no repetition of what's already there):

{context}

Continue from where it left off:"""
                    continuation = self.gemini_model.generate_content(
                        continuation_prompt,
                        generation_config={
                            "temperature": 0.3,
                            "max_output_tokens": 2048,
                        },
                        safety_settings=self.safety_settings
                    )
                    continuation_text = continuation.text.strip()
                    # Remove any markdown from continuation
                    if continuation_text.startswith("```"):
                        continuation_text = continuation_text.split("```")[1]
                        if "\n" in continuation_text:
                            continuation_text = continuation_text.split("\n", 1)[1]
                        if continuation_text.endswith("```"):
                            continuation_text = continuation_text[:-3].rstrip()
                    code += "\n" + continuation_text
                except Exception as e:
                    print(f"Continuation failed: {e}")
                    # Add a note that code may be incomplete
                    code += "\n\n# ⚠️ Note: Code generation may have been truncated. Please review and complete if needed."
            
            # Remove markdown code blocks if present
            if code.startswith("```"):
                lines = code.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].strip() == "```":
                    lines = lines[:-1]
                code = "\n".join(lines)
            
            # Clean up any trailing incomplete statements
            code = code.rstrip()
            # Remove any trailing incomplete comments
            while code and (code.endswith("#") or code.endswith("# ")):
                code = code.rstrip("# ").rstrip()
            
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
    
    async def chat(self, message: str, context: Optional[str] = None, rulesets: Optional[Dict[str, bool]] = None) -> Dict[str, Any]:
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
                user_prompt = f"{base_prompt}\n\nContext: {context}\n\nUser question: {message}"
            else:
                user_prompt = f"{base_prompt}\n\nUser question: {message}"
            
            full_prompt = self._build_ai_parenting_prompt(user_prompt, "chat conversation", rulesets)
            
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
    
    async def calculate_parenting_score(self, code: str, language: str = "python", rulesets: Optional[Dict[str, bool]] = None) -> Dict[str, Any]:
        """Calculate AI Parenting Score for code"""
        
        if not self.google_api_key or not self.gemini_model:
            return {
                "score": {
                    "ethicalFoundation": 0,
                    "biasAwareness": 0,
                    "safetyFirst": 0,
                    "responsibleDesign": 0,
                    "overall": 0
                },
                "feedback": "Error: Google Gemini API key not configured",
                "error": "No API key configured"
            }
        
        try:
            prompt = f"""Analyze this {language} code and provide a detailed AI Parenting Score (0-100) for each principle:

Code:
```{language}
{code}
```

Provide scores for:
1. Ethical Foundation (fairness, transparency, responsible AI)
2. Bias Awareness (potential biases, discrimination risks)
3. Safety First (security, error handling, validation)
4. Responsible Design (long-term impact, maintainability)

Format your response as:
ETHICAL_FOUNDATION: [score]/100 - [brief reason]
BIAS_AWARENESS: [score]/100 - [brief reason]
SAFETY_FIRST: [score]/100 - [brief reason]
RESPONSIBLE_DESIGN: [score]/100 - [brief reason]
OVERALL: [average score]/100

Then provide 3-5 specific improvement suggestions."""
            
            response = self.gemini_model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.3,
                    "max_output_tokens": 1500,
                },
                safety_settings=self.safety_settings
            )
            
            analysis = response.text.strip()
            
            # Parse scores from response
            scores = {
                "ethicalFoundation": self._extract_score(analysis, "ETHICAL_FOUNDATION"),
                "biasAwareness": self._extract_score(analysis, "BIAS_AWARENESS"),
                "safetyFirst": self._extract_score(analysis, "SAFETY_FIRST"),
                "responsibleDesign": self._extract_score(analysis, "RESPONSIBLE_DESIGN"),
                "overall": 0
            }
            
            scores["overall"] = int((scores["ethicalFoundation"] + scores["biasAwareness"] + 
                                    scores["safetyFirst"] + scores["responsibleDesign"]) / 4)
            
            # Extract improvements
            improvements = self._extract_improvements(analysis)
            
            return {
                "score": scores,
                "feedback": analysis,
                "improvements": improvements,
                "language": language
            }
        except Exception as e:
            error_msg = str(e)
            return {
                "score": {
                    "ethicalFoundation": 0,
                    "biasAwareness": 0,
                    "safetyFirst": 0,
                    "responsibleDesign": 0,
                    "overall": 0
                },
                "feedback": f"Error calculating score: {error_msg}",
                "error": error_msg
            }
    
    def _extract_score(self, text: str, keyword: str) -> int:
        """Extract score from analysis text"""
        import re
        pattern = rf"{keyword}:\s*(\d+)/100"
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1))
        # Fallback: estimate from keyword mentions
        count = text.lower().count(keyword.lower().replace("_", " "))
        return min(100, max(0, count * 20 + 40))
    
    def _extract_improvements(self, text: str) -> list:
        """Extract improvement suggestions from analysis"""
        lines = text.split("\n")
        improvements = []
        in_improvements = False
        
        for line in lines:
            line = line.strip()
            if any(word in line.lower() for word in ["improvement", "suggestion", "recommendation", "should", "consider"]):
                if line and not line.startswith("#") and len(line) > 20:
                    improvements.append(line)
                    if len(improvements) >= 5:
                        break
        
        return improvements[:5] if improvements else ["No specific improvements found"]
    
    async def analyze_code_from_image(
        self, 
        image_data: Union[str, bytes], 
        language: Optional[str] = None,
        rulesets: Optional[Dict[str, bool]] = None
    ) -> Dict[str, Any]:
        """Extract and analyze code from an image using multimodal Gemini"""
        
        if not self.google_api_key or not self.gemini_model:
            return {
                "code": "",
                "analysis": "Error: Google Gemini API key not configured",
                "error": "No API key configured"
            }
        
        try:
            import PIL.Image
            
            # Decode base64 image if string
            if isinstance(image_data, str):
                # Remove data URL prefix if present
                if image_data.startswith('data:image'):
                    image_data = image_data.split(',')[1]
                image_bytes = base64.b64decode(image_data)
                image = PIL.Image.open(io.BytesIO(image_bytes))
            else:
                image = PIL.Image.open(io.BytesIO(image_data))
            
            # Build prompt for code extraction and analysis
            prompt = f"""You are an AI code analysis expert specializing in AI Parenting principles. Analyze this image and provide a comprehensive response.

**CRITICAL: You MUST follow this EXACT format - do not deviate:**

CODE:
```[language]
[extract ALL code from the image here - preserve exact formatting, indentation, and structure]
```

ANALYSIS:
[Provide a DETAILED AI Parenting analysis covering ALL of these points:
1. Ethical Foundation: Evaluate fairness, transparency, and responsible AI development practices
2. Bias Awareness: Identify any potential biases, discrimination risks, or unfair treatment
3. Safety First: Assess security vulnerabilities, error handling, input validation, and safe defaults
4. Responsible Design: Consider long-term impact, maintainability, scalability, and social implications
5. Specific Recommendations: Provide actionable suggestions for improvement

Be thorough and specific. If you see code, analyze it deeply. If no code is found, describe what you see in the image.]

**Remember: The ANALYSIS section is crucial - provide comprehensive feedback even if the code looks good.**"""

            # Add ruleset-specific instructions
            if rulesets:
                active_rules = []
                if rulesets.get("ethicalFoundation", True):
                    active_rules.append("Ethical Foundation")
                if rulesets.get("biasAwareness", True):
                    active_rules.append("Bias Awareness")
                if rulesets.get("safetyFirst", True):
                    active_rules.append("Safety First")
                if rulesets.get("responsibleDesign", True):
                    active_rules.append("Responsible Design")
                
                if active_rules:
                    prompt += f"\n\nFocus especially on: {', '.join(active_rules)}"
            
            # Generate content with image
            response = self.gemini_model.generate_content(
                [prompt, image],
                generation_config={
                    "temperature": 0.3,
                    "max_output_tokens": 2048,
                },
                safety_settings=self.safety_settings
            )
            
            result_text = response.text.strip()
            
            # Parse code and analysis from response with improved logic
            code = ""
            analysis = ""
            
            # Try to find CODE: section
            if "CODE:" in result_text:
                # Split by CODE: marker
                parts = result_text.split("CODE:", 1)
                if len(parts) > 1:
                    code_section = parts[1]
                    
                    # Check if ANALYSIS: exists to split properly
                    if "ANALYSIS:" in code_section:
                        code_section = code_section.split("ANALYSIS:")[0]
                    
                    # Extract code from markdown blocks
                    if "```" in code_section:
                        # Find code blocks
                        import re
                        code_blocks = re.findall(r'```(?:[a-z]+)?\n?(.*?)```', code_section, re.DOTALL)
                        if code_blocks:
                            code = "\n".join(code_blocks).strip()
                        else:
                            # Fallback: extract between first ``` and last ```
                            start = code_section.find("```")
                            if start != -1:
                                start = code_section.find("\n", start) + 1
                                end = code_section.rfind("```")
                                if end != -1:
                                    code = code_section[start:end].strip()
                    else:
                        # No markdown, just take the text (might be "No code found")
                        code = code_section.strip()
                        if code.lower().startswith("no code found"):
                            code = ""
            
            # Try to find ANALYSIS: section
            if "ANALYSIS:" in result_text:
                analysis = result_text.split("ANALYSIS:", 1)[-1].strip()
            elif code:
                # If we have code but no ANALYSIS marker, try to infer
                # Look for text after the code block
                if "```" in result_text:
                    # Get everything after the last code block
                    last_block_end = result_text.rfind("```") + 3
                    remaining = result_text[last_block_end:].strip()
                    if remaining and len(remaining) > 50:  # Only if substantial content
                        analysis = remaining
                else:
                    # No clear structure, use everything except code
                    analysis = result_text.replace(f"CODE:\n{code}", "").strip()
            
            # Fallback: if no analysis found, use full response
            if not analysis and not code:
                analysis = result_text
            elif not analysis:
                analysis = "Analysis completed. Review the extracted code above."
            
            # If we have code but no analysis, try to analyze the extracted code
            if code and not analysis:
                # Use the regular analysis method as fallback
                try:
                    analysis_result = await self.analyze_code(code, language or "python", rulesets)
                    if analysis_result.get("analysis"):
                        analysis = analysis_result["analysis"]
                except:
                    pass
            
            # Ensure we always return something meaningful
            if not analysis and code:
                analysis = "Code extracted successfully. Generating detailed AI Parenting analysis..."
            elif not analysis and not code:
                analysis = "No code found in the image. Please ensure the image contains readable code."
            
            return {
                "code": code.strip() if code else "",
                "analysis": analysis if analysis else "Analysis completed.",
                "language": language or "auto-detected",
                "model": "gemini-2.5-flash",
                "multimodal": True,
                "image_analyzed": True
            }
            
        except Exception as e:
            error_msg = str(e)
            return {
                "code": "",
                "analysis": f"Error analyzing image: {error_msg}",
                "error": error_msg
            }
    
    async def generate_code_from_image(
        self,
        image_data: Union[str, bytes],
        prompt: str = "Extract and improve this code following AI parenting principles",
        rulesets: Optional[Dict[str, bool]] = None
    ) -> Dict[str, Any]:
        """Generate/improve code from an image with AI parenting principles"""
        
        if not self.google_api_key or not self.gemini_model:
            return {
                "code": "# Error: Google Gemini API key not configured",
                "error": "No API key configured"
            }
        
        try:
            import PIL.Image
            
            # Decode base64 image if string
            if isinstance(image_data, str):
                if image_data.startswith('data:image'):
                    image_data = image_data.split(',')[1]
                image_bytes = base64.b64decode(image_data)
                image = PIL.Image.open(io.BytesIO(image_bytes))
            else:
                image = PIL.Image.open(io.BytesIO(image_data))
            
            full_prompt = self._build_ai_parenting_prompt(
                f"{prompt}\n\nExtract code from this image and generate improved, ethical code following AI parenting principles.",
                "code generation from image",
                rulesets
            )
            
            response = self.gemini_model.generate_content(
                [full_prompt, image],
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
                "model": "gemini-2.5-flash",
                "multimodal": True,
                "image_analyzed": True
            }
            
        except Exception as e:
            error_msg = str(e)
            return {
                "code": f"# Error: {error_msg}",
                "error": error_msg
            }


    async def generate_pr_description(
        self,
        title: str,
        description: str,
        code_changes: Optional[str] = None,
        rulesets: Optional[Dict[str, bool]] = None
    ) -> Dict[str, Any]:
        """Generate an ethical PR description with AI Parenting principles"""
        
        if not self.google_api_key or not self.gemini_model:
            return {
                "title": title,
                "description": description,
                "body": description,
                "error": "No API key configured"
            }
        
        try:
            code_context = f"\n\n**Code Changes:**\n```\n{code_changes}\n```" if code_changes else ""
            
            prompt = f"""Generate a comprehensive Pull Request description that follows AI Parenting principles.

**Original PR Title:** {title}
**Original Description:** {description}
{code_context}

**Requirements:**
1. Keep the original intent and technical details
2. Enhance with AI Parenting considerations:
   - Ethical Foundation: Highlight fairness, transparency, responsible AI
   - Bias Awareness: Address potential biases or discrimination
   - Safety First: Emphasize security, error handling, validation
   - Responsible Design: Consider long-term impact and maintainability
3. Include a clear "What" and "Why" section
4. Add an "AI Parenting Impact" section explaining ethical considerations
5. Format as markdown suitable for GitHub/GitLab

**Output Format:**
TITLE: [Enhanced title]
DESCRIPTION: [Comprehensive PR description in markdown]"""

            full_prompt = self._build_ai_parenting_prompt(prompt, "PR generation", rulesets)
            
            response = self.gemini_model.generate_content(
                full_prompt,
                generation_config={
                    "temperature": 0.7,
                    "max_output_tokens": 2048,
                },
                safety_settings=self.safety_settings
            )
            
            result = response.text.strip()
            
            # Parse title and description
            pr_title = title
            pr_body = description
            
            if "TITLE:" in result:
                parts = result.split("TITLE:")
                if len(parts) > 1:
                    title_section = parts[1].split("DESCRIPTION:")[0] if "DESCRIPTION:" in parts[1] else parts[1]
                    pr_title = title_section.strip()
            
            if "DESCRIPTION:" in result:
                pr_body = result.split("DESCRIPTION:")[-1].strip()
            elif "TITLE:" in result:
                pr_body = result.split("TITLE:")[-1].strip()
            else:
                pr_body = result
            
            return {
                "title": pr_title,
                "description": pr_body.split("\n")[0] if "\n" in pr_body else pr_body,
                "body": pr_body,
                "pr_description": pr_body
            }
            
        except Exception as e:
            error_msg = str(e)
            return {
                "title": title,
                "description": description,
                "body": description,
                "error": error_msg
            }
    
    async def review_pr(
        self,
        title: str,
        description: str,
        code_changes: Optional[str] = None,
        rulesets: Optional[Dict[str, bool]] = None
    ) -> Dict[str, Any]:
        """Review a PR for AI Parenting compliance"""
        
        if not self.google_api_key or not self.gemini_model:
            return {
                "overallScore": 0,
                "ethicalScore": 0,
                "biasScore": 0,
                "safetyScore": 0,
                "designScore": 0,
                "strengths": [],
                "improvements": [],
                "recommendations": [],
                "ethicalIssues": [],
                "error": "No API key configured"
            }
        
        try:
            code_context = f"\n\n**Code Changes:**\n```\n{code_changes}\n```" if code_changes else ""
            
            prompt = f"""Review this Pull Request for AI Parenting compliance and provide detailed scores.

**PR Title:** {title}
**PR Description:** {description}
{code_context}

**Review Requirements:**
1. Score each AI Parenting principle (0-100):
   - Ethical Foundation: Fairness, transparency, responsible AI
   - Bias Awareness: Potential biases, discrimination risks
   - Safety First: Security, error handling, validation
   - Responsible Design: Long-term impact, maintainability

2. Identify strengths (what's good about this PR)

3. Identify ethical issues or concerns

4. Provide specific improvement suggestions

5. Give actionable recommendations

**Output Format:**
ETHICAL_SCORE: [0-100] - [brief reason]
BIAS_SCORE: [0-100] - [brief reason]
SAFETY_SCORE: [0-100] - [brief reason]
DESIGN_SCORE: [0-100] - [brief reason]
OVERALL_SCORE: [average score]

STRENGTHS:
- [strength 1]
- [strength 2]
...

ETHICAL_ISSUES:
- [issue 1 if any]
- [issue 2 if any]
...

IMPROVEMENTS:
- [improvement 1]
- [improvement 2]
...

RECOMMENDATIONS:
- [recommendation 1]
- [recommendation 2]
..."""

            full_prompt = self._build_ai_parenting_prompt(prompt, "PR review", rulesets)
            
            response = self.gemini_model.generate_content(
                full_prompt,
                generation_config={
                    "temperature": 0.3,
                    "max_output_tokens": 2048,
                },
                safety_settings=self.safety_settings
            )
            
            result_text = response.text.strip()
            
            # Parse scores
            scores = {
                "ethicalScore": self._extract_score(result_text, "ETHICAL_SCORE"),
                "biasScore": self._extract_score(result_text, "BIAS_SCORE"),
                "safetyScore": self._extract_score(result_text, "SAFETY_SCORE"),
                "designScore": self._extract_score(result_text, "DESIGN_SCORE"),
                "overallScore": 0
            }
            
            overall = self._extract_score(result_text, "OVERALL_SCORE")
            if overall == 0:
                overall = int((scores["ethicalScore"] + scores["biasScore"] + 
                              scores["safetyScore"] + scores["designScore"]) / 4)
            scores["overallScore"] = overall
            
            # Parse sections (returns list by default)
            strengths_result = self._extract_section(result_text, "STRENGTHS")
            strengths = strengths_result if isinstance(strengths_result, list) else []
            
            ethical_issues_result = self._extract_section(result_text, "ETHICAL_ISSUES")
            ethical_issues = ethical_issues_result if isinstance(ethical_issues_result, list) else []
            
            improvements_result = self._extract_section(result_text, "IMPROVEMENTS")
            improvements = improvements_result if isinstance(improvements_result, list) else []
            
            recommendations_result = self._extract_section(result_text, "RECOMMENDATIONS")
            recommendations = recommendations_result if isinstance(recommendations_result, list) else []
            
            return {
                **scores,
                "strengths": strengths,
                "ethicalIssues": ethical_issues,
                "improvements": improvements,
                "recommendations": recommendations
            }
            
        except Exception as e:
            error_msg = str(e)
            return {
                "overallScore": 0,
                "ethicalScore": 0,
                "biasScore": 0,
                "safetyScore": 0,
                "designScore": 0,
                "strengths": [],
                "improvements": [],
                "recommendations": [],
                "ethicalIssues": [],
                "error": error_msg
            }
    


    async def generate_image(
        self,
        principle: str,
        style: str = "illustration"
    ) -> Dict[str, Any]:
        """Generate image prompt and optionally create image for AI Parenting principle"""
        
        if not self.google_api_key or not self.gemini_model:
            return {
                "imagePrompt": "",
                "imageUrl": "",
                "error": "No API key configured"
            }
        
        try:
            # Map principle to visual descriptions
            principle_visuals = {
                "ethicalFoundation": "A nurturing tree growing from code, symbolizing ethical foundation in AI development, bright colors, modern illustration style",
                "biasAwareness": "A balanced scale with code on both sides, representing fairness and bias awareness, clean minimalist design",
                "safetyFirst": "A shield protecting code and AI systems, security-focused imagery, professional tech illustration",
                "responsibleDesign": "A timeline showing code evolution and long-term impact, futuristic design, showing growth and sustainability",
            }
            
            visual_description = principle_visuals.get(principle, "AI Parenting concept illustration")
            
            prompt = f"""Create a detailed image generation prompt for an AI Parenting principle illustration.

Principle: {principle}
Style: {style}
Base Description: {visual_description}

Generate a comprehensive image prompt that includes:
- Visual elements representing the principle
- Color scheme and mood
- Composition and layout
- Style specifications
- Technical details for image generation

Return ONLY the image generation prompt, no explanations."""

            response = self.gemini_model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.8,
                    "max_output_tokens": 500,
                },
                safety_settings=self.safety_settings
            )
            
            image_prompt = response.text.strip()
            
            # Try to generate actual image using available services
            image_url = await self._generate_actual_image(image_prompt, principle)
            
            return {
                "imagePrompt": image_prompt,
                "imageUrl": image_url,
                "principle": principle,
                "style": style
            }
            
        except Exception as e:
            error_msg = str(e)
            return {
                "imagePrompt": f"Create an illustration for {principle} AI Parenting principle",
                "imageUrl": "",
                "error": error_msg
            }
    
    async def _generate_actual_image(self, prompt: str, principle: str) -> str:
        """Generate actual image using available services"""
        try:
            # Try Gemini image generation first (new API)
            if self.gemini_image_client:
                try:
                    from PIL import Image
                    import base64
                    import io
                    
                    enhanced_prompt = f"{prompt}, high quality, professional illustration, AI Parenting concept, modern design, vibrant colors"
                    
                    # Try with config first (newer API)
                    try:
                        from google.genai.types import GenerateContentConfig, Modality
                        response = self.gemini_image_client.models.generate_content(
                            model="gemini-2.5-flash-image",
                            contents=[enhanced_prompt],
                            config=GenerateContentConfig(response_modalities=[Modality.TEXT, Modality.IMAGE]),
                        )
                    except (ImportError, AttributeError):
                        # Fallback to simpler API call
                        response = self.gemini_image_client.models.generate_content(
                            model="gemini-2.5-flash-image",
                            contents=[enhanced_prompt],
                        )
                    
                    # Check response structure - response has 'parts' attribute
                    if hasattr(response, 'parts'):
                        for part in response.parts:
                            # Check if part has inline_data (Blob object)
                            if hasattr(part, 'inline_data') and part.inline_data is not None:
                                try:
                                    # Try using as_image() method on the Blob
                                    if hasattr(part.inline_data, 'as_image'):
                                        image = part.inline_data.as_image()
                                        # Convert PIL Image to base64 data URL
                                        buffered = io.BytesIO()
                                        image.save(buffered, format="PNG")
                                        img_str = base64.b64encode(buffered.getvalue()).decode()
                                        return f"data:image/png;base64,{img_str}"
                                except Exception as e1:
                                    print(f"as_image() failed: {e1}")
                                    try:
                                        # Fallback: use direct data access
                                        if hasattr(part.inline_data, 'data') and part.inline_data.data:
                                            image_data = part.inline_data.data
                                            img_str = base64.b64encode(image_data).decode()
                                            return f"data:image/png;base64,{img_str}"
                                    except Exception as e2:
                                        print(f"Direct data access failed: {e2}")
                            elif hasattr(part, 'text') and part.text:
                                print(f"Gemini response text: {part.text}")
                    elif hasattr(response, 'candidates') and response.candidates:
                        # Alternative response structure (if needed)
                        for candidate in response.candidates:
                            if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts'):
                                for part in candidate.content.parts:
                                    if hasattr(part, 'inline_data') and part.inline_data:
                                        try:
                                            if hasattr(part.inline_data, 'as_image'):
                                                image = part.inline_data.as_image()
                                                buffered = io.BytesIO()
                                                image.save(buffered, format="PNG")
                                                img_str = base64.b64encode(buffered.getvalue()).decode()
                                                return f"data:image/png;base64,{img_str}"
                                            elif hasattr(part.inline_data, 'data'):
                                                image_data = part.inline_data.data
                                                img_str = base64.b64encode(image_data).decode()
                                                return f"data:image/png;base64,{img_str}"
                                        except Exception as e:
                                            print(f"Candidate part image extraction failed: {e}")
                except Exception as e:
                    print(f"Gemini image generation failed: {e}")
                    import traceback
                    traceback.print_exc()
            
            # Fallback to OpenAI DALL-E
            openai_key = os.getenv("OPENAI_API_KEY")
            if openai_key:
                try:
                    import openai
                    client = openai.OpenAI(api_key=openai_key)
                    response = client.images.generate(
                        model="dall-e-3",
                        prompt=f"{prompt}, high quality, professional illustration, AI Parenting concept, modern design, vibrant colors",
                        size="1024x1024",
                        quality="standard",
                        n=1,
                    )
                    return response.data[0].url
                except Exception as e:
                    print(f"DALL-E generation failed: {e}")
            
            # Fallback to Stability AI (Stable Diffusion)
            stability_key = os.getenv("STABILITY_API_KEY")
            if stability_key:
                try:
                    import requests
                    api_host = "https://api.stability.ai"
                    response = requests.post(
                        f"{api_host}/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
                        headers={
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                            "Authorization": f"Bearer {stability_key}"
                        },
                        json={
                            "text_prompts": [
                                {
                                    "text": f"{prompt}, high quality, professional illustration, AI Parenting concept"
                                }
                            ],
                            "cfg_scale": 7,
                            "height": 1024,
                            "width": 1024,
                            "samples": 1,
                            "steps": 30,
                        },
                    )
                    if response.status_code == 200:
                        data = response.json()
                        # Stability AI returns base64 images
                        import base64
                        image_data = data["artifacts"][0]["base64"]
                        # Convert to data URL for frontend
                        return f"data:image/png;base64,{image_data}"
                except Exception as e:
                    print(f"Stability AI generation failed: {e}")
            
            # Return empty if no service available
            return ""
            
        except Exception as e:
            print(f"Image generation error: {e}")
            return ""
    
    async def generate_video_content(
        self,
        principle: str,
        video_type: str = "educational",
        rulesets: Optional[Dict[str, bool]] = None,
        generate_media: bool = False
    ) -> Dict[str, Any]:
        """Generate video content (script, storyboard) for AI Parenting principles"""
        
        if not self.google_api_key or not self.gemini_model:
            return {
                "title": "",
                "script": "Error: Google Gemini API key not configured",
                "storyboard": "",
                "keyPoints": [],
                "duration": "",
                "principle": principle,
                "error": "No API key configured"
            }
        
        # Map principle IDs to full names
        principle_map = {
            "ethicalFoundation": "Ethical Foundation",
            "biasAwareness": "Bias Awareness",
            "safetyFirst": "Safety First",
            "responsibleDesign": "Responsible Design",
        }
        
        principle_name = principle_map.get(principle, principle)
        
        # Map video types to descriptions
        type_descriptions = {
            "educational": "educational video that explains the concept clearly",
            "tutorial": "step-by-step tutorial with practical examples",
            "demo": "demonstration video with code examples and live coding",
        }
        
        video_type_desc = type_descriptions.get(video_type, "educational video")
        
        try:
            prompt = f"""Create a comprehensive {video_type_desc} about the AI Parenting principle: {principle_name}.

**Principle Details:**
- Principle: {principle_name}
- Type: {video_type}
- Target Audience: Software developers and AI practitioners
- Goal: Educate about ethical AI development through the "AI Parenting" metaphor

**Required Output Format:**

TITLE: [Engaging video title]

DURATION: [Estimated duration, e.g., "5-7 minutes"]

KEY_POINTS:
- [Key point 1]
- [Key point 2]
- [Key point 3]
- [Key point 4]
- [Key point 5]

SCRIPT:
[Complete video script with:
- Engaging introduction
- Clear explanation of the principle
- Real-world examples and code snippets
- Practical applications
- Strong conclusion
- Include timing cues and speaker notes]

STORYBOARD:
[Visual storyboard describing:
- Scene 1: [description, visuals, on-screen text]
- Scene 2: [description, visuals, on-screen text]
- Continue for all scenes
- Include transitions and visual elements]

**Content Requirements:**
1. Make it engaging and accessible
2. Use the "AI Parenting" metaphor throughout
3. Include concrete code examples
4. Show before/after comparisons when relevant
5. Emphasize practical applications
6. Keep it educational and inspiring

**For {principle_name} specifically:**
{self._get_principle_specific_guidance(principle)}"""

            full_prompt = self._build_ai_parenting_prompt(prompt, f"video generation for {principle_name}", rulesets)
            
            response = self.gemini_model.generate_content(
                full_prompt,
                generation_config={
                    "temperature": 0.8,
                    "max_output_tokens": 4096,
                },
                safety_settings=self.safety_settings
            )
            
            result_text = response.text.strip()
            
            # Parse the response
            title_result = self._extract_section(result_text, "TITLE", single_line=True)
            title = title_result if isinstance(title_result, str) and title_result else f"AI Parenting: {principle_name}"
            
            duration_result = self._extract_section(result_text, "DURATION", single_line=True)
            duration = duration_result if isinstance(duration_result, str) and duration_result else "5-7 minutes"
            
            key_points_result = self._extract_section(result_text, "KEY_POINTS")
            key_points = key_points_result if isinstance(key_points_result, list) else []
            
            script_result = self._extract_section(result_text, "SCRIPT", multi_line=True)
            script = script_result if isinstance(script_result, str) and script_result else ""
            
            storyboard_result = self._extract_section(result_text, "STORYBOARD", multi_line=True)
            storyboard = storyboard_result if isinstance(storyboard_result, str) and storyboard_result else ""
            
            # Fallback if parsing fails
            if not script:
                script = result_text
            if not storyboard:
                storyboard = "Storyboard details will be generated based on the script."
            
            result = {
                "title": title,
                "script": script,
                "storyboard": storyboard,
                "keyPoints": key_points if key_points else ["Key points will be generated"],
                "duration": duration,
                "principle": principle_name,
                "videoType": video_type
            }
            
            # Generate images and video if requested
            if generate_media:
                # Generate thumbnail image
                image_result = await self.generate_image(principle, "illustration")
                result["thumbnailImage"] = image_result.get("imageUrl", "")
                result["imagePrompt"] = image_result.get("imagePrompt", "")
                
                # Generate video frames/storyboard images
                storyboard_images = await self._generate_storyboard_images(principle, storyboard)
                result["storyboardImages"] = storyboard_images
                
                # Generate video (if service available)
                video_url = await self._generate_actual_video(principle, script, storyboard)
                result["videoUrl"] = video_url
            
            return result
            
        except Exception as e:
            error_msg = str(e)
            return {
                "title": f"AI Parenting: {principle_name}",
                "script": f"Error generating video content: {error_msg}",
                "storyboard": "",
                "keyPoints": [],
                "duration": "",
                "principle": principle_name,
                "error": error_msg
            }
    
    async def _generate_storyboard_images(self, principle: str, storyboard: str) -> List[Dict[str, str]]:
        """Generate images for storyboard scenes"""
        try:
            # Extract key scenes from storyboard
            scenes = storyboard.split("Scene")[:5]  # Limit to 5 scenes
            images = []
            
            for i, scene in enumerate(scenes):
                if not scene.strip() or len(scene.strip()) < 20:
                    continue
                
                # Create image prompt for this scene
                scene_prompt = f"Create a storyboard illustration for scene {i+1}: {scene[:200]}, AI Parenting concept, professional illustration style"
                
                image_result = await self.generate_image(principle, "storyboard")
                if image_result.get("imageUrl"):
                    images.append({
                        "scene": i + 1,
                        "description": scene[:200],
                        "imageUrl": image_result.get("imageUrl", ""),
                        "imagePrompt": scene_prompt
                    })
            
            return images
            
        except Exception as e:
            print(f"Storyboard image generation error: {e}")
            return []
    
    async def _generate_actual_video(self, principle: str, script: str, storyboard: str) -> str:
        """Generate actual video using available services"""
        try:
            # Check for video generation APIs
            # Options: RunwayML, Synthesia, D-ID, Pika Labs, etc.
            
            # Example: RunwayML integration
            runway_key = os.getenv("RUNWAY_API_KEY")
            if runway_key:
                try:
                    import requests
                    # RunwayML API integration would go here
                    # This is a placeholder for actual implementation
                    pass
                except Exception as e:
                    print(f"RunwayML generation failed: {e}")
            
            # Example: Synthesia integration
            synthesia_key = os.getenv("SYNTHESIA_API_KEY")
            if synthesia_key:
                try:
                    # Synthesia API integration would go here
                    pass
                except Exception as e:
                    print(f"Synthesia generation failed: {e}")
            
            # For now, return empty - requires specific video generation service setup
            # The script and storyboard can be used with video editing tools
            return ""
            
        except Exception as e:
            print(f"Video generation error: {e}")
            return ""
    
    def _get_principle_specific_guidance(self, principle: str) -> str:
        """Get principle-specific guidance for video generation"""
        guidance = {
            "ethicalFoundation": """
- Explain what ethical foundation means in code
- Show examples of fair vs unfair algorithms
- Demonstrate transparency in code design
- Highlight accountability mechanisms
- Use examples of responsible AI development""",
            "biasAwareness": """
- Explain how bias enters code and data
- Show examples of biased vs unbiased code
- Demonstrate bias detection techniques
- Highlight real-world impact of bias
- Show how to prevent bias in AI systems""",
            "safetyFirst": """
- Explain security best practices
- Show examples of safe vs unsafe code
- Demonstrate error handling patterns
- Highlight input validation techniques
- Show security vulnerabilities and fixes""",
            "responsibleDesign": """
- Explain long-term thinking in code design
- Show maintainable vs unmaintainable code
- Demonstrate scalability considerations
- Highlight social impact of code
- Show sustainable development practices""",
        }
        return guidance.get(principle, "")
    
    def _extract_section(self, text: str, section_name: str, single_line: bool = False, multi_line: bool = False) -> Union[str, List[str]]:
        """Extract a section from the response text"""
        import re
        
        if single_line:
            pattern = rf"{section_name}:\s*(.+?)(?=\n[A-Z_]+:|$)"
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                return match.group(1).strip()
            return ""
        
        if multi_line:
            pattern = rf"{section_name}:\s*(.*?)(?=\n[A-Z_]+:|$)"
            match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            if match:
                content = match.group(1).strip()
                return content
            return ""
        
        # Default: return list
        pattern = rf"{section_name}:\s*(.*?)(?=\n[A-Z_]+:|$)"
        match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        if match:
            content = match.group(1).strip()
            # Split by lines and clean up
            items = [line.strip().lstrip("- ").strip() for line in content.split("\n") if line.strip()]
            return [item for item in items if item and len(item) > 5][:10]  # Max 10 items
        return []


# Global AI service instance
ai_service = AIService()
