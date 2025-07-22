const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Create the extension package
async function createExtensionPackage() {
  console.log('🔧 Creating Chrome Extension Package...');
  
  const sourceDir = path.join(__dirname, 'chrome-extension');
  const outputDir = path.join(__dirname, 'frontend', 'public', 'downloads');
  const outputFile = path.join(outputDir, 'rehbar-ai-extension.zip');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('✅ Created downloads directory');
  }
  
  // Create a file to stream archive data to
  const output = fs.createWriteStream(outputFile);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level
  });
  
  // Listen for all archive data to be written
  output.on('close', function() {
    console.log('✅ Extension package created: ' + archive.pointer() + ' total bytes');
    console.log('📦 Package location: ' + outputFile);
    console.log('🎉 Chrome extension is ready for download!');
  });
  
  // Good practice to catch warnings (ie stat failures and other non-blocking errors)
  archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
      console.warn('⚠️ Warning:', err);
    } else {
      throw err;
    }
  });
  
  // Good practice to catch this error explicitly
  archive.on('error', function(err) {
    throw err;
  });
  
  // Pipe archive data to the file
  archive.pipe(output);
  
  // Add files from chrome-extension directory
  const filesToInclude = [
    'manifest.json',
    'background.js',
    'content.js',
    'content.css',
    'popup.html',
    'popup.js',
    'popup-complete.js',
    'popup-full.js',
    'popup-new.html',
    'meeting-copilot.js',
    'gemini-ai.js',
    'firebase-config.js',
    'README.md',
    'INSTALL.md'
  ];
  
  console.log('📁 Adding files to package...');
  filesToInclude.forEach(file => {
    const filePath = path.join(sourceDir, file);
    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: file });
      console.log('  ✅ Added:', file);
    } else {
      console.log('  ⚠️ Missing:', file);
    }
  });
  
  // Finalize the archive (ie we are done appending files but streams have to finish yet)
  archive.finalize();
}

// Run the package creation
if (require.main === module) {
  createExtensionPackage().catch(console.error);
}

module.exports = { createExtensionPackage };
