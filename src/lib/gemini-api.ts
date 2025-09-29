// Google Gemini API client
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDy96fBgcLLqxlsQPOiN8JFPy11VsLblVQ';

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined. Please set the environment variable.');
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
  
  console.log('Calling Gemini API - Attempting...');

  // Validate messages structure
  if (!messages || messages.length === 0) {
    throw new Error('No messages provided for Gemini API call');
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const startTime = Date.now();
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
      console.log(`Gemini API - Attempt ${attempt}: Sending request with body:`, JSON.stringify(requestBody, null, 2));

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify(requestBody)
      });

      const responseTime = Date.now() - startTime;
      console.log(`Gemini API - Attempt ${attempt}: Response received in ${responseTime}ms`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API - Attempt ${attempt}: HTTP error ${response.status}`, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      console.log(`Gemini API - Attempt ${attempt}: Received response data:`, JSON.stringify(data, null, 2));
      
      if (data.error) {
        throw new Error(`Gemini API error: ${data.error.message}`);
      }

      if (data.promptFeedback?.blockReason) {
        throw new Error(`Content blocked by Gemini: ${data.promptFeedback.blockReason}`);
      }

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No candidates returned from Gemini API');
      }

      const content = data.candidates[0]?.content?.parts[0]?.text;
      if (!content || content.trim() === '') {
        throw new Error('Empty response from Gemini AI');
      }
      console.log(`Gemini API - Attempt ${attempt}: Successfully received content (${content.length} characters).`);
      return content;
    } catch (error) {
      lastError = error as Error;
      console.error(`Gemini API - Attempt ${attempt} failed:`, error);
      
      if (attempt < MAX_RETRIES) {
        const jitter = Math.random() * 500; // Add random jitter up to 500ms
        const delay = RETRY_DELAY * attempt + jitter;
        console.log(`Gemini API - Retrying in ${delay.toFixed(0)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All attempts failed, throw the last error
  throw lastError || new Error('Unknown error occurred during Gemini API call');
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
      console.log('Using provided fallback response.');
      return fallbackPrompt;
    }
    
    // Default fallback response
    return 'Desculpe, não consegui gerar uma resposta no momento devido a um problema técnico. Por favor, verifique sua conexão com a internet ou tente novamente mais tarde. Se o problema persistir, entre em contato com o suporte técnico.';
  }
}