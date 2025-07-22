// Content Script for Rehbar AI Extension

class RehbarAIChatInterface {
  constructor() {
    this.isListening = false;
    this.recognition = null;
    this.chatInterface = null;
    this.settings = null;
    this.contextData = '';
    this.apiKey = '';
    this.conversation = [];
    this.mediaRecorder = null;
    this.audioStream = null;

    this.init();
  }

  init() {
    this.createChatInterface();
    this.setupMessageListener();
    this.setupSpeechRecognition();
    this.setupAudioCapture();
  }

  createChatInterface() {
    // Remove existing interface if present
    const existing = document.getElementById('rehbar-ai-chat');
    if (existing) {
      existing.remove();
    }

    // Create chat interface container
    this.chatInterface = document.createElement('div');
    this.chatInterface.id = 'rehbar-ai-chat';
    this.chatInterface.className = 'rehbar-chat-interface';

    this.chatInterface.innerHTML = `
      <div class="chat-container">
        <div class="chat-header">
          <div class="header-left">
            <div class="status-indicator">
              <div class="status-dot" id="statusDot"></div>
              <span class="status-text" id="statusText">Rehbar AI Interview Assistant</span>
            </div>
          </div>
          <div class="header-right">
            <button class="control-btn" id="minimizeBtn" title="Minimize">−</button>
            <button class="control-btn" id="closeBtn" title="Close">×</button>
          </div>
        </div>

        <div class="chat-messages" id="chatMessages">
          <div class="welcome-message">
            <div class="ai-avatar">🤖</div>
            <div class="message-content">
              <div class="message-text">
                <strong>Welcome to Rehbar AI! 🎯</strong>
                <br><br>
                I'm your intelligent interview assistant. I can:
                <br>• 🎤 Listen to your conversation in real-time
                <br>• 💬 Provide smart responses based on your resume
                <br>• ✍️ Accept both voice and text input
                <br><br>
                <strong>Get started:</strong> Type a message below or click the 🎤 button for voice recognition!
              </div>
            </div>
          </div>
        </div>

        <div class="chat-input-area">
          <div class="input-container">
            <textarea
              id="messageInput"
              placeholder="Type your message here or use voice recognition..."
              rows="2"
            ></textarea>
            <div class="input-actions">
              <button class="action-btn voice-btn" id="voiceBtn" title="Voice Recognition">
                <span class="btn-icon">🎤</span>
              </button>
              <button class="action-btn send-btn" id="sendBtn" title="Send Message">
                <span class="btn-icon">📤</span>
              </button>
            </div>
          </div>

          <div class="chat-controls">
            <div class="listening-status" id="listeningStatus">
              <span class="mic-icon">🎤</span>
              <span class="status-label">Ready to listen...</span>
            </div>
            <div class="control-buttons">
              <button class="btn btn-secondary" id="settingsBtn">
                <span class="btn-icon">⚙️</span>
                Settings
              </button>
              <button class="btn btn-secondary" id="clearChatBtn">
                <span class="btn-icon">🗑️</span>
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add to page
    document.body.appendChild(this.chatInterface);

    // Initially hidden
    this.chatInterface.style.display = 'none';

    // Bind events after DOM is ready
    setTimeout(() => {
      this.bindChatEvents();
    }, 100);
  }

  bindChatEvents() {
    console.log('Binding chat events...');

    try {
      // Use event delegation for more reliable event handling
      this.chatInterface.addEventListener('click', (e) => {
        e.stopPropagation();

        const target = e.target.closest('button');
        if (!target) return;

        const id = target.id;
        console.log('Button clicked:', id);

        switch (id) {
          case 'voiceBtn':
            e.preventDefault();
            this.toggleVoiceRecognition();
            break;

          case 'sendBtn':
            e.preventDefault();
            this.sendMessage();
            break;

          case 'settingsBtn':
            e.preventDefault();
            chrome.runtime.openOptionsPage();
            break;

          case 'clearChatBtn':
            e.preventDefault();
            this.clearChat();
            break;

          case 'minimizeBtn':
            e.preventDefault();
            this.toggleMinimize();
            break;

          case 'closeBtn':
            e.preventDefault();
            this.stopListening();
            this.hideChatInterface();
            break;
        }
      });

      // Message input enter key
      const messageInput = this.chatInterface.querySelector('#messageInput');
      if (messageInput) {
        messageInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
          }
        });
        console.log('Message input event listener added');
      }

      // Prevent chat from interfering with page
      this.chatInterface.addEventListener('mousedown', (e) => {
        e.stopPropagation();
      });

      console.log('All chat event listeners bound successfully');
    } catch (error) {
      console.error('Error binding chat events:', error);
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('Content script received message:', message.type);

      switch (message.type) {
        case 'START_LISTENING':
          this.startListening(message.data);
          break;
        case 'STOP_LISTENING':
          this.stopListening();
          break;
        case 'TOGGLE_CHAT_INTERFACE':
          this.toggleChatInterface();
          break;
        case 'TOGGLE_OVERLAY':
          this.toggleChatVisibility();
          break;
        case 'FORCE_SHOW_OVERLAY':
          this.forceShowChat();
          break;
        case 'REQUEST_TAB_CAPTURE':
          this.handleTabCaptureRequest();
          break;
        case 'MODE_CHANGED':
          this.handleModeChange(message.mode);
          break;
      }
      sendResponse({ success: true });
    });
  }

  toggleChatInterface() {
    console.log('Toggling chat interface...');
    if (this.chatInterface.style.display === 'none') {
      this.showChatInterface();
    } else {
      this.hideChatInterface();
    }
  }

  forceShowChat() {
    console.log('Force showing chat interface...');
    this.showChatInterface();
    this.addChatMessage('system', '🤖 Chat interface force-shown! Click "Start Listening" to begin voice recognition.');
  }

  toggleChatVisibility() {
    if (this.chatInterface.style.display === 'none') {
      this.showChatInterface();
    } else {
      this.hideChatInterface();
    }
  }

  async handleTabCaptureRequest() {
    try {
      // This would require additional permissions and setup
      // For now, we'll just return false
      return false;
    } catch (error) {
      console.error('Tab capture not available:', error);
      return false;
    }
  }

  setupSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      this.addChatMessage('system', 'Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      console.log('Speech recognition started');
      this.updateStatus('listening', 'Listening to conversation...');
      this.updateListeningStatus('🎤 Listening to conversation...', true);
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      if (this.isListening) {
        // Restart if we're supposed to be listening
        setTimeout(() => {
          if (this.isListening) {
            try {
              this.recognition.start();
            } catch (error) {
              console.error('Failed to restart recognition:', error);
              this.stopListening();
            }
          }
        }, 100);
      } else {
        this.updateStatus('stopped', 'Ready to listen...');
        this.updateListeningStatus('🎤 Ready to listen...', false);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.updateStatus('error', 'Error occurred');

      if (event.error === 'not-allowed') {
        this.addChatMessage('system', '❌ Microphone permission denied. Please allow microphone access and try again.');
        this.requestMicrophonePermission();
      } else if (event.error === 'network') {
        this.addChatMessage('system', '❌ Network error. Please check your internet connection.');
      } else if (event.error === 'no-speech') {
        this.addChatMessage('system', '⚠️ No speech detected. Please speak clearly.');
      } else {
        this.addChatMessage('system', `❌ Speech recognition error: ${event.error}`);
      }
    };

    this.recognition.onresult = (event) => {
      this.handleSpeechResult(event);
    };
  }

  setupAudioCapture() {
    // This will be used to capture system audio (interviewer's voice)
    // Note: System audio capture requires special permissions and may not work in all scenarios
    console.log('Audio capture setup initialized');
  }

  // Request microphone permission explicitly
  async requestMicrophonePermission() {
    try {
      console.log('Requesting microphone permission...');
      this.addChatMessage('system', '🎤 Requesting microphone permission from browser...');

      // This will trigger the browser's permission popup
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Keep the stream for actual use
      this.audioStream = stream;

      console.log('Microphone permission granted!');
      this.addChatMessage('system', '✅ Microphone permission granted! Voice recognition is now active.');

      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);

      if (error.name === 'NotAllowedError') {
        this.addChatMessage('system', '❌ Microphone permission denied. Please allow microphone access when prompted by the browser.');
        this.showMicrophonePermissionDialog();
      } else if (error.name === 'NotFoundError') {
        this.addChatMessage('system', '❌ No microphone found. Please connect a microphone and try again.');
      } else {
        this.addChatMessage('system', `❌ Microphone access failed: ${error.message}`);
      }

      return false;
    }
  }

  showMicrophonePermissionDialog() {
    this.addChatMessage('system', `
      <strong>🎤 Microphone Permission Required</strong><br><br>
      To enable voice recognition:<br>
      1. Look for the microphone icon 🎤 in your browser's address bar<br>
      2. Click it and select "Allow"<br>
      3. Or click the 🔒 lock icon → Site settings → Microphone → Allow<br>
      4. Refresh this page and try again
    `);
  }

  // Request system audio capture (for interviewer's voice)
  async requestSystemAudioCapture() {
    try {
      // Try to capture tab audio (interviewer's voice from meeting)
      const tabStream = await chrome.runtime.sendMessage({
        type: 'REQUEST_TAB_CAPTURE'
      });

      if (tabStream) {
        console.log('System audio capture enabled');
        this.addChatMessage('system', '✅ System audio capture enabled! I can now hear both you and the interviewer.');
        return true;
      }
    } catch (error) {
      console.log('System audio capture not available:', error);
      this.addChatMessage('system', '⚠️ System audio capture not available. I can only hear your microphone.');
    }

    return false;
  }

  showMicrophonePermissionHelp() {
    const helpMessage = `
      <div style="text-align: left; line-height: 1.4;">
        <strong>🎤 Microphone Permission Required</strong><br><br>
        <strong>To enable voice recognition:</strong><br>
        1. Click the 🔒 or 🎤 icon in the address bar<br>
        2. Select "Allow" for microphone access<br>
        3. Reload this page<br>
        4. Try starting listening again<br><br>
        <strong>Or:</strong><br>
        • Go to Chrome Settings → Privacy → Site Settings → Microphone<br>
        • Add this site to "Allowed" list
      </div>
    `;

    // Create a more prominent permission help overlay
    const helpOverlay = document.createElement('div');
    helpOverlay.style.cssText = `
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      background: rgba(0, 0, 0, 0.95) !important;
      color: white !important;
      padding: 20px !important;
      border-radius: 12px !important;
      border: 2px solid #ef4444 !important;
      z-index: 2147483647 !important;
      max-width: 400px !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 14px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
    `;

    helpOverlay.innerHTML = helpMessage + `
      <div style="margin-top: 15px; text-align: center;">
        <button id="rehbar-close-help" style="
          background: #3b82f6 !important;
          color: white !important;
          border: none !important;
          padding: 8px 16px !important;
          border-radius: 6px !important;
          cursor: pointer !important;
          font-size: 12px !important;
        ">Got it</button>
      </div>
    `;

    document.body.appendChild(helpOverlay);

    // Auto-remove after 10 seconds or on click
    const closeHelp = () => {
      if (helpOverlay.parentNode) {
        helpOverlay.remove();
      }
    };

    document.getElementById('rehbar-close-help').onclick = closeHelp;
    setTimeout(closeHelp, 10000);
  }

  async startListening(data) {
    // Load data from storage if not provided
    if (!data || !data.apiKey || !data.contextData) {
      await this.loadStoredData();
    } else {
      this.settings = data.settings;
      this.contextData = data.contextData;
      this.apiKey = data.apiKey;
    }

    // Check if we have required data
    if (!this.apiKey) {
      this.addChatMessage('system', '❌ API key not configured. Please go to extension settings and add your Gemini API key.');
      return;
    }

    if (!this.contextData) {
      this.addChatMessage('system', '❌ Resume not uploaded. Please go to extension settings and upload your resume.');
      return;
    }

    // Show chat interface if not visible
    if (this.chatInterface.style.display === 'none') {
      this.showChatInterface();
    }

    // Request microphone permission first
    const hasPermission = await this.requestMicrophonePermission();
    if (!hasPermission) {
      return;
    }

    this.isListening = true;
    this.updateVoiceButton();

    if (this.recognition) {
      try {
        this.recognition.start();
        this.addChatMessage('system', '🎤 Voice recognition started! Speak naturally and I\'ll transcribe and respond.');
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        this.addChatMessage('system', `❌ Failed to start speech recognition: ${error.message}`);
        this.isListening = false;
        this.updateVoiceButton();
      }
    }
  }

  async loadStoredData() {
    try {
      const data = await chrome.storage.local.get(['geminiApiKey', 'resumeText', 'productSheet', 'settings']);

      this.apiKey = data.geminiApiKey;
      this.settings = data.settings || { mode: 'interview', responseLength: 80, typingSpeed: 50 };

      // Load context based on mode
      if (this.settings.mode === 'interview') {
        this.contextData = data.resumeText;
      } else {
        this.contextData = data.productSheet;
      }

      console.log('Loaded data:', {
        hasApiKey: !!this.apiKey,
        hasContextData: !!this.contextData,
        mode: this.settings.mode
      });

    } catch (error) {
      console.error('Failed to load stored data:', error);
      this.addChatMessage('system', '❌ Failed to load extension data. Please check your settings.');
    }
  }

  stopListening() {
    this.isListening = false;

    if (this.recognition) {
      this.recognition.stop();
    }

    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }

    this.updateStatus('stopped', 'Ready to listen...');
    this.updateListeningStatus('🎤 Ready to listen...', false);
    this.updateVoiceButton();

    this.addChatMessage('system', '⏹️ Voice recognition stopped. You can still type messages.');
  }

  stopListening() {
    this.isListening = false;
    
    if (this.recognition) {
      this.recognition.stop();
    }
    
    this.updateStatus('stopped');
  }

  async showChatInterface() {
    console.log('Showing chat interface...');
    this.chatInterface.style.display = 'flex';
    this.chatInterface.style.visibility = 'visible';
    this.chatInterface.style.opacity = '1';
    this.chatInterface.classList.remove('minimized');

    // Ensure interface is on top
    this.chatInterface.style.zIndex = '2147483647';

    // Load stored data when interface opens
    await this.loadStoredData();

    // Show status based on loaded data
    if (this.apiKey && this.contextData) {
      this.addChatMessage('system', '✅ Extension configured! You can start typing or use voice recognition.');
    } else {
      let missingItems = [];
      if (!this.apiKey) missingItems.push('API key');
      if (!this.contextData) missingItems.push('resume');

      this.addChatMessage('system', `❌ Missing: ${missingItems.join(' and ')}. Please configure in extension settings.`);
    }

    console.log('🤖 Rehbar AI chat interface is now visible');
  }

  hideChatInterface() {
    console.log('Hiding chat interface...');
    this.chatInterface.style.display = 'none';
    chrome.runtime.sendMessage({ type: 'STOP_LISTENING' });
  }

  toggleMinimize() {
    console.log('Toggling minimize...');
    const isMinimized = this.chatInterface.classList.contains('minimized');

    if (isMinimized) {
      this.chatInterface.classList.remove('minimized');
      this.chatInterface.style.height = '650px';
      console.log('Chat interface expanded');
    } else {
      this.chatInterface.classList.add('minimized');
      this.chatInterface.style.height = '80px';
      console.log('Chat interface minimized');
    }

    const minimizeBtn = this.chatInterface.querySelector('#minimizeBtn');
    if (minimizeBtn) {
      if (this.chatInterface.classList.contains('minimized')) {
        minimizeBtn.textContent = '+';
        minimizeBtn.title = 'Restore';
      } else {
        minimizeBtn.textContent = '−';
        minimizeBtn.title = 'Minimize';
      }
    }
  }

  updateStatus(status, text) {
    const statusDot = this.chatInterface.querySelector('#statusDot');
    const statusText = this.chatInterface.querySelector('#statusText');

    statusDot.className = 'status-dot';

    switch (status) {
      case 'listening':
        statusDot.classList.add('listening');
        statusText.textContent = text || 'Listening...';
        break;
      case 'processing':
        statusDot.classList.add('processing');
        statusText.textContent = text || 'Processing...';
        break;
      case 'error':
        statusDot.classList.add('error');
        statusText.textContent = text || 'Error';
        break;
      default:
        statusText.textContent = text || 'Rehbar AI Interview Assistant';
    }
  }

  updateListeningStatus(text, isListening) {
    const listeningStatus = this.chatInterface.querySelector('#listeningStatus .status-label');
    listeningStatus.textContent = text;

    const statusContainer = this.chatInterface.querySelector('#listeningStatus');
    if (isListening) {
      statusContainer.classList.add('active');
    } else {
      statusContainer.classList.remove('active');
    }
  }

  toggleVoiceRecognition() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  async sendMessage() {
    const messageInput = this.chatInterface.querySelector('#messageInput');
    const message = messageInput.value.trim();

    if (!message) return;

    // Load data if not already loaded
    if (!this.apiKey || !this.contextData) {
      await this.loadStoredData();
    }

    // Check if we have required data
    if (!this.apiKey) {
      this.addChatMessage('system', '❌ API key missing. Please configure in extension settings.');
      return;
    }

    if (!this.contextData) {
      this.addChatMessage('system', '❌ Resume not uploaded. Please upload your resume in extension settings.');
      return;
    }

    // Add user message to chat
    this.addChatMessage('user', message);

    // Clear input
    messageInput.value = '';

    // Generate AI response
    this.generateAIResponse(message, 'user');
  }

  updateVoiceButton() {
    const voiceBtn = this.chatInterface.querySelector('#voiceBtn');
    const btnIcon = voiceBtn.querySelector('.btn-icon');

    if (this.isListening) {
      voiceBtn.classList.add('active');
      btnIcon.textContent = '⏹️';
      voiceBtn.title = 'Stop Voice Recognition';
    } else {
      voiceBtn.classList.remove('active');
      btnIcon.textContent = '🎤';
      voiceBtn.title = 'Start Voice Recognition';
    }
  }

  toggleMinimize() {
    this.overlay.classList.toggle('minimized');
  }

  updateStatus(status) {
    const statusDot = this.overlay.querySelector('.status-dot');
    const statusText = this.overlay.querySelector('.status-text');

    statusDot.className = 'status-dot';

    switch (status) {
      case 'listening':
        statusDot.classList.add('listening');
        statusText.textContent = 'Listening...';
        break;
      case 'processing':
        statusDot.classList.add('processing');
        statusText.textContent = 'Processing...';
        break;
      case 'error':
        statusDot.classList.add('error');
        statusText.textContent = 'Error';
        break;
      default:
        statusText.textContent = 'Rehbar AI';
    }
  }

  addChatMessage(type, content, actions = null) {
    const chatMessages = this.chatInterface.querySelector('#chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}-message`;

    const timestamp = new Date().toLocaleTimeString();

    let avatar = '';
    let sender = '';

    switch (type) {
      case 'user':
        avatar = '👤';
        sender = 'You';
        break;
      case 'interviewer':
        avatar = '👔';
        sender = 'Interviewer';
        break;
      case 'ai':
        avatar = '🤖';
        sender = 'AI Assistant';
        break;
      case 'system':
        avatar = '⚙️';
        sender = 'System';
        break;
    }

    messageDiv.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">
        <div class="message-header">
          <span class="message-sender">${sender}</span>
          <span class="message-time">${timestamp}</span>
        </div>
        <div class="message-text">${content}</div>
        ${actions ? `<div class="message-actions">${actions}</div>` : ''}
      </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Store in conversation history
    this.conversation.push({
      type,
      content,
      timestamp: Date.now()
    });
  }

