import { useState, useCallback, useRef } from 'react'

export interface WhisperState {
  isRecording: boolean
  isProcessing: boolean
  transcript: string
  error: string | null
  audioLevel: number
}

export interface WhisperHook {
  state: WhisperState
  startRecording: () => Promise<void>
  stopRecording: () => void
  toggleRecording: () => void
}

export function useWhisper(): WhisperHook {
  const [state, setState] = useState<WhisperState>({
    isRecording: false,
    isProcessing: false,
    transcript: '',
    error: null,
    audioLevel: 0
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>()

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
    const normalizedLevel = average / 255

    setState(prev => ({ ...prev, audioLevel: normalizedLevel }))
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
  }, [])

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null, isRecording: true }))

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })

      // Set up audio analysis
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 256
      
      updateAudioLevel()

      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream)
      const chunks: Blob[] = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        setState(prev => ({ ...prev, isRecording: false, isProcessing: true }))
        
        const audioBlob = new Blob(chunks, { type: 'audio/wav' })
        
        // TODO: Send to Whisper API
        // For now, simulate processing
        setTimeout(() => {
          setState(prev => ({ 
            ...prev, 
            isProcessing: false, 
            transcript: 'This is a simulated transcript. Integrate with Whisper API.' 
          }))
        }, 2000)

        // Clean up
        stream.getTracks().forEach(track => track.stop())
        if (audioContextRef.current) {
          audioContextRef.current.close()
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }

      mediaRecorderRef.current.start()
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to start recording',
        isRecording: false 
      }))
    }
  }, [updateAudioLevel])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop()
    }
  }, [state.isRecording])

  const toggleRecording = useCallback(() => {
    if (state.isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [state.isRecording, startRecording, stopRecording])

  return {
    state,
    startRecording,
    stopRecording,
    toggleRecording
  }
}
