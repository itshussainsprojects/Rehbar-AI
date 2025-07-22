import type { AISuggestion, GeminiResponse, ExtensionSettings } from '../types'

interface GeminiRequestBody {
  contents: Array<{
    parts: Array<{
      text: string
    }>
  }>
  generationConfig: {
    temperature: number
    topK: number
    topP: number
    maxOutputTokens: number
  }
}

interface GeminiApiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
    finishReason: string
  }>
  usageMetadata: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
  }
}

export class GeminiClient {
  private apiKey: string
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateSuggestions(
    transcript: string,
    mode: 'interview' | 'sales',
    contextData: string,
    settings: ExtensionSettings
  ): Promise<GeminiResponse> {
    try {
      const prompt = this.buildPrompt(transcript, mode, contextData, settings)
      
      const requestBody: GeminiRequestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      }

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
      }

      const data: GeminiApiResponse = await response.json()
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini API')
      }

      const responseText = data.candidates[0].content.parts[0].text
      const suggestions = this.parseResponse(responseText)
      
      return {
        suggestions,
        tokensUsed: data.usageMetadata?.totalTokenCount || 0
      }

    } catch (error) {
      console.error('Gemini API error:', error)
      throw error
    }
  }

  private buildPrompt(
    transcript: string,
    mode: 'interview' | 'sales',
    contextData: string,
    settings: ExtensionSettings
  ): string {
    const basePrompt = mode === 'interview' 
      ? this.buildInterviewPrompt(transcript, contextData, settings)
      : this.buildSalesPrompt(transcript, contextData, settings)

    return `${basePrompt}

IMPORTANT: Respond with a valid JSON array containing 1-3 suggestion objects. Each object must have:
- "id": unique identifier
- "text": the suggestion text (≤ ${settings.answerLen} words)
- "confidence": number between 0-1
- "type": "answer", "question", or "tip"

Example format:
[
  {
    "id": "1",
    "text": "Based on my experience with React and TypeScript, I've built scalable applications that improved performance by 40%.",
    "confidence": 0.9,
    "type": "answer"
  }
]`
  }

  private buildInterviewPrompt(transcript: string, resumeText: string, settings: ExtensionSettings): string {
    return `You are an expert interview coach helping a candidate during a live interview.

CANDIDATE'S RESUME/BACKGROUND:
${resumeText}

INTERVIEWER'S QUESTION/COMMENT:
"${transcript}"

Your task:
1. Analyze the question in context of the candidate's background
2. Provide 1-3 strategic response suggestions
3. Each suggestion should be authentic, specific, and highlight relevant experience
4. Keep responses concise (≤ ${settings.answerLen} words each)
5. Include confidence scores based on how well the resume matches the question

Focus on:
- Specific examples from their experience
- Quantifiable achievements when possible
- Technical skills that match the question
- Soft skills demonstrated through past work
- Questions to ask back when appropriate`
  }

  private buildSalesPrompt(transcript: string, productSheet: string, settings: ExtensionSettings): string {
    return `You are an expert sales coach helping during a live sales conversation.

PRODUCT/SERVICE INFORMATION:
${productSheet}

PROSPECT'S COMMENT/QUESTION:
"${transcript}"

Your task:
1. Analyze the prospect's statement for buying signals, objections, or information needs
2. Provide 1-3 strategic response suggestions
3. Each suggestion should address their specific concern while highlighting product benefits
4. Keep responses concise (≤ ${settings.answerLen} words each)
5. Include confidence scores based on how well the product fits their needs

Focus on:
- Addressing specific objections or concerns
- Highlighting relevant product benefits
- Creating urgency when appropriate
- Asking qualifying questions
- Moving toward next steps/closing`
  }

  private parseResponse(responseText: string): AISuggestion[] {
    try {
      // Extract JSON from response (handle cases where AI adds extra text)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('No JSON array found in response')
      }

      const suggestions = JSON.parse(jsonMatch[0])
      
      // Validate and sanitize suggestions
      return suggestions
        .filter((s: any) => s.text && s.id && s.type && typeof s.confidence === 'number')
        .map((s: any, index: number) => ({
          id: s.id || `suggestion-${index}`,
          text: s.text.trim(),
          confidence: Math.max(0, Math.min(1, s.confidence)),
          type: ['answer', 'question', 'tip'].includes(s.type) ? s.type : 'answer'
        }))
        .slice(0, 3) // Limit to 3 suggestions

    } catch (error) {
      console.error('Failed to parse Gemini response:', error)
      
      // Fallback: create a single suggestion from the raw text
      return [{
        id: 'fallback-1',
        text: responseText.slice(0, 200) + (responseText.length > 200 ? '...' : ''),
        confidence: 0.5,
        type: 'answer'
      }]
    }
  }

  // Test API key validity
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateSuggestions(
        'Hello, this is a test.',
        'interview',
        'Test resume content',
        { mode: 'interview', answerLen: 50, ttsVoice: 'default', autoType: false }
      )
      return response.suggestions.length > 0
    } catch (error) {
      console.error('Gemini connection test failed:', error)
      return false
    }
  }
}
