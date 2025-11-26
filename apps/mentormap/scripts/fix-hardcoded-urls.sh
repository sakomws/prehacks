#!/bin/bash

# Fix all hardcoded localhost URLs in frontend
# This script replaces all http://localhost:8000 with environment variable

set -e

echo "🔧 Fixing hardcoded URLs in frontend..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/../frontend"

cd "$FRONTEND_DIR"

# Count occurrences before
BEFORE=$(grep -r "localhost:8000" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
echo "Found $BEFORE hardcoded localhost:8000 URLs"
echo ""

# Replace in all TypeScript/TSX files
echo "Replacing URLs..."

# Method 1: Direct string replacement
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak \
  -e 's|"http://localhost:8000/|`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/|g' \
  -e 's|"http://localhost:8000"|process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"|g' \
  {} \;

# Remove backup files
find src -name "*.bak" -delete

# Count occurrences after
AFTER=$(grep -r "localhost:8000" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)

echo ""
echo "✅ Done!"
echo "   Before: $BEFORE occurrences"
echo "   After: $AFTER occurrences"
echo ""

if [ $AFTER -gt 0 ]; then
    echo "⚠️  Some URLs still remain. Manual review needed:"
    grep -rn "localhost:8000" src/ --include="*.tsx" --include="*.ts" 2>/dev/null || true
    echo ""
fi

echo "Next steps:"
echo "1. Review changes: git diff src/"
echo "2. Test locally: npm run dev"
echo "3. Build: npm run build"
echo "4. Commit: git add src/ && git commit -m 'Replace hardcoded API URLs with environment variables'"
