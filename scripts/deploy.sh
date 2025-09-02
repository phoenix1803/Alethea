#!/bin/bash

# Alethea Authenticity Engine Deployment Script

set -e

echo "🚀 Starting deployment process..."

# Check if required environment variables are set
echo "📋 Checking environment variables..."
required_vars=(
    "GEMINI_API_KEY"
    "HUGGINGFACE_API_KEY"
    "OPENAI_API_KEY"
    "NEWS_API_KEY"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set"
        exit 1
    fi
done

echo "✅ All required environment variables are set"

# Run type checking
echo "🔍 Running type checking..."
npm run type-check

# Run tests
echo "🧪 Running tests..."
npm run test:ci

# Run linting
echo "🔧 Running linter..."
npm run lint

# Build the application
echo "🏗️  Building application..."
npm run build

echo "✅ Build completed successfully!"

# Deploy to Vercel (if vercel CLI is available)
if command -v vercel &> /dev/null; then
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    echo "✅ Deployment completed!"
else
    echo "⚠️  Vercel CLI not found. Please deploy manually or install Vercel CLI."
    echo "   Run: npm i -g vercel"
fi

echo "🎉 Deployment process completed!"