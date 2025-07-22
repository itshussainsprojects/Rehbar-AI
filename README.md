# 🤖 Rehbar AI - Complete AI Assistant Platform

A comprehensive AI-powered voice assistant platform with Chrome extension, desktop applications, and web interface. Built with Node.js, Firebase, Google Gemini AI, and modern web technologies.

## 🌟 Features

### 🎯 Core Features
- **AI-Powered Conversations** - Advanced AI using Google Gemini API
- **Voice Recognition** - Real-time speech-to-text and text-to-speech
- **Chrome Extension** - Seamless web browsing assistance
- **Desktop Applications** - Native apps for Windows, macOS, and Linux
- **Web Dashboard** - Complete user management and analytics
- **Real-time Communication** - WebSocket-based live interactions

### 🔐 Authentication & Security
- **Firebase Authentication** - Secure user management
- **JWT Tokens** - Stateless authentication with refresh tokens
- **Rate Limiting** - API protection and usage controls
- **Data Encryption** - End-to-end security for sensitive data
- **CORS Protection** - Secure cross-origin requests

### 💳 Subscription Management
- **Trial System** - 3-day free trial for new users
- **Stripe Integration** - Secure payment processing
- **Multiple Plans** - Trial, Pro, and Premium tiers
- **Usage Tracking** - Daily request limits and analytics
- **Automatic Billing** - Recurring subscription management

### 🎨 Modern UI/UX
- **3D Animations** - Stunning visual effects with Framer Motion
- **Responsive Design** - Works on all devices and screen sizes
- **Dark/Light Themes** - User preference support
- **Accessibility** - WCAG compliant interface
- **Progressive Web App** - Offline capabilities

## 🏗️ Architecture

```
Rehbar AI Platform
├── Backend (Node.js + Express)
│   ├── Firebase Firestore (Database)
│   ├── Firebase Auth (Authentication)
│   ├── Google Gemini AI (AI Processing)
│   ├── Stripe (Payments)
│   └── Socket.IO (Real-time)
├── Frontend (React + Vite)
│   ├── 3D UI Components
│   ├── Voice Interface
│   └── Dashboard
├── Chrome Extension
│   ├── Background Service Worker
│   ├── Content Scripts
│   ├── Popup Interface
│   └── Context Menus
└── Desktop Apps
    ├── Windows (Electron)
    ├── macOS (Electron)
    └── Linux (Electron)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Firebase Project
- Google Gemini API Key (provided)
- Stripe Account (optional, for payments)

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/your-username/rehbar-ai.git
cd rehbar-ai

# Install backend dependencies
cd backend
npm install

# Run the interactive setup
node install.js

# Start development server
npm run dev
```

### 2. Frontend Setup

```bash
# Install frontend dependencies
cd ../frontend
npm install

# Start development server
npm run dev
```

### 3. Chrome Extension Setup

```bash
# Build extension
cd ../chrome-extension

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the chrome-extension folder
```

## 📁 Project Structure

```
rehbar-ai/
├── backend/                 # Node.js Backend
│   ├── config/             # Configuration files
│   │   ├── firebase.js     # Firebase setup
│   │   └── gemini.js       # Gemini AI setup
│   ├── middleware/         # Express middleware
│   │   ├── auth.js         # Authentication
│   │   └── errorHandler.js # Error handling
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication routes
│   │   ├── ai.js           # AI interaction routes
│   │   ├── conversations.js # Chat management
│   │   ├── subscriptions.js # Payment handling
│   │   ├── extension.js    # Chrome extension API
│   │   └── downloads.js    # App downloads
│   ├── server.js           # Main server file
│   ├── install.js          # Setup script
│   └── package.json        # Dependencies
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utilities
│   └── package.json
├── chrome-extension/       # Chrome Extension
│   ├── manifest.json       # Extension manifest
│   ├── background.js       # Service worker
│   ├── content.js          # Content script
│   ├── popup.html          # Popup interface
│   ├── popup.js            # Popup logic
│   └── content.css         # Styles
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Firebase (Get from Firebase Console)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL=your_service_account_email

# Gemini AI (Provided)
GEMINI_API_KEY=AIzaSyCqLQN_f8hqL8c2C5bAC9jNG73X2O5kqog

# JWT Secrets (Generated automatically)
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Stripe (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Trial Configuration
TRIAL_PERIOD_DAYS=3
FREE_DAILY_REQUESTS=50
PRO_DAILY_REQUESTS=1000
PREMIUM_DAILY_REQUESTS=5000
```

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication and Firestore
3. Generate service account credentials
4. Update environment variables

### Stripe Setup (Optional)

1. Create a Stripe account at https://stripe.com/
2. Get API keys from the dashboard
3. Set up webhook endpoints
4. Update environment variables

## 🎮 Usage

### Web Interface
1. Visit `http://localhost:3000`
2. Create an account or sign in
3. Start chatting with the AI
4. Manage your subscription

### Chrome Extension
1. Install the extension in Chrome
2. Click the extension icon
3. Sign in with your account
4. Use context menus or the popup interface

### API Endpoints

#### Authentication
```
POST /api/auth/register    # Register new user
POST /api/auth/login       # User login
POST /api/auth/refresh     # Refresh token
POST /api/auth/logout      # User logout
```

#### AI Interaction
```
POST /api/ai/chat          # Send message to AI
POST /api/ai/stream        # Streaming AI response
GET  /api/ai/personalities # Get AI personalities
```

#### Conversations
```
GET    /api/conversations     # Get user conversations
POST   /api/conversations     # Create conversation
GET    /api/conversations/:id # Get specific conversation
PUT    /api/conversations/:id # Update conversation
DELETE /api/conversations/:id # Delete conversation
```

#### Subscriptions
```
GET  /api/subscriptions/plans              # Get subscription plans
POST /api/subscriptions/create-checkout    # Create Stripe checkout
GET  /api/subscriptions/status             # Get subscription status
POST /api/subscriptions/cancel             # Cancel subscription
```

## 🔒 Security Features

- **Authentication**: Firebase Auth with JWT tokens
- **Authorization**: Role-based access control
- **Rate Limiting**: API request throttling
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Secure cross-origin requests
- **Encryption**: Sensitive data encryption
- **Security Headers**: Helmet.js security headers

## 📊 Subscription Plans

### Trial (Free)
- 3-day trial period
- 50 daily AI requests
- Basic features
- Chrome extension access

### Pro ($9.99/month)
- 1,000 daily AI requests
- Advanced voice features
- Priority support
- Desktop app access

### Premium ($19.99/month)
- 5,000 daily AI requests
- Custom AI personalities
- Advanced analytics
- API access
- White-label options

## 🚀 Deployment

### Backend Deployment (Firebase Functions)
```bash
cd backend
npm run deploy
```

### Frontend Deployment (Firebase Hosting)
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

### Chrome Extension Publishing
1. Build the extension
2. Create a ZIP file
3. Upload to Chrome Web Store
4. Submit for review

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline comments
- **Issues**: Create an issue on GitHub
- **Email**: support@rehbar-ai.com
- **Discord**: Join our community server

## 🙏 Acknowledgments

- **Google Gemini AI** - Powerful AI capabilities
- **Firebase** - Backend infrastructure
- **Stripe** - Payment processing
- **React** - Frontend framework
- **Chrome Extensions API** - Browser integration

---

Made with ❤️ by the Rehbar AI Team
