#!/bin/bash

echo "🚀 Setting up Real Browser Automation for JobHax Agent"
echo "=================================================="

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Install Chrome if not present (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! command -v google-chrome &> /dev/null && ! command -v /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome &> /dev/null; then
        echo "🌐 Chrome not found. Please install Google Chrome manually:"
        echo "   https://www.google.com/chrome/"
        echo "   Or install via Homebrew: brew install --cask google-chrome"
    else
        echo "✅ Chrome found"
    fi
fi

# Create artifacts directory
echo "📁 Creating artifacts directory..."
mkdir -p artifacts/screenshots

# Create data directory if it doesn't exist
mkdir -p data

# Copy test data if it exists
if [ -f "data/test_data.json" ]; then
    echo "✅ Test data found"
else
    echo "📝 Creating test data..."
    cat > data/test_data.json << 'EOF'
{
  "personal_information": {
    "first_name": "[REDACTED]",
    "last_name": "[REDACTED]",
    "email": "[REDACTED]",
    "phone": "[REDACTED]",
    "address": "[REDACTED]"
  },
  "eligibility": {
    "over_18": true,
    "eligible_to_work_in_us": true,
    "require_sponsorship": false,
    "professional_license": false
  },
  "motivation": {
    "what_drew_you_to_healthcare": "I am deeply motivated by the opportunity to improve lives through technology, secure systems, and innovation. Healthcare offers a chance to apply my skills in AI, security, and platform engineering to ensure reliability, safety, and efficiency for patients and providers."
  },
  "experience": {
    "years_related_role": "8+ years"
  },
  "voluntary_disclosures": {
    "gender": "Male",
    "race": "White (Not Hispanic or Latino)",
    "hispanic_or_latino": false,
    "veteran_status": "Not a Veteran",
    "disability_status": "No, I do not have a disability and have not had one in the past",
    "date": "2025-09-27"
  }
}
EOF
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the real browser automation server:"
echo "   source .venv/bin/activate"
echo "   python real_main.py"
echo ""
echo "🌐 To test with a job application:"
echo "   curl -X POST http://localhost:8080/apply \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"job_url\": \"https://apply.appcast.io/jobs/50590620606/applyboard/apply\", \"headless\": false}'"
echo ""
echo "📸 Screenshots will be saved to: artifacts/screenshots/"
echo ""
