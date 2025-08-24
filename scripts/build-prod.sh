#!/bin/bash

echo "🚀 Building ProcureX for production..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf build/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building application..."
npm run build

# Verify build output
echo "✅ Verifying build output..."
if [ ! -f "build/index.html" ]; then
    echo "❌ Error: build/index.html not found"
    exit 1
fi

if [ ! -f "build/favicon.ico" ]; then
    echo "❌ Error: build/favicon.ico not found"
    exit 1
fi

if [ ! -f "build/logo192.png" ]; then
    echo "❌ Error: build/logo192.png not found"
    exit 1
fi

if [ ! -f "build/logo512.png" ]; then
    echo "❌ Error: build/logo512.png not found"
    exit 1
fi

if [ ! -f "build/apple-touch-icon.png" ]; then
    echo "❌ Error: build/apple-touch-icon.png not found"
    exit 1
fi

echo "✅ All required files are present in build directory"
echo "📁 Build directory contents:"
ls -la build/

echo "🎉 Build completed successfully!"
echo "📦 Ready for deployment to Render"
