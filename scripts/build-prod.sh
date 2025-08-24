#!/bin/bash

echo "🚀 Building E-Supplier for production..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf build/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build the application
echo "🔨 Building application..."
npm run build

# Verify build
if [ -d "build" ]; then
    echo "✅ Build successful!"
    echo "📁 Build directory created at: $(pwd)/build"
    echo "📊 Build size: $(du -sh build | cut -f1)"
else
    echo "❌ Build failed!"
    exit 1
fi

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf e-supplier-build.tar.gz build/

echo "🎉 Production build ready!"
echo "📦 Deployment package: e-supplier-build.tar.gz"
echo "🌐 Ready to deploy on Render!"
