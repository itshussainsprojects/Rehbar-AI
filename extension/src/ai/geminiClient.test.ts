import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GeminiClient } from './geminiClient'

describe('GeminiClient', () => {
  let client: GeminiClient
  const mockApiKey = 'test-api-key'

  beforeEach(() => {
    client = new GeminiClient(mockApiKey)
    vi.clearAllMocks()
  })

  describe('generateSuggestions', () => {
    it('should generate suggestions for interview mode', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify([
                {
                  id: '1',
                  text: 'Based on my React experience, I built a dashboard that improved user engagement by 40%.',
                  confidence: 0.9,
                  type: 'answer'
                }
              ])
            }]
          }
        }],
        usageMetadata: {
          totalTokenCount: 150
        }
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.generateSuggestions(
        'Tell me about your React experience',
        'interview',
        'Senior Frontend Developer with 5 years React experience',
        { mode: 'interview', answerLen: 80, ttsVoice: 'default', autoType: false }
      )

      expect(result.suggestions).toHaveLength(1)
      expect(result.suggestions[0].type).toBe('answer')
      expect(result.tokensUsed).toBe(150)
    })

    it('should generate suggestions for sales mode', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify([
                {
                  id: '1',
                  text: 'Our premium plan includes advanced analytics that can increase your ROI by 30%.',
                  confidence: 0.85,
                  type: 'answer'
                }
              ])
            }]
          }
        }],
        usageMetadata: {
          totalTokenCount: 120
        }
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.generateSuggestions(
        'What are the benefits of your premium plan?',
        'sales',
        'SaaS Analytics Platform - Premium features include advanced reporting',
        { mode: 'sales', answerLen: 60, ttsVoice: 'default', autoType: false }
      )

      expect(result.suggestions).toHaveLength(1)
      expect(result.suggestions[0].type).toBe('answer')
      expect(result.tokensUsed).toBe(120)
    })

    it('should handle API errors gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      })

      await expect(
        client.generateSuggestions(
          'Test question',
          'interview',
          'Test context',
          { mode: 'interview', answerLen: 80, ttsVoice: 'default', autoType: false }
        )
      ).rejects.toThrow('Gemini API error: 401 Unauthorized')
    })

    it('should handle malformed JSON responses', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: 'This is not valid JSON'
            }]
          }
        }],
        usageMetadata: {
          totalTokenCount: 50
        }
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.generateSuggestions(
        'Test question',
        'interview',
        'Test context',
        { mode: 'interview', answerLen: 80, ttsVoice: 'default', autoType: false }
      )

      // Should fallback to creating a suggestion from raw text
      expect(result.suggestions).toHaveLength(1)
      expect(result.suggestions[0].id).toBe('fallback-1')
      expect(result.suggestions[0].confidence).toBe(0.5)
    })

    it('should validate and sanitize suggestions', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify([
                {
                  id: '1',
                  text: 'Valid suggestion',
                  confidence: 0.9,
                  type: 'answer'
                },
                {
                  // Missing required fields
                  confidence: 0.8
                },
                {
                  id: '2',
                  text: 'Another valid suggestion',
                  confidence: 1.5, // Out of range
                  type: 'invalid-type'
                }
              ])
            }]
          }
        }],
        usageMetadata: {
          totalTokenCount: 100
        }
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.generateSuggestions(
        'Test question',
        'interview',
        'Test context',
        { mode: 'interview', answerLen: 80, ttsVoice: 'default', autoType: false }
      )

      expect(result.suggestions).toHaveLength(2)
      expect(result.suggestions[0].text).toBe('Valid suggestion')
      expect(result.suggestions[1].confidence).toBe(1) // Clamped to max
      expect(result.suggestions[1].type).toBe('answer') // Fallback type
    })
  })

  describe('testConnection', () => {
    it('should return true for valid API key', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify([{
                id: '1',
                text: 'Test response',
                confidence: 0.9,
                type: 'answer'
              }])
            }]
          }
        }],
        usageMetadata: {
          totalTokenCount: 50
        }
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.testConnection()
      expect(result).toBe(true)
    })

    it('should return false for invalid API key', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401
      })

      const result = await client.testConnection()
      expect(result).toBe(false)
    })
  })
})
