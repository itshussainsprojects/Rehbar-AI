// Options Page Script for Rehbar AI Extension

class OptionsController {
  constructor() {
    this.data = {
      geminiApiKey: '',
      resumeText: '',
      productSheet: '',
      settings: {
        mode: 'interview',
        responseLength: 80,
        ttsVoice: 'default',
        typingSpeed: 50
      },
      usage: {
        sessionsCount: 0,
        totalTokensUsed: 0,
        lastUsed: null
      }
    };
    
    this.init();
  }

  async init() {
    await this.loadData();
    this.bindEvents();
    this.populateVoices();
    this.updateUI();
  }

  async loadData() {
    try {
      const stored = await chrome.storage.local.get([
        'geminiApiKey', 
        'resumeText', 
        'productSheet', 
        'settings', 
        'usage'
      ]);
      
      this.data = {
        geminiApiKey: stored.geminiApiKey || '',
        resumeText: stored.resumeText || '',
        productSheet: stored.productSheet || '',
        settings: { ...this.data.settings, ...stored.settings },
        usage: { ...this.data.usage, ...stored.usage }
      };
    } catch (error) {
      console.error('Failed to load data:', error);
      this.showSaveStatus('Failed to load settings', 'error');
    }
  }

  bindEvents() {
    // API Key
    document.getElementById('apiKey').addEventListener('input', (e) => {
      this.data.geminiApiKey = e.target.value.trim();
    });

    document.getElementById('testApiBtn').addEventListener('click', () => {
      this.testApiKey();
    });

    // File uploads
    this.setupFileUpload('resumeFile', 'resumeUpload', 'resumeStatus', 'resumeText');
    this.setupFileUpload('productFile', 'productUpload', 'productStatus', 'productSheet');

    // Settings
    document.getElementById('defaultMode').addEventListener('change', (e) => {
      this.data.settings.mode = e.target.value;
    });

    document.getElementById('responseLength').addEventListener('input', (e) => {
      this.data.settings.responseLength = parseInt(e.target.value);
      document.getElementById('responseLengthValue').textContent = e.target.value;
    });

    document.getElementById('typingSpeed').addEventListener('input', (e) => {
      this.data.settings.typingSpeed = parseInt(e.target.value);
      document.getElementById('typingSpeedValue').textContent = e.target.value;
    });

    document.getElementById('ttsVoice').addEventListener('change', (e) => {
      this.data.settings.ttsVoice = e.target.value;
    });

    // Actions
    document.getElementById('saveBtn').addEventListener('click', () => {
      this.saveData();
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      this.resetData();
    });
  }

