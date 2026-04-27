import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is not defined. Please set the environment variable.');
}

const groq: any = new Groq({ apiKey: GROQ_API_KEY });

interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GroqCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export async function callGroq(messages: GroqMessage[], temperature = 0.6, maxTokens = 4096): Promise<string> {
  let lastError: Error | null = null;
  
  console.log('Calling Groq API - Attempting...');

  if (!messages || messages.length === 0) {
    throw new Error('No messages provided for Groq API call');
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const startTime = Date.now();
    try {
      // Groq uses standard chat messages with content text

      const requestBody = {
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature,
        max_output_tokens: maxTokens
      };
      console.log(`Groq API - Attempt ${attempt}: Sending request with body:`, JSON.stringify(requestBody, null, 2));

      const response: GroqCompletionResponse = await groq.chat.completions.create(requestBody);

      const responseTime = Date.now() - startTime;
      console.log(`Groq API - Attempt ${attempt}: Response received in ${responseTime}ms`);

      console.log(`Groq API - Attempt ${attempt}: Received response data:`, JSON.stringify(response, null, 2));

      const content = response?.choices?.[0]?.message?.content;
      if (!content || content.trim() === '') {
        throw new Error('Empty response from Groq AI');
      }
      console.log(`Groq API - Attempt ${attempt}: Successfully received content (${content.length} characters).`);
      return content;
    } catch (error) {
      lastError = error as Error;
      console.error(`Groq API - Attempt ${attempt} failed:`, error);
      
      if (attempt < MAX_RETRIES) {
        const jitter = Math.random() * 500; // Add random jitter up to 500ms
        const delay = RETRY_DELAY * attempt + jitter;
        console.log(`Groq API - Retrying in ${delay.toFixed(0)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All attempts failed, throw the last error
  throw lastError || new Error('Unknown error occurred during Groq API call');
}

// Enhanced function with better error handling and fallback
export async function callGroqWithFallback(
  messages: GroqMessage[],
  temperature = 0.6,
  maxTokens = 4096,
  fallbackPrompt?: string
): Promise<string> {
  try {
    return await callGroq(messages, temperature, maxTokens);
  } catch (error) {
    console.error('All attempts to call Groq API failed:', error);
    
    // If a fallback prompt is provided, use it
    if (fallbackPrompt) {
      console.log('Using provided fallback response.');
      return fallbackPrompt;
    }
    
    // Default fallback response
    return 'Desculpe, não consegui gerar uma resposta no momento devido a um problema técnico. Por favor, verifique sua conexão com a internet ou tente novamente mais tarde. Se o problema persistir, entre em contato com o suporte técnico.';
  }
}
