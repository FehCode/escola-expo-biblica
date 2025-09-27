'use client';

import { useState } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { formatAIResponse } from '@/lib/ai-formatter';
import { sanitizeAndFormatResponse } from '@/lib/ai-sanitizer';

interface AITutorProps {
  lessonId: string;
  lessonTitle: string;
}

export default function AITutor({ lessonId, lessonTitle }: AITutorProps) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{role: 'user' | 'tutor'; content: string}>>([]);

  const handleAskQuestion = async () => {
    if (!question.trim() || isLoading) return;

    const userQuestion = question.trim();
    setQuestion('');
    setIsLoading(true);

    // Add user question to conversation
    setConversation(prev => [...prev, { role: 'user', content: userQuestion }]);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: `Sobre a lição "${lessonTitle}", ${userQuestion}. Por favor, forneça uma resposta detalhada e teologicamente precisa, incluindo contexto bíblico e aplicações práticas quando relevante.` 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add tutor response to conversation
      const sanitizedResponse = sanitizeAndFormatResponse(data.response, 'theological');
      const formattedResponse = formatAIResponse(sanitizedResponse, {
        theme: 'light',
        highlightColor: 'indigo',
        enableEmphasis: true,
        enableColorCoding: true
      });
      setConversation(prev => [...prev, { role: 'tutor', content: formattedResponse }]);
    } catch (error) {
      console.error('Error calling AI tutor:', error);
      setConversation(prev => [...prev, { 
        role: 'tutor', 
        content: '<p class="text-red-600"><strong>⚠️ Erro Temporário</strong></p><p>Desculpe, estou enfrentando dificuldades técnicas para processar sua pergunta no momento. Por favor, tente novamente em alguns instantes.</p><p><strong>Sugestão:</strong> Verifique sua conexão com a internet e tente formular sua pergunta de outra forma.</p>' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-slate-800">Tutor IA</h3>
      </div>
      
      <p className="text-sm text-slate-600 mb-4">
        Tire dúvidas sobre esta lição com nosso assistente de IA especializado em teologia e hermenêutica.
      </p>

      {/* Conversation History */}
      {conversation.length > 0 && (
        <div className="mb-4 space-y-3 max-h-64 overflow-y-auto">
          {conversation.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ai-formatted-content ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
                dangerouslySetInnerHTML={{ __html: msg.content }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua pergunta sobre esta lição..."
          className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          rows={2}
          disabled={isLoading}
        />
        <button
          onClick={handleAskQuestion}
          disabled={!question.trim() || isLoading}
          className="self-end px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {/* Help Text */}
      <div className="mt-2 text-xs text-slate-500">
        💡 <strong>Dica:</strong> Seja específico em sua pergunta para obter respostas mais precisas e relevantes.
      </div>
    </div>
  );
}