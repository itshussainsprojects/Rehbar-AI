@echo off
REM Rehbar AI Production Deployment Script for Windows
echo 🚀 Starting Rehbar AI Production Deployment...

REM Check if we're in the right directory
if not exist "package.json" if not exist "frontend" if not exist "backend" (
    echo ❌ Error: Please run this script from the project root directory
    exit /b 1
)

REM Check prerequisites
echo 🔍 Checking prerequisites...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm and try again.
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Build Frontend
echo 🏗️  Building frontend for production...
cd frontend

REM Install dependencies
echo 📦 Installing frontend dependencies...
call npm ci --production=false

REM Run production build
echo 🔨 Building frontend...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    exit /b 1
)

echo ✅ Frontend build completed
cd ..

REM Build Backend
echo 🏗️  Preparing backend for production...
cd backend

REM Install dependencies
echo 📦 Installing backend dependencies...
call npm ci --production

echo ✅ Backend dependencies installed
cd ..

REM Build Chrome Extension
echo 🏗️  Building Chrome extension...
cd extension

REM Install dependencies
echo 📦 Installing extension dependencies...
call npm ci --production=false

REM Build extension
echo 🔨 Building extension...
call npm run build:prod

if %errorlevel% neq 0 (
    echo ❌ Extension build failed
    exit /b 1
)

REM Create extension zip
echo 📦 Creating extension package...
call npm run zip

echo ✅ Extension build completed
cd ..

REM Create deployment package
echo 📦 Creating deployment package...
if not exist "dist\deployment" mkdir dist\deployment

REM Copy built frontend
xcopy /E /I frontend\dist dist\deployment\frontend

REM Copy backend files
if not exist "dist\deployment\backend" mkdir dist\deployment\backend
xcopy /E /I backend\*.js dist\deployment\backend\
xcopy /E /I backend\*.json dist\deployment\backend\
xcopy /E /I backend\config dist\deployment\backend\config\
xcopy /E /I backend\middleware dist\deployment\backend\middleware\
xcopy /E /I backend\routes dist\deployment\backend\routes\
xcopy /E /I backend\services dist\deployment\backend\services\

REM Copy extension
xcopy /E /I extension\dist dist\deployment\extension

REM Copy configuration files
copy README.md dist\deployment\
copy .gitignore dist\deployment\

echo ✅ Deployment package created in dist\deployment\

REM Display deployment instructions
echo.
echo 🎉 Production build completed successfully!
echo.
echo 📁 Deployment files are ready in: dist\deployment\
echo.
echo 🚀 Next steps:
echo 1. Frontend: Deploy dist\deployment\frontend to Vercel
echo 2. Backend: Deploy dist\deployment\backend to your server
echo 3. Extension: Upload dist\deployment\extension to Chrome Web Store
echo.
echo 📋 Don't forget to:
echo - Set up environment variables in your hosting platforms
echo - Configure Firebase for production
echo - Update CORS origins with your production domains
echo - Test all components in production environment
echo.
echo ✨ Happy deploying!

pause
