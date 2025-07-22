# 📦 Rehbar AI - Installation Guide

## 🚀 Quick Installation

### Method 1: Development Mode (Recommended for testing)

1. **Download the extension**
   ```bash
   git clone <repository-url>
   cd extension
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Build the extension**
   ```bash
   pnpm build
   # or
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from the extension directory
   - The extension should now appear in your extensions list

### Method 2: ZIP Distribution

1. **Get the ZIP file**
   - Download `rehbar_ai.zip` from releases
   - Or build yourself: `pnpm build && pnpm zip`

2. **Extract and load**
   - Extract the ZIP file to a folder
   - Follow steps 4 from Method 1 above

## ⚙️ Initial Setup

### 1. Get Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### 2. Configure Extension

1. **Open Settings**
   - Click the Rehbar AI extension icon
   - Click the settings gear icon
   - Or right-click extension → "Options"

2. **Add API Key**
   - Paste your Gemini API key
   - Click "Test" to verify it works
   - You should see "API key is valid" ✅

3. **Upload Content**
   
   **For Interview Mode:**
   - Upload your resume/CV as a text file
   - Include your experience, skills, achievements
   - The more detailed, the better the suggestions

   **For Sales Mode:**
   - Upload your product sheet/info as a text file
   - Include features, benefits, pricing, use cases
   - Add common objections and responses

4. **Adjust Settings**
   - Choose default mode (Interview/Sales)
   - Set response length (30-150 words)
   - Enable/disable auto-typing
   - Save settings

## 🎯 Usage Instructions

### Starting a Session

1. **Join a meeting**
   - Works on Google Meet, Zoom, Microsoft Teams
   - Extension will detect the platform automatically

2. **Start listening**
   - Click the extension icon
   - Click "Start Listening"
   - Grant microphone permission if prompted

3. **Use suggestions**
   - Speak naturally during the conversation
   - AI suggestions appear in the overlay
   - Click "Copy" to copy to clipboard
   - Click "Type" to auto-insert into active text field
   - Click "Speak" to use text-to-speech

### Managing the Overlay

- **Minimize**: Click the minimize button to reduce to a small indicator
- **Move**: The overlay is positioned in the top-right by default
- **Close**: Click the X button or "Stop Listening" in popup

## 🔧 Troubleshooting

### Common Issues

**❌ Extension not loading**
- Make sure you selected the `dist` folder, not the root folder
- Check that all files are present in the dist folder
- Try refreshing the extensions page

**❌ API key not working**
- Verify you copied the complete key
- Check your Google AI Studio quota/billing
- Try generating a new API key

**❌ Microphone not working**
- Check Chrome's microphone permissions
- Go to `chrome://settings/content/microphone`
- Ensure the meeting site has microphone access
- Try refreshing the page

**❌ Speech recognition not working**
- Ensure you're on HTTPS (required for WebSpeech API)
- Check your internet connection
- Try speaking more clearly
- Verify microphone is working in other apps

**❌ Auto-type not working**
- Click in a text input field first
- Some sites may block programmatic text insertion
- Try copying and pasting manually instead

**❌ No suggestions appearing**
- Check that you've uploaded resume/product content
- Verify API key is working
- Ensure you're speaking clearly
- Check console for error messages

### Debug Information

1. **Open Developer Tools**
   - Right-click on the page → "Inspect"
   - Go to "Console" tab
   - Look for "Rehbar AI" messages

2. **Check Extension Console**
   - Go to `chrome://extensions/`
   - Find Rehbar AI extension
   - Click "Inspect views: service worker"
   - Check console for errors

3. **Reset Settings**
   - Go to extension options
   - Clear API key and re-enter
   - Re-upload content files
   - Save settings again

## 🔒 Privacy & Permissions

### Required Permissions

- **Microphone**: For speech recognition
- **Active Tab**: To detect meeting platforms
- **Storage**: To save your settings locally
- **Scripting**: To inject the overlay interface

### Data Handling

- ✅ All data stored locally in Chrome
- ✅ No data sent to external servers (except Gemini API)
- ✅ API calls only contain the spoken text and your context
- ✅ No recording or storage of audio
- ✅ Settings can be cleared anytime

## 🆘 Support

### Getting Help

1. **Check this guide** for common solutions
2. **Review console logs** for technical details
3. **Try different browsers** to isolate issues
4. **Test on different meeting platforms**

### Reporting Issues

When reporting problems, please include:
- Chrome version
- Extension version
- Meeting platform (Meet/Zoom/Teams)
- Console error messages
- Steps to reproduce

---

🎉 **You're all set!** Start your next meeting with AI-powered assistance.
