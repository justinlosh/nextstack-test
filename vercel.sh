#!/bin/bash
set -e

echo "🚀 Starting Vercel-optimized build process..."

# 1. Environment setup
echo "📋 Setting up environment..."
NODE_ENV=production

# 2. Install dependencies if needed
if [ "$VERCEL_ENV" = "production" ]; then
  echo "🔧 Installing production dependencies..."
  npm ci --only=production
else
  echo "🔧 Installing all dependencies..."
  npm ci
fi

# 3. Run tests in preview and production environments
if [ "$VERCEL_ENV" != "development" ]; then
  echo "🧪 Running tests..."
  npm run test:ci
fi

# 4. Run the enhanced build process
echo "🏗️ Running enhanced build process..."
node scripts/build.js --vercel-env=$VERCEL_ENV

# 5. Post-build optimizations
echo "✨ Running post-build optimizations..."
node scripts/vercel-optimize.js

echo "✅ Build completed successfully!"
