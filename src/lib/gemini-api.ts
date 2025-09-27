// Google Gemini API client
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const GEMINI_API_KEY = 'AIzaSyDy96fBgcLLqxlsQPOiN8JFPy11VsLblVQ';

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined.');
}

interface GeminiMessage {
  role: 'user' | 'model' | 'system';
  parts: Array<{ text: string }>;
}

interface GeminiRequest {
  contents: GeminiMessage[];
  generationConfig?: {
    maxOutputTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
  error?: {
    message: string;
  };
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export async function callGemini(messages: GeminiMessage[], temperature = 0.6, maxTokens = 4096): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const contents = messages.map(msg => ({
        role: msg.role === 'system' ? 'user' : msg.role, // Gemini doesn't have a 'system' role directly in generateContent
        parts: msg.parts
      }));

      const requestBody: GeminiRequest = {
        contents,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature
        }
      };

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      if (data.promptFeedback?.blockReason) {
        throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
      }

      const content = data.candidates[0]?.content?.parts[0]?.text;
      if (!content || content.trim() === '') {
        throw new Error('Empty response from AI');
      }

      return content;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY * attempt;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All attempts failed, throw the last error
  throw lastError || new Error('Unknown error occurred');
}

// Enhanced function with better error handling and fallback
export async function callGeminiWithFallback(
  messages: GeminiMessage[], 
  temperature = 0.6, 
  maxTokens = 4096,
  fallbackPrompt?: string
): Promise<string> {
  try {
    return await callGemini(messages, temperature, maxTokens);
  } catch (error) {
    console.error('All attempts to call Gemini API failed:', error);
    
    // If a fallback prompt is provided, use it
    if (fallbackPrompt) {
      console.log('Using fallback response');
      return fallbackPrompt;
    }
    
    // Default fallback response
    return 'Desculpe, estou enfrentando dificuldades técnicas para gerar uma resposta no momento. Por favor, tente novamente em alguns instantes. Se o problema persistir, entre em contato com o suporte.';
  }
}