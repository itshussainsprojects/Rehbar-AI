import type { WhisperConfig, SpeechRecognitionResult } from '../types'

interface WhisperInstance {
  transcribe: (audioData: Float32Array) => Promise<string>
  free: () => void
}

class WhisperWasm {
  private instance: WhisperInstance | null = null
  private isLoading = false
  private loadPromise: Promise<void> | null = null

  async initialize(config: WhisperConfig): Promise<void> {
    if (this.instance) return
    if (this.isLoading) {
      await this.loadPromise
      return
    }

    this.isLoading = true
    this.loadPromise = this.loadWhisper(config)
    await this.loadPromise
    this.isLoading = false
  }

  private async loadWhisper(config: WhisperConfig): Promise<void> {
    try {
      // In a real implementation, you would load whisper.cpp WASM
      // For this demo, we'll simulate the loading
      console.log('Loading Whisper WASM model...')
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock Whisper instance
      this.instance = {
        transcribe: async (audioData: Float32Array): Promise<string> => {
          // Simulate transcription processing
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Return mock transcription
          return "This is a mock transcription from Whisper WASM"
        },
        free: () => {
          console.log('Whisper instance freed')
        }
      }
      
      console.log('Whisper WASM loaded successfully')
    } catch (error) {
      console.error('Failed to load Whisper WASM:', error)
      throw error
    }
  }

  async transcribe(audioData: Float32Array): Promise<SpeechRecognitionResult> {
    if (!this.instance) {
      throw new Error('Whisper not initialized')
    }

    try {
      const text = await this.instance.transcribe(audioData)
      
      return {
        text: text.trim(),
        confidence: 0.85, // Whisper typically has good confidence
        isFinal: true
      }
    } catch (error) {
      console.error('Whisper transcription error:', error)
      throw error
    }
  }

  isReady(): boolean {
    return !!this.instance && !this.isLoading
  }

  destroy(): void {
    if (this.instance) {
      this.instance.free()
      this.instance = null
    }
  }
}

// Audio processing utilities
export class AudioProcessor {
  private audioContext: AudioContext | null = null
  private mediaStream: MediaStream | null = null
  private processor: ScriptProcessorNode | null = null
  private whisper: WhisperWasm

  constructor() {
    this.whisper = new WhisperWasm()
  }

  async initialize(): Promise<void> {
    // Initialize audio context
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Initialize Whisper
    await this.whisper.initialize({
      modelPath: '/models/ggml-tiny.en.bin',
      language: 'en',
      task: 'transcribe'
    })
  }

  async startRecording(onTranscript: (result: SpeechRecognitionResult) => void): Promise<void> {
    if (!this.audioContext || !this.whisper.isReady()) {
      throw new Error('Audio processor not initialized')
    }

    try {
      // Get microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })

      const source = this.audioContext.createMediaStreamSource(this.mediaStream)
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1)

      let audioBuffer: Float32Array[] = []
      const bufferDuration = 3000 // 3 seconds

      this.processor.onaudioprocess = async (event) => {
        const inputData = event.inputBuffer.getChannelData(0)
        audioBuffer.push(new Float32Array(inputData))

        // Process every 3 seconds of audio
        const totalSamples = audioBuffer.reduce((sum, buf) => sum + buf.length, 0)
        const expectedSamples = (bufferDuration / 1000) * 16000

        if (totalSamples >= expectedSamples) {
          const combinedBuffer = new Float32Array(totalSamples)
          let offset = 0
          
          for (const buffer of audioBuffer) {
            combinedBuffer.set(buffer, offset)
            offset += buffer.length
          }

          try {
            const result = await this.whisper.transcribe(combinedBuffer)
            if (result.text.length > 0) {
              onTranscript(result)
            }
          } catch (error) {
            console.error('Transcription error:', error)
          }

          audioBuffer = []
        }
      }

      source.connect(this.processor)
      this.processor.connect(this.audioContext.destination)

    } catch (error) {
      console.error('Failed to start recording:', error)
      throw error
    }
  }

  stopRecording(): void {
    if (this.processor) {
      this.processor.disconnect()
      this.processor = null
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop())
      this.mediaStream = null
    }
  }

  destroy(): void {
    this.stopRecording()
    this.whisper.destroy()
    
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}

export { WhisperWasm }