  setupFileUpload(inputId, areaId, statusId, dataKey) {
    const input = document.getElementById(inputId);
    const area = document.getElementById(areaId);
    const status = document.getElementById(statusId);

    // Click to upload
    area.addEventListener('click', () => {
      input.click();
    });

    // File selection
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.processFile(file, dataKey, status);
      }
    });

    // Drag and drop
    area.addEventListener('dragover', (e) => {
      e.preventDefault();
      area.classList.add('dragover');
    });

    area.addEventListener('dragleave', () => {
      area.classList.remove('dragover');
    });

    area.addEventListener('drop', (e) => {
      e.preventDefault();
      area.classList.remove('dragover');

      const file = e.dataTransfer.files[0];
      if (file) {
        this.processFile(file, dataKey, status);
      }
    });
  }

  async processFile(file, dataKey, statusElement) {
    try {
      statusElement.className = 'upload-status';
      statusElement.textContent = 'Processing file...';
      statusElement.style.display = 'block';

      let text = '';
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        text = await this.readTextFile(file);
      } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        text = await this.readPdfFile(file);
      } else if (fileName.endsWith('.docx')) {
        text = await this.readDocxFile(file);
      } else {
        throw new Error('Unsupported file type. Please use .txt, .pdf, or .docx files.');
      }

      if (!text.trim()) {
        throw new Error('No text content found in the file.');
      }

      this.data[dataKey] = text.trim();
      statusElement.className = 'upload-status success';
      statusElement.textContent = `✅ File uploaded successfully (${text.length} characters)`;

    } catch (error) {
      console.error('File processing error:', error);
      statusElement.className = 'upload-status error';
      statusElement.textContent = `❌ ${error.message}`;
    }
  }

  readTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  }

  async readPdfFile(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        text += pageText + '\n';
      }

      return text;
    } catch (error) {
      throw new Error('Failed to read PDF file. Please ensure it contains text content.');
    }
  }

  async readDocxFile(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      throw new Error('Failed to read DOCX file. Please ensure it\'s a valid Word document.');
    }
  }

  async testApiKey() {
    const apiKey = this.data.geminiApiKey;
    const statusElement = document.getElementById('apiKeyStatus');
    const testBtn = document.getElementById('testApiBtn');

    if (!apiKey) {
      this.showApiStatus('Please enter an API key first', 'error');
      return;
    }

    try {
      testBtn.disabled = true;
      testBtn.textContent = 'Testing...';
      this.showApiStatus('Testing API key...', 'loading');

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello, this is a test message. Please respond with "API key is working".'
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 50
          }
        })
      });

      if (response.ok) {
        this.showApiStatus('✅ API key is valid and working!', 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

    } catch (error) {
      console.error('API test error:', error);
      this.showApiStatus(`❌ API key test failed: ${error.message}`, 'error');
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = 'Test';
    }
  }

  showApiStatus(message, type) {
    const statusElement = document.getElementById('apiKeyStatus');
    statusElement.className = `status-message ${type}`;
    statusElement.textContent = message;
  }

  populateVoices() {
    const voiceSelect = document.getElementById('ttsVoice');

    // Clear existing options except default
    while (voiceSelect.children.length > 1) {
      voiceSelect.removeChild(voiceSelect.lastChild);
    }

    if ('speechSynthesis' in window) {
      const voices = speechSynthesis.getVoices();

      voices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
      });

      // Set current voice
      voiceSelect.value = this.data.settings.ttsVoice;
    }
  }

  updateUI() {
    // API Key
    document.getElementById('apiKey').value = this.data.geminiApiKey;

    // Settings
    document.getElementById('defaultMode').value = this.data.settings.mode;
    document.getElementById('responseLength').value = this.data.settings.responseLength;
    document.getElementById('responseLengthValue').textContent = this.data.settings.responseLength;
    document.getElementById('typingSpeed').value = this.data.settings.typingSpeed;
    document.getElementById('typingSpeedValue').textContent = this.data.settings.typingSpeed;
    document.getElementById('ttsVoice').value = this.data.settings.ttsVoice;

    // Upload status
    if (this.data.resumeText) {
      const resumeStatus = document.getElementById('resumeStatus');
      resumeStatus.className = 'upload-status success';
      resumeStatus.textContent = `✅ Resume uploaded (${this.data.resumeText.length} characters)`;
      resumeStatus.style.display = 'block';
    }

    if (this.data.productSheet) {
      const productStatus = document.getElementById('productStatus');
      productStatus.className = 'upload-status success';
      productStatus.textContent = `✅ Product sheet uploaded (${this.data.productSheet.length} characters)`;
      productStatus.style.display = 'block';
    }

    // Usage stats
    document.getElementById('totalSessions').textContent = this.data.usage.sessionsCount;
    document.getElementById('totalTokens').textContent = this.data.usage.totalTokensUsed;

    const lastUsed = this.data.usage.lastUsed;
    if (lastUsed) {
      const date = new Date(lastUsed);
      document.getElementById('lastUsed').textContent = date.toLocaleDateString();
    } else {
      document.getElementById('lastUsed').textContent = 'Never';
    }
  }

  async saveData() {
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.querySelector('.btn-text').textContent;

    try {
      saveBtn.disabled = true;
      saveBtn.querySelector('.btn-text').textContent = 'Saving...';

      await chrome.storage.local.set({
        geminiApiKey: this.data.geminiApiKey,
        resumeText: this.data.resumeText,
        productSheet: this.data.productSheet,
        settings: this.data.settings
      });

      this.showSaveStatus('✅ Settings saved successfully!', 'success');

    } catch (error) {
      console.error('Save error:', error);
      this.showSaveStatus('❌ Failed to save settings', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.querySelector('.btn-text').textContent = originalText;
    }
  }

  async resetData() {
    if (!confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      return;
    }

    try {
      await chrome.storage.local.clear();

      // Reset local data
      this.data = {
        geminiApiKey: '',
        resumeText: '',
        productSheet: '',
        settings: {
          mode: 'interview',
          responseLength: 80,
          ttsVoice: 'default',
          typingSpeed: 50
        },
        usage: {
          sessionsCount: 0,
          totalTokensUsed: 0,
          lastUsed: null
        }
      };

      this.updateUI();
      this.showSaveStatus('✅ All data has been reset', 'success');

    } catch (error) {
      console.error('Reset error:', error);
      this.showSaveStatus('❌ Failed to reset data', 'error');
    }
  }

  showSaveStatus(message, type) {
    const statusElement = document.getElementById('saveStatus');
    statusElement.className = `save-status ${type}`;
    statusElement.textContent = message;

    // Auto-hide after 3 seconds
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 3000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new OptionsController();
});

// Handle voices loading
if ('speechSynthesis' in window) {
  speechSynthesis.addEventListener('voiceschanged', () => {
    // Re-populate voices when they become available
    if (window.optionsController) {
      window.optionsController.populateVoices();
    }
  });
}
