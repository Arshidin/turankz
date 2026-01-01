#!/bin/bash

# Setup VitePress for Turan Standard Pool Documentation

echo "Setting up VitePress for documentation..."

# Navigate to project root
cd "$(dirname "$0")/.."

# Install VitePress
echo "Installing VitePress..."
npm install -D vitepress

# Create VitePress config directory
mkdir -p docs-site/.vitepress

echo "VitePress installed successfully!"
echo ""
echo "Next steps:"
echo "1. Create docs-site/.vitepress/config.ts (see HOSTING_SETUP.md for example)"
echo "2. Run: npm run docs:dev"
echo ""
echo "Or use the simple server that's already running at: http://localhost:8080"

