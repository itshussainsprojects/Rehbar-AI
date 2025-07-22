import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWebSpeech } from './useWebSpeech'

describe('useWebSpeech', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useWebSpeech())

    expect(result.current.isListening).toBe(false)
    expect(result.current.transcript).toBe('')
    expect(result.current.interimTranscript).toBe('')
    expect(result.current.isSupported).toBe(true)
    expect(result.current.error).toBe(null)
  })

  it('should start listening when startListening is called', () => {
    const { result } = renderHook(() => useWebSpeech())

    act(() => {
      result.current.startListening()
    })

    expect(result.current.isListening).toBe(true)
  })

  it('should stop listening when stopListening is called', () => {
    const { result } = renderHook(() => useWebSpeech())

    act(() => {
      result.current.startListening()
    })

    expect(result.current.isListening).toBe(true)

    act(() => {
      result.current.stopListening()
    })

    expect(result.current.isListening).toBe(false)
  })

  it('should call onResult callback when speech is recognized', () => {
    const onResult = vi.fn()
    const { result } = renderHook(() => useWebSpeech({ onResult }))

    act(() => {
      result.current.startListening()
    })

    // Simulate speech recognition result
    const mockEvent = {
      resultIndex: 0,
      results: [{
        isFinal: true,
        0: {
          transcript: 'Hello world',
          confidence: 0.9
        }
      }]
    }

    // Trigger the onresult event
    const recognition = (global as any).SpeechRecognition.mock.instances[0]
    act(() => {
      recognition.onresult(mockEvent)
    })

    expect(onResult).toHaveBeenCalledWith({
      text: 'Hello world',
      confidence: 0.9,
      isFinal: true
    })
  })

  it('should handle interim results', () => {
    const onResult = vi.fn()
    const { result } = renderHook(() => useWebSpeech({ onResult }))

    act(() => {
      result.current.startListening()
    })

    const mockEvent = {
      resultIndex: 0,
      results: [{
        isFinal: false,
        0: {
          transcript: 'Hello',
          confidence: 0.7
        }
      }]
    }

    const recognition = (global as any).SpeechRecognition.mock.instances[0]
    act(() => {
      recognition.onresult(mockEvent)
    })

    expect(onResult).toHaveBeenCalledWith({
      text: 'Hello',
      confidence: 0.5,
      isFinal: false
    })
    expect(result.current.interimTranscript).toBe('Hello')
  })

  it('should handle errors', () => {
    const onError = vi.fn()
    const { result } = renderHook(() => useWebSpeech({ onError }))

    act(() => {
      result.current.startListening()
    })

    const recognition = (global as any).SpeechRecognition.mock.instances[0]
    act(() => {
      recognition.onerror({ error: 'network' })
    })

    expect(onError).toHaveBeenCalledWith('Speech recognition error: network')
    expect(result.current.error).toBe('Speech recognition error: network')
    expect(result.current.isListening).toBe(false)
  })

  it('should handle unsupported browsers', () => {
    // Temporarily remove SpeechRecognition
    const originalSpeechRecognition = global.SpeechRecognition
    const originalWebkitSpeechRecognition = global.webkitSpeechRecognition
    
    delete (global as any).SpeechRecognition
    delete (global as any).webkitSpeechRecognition

    const onError = vi.fn()
    const { result } = renderHook(() => useWebSpeech({ onError }))

    expect(result.current.isSupported).toBe(false)

    act(() => {
      result.current.startListening()
    })

    expect(onError).toHaveBeenCalledWith('Speech recognition not supported in this browser')
    expect(result.current.error).toBe('Speech recognition not supported in this browser')

    // Restore
    global.SpeechRecognition = originalSpeechRecognition
    global.webkitSpeechRecognition = originalWebkitSpeechRecognition
  })

  it('should accumulate final transcripts', () => {
    const { result } = renderHook(() => useWebSpeech())

    act(() => {
      result.current.startListening()
    })

    const recognition = (global as any).SpeechRecognition.mock.instances[0]

    // First result
    act(() => {
      recognition.onresult({
        resultIndex: 0,
        results: [{
          isFinal: true,
          0: { transcript: 'Hello', confidence: 0.9 }
        }]
      })
    })

    expect(result.current.transcript).toBe('Hello')

    // Second result
    act(() => {
      recognition.onresult({
        resultIndex: 1,
        results: [
          { isFinal: true, 0: { transcript: 'Hello', confidence: 0.9 } },
          { isFinal: true, 0: { transcript: ' world', confidence: 0.8 } }
        ]
      })
    })

    expect(result.current.transcript).toBe('Hello world')
  })
})
