#!/usr/bin/env node

// Simple build script that bypasses TypeScript checking for production
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build...');

try {
  // Check if we're in production mode
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  
  if (isProduction) {
    console.log('📦 Production mode detected - skipping TypeScript checks');
    
    // Run Vite build directly without TypeScript checking
    execSync('npx vite build --mode production', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    console.log('✅ Production build completed successfully!');
  } else {
    console.log('🔧 Development mode - running with TypeScript checks');
    execSync('npx tsc && npx vite build', { stdio: 'inherit' });
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
