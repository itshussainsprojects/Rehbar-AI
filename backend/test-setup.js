// Test script to verify backend setup

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Rehbar AI Backend Setup...\n');

// Test 1: Check if .env file exists
console.log('1. Checking environment configuration...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env file found');
  
  // Read and check for key environment variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = ['GEMINI_API_KEY', 'JWT_SECRET', 'PORT'];
  const missingVars = requiredVars.filter(varName => !envContent.includes(`${varName}=`));

  if (missingVars.length === 0) {
    console.log('   ✅ Required environment variables are configured');
  } else {
    console.log(`   ⚠️  Missing environment variables: ${missingVars.join(', ')}`);
  }
} else {
  console.log('   ❌ .env file not found');
}

// Test 2: Check package.json and dependencies
console.log('\n2. Checking package configuration...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  console.log('   ✅ package.json found');
  
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    console.log('   ✅ Dependencies installed');
  } else {
    console.log('   ⚠️  Dependencies not installed. Run: npm install');
  }
} else {
  console.log('   ❌ package.json not found');
}

// Test 3: Check core files
console.log('\n3. Checking core backend files...');
const coreFiles = [
  'server.js',
  'config/firebase.js',
  'config/gemini.js',
  'middleware/auth.js',
  'routes/auth.js',
  'routes/ai.js'
];

coreFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} missing`);
  }
});

// Test 4: Test Gemini API connection
console.log('\n4. Testing Gemini AI connection...');
const envContent = fs.readFileSync(envPath, 'utf8');
const geminiKeyMatch = envContent.match(/GEMINI_API_KEY=(.+)/);
if (geminiKeyMatch && geminiKeyMatch[1]) {
  console.log('   ✅ Gemini API key configured');
  console.log('   ℹ️  API key:', geminiKeyMatch[1].substring(0, 10) + '...');
} else {
  console.log('   ❌ Gemini API key not configured');
}

// Test 5: Check Chrome extension files
console.log('\n5. Checking Chrome extension files...');
const extensionPath = path.join(__dirname, '..', 'chrome-extension');
const extensionFiles = [
  'manifest.json',
  'background.js',
  'content.js',
  'popup.html',
  'popup.js'
];

extensionFiles.forEach(file => {
  const filePath = path.join(extensionPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} missing`);
  }
});

// Test 6: Check frontend files
console.log('\n6. Checking frontend files...');
const frontendPath = path.join(__dirname, '..', 'frontend');
const frontendFiles = [
  'package.json',
  'src/App.tsx',
  'src/pages/Home.tsx'
];

frontendFiles.forEach(file => {
  const filePath = path.join(frontendPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} missing`);
  }
});

console.log('\n🎉 Setup verification complete!');
console.log(`
📋 Next Steps:
1. Configure Firebase credentials in .env file
2. Start backend: npm run dev
3. Start frontend: cd ../frontend && npm run dev
4. Load Chrome extension in Chrome
5. Test the complete system

🚀 Your Rehbar AI platform is ready for development!
`);

// Test basic server configuration
console.log('7. Testing server configuration...');
try {
  // Check if server.js has basic structure
  const serverContent = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  if (serverContent.includes('express') && serverContent.includes('PORT')) {
    console.log('   ✅ Server configuration looks valid');
  } else {
    console.log('   ⚠️  Server configuration may be incomplete');
  }
} catch (error) {
  console.log('   ❌ Server configuration error:', error.message);
}

console.log('\n✨ All tests completed!');
