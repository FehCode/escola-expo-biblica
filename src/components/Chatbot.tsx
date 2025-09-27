'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare, BookOpen, Lightbulb, Users } from 'lucide-react';
import { formatAIResponse, formatTheologicalResponse } from '@/lib/ai-formatter';
import { sanitizeAndFormatResponse } from '@/lib/ai-sanitizer';

interface ChatbotProps {
  lms: {
    chatbotHistory: Array<{ role: 'user' | 'bot'; content: string }>;
    addChatMessage: (role: 'user' | 'bot', content: string) => void;
  };
}

export default function Chatbot({ lms }: ChatbotProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [lms.chatbotHistory]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setShowSuggestions(false);
    lms.addChatMessage('user', userMessage);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Format the AI response with enhanced styling
      const sanitizedResponse = sanitizeAndFormatResponse(data.response, 'theological');
      const formattedResponse = formatTheologicalResponse(sanitizedResponse, {
        theme: 'light',
        highlightColor: 'purple',
        enableEmphasis: true,
        enableColorCoding: true
      });

      lms.addChatMessage('bot', formattedResponse);
    } catch (error) {
      console.error('Error calling chatbot API:', error);
      lms.addChatMessage('bot', '<p>Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente mais tarde.</p>');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };

  const clearChat = () => {
    lms.chatbotHistory.length = 0;
    setShowSuggestions(true);
    setInput('');
  };

  const suggestionCategories = [
    {
      icon: BookOpen,
      title: 'Estudo Bíblico',
      questions: [
        'Como interpretar corretamente a parábola do semeador?',
        'Qual o significado da justificação pela fé em Romanos?',
        'Explique o conceito de santificação prática'
      ]
    },
    {
      icon: Lightbulb,
      title: 'Teologia',
      questions: [
        'Qual a diferença entre Calvinismo e Arminianismo?',
        'O que é a doutrina da Trindade?',
        'Explique os cinco solas da Reforma Protestante'
      ]
    },
    {
      icon: Users,
      title: 'Vida Cristã',
      questions: [
        'Como aplicar os ensinamentos de Jesus no trabalho?',
        'Qual a importância da oração diária?',
        'Como lidar com dúvidas na fé cristã?'
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto fade-in">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <MessageSquare className="h-8 w-8 text-indigo-600" />
          <h2 className="text-3xl font-bold text-slate-800">Converse com Apolo</h2>
        </div>
        <p className="text-slate-600">Seu assistente teológico especializado para dúvidas bíblicas e crescimento espiritual.</p>
      </div>

      <div className="bg-white rounded-lg shadow-xl h-[70vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Apolo - Assistente Teológico</h3>
                <p className="text-sm text-indigo-100">Especialista em hermenêutica e teologia reformada</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md text-sm transition-colors"
            >
              Limpar Conversa
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-grow p-6 space-y-4 overflow-y-auto bg-slate-50">
          {lms.chatbotHistory.length === 0 ? (
            <div className="space-y-6">
              {/* Welcome Message */}
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Bem-vindo à conversa com Apolo!</h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  Estou aqui para ajudar você com dúvidas bíblicas, teológicas e orientação espiritual. 
                  Como posso servir-lhe hoje?
                </p>
              </div>

              {/* Suggestions */}
              {showSuggestions && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-700 text-center">Sugestões para começar:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {suggestionCategories.map((category, index) => {
                      const Icon = category.icon;
                      return (
                        <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Icon className="h-5 w-5 text-indigo-600" />
                            <h5 className="font-medium text-slate-800">{category.title}</h5>
                          </div>
                          <div className="space-y-2">
                            {category.questions.map((question, qIndex) => (
                              <button
                                key={qIndex}
                                onClick={() => handleSuggestionClick(question)}
                                className="block w-full text-left text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded transition-colors"
                              >
                                {question}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            lms.chatbotHistory.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-4 rounded-lg max-w-2xl ai-formatted-content prose-custom prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-900 prose-em:text-slate-600 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white prose-headings:text-indigo-100 prose-p:text-indigo-50 prose-strong:text-indigo-50 prose-em:text-indigo-200'
                      : 'bg-white text-slate-800 shadow-sm border border-slate-200'
                  }`}
                  dangerouslySetInnerHTML={{ __html: message.content }}
                />
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 max-w-lg flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-slate-600">Apolo está preparando sua resposta...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Container */}
        <div className="p-4 bg-white border-t border-slate-200 rounded-b-lg">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua pergunta teológica ou bíblica..."
              className="flex-grow px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows={3}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 transition-all self-end"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="mt-2 text-xs text-slate-500 text-center">
            Pressione Enter para enviar • Apolo responde com base em princípios teológicos reformados
          </div>
        </div>
      </div>
    </div>
  );
}