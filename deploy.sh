#!/bin/bash

# Rehbar AI Production Deployment Script
echo "🚀 Starting Rehbar AI Production Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "frontend" ] && [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Build Frontend
echo "🏗️  Building frontend for production..."
cd frontend

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm ci --production=false

# Run production build
echo "🔨 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend build completed"
cd ..

# Build Backend (if needed)
echo "🏗️  Preparing backend for production..."
cd backend

# Install dependencies
echo "📦 Installing backend dependencies..."
npm ci --production

echo "✅ Backend dependencies installed"
cd ..

# Build Chrome Extension
echo "🏗️  Building Chrome extension..."
cd extension

# Install dependencies
echo "📦 Installing extension dependencies..."
npm ci --production=false

# Build extension
echo "🔨 Building extension..."
npm run build:prod

if [ $? -ne 0 ]; then
    echo "❌ Extension build failed"
    exit 1
fi

# Create extension zip
echo "📦 Creating extension package..."
npm run zip

echo "✅ Extension build completed"
cd ..

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p dist/deployment

# Copy built frontend
cp -r frontend/dist dist/deployment/frontend

# Copy backend files (excluding node_modules)
mkdir -p dist/deployment/backend
cp -r backend/*.js backend/*.json backend/config backend/middleware backend/routes backend/services dist/deployment/backend/

# Copy extension
cp -r extension/dist dist/deployment/extension

# Copy configuration files
cp README.md dist/deployment/
cp .gitignore dist/deployment/

echo "✅ Deployment package created in dist/deployment/"

# Display deployment instructions
echo ""
echo "🎉 Production build completed successfully!"
echo ""
echo "📁 Deployment files are ready in: dist/deployment/"
echo ""
echo "🚀 Next steps:"
echo "1. Frontend: Deploy dist/deployment/frontend to Vercel"
echo "2. Backend: Deploy dist/deployment/backend to your server"
echo "3. Extension: Upload dist/deployment/extension to Chrome Web Store"
echo ""
echo "📋 Don't forget to:"
echo "- Set up environment variables in your hosting platforms"
echo "- Configure Firebase for production"
echo "- Update CORS origins with your production domains"
echo "- Test all components in production environment"
echo ""
echo "✨ Happy deploying!"
