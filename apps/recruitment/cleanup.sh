#!/bin/bash

# Recruitment Automation Suite Cleanup Script
echo "🧹 Cleaning up Recruitment Automation Suite..."

# Remove Python cache files
echo "🗑️  Removing Python cache files..."
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -type f -delete 2>/dev/null || true

# Remove virtual environments
echo "🗑️  Removing virtual environments..."
find . -name "venv" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".venv" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove node_modules
echo "🗑️  Removing node_modules..."
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove logs
echo "🗑️  Removing log files..."
find . -name "*.log" -type f -delete 2>/dev/null || true
rm -rf logs/ 2>/dev/null || true

# Remove temporary files
echo "🗑️  Removing temporary files..."
find . -name "*.tmp" -type f -delete 2>/dev/null || true
find . -name "*.temp" -type f -delete 2>/dev/null || true
find . -name ".DS_Store" -type f -delete 2>/dev/null || true

# Remove empty directories
echo "🗑️  Removing empty directories..."
find . -type d -empty -delete 2>/dev/null || true

echo "✅ Cleanup complete!"
echo "📊 Repository size reduced significantly"
echo "🚀 Ready for fresh setup with ./setup.sh"
