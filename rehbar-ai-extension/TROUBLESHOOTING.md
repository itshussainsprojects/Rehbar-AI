# 🔧 Rehbar AI Troubleshooting Guide

## 🚨 Current Issues & Solutions

### Issue 1: "Please upload resume" even after uploading

**Problem**: Files upload but don't save to storage

**Solution**:
1. Open extension options page
2. Upload your file (resume for Interview mode, product sheet for Sales mode)
3. **IMPORTANT**: Click "Save Settings" button after uploading
4. Check browser console (F12) for any errors
5. Verify file was saved by reopening options page

**Debug steps**:
```javascript
// Check what's in storage (paste in browser console)
chrome.storage.local.get(null, (data) => console.log('Storage:', data));
```

### Issue 2: No microphone permission popup

**Problem**: Extension says "listening" but no browser permission request

**Solution**:
1. **Manual permission**: Click the 🔒 or 🎤 icon in Chrome's address bar
2. Select "Allow" for microphone access
3. Reload the page
4. Try starting listening again

**Alternative**:
1. Go to `chrome://settings/content/microphone`
2. Add your meeting site to "Allowed" list
3. Reload the page

### Issue 3: No overlay/chat interface appears

**Problem**: Extension loads but no overlay shows on screen

**Solution**:
1. **Check if content script loaded**: Look for "🤖 Rehbar AI Ready" indicator (appears for 3 seconds)
2. **Force show overlay**: Press `Ctrl+Shift+O`
3. **Check supported sites**: Only works on Google Meet, Zoom, Teams
4. **Reload page**: Refresh the meeting page and try again

### Issue 4: No voice transcription

**Problem**: Microphone works but no speech-to-text

**Solution**:
1. **Check HTTPS**: Speech recognition only works on HTTPS sites
2. **Test microphone**: Use the test page (`test_page.html`)
3. **Check browser support**: Chrome/Edge work best
4. **Clear speech cache**: Restart browser

## 🧪 Testing Steps

### Step 1: Create Icons (Required)
```bash
1. Open create_icons.html in browser
2. Click "Generate Icons"
3. Save all 3 icons to icons/ folder
4. Reload extension in chrome://extensions/
```

### Step 2: Configure Extension
```bash
1. Click extension icon → Settings
2. Add API key: AIzaSyCHrIRyNwPS8FbYLPcWdhlu0J0pPoEcotw
3. Upload resume.txt or product.txt file
4. Click "Save Settings" (IMPORTANT!)
5. Verify green checkmarks in popup
```

### Step 3: Test on Meeting Site
```bash
1. Go to meet.google.com (or zoom/teams)
2. Look for "🤖 Rehbar AI Ready" indicator
3. Click extension icon → "Start Listening"
4. Allow microphone permission
5. Speak - overlay should appear with transcript
```

### Step 4: Use Test Page
```bash
1. Open test_page.html in browser
2. Click "Check Setup" - should show green checkmarks
3. Click "Test Microphone" - should request permission
4. Test keyboard shortcuts
```

## 🔍 Debug Commands

**Check extension storage**:
```javascript
chrome.storage.local.get(null, console.log);
```

**Check if content script loaded**:
```javascript
console.log('Rehbar AI loaded:', !!window.rehbarAI);
```

**Test speech recognition**:
```javascript
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.onresult = (e) => console.log('Speech:', e.results[0][0].transcript);
recognition.start();
```

**Force show overlay**:
```javascript
if (window.rehbarAI) window.rehbarAI.showOverlay();
```

## 📝 Common Error Messages

### "API key not configured"
- Go to options page
- Add your Gemini API key
- Click "Test" to verify
- Click "Save Settings"

### "Resume not uploaded" 
- Upload .txt, .pdf, or .docx file
- **Must click "Save Settings" after upload**
- Check file contains text content

### "Microphone permission denied"
- Click 🔒 icon in address bar
- Select "Allow" for microphone
- Reload page and try again

### "Speech recognition not supported"
- Use Chrome or Edge browser
- Ensure you're on HTTPS site
- Try restarting browser

### "Failed to generate suggestions"
- Check internet connection
- Verify API key is correct
- Check browser console for errors

## 🎯 Quick Fixes

### Reset Everything
```bash
1. Go to chrome://extensions/
2. Remove Rehbar AI extension
3. Delete rehbar-ai-extension folder
4. Re-download and setup from scratch
```

### Clear Extension Data
```javascript
// Paste in browser console
chrome.storage.local.clear(() => console.log('Storage cleared'));
```

### Force Reload Content Script
```bash
1. Go to meeting page
2. Press F12 → Console tab
3. Reload page (Ctrl+R)
4. Look for "Rehbar AI content script loaded" message
```

## 📞 Still Not Working?

1. **Open browser console** (F12 → Console)
2. **Look for error messages** (red text)
3. **Copy error messages** and check against this guide
4. **Try test page** (`test_page.html`) to isolate issues
5. **Check permissions** in `chrome://settings/content`

## ✅ Success Indicators

When working correctly, you should see:
- ✅ "🤖 Rehbar AI Ready" indicator on page load
- ✅ Green checkmarks in extension popup
- ✅ Microphone permission popup when starting
- ✅ Overlay appears in top-right corner
- ✅ Live transcript updates as you speak
- ✅ AI suggestions appear below transcript

---

**Most common issue**: Forgetting to click "Save Settings" after uploading files!
