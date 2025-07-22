# 🤖 Rehbar AI - Chrome Extension

Real-time voice coaching for interviews and sales calls. No auth, no backend—everything local & free.

## ✨ Features

- **🎤 Real-time Voice Recognition** - Continuous speech-to-text with WebSpeech API + Whisper.cpp fallback
- **🧠 AI-Powered Suggestions** - Context-aware responses using Google Gemini 1.5 Pro
- **🧑‍💼 Interview Mode** - Resume-aware coaching for job interviews
- **💼 Sales Mode** - Product-aware assistance for sales conversations
- **🎯 Smart Targeting** - Works on Google Meet, Zoom, Microsoft Teams
- **🔒 Privacy First** - All processing local, no data sent to servers
- **⚡ Instant Setup** - Just add API key and upload your resume/product sheet

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Development
```bash
pnpm dev      # Start development server with HMR
```

### 3. Build for Production
```bash
pnpm build    # Build extension
pnpm zip      # Create distribution ZIP
```

### 4. Load in Chrome
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

## 📁 Project Structure

```
extension/
├── manifest.json           # Extension manifest
├── vite.config.ts          # Vite + crxjs configuration
└── src/
   ├── serviceWorker.ts     # Background service worker
   ├── content/
   │   ├── overlay.tsx      # Injected UI overlay
   │   └── styles.css       # Content script styles
   ├── popup/
   │   ├── Popup.tsx        # Extension popup
   │   └── Popup.html       # Popup HTML
   ├── options/
   │   ├── Options.tsx      # Settings page
   │   └── Options.html     # Options HTML
   ├── stt/
   │   ├── useWebSpeech.ts  # WebSpeech API hook
   │   └── whisperWasm.ts   # Whisper.cpp WASM fallback
   ├── ai/
   │   └── geminiClient.ts  # Gemini API integration
   ├── utils/
   │   └── autoType.ts      # Text insertion utility
   └── types.d.ts           # TypeScript definitions
```

## ⚙️ Configuration

### 1. Get Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key

### 2. Setup Extension
1. Click extension icon → Settings
2. Paste your Gemini API key
3. Upload your resume (for Interview mode) or product sheet (for Sales mode)
4. Adjust settings as needed
5. Click "Save Settings"

### 3. Usage
1. Join a meeting (Google Meet, Zoom, Teams)
2. Click extension icon
3. Click "Start Listening"
4. Speak naturally - get AI suggestions in real-time
5. Copy, auto-type, or speak suggestions

## 🎯 Supported Platforms

- ✅ Google Meet (`meet.google.com`)
- ✅ Zoom (`*.zoom.us`)
- ✅ Microsoft Teams (`teams.microsoft.com`)

## 🧪 Testing

### Unit Tests
```bash
pnpm test              # Run Vitest unit tests
pnpm test:watch        # Watch mode
```

### E2E Tests
```bash
pnpm test:e2e          # Run Playwright E2E tests
```

## 🔧 Development

### Tech Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite + crxjs
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Testing**: Vitest + Playwright
- **AI**: Google Gemini 1.5 Pro
- **Speech**: WebSpeech API + Whisper.cpp WASM

### Key Components

#### Service Worker (`serviceWorker.ts`)
- Manages extension lifecycle
- Handles popup ↔ content script communication
- Injects overlay on supported sites
- Tracks usage statistics

#### Content Overlay (`content/overlay.tsx`)
- Real-time transcript display
- AI suggestion cards with actions
- Minimizable floating UI
- Accessibility compliant

#### Speech Recognition (`stt/useWebSpeech.ts`)
- Primary: WebSpeech API for real-time recognition
- Fallback: Whisper.cpp WASM for offline processing
- Continuous listening with interim results
- Error handling and recovery

#### AI Client (`ai/geminiClient.ts`)
- Gemini 1.5 Pro integration
- Context-aware prompt engineering
- Response parsing and validation
- Token usage tracking

### Data Storage

Uses `chrome.storage.local` for:
```typescript
{
  geminiKey: string           // API key
  resumeText: string          // Resume content (interview mode)
  productSheet: string        // Product info (sales mode)
  settings: {
    mode: 'interview' | 'sales'
    answerLen: number         // Response length (30-150 words)
    ttsVoice: string         // TTS voice preference
    autoType: boolean        // Auto-type suggestions
  }
  usage: {
    sessions: number         // Session count
    tokens: number          // Token usage
  }
}
```

## 🎨 UI/UX Features

- **Glass morphism design** with backdrop blur
- **Responsive layout** adapts to screen size
- **Accessibility support** with ARIA labels and keyboard navigation
- **Reduced motion** support for users with vestibular disorders
- **High contrast** mode compatibility
- **Print-friendly** (hides overlay when printing)

## 🔒 Privacy & Security

- **No external servers** - all processing happens locally
- **API key stored locally** in Chrome's secure storage
- **No data collection** - your conversations stay private
- **Minimal permissions** - only what's needed for functionality
- **Content Security Policy** prevents XSS attacks

## 📦 Distribution

### Chrome Web Store
1. Build production version: `pnpm build`
2. Create ZIP: `pnpm zip`
3. Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)

### Manual Distribution
1. Share the built ZIP file
2. Users load as unpacked extension in developer mode

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests: `pnpm test && pnpm test:e2e`
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Extension not working on meeting sites**
- Ensure you're on a supported platform (Meet/Zoom/Teams)
- Check that the extension has permission for the site
- Try refreshing the page

**Speech recognition not working**
- Check microphone permissions in Chrome
- Ensure you're using HTTPS (required for WebSpeech API)
- Try speaking more clearly or adjusting microphone

**AI suggestions not appearing**
- Verify API key is valid in settings
- Check that resume/product sheet is uploaded
- Ensure you have internet connection for Gemini API

**Auto-type not working**
- Click in a text input field first
- Check that the field accepts text input
- Some sites may block programmatic text insertion

### Debug Mode
1. Open Chrome DevTools
2. Go to Console tab
3. Look for "Rehbar AI" logs
4. Report issues with console output

---

Made with ❤️ for better conversations
