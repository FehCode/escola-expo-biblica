// Z.AI Open Platform API client
const ZAI_API_URL = 'https://api.z.ai/api/paas/v4/chat/completions';
const ZAI_API_KEY = process.env.ZAI_API_KEY;

if (!ZAI_API_KEY) {
  throw new Error('ZAI_API_KEY is not defined in environment variables.');
}

interface ZAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ZAIRequest {
  model: string;
  messages: ZAIMessage[];
  thinking?: {
    type: 'enabled' | 'disabled';
  };
  max_tokens: number;
  temperature: number;
}

interface ZAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: string;
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export async function callZAI(messages: ZAIMessage[], temperature = 0.6, maxTokens = 4096): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const requestBody: ZAIRequest = {
        model: 'glm-4.5',
        messages,
        thinking: {
          type: 'enabled'
        },
        max_tokens: maxTokens,
        temperature
      };

      const response = await fetch(ZAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': ZAI_API_KEY
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data: ZAIResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const content = data.choices[0]?.message?.content;
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
export async function callZAIWithFallback(
  messages: ZAIMessage[], 
  temperature = 0.6, 
  maxTokens = 4096,
  fallbackPrompt?: string
): Promise<string> {
  try {
    return await callZAI(messages, temperature, maxTokens);
  } catch (error) {
    console.error('All attempts to call ZAI API failed:', error);
    
    // If a fallback prompt is provided, use it
    if (fallbackPrompt) {
      console.log('Using fallback response');
      return fallbackPrompt;
    }
    
    // Default fallback response
    return 'Desculpe, estou enfrentando dificuldades técnicas para gerar uma resposta no momento. Por favor, tente novamente em alguns instantes. Se o problema persistir, entre em contato com o suporte.';
  }
}