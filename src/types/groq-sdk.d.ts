declare module 'groq-sdk' {
  export interface GroqMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }

  export interface GroqCompletionResponse {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  }

  export interface GroqChatCompletions {
    create(request: {
      model: string;
      messages: GroqMessage[];
      temperature?: number;
      max_output_tokens?: number;
    }): Promise<GroqCompletionResponse>;
  }

  export interface GroqClient {
    chat: {
      completions: GroqChatCompletions;
    };
  }

  export default class Groq implements GroqClient {
    constructor(config?: { apiKey?: string });
    chat: GroqClient['chat'];
  }
}