  clearChat() {
    const chatMessages = this.chatInterface.querySelector('#chatMessages');
    chatMessages.innerHTML = `
      <div class="welcome-message">
        <div class="ai-avatar">🤖</div>
        <div class="message-content">
          <div class="message-text">
            Chat cleared! I'm ready to assist with your interview.
          </div>
        </div>
      </div>
    `;
    this.conversation = [];
  }

  handleSpeechResult(event) {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;

      if (result.isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    // Show interim results in status
    if (interimTranscript.trim()) {
      this.updateListeningStatus(`🎤 "${interimTranscript.trim()}"`, true);
    }

    // Process final transcript
    if (finalTranscript.trim()) {
      // Determine if this is user or interviewer speaking
      // For now, we'll assume it's the user - in a real implementation,
      // you'd need voice recognition or other methods to distinguish speakers
      const speaker = 'user'; // This could be enhanced with speaker detection

      this.addChatMessage(speaker, finalTranscript.trim());
      this.generateAIResponse(finalTranscript.trim(), speaker);
    }
  }

  updateTranscriptDisplay(finalText, interimText) {
    const display = document.getElementById('transcriptDisplay');

    let content = '';
    if (this.currentTranscript) {
      content += `<span class="final-text">${this.currentTranscript}</span>`;
    }
    if (finalText) {
      content += `<span class="final-text">${finalText}</span>`;
    }
    if (interimText) {
      content += `<span class="interim-text">${interimText}</span>`;
    }

    if (!content) {
      content = '<div class="transcript-placeholder">Waiting for speech...</div>';
    }

    display.innerHTML = content;
    display.scrollTop = display.scrollHeight;
  }

  clearTranscript() {
    this.currentTranscript = '';
    const display = document.getElementById('transcriptDisplay');
    display.innerHTML = '<div class="transcript-placeholder">Waiting for speech...</div>';
  }

  async generateAIResponse(transcript, speaker) {
    if (!this.apiKey || !this.contextData) {
      this.addChatMessage('system', '❌ Missing API key or resume data. Please configure the extension.');
      return;
    }

    try {
      this.updateStatus('processing', 'Generating AI response...');

      const prompt = this.buildConversationPrompt(transcript, speaker);
      const response = await this.callGeminiAPI(prompt);

      if (response.content) {
        // Create action buttons for the AI response
        const actions = `
          <button class="action-btn copy-btn" onclick="navigator.clipboard.writeText('${response.content.replace(/'/g, "\\'")}')">
            📋 Copy
          </button>
          <button class="action-btn speak-btn" onclick="speechSynthesis.speak(new SpeechSynthesisUtterance('${response.content.replace(/'/g, "\\'")}'))">
            🔊 Speak
          </button>
        `;

        this.addChatMessage('ai', response.content, actions);

        // Update usage stats
        chrome.runtime.sendMessage({
          type: 'UPDATE_USAGE',
          data: { tokensUsed: response.tokensUsed || 0 }
        });
      }

    } catch (error) {
      console.error('AI response error:', error);
      this.addChatMessage('system', `❌ Failed to generate AI response: ${error.message}`);
    } finally {
      this.updateStatus('listening', 'Listening to conversation...');
    }
  }

  buildConversationPrompt(transcript, speaker) {
    const mode = this.settings?.mode || 'interview';
    const maxWords = this.settings?.responseLength || 80;

    // Get recent conversation context
    const recentMessages = this.conversation.slice(-5).map(msg => {
      const speakerLabel = msg.type === 'user' ? 'Candidate' :
                          msg.type === 'interviewer' ? 'Interviewer' :
                          msg.type;
      return `${speakerLabel}: ${msg.content}`;
    }).join('\n');

    const basePrompt = mode === 'interview'
      ? `You are an expert interview coach helping a job candidate during a live interview. Provide helpful, professional responses based on the candidate's resume.`
      : `You are an expert sales coach helping during a live sales call. Provide helpful responses based on the product information.`;

    const contextPrompt = mode === 'interview'
      ? `CANDIDATE'S RESUME:\n${this.contextData}\n\n`
      : `PRODUCT INFORMATION:\n${this.contextData}\n\n`;

    return `${basePrompt}

${contextPrompt}RECENT CONVERSATION:
${recentMessages}

LATEST MESSAGE:
${speaker === 'user' ? 'Candidate' : 'Interviewer'}: ${transcript}

Provide a helpful response for the candidate in ${maxWords} words or less. Be natural, professional, and specific to their background. Only return the response text, no JSON or formatting.`;
  }

  async callGeminiAPI(prompt) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const responseText = data.candidates[0]?.content?.parts[0]?.text;

    if (!responseText) {
      throw new Error('No response from AI');
    }

    return {
      content: responseText.trim(),
      tokensUsed: data.usageMetadata?.totalTokenCount || 0
    };
  }

