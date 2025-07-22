import { useState, useEffect, useCallback, useRef } from 'react'
import type { TranscriptChunk, SpeechRecognitionResult } from '../types'

interface UseWebSpeechOptions {
  continuous?: boolean
  interimResults?: boolean
  language?: string
  onResult?: (result: SpeechRecognitionResult) => void
  onError?: (error: string) => void
}

interface UseWebSpeechReturn {
  isListening: boolean
  transcript: string
  interimTranscript: string
  startListening: () => void
  stopListening: () => void
  isSupported: boolean
  error: string | null
}

export function useWebSpeech(options: UseWebSpeechOptions = {}): UseWebSpeechReturn {
  const {
    continuous = true,
    interimResults = true,
    language = 'en-US',
    onResult,
    onError
  } = options

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const recognitionRef = useRef<any>(null)
  const isSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  const initializeRecognition = useCallback(() => {
    if (!isSupported) return null

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.lang = language
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = (event: any) => {
      const errorMessage = `Speech recognition error: ${event.error}`
      setError(errorMessage)
      setIsListening(false)
      onError?.(errorMessage)
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0].transcript

        if (result.isFinal) {
          finalTranscript += text
        } else {
          interimText += text
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript)
        onResult?.({
          text: finalTranscript,
          confidence: event.results[event.results.length - 1][0].confidence || 0.9,
          isFinal: true
        })
      }

      setInterimTranscript(interimText)
      
      if (interimText && onResult) {
        onResult({
          text: interimText,
          confidence: 0.5,
          isFinal: false
        })
      }
    }

    return recognition
  }, [continuous, interimResults, language, onResult, onError, isSupported])

  const startListening = useCallback(() => {
    if (!isSupported) {
      const errorMsg = 'Speech recognition not supported in this browser'
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    recognitionRef.current = initializeRecognition()
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (err) {
        const errorMsg = 'Failed to start speech recognition'
        setError(errorMsg)
        onError?.(errorMsg)
      }
    }
  }, [initializeRecognition, isSupported, onError])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    isSupported,
    error
  }
}
