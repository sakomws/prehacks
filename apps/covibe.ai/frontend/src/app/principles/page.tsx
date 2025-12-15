import Link from "next/link";

export default function PrinciplesPage() {
  const principles = [
    {
      icon: "🌱",
      title: "Ethical Foundation",
      shortDesc: "Code that promotes fairness and responsible AI development",
      fullDesc: `Ethical Foundation means writing code that serves as a moral compass for AI systems. Just as parents teach children right from wrong, developers must embed ethical considerations directly into their code.

**Key Aspects:**
- **Fairness**: Ensure your code treats all users and data points equitably, without discrimination
- **Transparency**: Make decision-making processes clear and explainable
- **Accountability**: Design systems where responsibility for outcomes is clear
- **Justice**: Consider the broader social impact of your code on different communities

**Why It Matters:**
AI systems learn patterns from code. If code contains biased logic or unfair algorithms, AI will perpetuate and amplify these issues. Ethical foundation code teaches AI to make decisions that are fair, just, and beneficial for all stakeholders.`,
      examples: [
        "Implementing fair sampling methods in data processing",
        "Using transparent scoring algorithms with clear criteria",
        "Building audit trails for AI decision-making",
        "Designing systems that respect user privacy and consent"
      ],
      codeExample: `# ❌ Poor: Hidden bias in scoring
def calculate_score(user):
    # Age-based discrimination
    if user.age > 50:
        return user.income * 0.5  # Penalizes older users
    return user.income * 1.0

# ✅ Better: Fair, transparent scoring
def calculate_score(user, criteria):
    """
    Calculate user score based on transparent, fair criteria.
    
    Args:
        user: User object with relevant attributes
        criteria: Dict of scoring weights (must be age-neutral)
    
    Returns:
        float: Transparent score with documented reasoning
    """
    score = 0.0
    for attribute, weight in criteria.items():
        if attribute == 'age':  # Age-neutral scoring
            continue
        score += getattr(user, attribute, 0) * weight
    
    # Log for transparency and auditability
    log_score_calculation(user.id, score, criteria)
    return score`
    },
    {
      icon: "⚖️",
      title: "Bias Awareness",
      shortDesc: "Detect and prevent biases that AI systems might inherit",
      fullDesc: `Bias Awareness is about recognizing that code can encode human prejudices and systemic inequalities. Just as parents must be aware of their own biases when teaching children, developers must actively identify and eliminate bias in their code.

**Types of Bias to Watch For:**
- **Data Bias**: Training data that underrepresents certain groups
- **Algorithmic Bias**: Logic that inadvertently discriminates
- **Confirmation Bias**: Code that reinforces existing stereotypes
- **Selection Bias**: Sampling methods that exclude certain populations

**Why It Matters:**
AI systems amplify whatever patterns they find in code and data. A small bias in code can become a major problem when scaled across millions of users. By being aware of potential biases, developers can create more inclusive and fair AI systems.`,
      examples: [
        "Testing algorithms with diverse demographic data",
        "Implementing bias detection checks in data pipelines",
        "Using representative training datasets",
        "Regular audits for discriminatory patterns"
      ],
      codeExample: `# ❌ Poor: Gender bias in recommendations
def recommend_jobs(user):
    if user.gender == 'female':
        return ['nurse', 'teacher', 'secretary']  # Stereotypical roles
    else:
        return ['engineer', 'doctor', 'lawyer']

# ✅ Better: Bias-aware, skill-based recommendations
def recommend_jobs(user, job_history, skills):
    """
    Recommend jobs based on skills and experience, not demographics.
    
    Implements bias detection to ensure fair recommendations.
    """
    # Skill-based matching (demographic-neutral)
    matches = find_jobs_by_skills(skills, job_history)
    
    # Bias check: ensure diversity in recommendations
    recommendations = apply_diversity_filter(matches)
    
    # Log for bias auditing
    log_recommendations(user.id, recommendations, 
                       bias_check_passed=True)
    return recommendations`
    },
    {
      icon: "🛡️",
      title: "Safety First",
      shortDesc: "Prioritize security, error handling, and safe defaults",
      fullDesc: `Safety First means treating code security and robustness as fundamental requirements, not afterthoughts. Just as parents childproof their homes, developers must "AI-proof" their code to prevent harm.

**Safety Dimensions:**
- **Input Validation**: Always validate and sanitize inputs to prevent injection attacks
- **Error Handling**: Graceful failure modes that don't expose sensitive information
- **Secure Defaults**: Systems that fail securely, not dangerously
- **Access Control**: Proper authentication and authorization
- **Data Protection**: Encryption, secure storage, and privacy safeguards

**Why It Matters:**
Unsafe code can lead to data breaches, system failures, or malicious exploitation. When AI systems learn from unsafe code, they inherit these vulnerabilities. Safety-first code teaches AI to be robust, secure, and trustworthy.`,
      examples: [
        "Input validation and sanitization for all user data",
        "Comprehensive error handling with safe fallbacks",
        "Rate limiting to prevent abuse",
        "Encryption for sensitive data at rest and in transit"
      ],
      codeExample: `# ❌ Poor: Unsafe, vulnerable code
def process_payment(user_id, amount):
    query = f"UPDATE accounts SET balance = balance - {amount} WHERE id = {user_id}"
    db.execute(query)  # SQL injection vulnerability!

# ✅ Better: Safe, validated, and secure
def process_payment(user_id: str, amount: float) -> dict:
    """
    Process payment with comprehensive safety checks.
    
    Args:
        user_id: Validated user identifier
        amount: Positive numeric amount
    
    Returns:
        dict: Transaction result with status
    
    Raises:
        ValidationError: If inputs are invalid
        SecurityError: If suspicious activity detected
    """
    # Input validation
    if not is_valid_user_id(user_id):
        raise ValidationError("Invalid user ID")
    if amount <= 0 or amount > MAX_TRANSACTION:
        raise ValidationError("Invalid amount")
    
    # Security checks
    if detect_suspicious_activity(user_id):
        log_security_event(user_id, "suspicious_payment_attempt")
        raise SecurityError("Transaction blocked for security")
    
    # Safe database operation (parameterized query)
    try:
        result = db.execute(
            "UPDATE accounts SET balance = balance - ? WHERE id = ?",
            (amount, user_id)
        )
        log_transaction(user_id, amount, "success")
        return {"status": "success", "transaction_id": result.id}
    except Exception as e:
        log_error(user_id, str(e))
        # Safe failure: don't expose internal errors
        raise PaymentError("Transaction failed. Please try again.")`
    },
    {
      icon: "📚",
      title: "Responsible Design",
      shortDesc: "Consider long-term impact on AI systems and users",
      fullDesc: `Responsible Design means thinking beyond immediate functionality to consider the long-term consequences of code. Just as parents consider how their actions today affect their children's future, developers must consider how their code will impact AI systems and society over time.

**Long-term Considerations:**
- **Maintainability**: Code that future developers (and AI) can understand and modify
- **Scalability**: Systems that can grow without becoming problematic
- **Sustainability**: Solutions that don't create technical debt or environmental costs
- **Social Impact**: Understanding how code affects different communities
- **Future-proofing**: Designing for change and evolution

**Why It Matters:**
Code written today will influence AI systems for years to come. Short-sighted design decisions can create systemic problems that are difficult to fix later. Responsible design ensures that code contributes positively to the AI ecosystem over time.`,
      examples: [
        "Writing clear, self-documenting code with comments",
        "Designing modular, extensible architectures",
        "Considering environmental impact of compute resources",
        "Planning for graceful deprecation and migration paths"
      ],
      codeExample: `# ❌ Poor: Short-sighted, hardcoded design
def get_user_recommendations(user_id):
    # Hardcoded logic that won't scale
    if user_id < 1000:
        return ['product_a', 'product_b']
    else:
        return ['product_c', 'product_d']

# ✅ Better: Responsible, maintainable, scalable design
class RecommendationEngine:
    """
    Responsible recommendation system designed for long-term use.
    
    Features:
    - Configurable recommendation strategies
    - Extensible architecture for new algorithms
    - Performance monitoring and optimization
    - Clear documentation for future maintainers
    """
    
    def __init__(self, strategy: RecommendationStrategy):
        self.strategy = strategy
        self.metrics = RecommendationMetrics()
    
    def get_recommendations(self, user_id: str, context: dict) -> list:
        """
        Get recommendations with responsible design principles.
        
        - Uses strategy pattern for flexibility
        - Tracks performance metrics
        - Handles edge cases gracefully
        - Documents decision-making process
        """
        try:
            # Validate inputs
            if not self._is_valid_user(user_id):
                return self._get_default_recommendations()
            
            # Get recommendations using configured strategy
            recommendations = self.strategy.recommend(user_id, context)
            
            # Track metrics for continuous improvement
            self.metrics.record_recommendation(user_id, recommendations)
            
            # Ensure diversity and fairness
            recommendations = self._apply_responsible_filters(recommendations)
            
            return recommendations
            
        except Exception as e:
            # Graceful degradation
            log_error(user_id, str(e))
            return self._get_default_recommendations()
    
    def _apply_responsible_filters(self, recommendations: list) -> list:
        """Apply filters for diversity, fairness, and long-term value."""
        # Implementation for responsible filtering
        return recommendations`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>🌱</span> AI Parenting Principles
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Understanding ethical AI development through the parenting metaphor
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            ← Home
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Introduction */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-3xl font-bold mb-4">What is AI Parenting?</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Just as children learn from their environment, AI systems learn from the code and data we provide. 
            <strong className="text-blue-600 dark:text-blue-400"> AI Parenting</strong> is the practice of writing code 
            with the awareness that it will influence how AI systems behave, making ethical considerations and 
            responsible design central to development.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            These four principles guide developers to write code that serves as a positive example for AI systems, 
            teaching them to be fair, unbiased, safe, and responsible.
          </p>
        </div>

        {/* Principles */}
        {principles.map((principle, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="text-5xl flex-shrink-0">{principle.icon}</div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{principle.title}</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">{principle.shortDesc}</p>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none mb-6">
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {principle.fullDesc}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>💡</span> Practical Examples
              </h3>
              <ul className="space-y-2">
                {principle.examples.map((example, exIdx) => (
                  <li key={exIdx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>💻</span> Code Examples
              </h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-100">
                  <code>{principle.codeExample}</code>
                </pre>
              </div>
            </div>
          </div>
        ))}

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Practice AI Parenting?</h2>
          <p className="mb-6 opacity-90">
            Start writing ethical code and see your AI Parenting Score in real-time
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/playground"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              🎮 Try Playground
            </Link>
            <Link
              href="/generate"
              className="px-6 py-3 bg-white/20 text-white border-2 border-white rounded-lg font-medium hover:bg-white/30 transition-colors"
            >
              🧠 Generate Code
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