  parseAIResponse(responseText, tokensUsed) {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const suggestions = JSON.parse(jsonMatch[0]);

      // Validate and clean suggestions
      const validSuggestions = suggestions
        .filter(s => s.text && s.text.trim())
        .map((s, index) => ({
          id: `suggestion-${Date.now()}-${index}`,
          text: s.text.trim(),
          confidence: Math.max(0, Math.min(1, s.confidence || 0.8)),
          type: ['answer', 'question', 'tip'].includes(s.type) ? s.type : 'answer'
        }))
        .slice(0, 3);

      return { suggestions: validSuggestions, tokensUsed };

    } catch (error) {
      console.error('Failed to parse AI response:', error);

      // Fallback: create single suggestion from raw text
      return {
        suggestions: [{
          id: `fallback-${Date.now()}`,
          text: responseText.slice(0, 200) + (responseText.length > 200 ? '...' : ''),
          confidence: 0.5,
          type: 'answer'
        }],
        tokensUsed
      };
    }
  }

  displaySuggestions(suggestions) {
    const container = document.getElementById('suggestionsContainer');

    if (!suggestions || suggestions.length === 0) {
      container.innerHTML = '<div class="suggestions-placeholder">No suggestions available</div>';
      return;
    }

    container.innerHTML = suggestions.map(suggestion => `
      <div class="suggestion-card" data-id="${suggestion.id}">
        <div class="suggestion-header">
          <span class="suggestion-type ${suggestion.type}">${suggestion.type}</span>
          <span class="suggestion-confidence">${Math.round(suggestion.confidence * 100)}%</span>
        </div>
        <div class="suggestion-text">${suggestion.text}</div>
        <div class="suggestion-actions">
          <button class="action-btn copy-btn" data-text="${this.escapeHtml(suggestion.text)}" title="Copy to clipboard">
            📋 Copy
          </button>
          <button class="action-btn type-btn" data-text="${this.escapeHtml(suggestion.text)}" title="Auto-type">
            ⌨️ Type
          </button>
          <button class="action-btn speak-btn" data-text="${this.escapeHtml(suggestion.text)}" title="Text-to-speech">
            🔊 Speak
          </button>
        </div>
      </div>
    `).join('');

    // Bind action buttons
    this.bindSuggestionActions();
  }

  bindSuggestionActions() {
    const container = document.getElementById('suggestionsContainer');

    // Copy buttons
    container.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const text = btn.dataset.text;
        try {
          await navigator.clipboard.writeText(text);
          this.showToast('Copied to clipboard!');
        } catch (error) {
          console.error('Copy failed:', error);
          this.showToast('Copy failed', 'error');
        }
      });
    });

    // Auto-type buttons
    container.querySelectorAll('.type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.text;
        this.autoTypeText(text);
      });
    });

    // Speak buttons
    container.querySelectorAll('.speak-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.text;
        this.speakText(text);
      });
    });
  }

  async autoTypeText(text) {
    try {
      const activeElement = document.activeElement;

      if (!this.isTextInputElement(activeElement)) {
        // Try to find a suitable input field
        const inputField = this.findBestInputField();
        if (inputField) {
          inputField.focus();
          await this.typeIntoElement(inputField, text);
        } else {
          this.showToast('No text input field found', 'error');
        }
      } else {
        await this.typeIntoElement(activeElement, text);
      }

      this.showToast('Text typed successfully!');
    } catch (error) {
      console.error('Auto-type failed:', error);
      this.showToast('Auto-type failed', 'error');
    }
  }

  isTextInputElement(element) {
    if (!element) return false;

    const tagName = element.tagName.toLowerCase();

    if (tagName === 'textarea') return true;
    if (tagName === 'input') {
      const type = element.type.toLowerCase();
      return ['text', 'email', 'search', 'url', 'tel'].includes(type);
    }
    if (element.contentEditable === 'true') return true;

    return false;
  }

  findBestInputField() {
    const selectors = [
      'textarea:not([disabled]):not([readonly])',
      'input[type="text"]:not([disabled]):not([readonly])',
      '[contenteditable="true"]',
      'input[type="email"]:not([disabled]):not([readonly])',
      'input[type="search"]:not([disabled]):not([readonly])'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (element.offsetParent !== null) { // Element is visible
          return element;
        }
      }
    }

    return null;
  }

  async typeIntoElement(element, text) {
    const typingSpeed = this.settings?.typingSpeed || 50;

    if (element.tagName.toLowerCase() === 'textarea' || element.tagName.toLowerCase() === 'input') {
      // For input/textarea elements
      const startPos = element.selectionStart || element.value.length;
      const endPos = element.selectionEnd || element.value.length;

      const beforeText = element.value.substring(0, startPos);
      const afterText = element.value.substring(endPos);

      // Type character by character
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const currentPos = startPos + i;

        element.value = beforeText + text.substring(0, i + 1) + afterText;
        element.setSelectionRange(currentPos + 1, currentPos + 1);

        // Trigger events
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));

        if (i < text.length - 1) {
          await this.sleep(typingSpeed);
        }
      }
    } else if (element.contentEditable === 'true') {
      // For contenteditable elements
      element.focus();

      for (const char of text) {
        document.execCommand('insertText', false, char);
        await this.sleep(typingSpeed);
      }
    }
  }

  speakText(text) {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Set voice if specified
      if (this.settings?.ttsVoice && this.settings.ttsVoice !== 'default') {
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => voice.name === this.settings.ttsVoice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      speechSynthesis.speak(utterance);
      this.showToast('Speaking...');
    } else {
      this.showToast('Text-to-speech not supported', 'error');
    }
  }

  clearSuggestions() {
    const container = document.getElementById('suggestionsContainer');
    container.innerHTML = '<div class="suggestions-placeholder">Start speaking to get AI suggestions...</div>';
  }

  showLoadingSpinner(show) {
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = show ? 'block' : 'none';
  }

  showError(message) {
    this.showToast(message, 'error');
  }

  showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.rehbar-toast');
    if (existingToast) {
      existingToast.remove();
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = `rehbar-toast ${type}`;
    toast.textContent = message;

    // Add to overlay
    this.overlay.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 3000);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Keyboard shortcut handlers
  toggleOverlayVisibility() {
    if (this.overlay.style.display === 'none') {
      this.showOverlay();
      this.showToast('Overlay shown (Ctrl+Shift+O to toggle)');
    } else {
      this.hideOverlay();
    }
  }

  handleQuickAction() {
    if (this.suggestions.length > 0) {
      const lastSuggestion = this.suggestions[this.suggestions.length - 1];

      // Check if Shift is currently held (we'll default to copy)
      // Since we can't detect Shift in the background script, we'll cycle through actions
      const actions = ['copy', 'type', 'speak'];
      const currentTime = Date.now();

      // If called within 2 seconds, cycle to next action
      if (this.lastQuickAction && (currentTime - this.lastQuickAction.time) < 2000) {
        this.lastQuickAction.index = (this.lastQuickAction.index + 1) % actions.length;
      } else {
        this.lastQuickAction = { index: 0, time: currentTime };
      }

      const action = actions[this.lastQuickAction.index];
      this.lastQuickAction.time = currentTime;

      switch (action) {
        case 'copy':
          navigator.clipboard.writeText(lastSuggestion.text).then(() => {
            this.showToast('Suggestion copied! (Press Ctrl+Shift+Q again for type/speak)');
          }).catch(() => {
            this.showToast('Failed to copy suggestion', 'error');
          });
          break;
        case 'type':
          this.autoTypeText(lastSuggestion.text);
          this.showToast('Typing suggestion... (Press Ctrl+Shift+Q again to speak)');
          break;
        case 'speak':
          this.speakText(lastSuggestion.text);
          this.showToast('Speaking suggestion... (Press Ctrl+Shift+Q again to copy)');
          break;
      }
    } else {
      this.showToast('No suggestions available', 'error');
    }
  }

  handleModeChange(newMode) {
    if (this.settings) {
      this.settings.mode = newMode;
      this.showToast(`Switched to ${newMode} mode (Ctrl+Shift+M)`, 'success');

      // Update overlay header if visible
      if (this.overlay.style.display !== 'none') {
        const statusText = this.overlay.querySelector('.status-text');
        if (statusText && !this.isListening) {
          statusText.textContent = `Rehbar AI - ${newMode}`;
        }
      }
    }
  }

  // Add global keyboard listener for additional shortcuts
  setupGlobalKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Only handle shortcuts when overlay is visible and not in input fields
      if (this.overlay.style.display === 'none' ||
          e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' ||
          e.target.contentEditable === 'true') {
        return;
      }

      // ESC to hide overlay
      if (e.key === 'Escape') {
        e.preventDefault();
        this.hideOverlay();
        this.showToast('Overlay hidden (press Ctrl+Shift+O to show)');
      }

      // Number keys to quickly use suggestions (1, 2, 3)
      if (e.key >= '1' && e.key <= '3' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const index = parseInt(e.key) - 1;
        if (this.suggestions[index]) {
          e.preventDefault();
          const suggestion = this.suggestions[index];

          if (e.shiftKey) {
            // Shift + number = auto-type
            this.autoTypeText(suggestion.text);
            this.showToast(`Typing suggestion ${e.key}`);
          } else {
            // Just number = copy
            navigator.clipboard.writeText(suggestion.text).then(() => {
              this.showToast(`Suggestion ${e.key} copied (Shift+${e.key} to type)`);
            });
          }
        }
      }

      // Space to toggle listening when overlay is focused
      if (e.key === ' ' && e.ctrlKey) {
        e.preventDefault();
        if (this.isListening) {
          this.stopListening();
          this.hideOverlay();
        } else {
          // Request to start listening
          chrome.runtime.sendMessage({ type: 'START_LISTENING' });
        }
      }
    });
  }
}

// Initialize chat interface when script loads
console.log('Rehbar AI content script loaded on:', window.location.href);

function initializeRehbarAI() {
  console.log('Initializing Rehbar AI chat interface...');
  try {
    window.rehbarAI = new RehbarAIChatInterface();
    console.log('Rehbar AI chat interface initialized successfully');

    // Add a visual indicator that the extension is loaded
    const indicator = document.createElement('div');
    indicator.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
      color: white !important;
      padding: 12px 16px !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      z-index: 2147483647 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
      animation: slideIn 0.3s ease !important;
    `;
    indicator.innerHTML = '🤖 Rehbar AI Ready<br><small>Press Ctrl+Shift+O to open</small>';
    document.body.appendChild(indicator);

    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    // Remove indicator after 5 seconds
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => indicator.remove(), 300);
      }
    }, 5000);

  } catch (error) {
    console.error('Failed to initialize Rehbar AI:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeRehbarAI);
} else {
  initializeRehbarAI();
}
