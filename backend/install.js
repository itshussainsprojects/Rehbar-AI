#!/usr/bin/env node

// Rehbar AI Backend Installation Script

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`
🚀 Rehbar AI Backend Installation
==================================

This script will help you set up the Rehbar AI backend with all necessary configurations.
`);

async function main() {
  try {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('\n🔧 Setting up environment configuration...');
    await setupEnvironment();
    
    console.log('\n🔥 Setting up Firebase...');
    await setupFirebase();
    
    console.log('\n💳 Setting up Stripe (optional)...');
    await setupStripe();
    
    console.log('\n🤖 Setting up Gemini AI...');
    await setupGemini();
    
    console.log('\n✅ Installation completed successfully!');
    console.log(`
🎉 Your Rehbar AI backend is ready!

Next steps:
1. Start the development server: npm run dev
2. Deploy to Firebase: npm run deploy
3. Set up your Chrome extension with the API URL

API will be available at: http://localhost:5000
`);
    
  } catch (error) {
    console.error('❌ Installation failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function setupEnvironment() {
  const envPath = path.join(__dirname, '.env');
  
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Skipping environment setup...');
      return;
    }
  }
  
  const port = await question('Enter server port (default: 5000): ') || '5000';
  const nodeEnv = await question('Enter environment (development/production) [development]: ') || 'development';
  
  // Generate secure secrets
  const jwtSecret = generateSecureKey(64);
  const jwtRefreshSecret = generateSecureKey(64);
  const encryptionKey = generateSecureKey(32);
  
  const envContent = `# Server Configuration
PORT=${port}
NODE_ENV=${nodeEnv}

# Firebase Configuration (Fill these from your Firebase project)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nyour_private_key\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your_project_id.iam.gserviceaccount.com

# Google Gemini API
GEMINI_API_KEY=AIzaSyCqLQN_f8hqL8c2C5bAC9jNG73X2O5kqog

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Stripe Configuration (Optional - for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Security
ENCRYPTION_KEY=${encryptionKey}
CORS_ORIGIN=http://localhost:3000,chrome-extension://

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=audio/mpeg,audio/wav,audio/ogg,image/jpeg,image/png,image/gif

# Trial Configuration
TRIAL_PERIOD_DAYS=3
FREE_DAILY_REQUESTS=50
PRO_DAILY_REQUESTS=1000
PREMIUM_DAILY_REQUESTS=5000

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment file created with secure secrets');
}

async function setupFirebase() {
  console.log(`
Firebase Setup Instructions:
1. Go to https://console.firebase.google.com/
2. Create a new project or select existing one
3. Enable Authentication and Firestore
4. Go to Project Settings > Service Accounts
5. Generate a new private key
6. Update the Firebase configuration in .env file

Would you like to set up Firebase now?`);
  
  const setup = await question('Set up Firebase interactively? (y/N): ');
  if (setup.toLowerCase() === 'y') {
    const projectId = await question('Enter Firebase Project ID: ');
    if (projectId) {
      updateEnvFile('FIREBASE_PROJECT_ID', projectId);
      console.log('✅ Firebase Project ID updated');
      console.log('⚠️  Don\'t forget to update other Firebase credentials in .env');
    }
  }
}

async function setupStripe() {
  const useStripe = await question('Do you want to set up Stripe for payments? (y/N): ');
  if (useStripe.toLowerCase() === 'y') {
    console.log(`
Stripe Setup Instructions:
1. Go to https://dashboard.stripe.com/
2. Get your API keys from Developers > API keys
3. Set up webhooks for subscription events
4. Update STRIPE_* variables in .env file
`);
    
    const secretKey = await question('Enter Stripe Secret Key (optional): ');
    if (secretKey) {
      updateEnvFile('STRIPE_SECRET_KEY', secretKey);
      console.log('✅ Stripe Secret Key updated');
    }
  }
}

async function setupGemini() {
  console.log('✅ Gemini API key is already configured in .env');
  console.log('The provided key should work for development and testing.');
  
  const customKey = await question('Do you want to use your own Gemini API key? (y/N): ');
  if (customKey.toLowerCase() === 'y') {
    const apiKey = await question('Enter your Gemini API key: ');
    if (apiKey) {
      updateEnvFile('GEMINI_API_KEY', apiKey);
      console.log('✅ Gemini API key updated');
    }
  }
}

function generateSecureKey(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function updateEnvFile(key, value) {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  
  let content = fs.readFileSync(envPath, 'utf8');
  const regex = new RegExp(`^${key}=.*$`, 'm');
  
  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    content += `\n${key}=${value}`;
  }
  
  fs.writeFileSync(envPath, content);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Run installation
main().catch(console.error);
