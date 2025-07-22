const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;
let model;

const initializeGemini = () => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Initialize the model with safety settings
    model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    });

    console.log('✅ Gemini AI initialized successfully');
  } catch (error) {
    console.error('❌ Gemini AI initialization error:', error);
    process.exit(1);
  }
};

// System prompts for different personalities
const SYSTEM_PROMPTS = {
  helpful: `You are Rehbar AI, a helpful and friendly AI assistant. You provide accurate, concise, and useful responses. You're knowledgeable about a wide range of topics and always try to be helpful while maintaining a professional yet warm tone.`,
  
  creative: `You are Rehbar AI, a creative and imaginative AI assistant. You approach problems with creativity and think outside the box. You're great at brainstorming, creative writing, and helping users explore new ideas and perspectives.`,
  
  professional: `You are Rehbar AI, a professional AI assistant designed for business and work environments. You provide clear, structured, and professional responses. You're excellent at helping with work-related tasks, analysis, and professional communication.`,
  
  casual: `You are Rehbar AI, a casual and friendly AI assistant. You communicate in a relaxed, conversational manner while still being helpful and informative. You use a more informal tone and can engage in light conversation.`,
  
  technical: `You are Rehbar AI, a technical AI assistant with expertise in technology, programming, and technical subjects. You provide detailed technical explanations, code examples, and help with technical problem-solving.`
};

// Generate AI response
const generateResponse = async (prompt, personality = 'helpful', conversationHistory = []) => {
  try {
    if (!model) {
      throw new Error('Gemini model not initialized');
    }

    // Build conversation context
    let fullPrompt = SYSTEM_PROMPTS[personality] || SYSTEM_PROMPTS.helpful;
    
    // Add conversation history for context
    if (conversationHistory.length > 0) {
      fullPrompt += '\n\nConversation History:\n';
      conversationHistory.slice(-10).forEach((msg, index) => {
        fullPrompt += `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    }
    
    fullPrompt += `\n\nUser: ${prompt}\nAssistant:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      response: text,
      tokensUsed: response.usageMetadata?.totalTokenCount || 0
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Handle specific Gemini API errors
    if (error.message?.includes('SAFETY')) {
      return {
        success: false,
        error: 'Content blocked by safety filters',
        response: "I'm sorry, but I can't provide a response to that request due to safety guidelines."
      };
    }
    
    if (error.message?.includes('QUOTA_EXCEEDED')) {
      return {
        success: false,
        error: 'API quota exceeded',
        response: "I'm currently experiencing high demand. Please try again in a moment."
      };
    }
    
    return {
      success: false,
      error: error.message || 'Failed to generate response',
      response: "I'm sorry, I'm having trouble processing your request right now. Please try again."
    };
  }
};

// Generate streaming response
const generateStreamingResponse = async (prompt, personality = 'helpful', conversationHistory = []) => {
  try {
    if (!model) {
      throw new Error('Gemini model not initialized');
    }

    // Build conversation context
    let fullPrompt = SYSTEM_PROMPTS[personality] || SYSTEM_PROMPTS.helpful;
    
    if (conversationHistory.length > 0) {
      fullPrompt += '\n\nConversation History:\n';
      conversationHistory.slice(-10).forEach((msg, index) => {
        fullPrompt += `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    }
    
    fullPrompt += `\n\nUser: ${prompt}\nAssistant:`;

    const result = await model.generateContentStream(fullPrompt);
    return result.stream;
  } catch (error) {
    console.error('Error generating streaming response:', error);
    throw error;
  }
};

// Analyze text for intent and entities
const analyzeIntent = async (text) => {
  try {
    const prompt = `Analyze the following user message and extract:
1. Primary intent (question, request, command, conversation, etc.)
2. Key entities (names, dates, locations, etc.)
3. Sentiment (positive, negative, neutral)
4. Urgency level (low, medium, high)

User message: "${text}"

Respond in JSON format:
{
  "intent": "primary intent",
  "entities": ["entity1", "entity2"],
  "sentiment": "sentiment",
  "urgency": "urgency level",
  "confidence": 0.95
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text_response = response.text();
    
    try {
      return JSON.parse(text_response);
    } catch (parseError) {
      return {
        intent: 'unknown',
        entities: [],
        sentiment: 'neutral',
        urgency: 'low',
        confidence: 0.5
      };
    }
  } catch (error) {
    console.error('Error analyzing intent:', error);
    return {
      intent: 'unknown',
      entities: [],
      sentiment: 'neutral',
      urgency: 'low',
      confidence: 0.0
    };
  }
};

// Generate conversation summary
const generateSummary = async (messages) => {
  try {
    if (!messages || messages.length === 0) {
      return 'Empty conversation';
    }

    const conversationText = messages.map(msg => 
      `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    const prompt = `Summarize the following conversation in 2-3 sentences, highlighting the main topics discussed and any important outcomes:

${conversationText}

Summary:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Unable to generate summary';
  }
};

// Generate conversation title
const generateTitle = async (firstMessage) => {
  try {
    const prompt = `Generate a short, descriptive title (3-6 words) for a conversation that starts with this message:

"${firstMessage}"

Title:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim().replace(/['"]/g, '');
  } catch (error) {
    console.error('Error generating title:', error);
    return 'New Conversation';
  }
};

// Check if content is appropriate
const moderateContent = async (content) => {
  try {
    const prompt = `Analyze the following content for appropriateness. Check for:
1. Harmful or offensive language
2. Inappropriate requests
3. Spam or nonsensical content
4. Privacy violations

Content: "${content}"

Respond with JSON:
{
  "appropriate": true/false,
  "reason": "explanation if inappropriate",
  "severity": "low/medium/high"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text_response = response.text();
    
    try {
      return JSON.parse(text_response);
    } catch (parseError) {
      return {
        appropriate: true,
        reason: '',
        severity: 'low'
      };
    }
  } catch (error) {
    console.error('Error moderating content:', error);
    return {
      appropriate: true,
      reason: '',
      severity: 'low'
    };
  }
};

// Get available personalities
const getPersonalities = () => {
  return Object.keys(SYSTEM_PROMPTS).map(key => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    description: SYSTEM_PROMPTS[key].split('.')[0] + '.'
  }));
};

module.exports = {
  initializeGemini,
  generateResponse,
  generateStreamingResponse,
  analyzeIntent,
  generateSummary,
  generateTitle,
  moderateContent,
  getPersonalities,
  model
};
