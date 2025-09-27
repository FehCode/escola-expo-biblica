'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Send, Loader2, MessageSquare, BookOpen, Lightbulb, Users, 
  History, Save, Trash2, Clock, Star, ChevronDown, ChevronUp,
  Heart, Share2, Download, Settings, Mic, MicOff, Volume2, VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatAIResponse, formatTheologicalResponse } from '@/lib/ai-formatter';
import { sanitizeAndFormatResponse } from '@/lib/ai-sanitizer';
import { formatEnhancedTheologicalResponse } from '@/lib/enhanced-formatter';
import { toast } from '@/hooks/use-toast';
import ChatbotSettings from './ChatbotSettings';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  category?: string;
  isFavorite?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastAccessed: Date;
  category?: string;
}

interface QuickReply {
  id: string;
  text: string;
  category: string;
  icon: any;
  color: string;
}

interface ChatbotProps {
  lms: {
    chatbotHistory: Array<{ role: 'user' | 'bot'; content: string }>;
    addChatMessage: (role: 'user' | 'bot', content: string) => void;
  };
}

export default function EnhancedChatbot({ lms }: ChatbotProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    voiceEnabled: true,
    autoSave: true,
    theme: 'light' as 'light' | 'dark' | 'auto',
    fontSize: 'medium' as 'small' | 'medium' | 'large',
    responseStyle: 'detailed' as 'detailed' | 'concise' | 'academic',
    language: 'pt-BR' as 'pt-BR' | 'en-US' | 'es-ES'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Quick replies for common theological questions
  const quickReplies: QuickReply[] = [
    {
      id: '1',
      text: 'Como interpretar a Bíblia corretamente?',
      category: 'Hermenêutica',
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: '2',
      text: 'O que é a doutrina da Trindade?',
      category: 'Teologia',
      icon: Lightbulb,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: '3',
      text: 'Como aplicar a fé no dia a dia?',
      category: 'Vida Cristã',
      icon: Users,
      color: 'bg-green-100 text-green-800'
    },
    {
      id: '4',
      text: 'Explique a justificação pela fé',
      category: 'Soteriologia',
      icon: Star,
      color: 'bg-amber-100 text-amber-800'
    },
    {
      id: '5',
      text: 'Qual o significado do batismo?',
      category: 'Sacramentos',
      icon: Heart,
      color: 'bg-red-100 text-red-800'
    },
    {
      id: '6',
      text: 'Como orar efetivamente?',
      category: 'Oração',
      icon: MessageSquare,
      color: 'bg-indigo-100 text-indigo-800'
    }
  ];

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('chatbotSessions');
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          lastAccessed: new Date(session.lastAccessed),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setSessions(parsedSessions);
      } catch (error) {
        console.error('Error loading sessions:', error);
      }
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('chatbotSessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [lms.chatbotHistory, currentSession]);

  const generateSessionTitle = (firstMessage: string) => {
    const words = firstMessage.split(' ').slice(0, 5);
    return words.join(' ') + (firstMessage.split(' ').length > 5 ? '...' : '');
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Nova Conversa',
      messages: [],
      createdAt: new Date(),
      lastAccessed: new Date()
    };
    setCurrentSession(newSession);
    setShowHistory(false);
  };

  const saveCurrentSession = () => {
    if (!currentSession || currentSession.messages.length === 0) return;

    const updatedSession = {
      ...currentSession,
      lastAccessed: new Date()
    };

    const existingIndex = sessions.findIndex(s => s.id === currentSession.id);
    if (existingIndex >= 0) {
      const updatedSessions = [...sessions];
      updatedSessions[existingIndex] = updatedSession;
      setSessions(updatedSessions);
    } else {
      setSessions(prev => [updatedSession, ...prev]);
    }

    toast({
      title: "Sessão Salva!",
      description: "Sua conversa foi salva com sucesso.",
    });
  };

  const loadSession = (session: ChatSession) => {
    setCurrentSession(session);
    setShowHistory(false);
    // Update lms history for compatibility
    lms.chatbotHistory.length = 0;
    session.messages.forEach(msg => {
      lms.addChatMessage(msg.role, msg.content);
    });
  };

  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
      lms.chatbotHistory.length = 0;
    }
    toast({
      title: "Sessão Excluída",
      description: "A conversa foi removida com sucesso.",
    });
  };

  const exportSession = (session: ChatSession) => {
    const exportData = {
      title: session.title,
      createdAt: session.createdAt.toISOString(),
      messages: session.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatbot-session-${session.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exportado!",
      description: "Sessão exportada com sucesso.",
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setShowSuggestions(false);
    setShowQuickReplies(false);

    // Add to current session
    if (!currentSession) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: generateSessionTitle(userMessage),
        messages: [],
        createdAt: new Date(),
        lastAccessed: new Date()
      };
      setCurrentSession(newSession);
    }

    const message: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message],
        lastAccessed: new Date()
      } : null);
    }

    lms.addChatMessage('user', userMessage);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          sessionHistory: currentSession?.messages || []
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Use the formatted response directly from API (no additional formatting needed)
      const formattedResponse = data.response;

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: formattedResponse,
        timestamp: new Date(),
        category: 'response'
      };

      if (currentSession) {
        setCurrentSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, botMessage],
          lastAccessed: new Date()
        } : null);
      }

      lms.addChatMessage('bot', formattedResponse);

      // Auto-speak if voice is enabled
      if (voiceEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.8;
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }

    } catch (error) {
      console.error('Error calling chatbot API:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: '<p>Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente mais tarde.</p>',
        timestamp: new Date()
      };

      if (currentSession) {
        setCurrentSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, errorMessage],
          lastAccessed: new Date()
        } : null);
      }

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

  const handleQuickReply = (reply: QuickReply) => {
    setInput(reply.text);
    setShowQuickReplies(false);
  };

  const clearChat = () => {
    lms.chatbotHistory.length = 0;
    setCurrentSession(null);
    setShowSuggestions(true);
    setShowQuickReplies(true);
    setInput('');
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSettingsChange = (newSettings: typeof settings) => {
    setSettings(newSettings);
    setVoiceEnabled(newSettings.voiceEnabled);
    // Save settings to localStorage
    localStorage.setItem('chatbotSettings', JSON.stringify(newSettings));
  };

  const exportData = () => {
    const exportData = {
      settings,
      sessions,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatbot-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Dados Exportados!",
      description: "Todos os dados foram exportados com sucesso.",
    });
  };

  const importData = (data: any) => {
    try {
      if (data.settings) {
        setSettings(data.settings);
        setVoiceEnabled(data.settings.voiceEnabled);
      }
      if (data.sessions) {
        const parsedSessions = data.sessions.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          lastAccessed: new Date(session.lastAccessed),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setSessions(parsedSessions);
      }
      toast({
        title: "Dados Importados!",
        description: "Seus dados foram importados com sucesso.",
      });
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível importar os dados.",
        variant: "destructive",
      });
    }
  };

  const clearAllData = () => {
    setSessions([]);
    setCurrentSession(null);
    lms.chatbotHistory.length = 0;
    localStorage.removeItem('chatbotSessions');
    localStorage.removeItem('chatbotSettings');
    toast({
      title: "Dados Limpos!",
      description: "Todos os dados foram removidos com sucesso.",
    });
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('chatbotSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        setVoiceEnabled(parsedSettings.voiceEnabled);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto fade-in">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <MessageSquare className="h-8 w-8 text-indigo-600" />
          <h2 className="text-3xl font-bold text-slate-800">Converse com Apolo</h2>
        </div>
        <p className="text-slate-600">Seu assistente teológico especializado para dúvidas bíblicas e crescimento espiritual.</p>
      </div>

      <div className="bg-white rounded-lg shadow-xl h-[75vh] flex flex-col">
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
            <div className="flex items-center gap-2">
              <ChatbotSettings
                settings={settings}
                onSettingsChange={handleSettingsChange}
                onExportData={exportData}
                onImportData={importData}
                onClearData={clearAllData}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="text-white hover:bg-white/20"
              >
                <History className="h-4 w-4 mr-1" />
                Histórico
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-white hover:bg-white/20"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            </div>
          </div>
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className="absolute right-4 top-20 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-10 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-800">Histórico de Conversas</h4>
                <Button variant="ghost" size="sm" onClick={createNewSession}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ScrollArea className="h-80">
              {sessions.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  Nenhuma conversa salva
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => loadSession(session)}
                    className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-slate-800 text-sm truncate">
                          {session.title}
                        </h5>
                        <p className="text-xs text-slate-500">
                          {formatDate(session.createdAt)} • {session.messages.length} mensagens
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            exportSession(session);
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => deleteSession(session.id, e)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-grow p-6 space-y-4 overflow-y-auto bg-slate-50" ref={chatContainerRef}>
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

              {/* Quick Replies */}
              {showQuickReplies && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-700 text-center">Respostas Rápidas:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {quickReplies.map((reply) => {
                      const Icon = reply.icon;
                      return (
                        <Card
                          key={reply.id}
                          className="cursor-pointer hover:shadow-md transition-all border-slate-200 hover:border-indigo-300"
                          onClick={() => handleQuickReply(reply)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`p-1 rounded ${reply.color}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {reply.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-700 font-medium">
                              {reply.text}
                            </p>
                          </CardContent>
                        </Card>
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
                <div className="max-w-2xl w-full">
                  <div
                    className={`p-4 rounded-lg ai-formatted-content prose-custom prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-900 prose-em:text-slate-600 ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white prose-headings:text-indigo-100 prose-p:text-indigo-50 prose-strong:text-indigo-50 prose-em:text-indigo-200'
                        : 'bg-white text-slate-800 shadow-sm border border-slate-200'
                    }`}
                    dangerouslySetInnerHTML={{ __html: message.content }}
                  />
                  {currentSession && currentSession.messages[index] && (
                    <div className={`text-xs text-slate-500 mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTime(currentSession.messages[index].timestamp)}
                    </div>
                  )}
                </div>
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
              rows={2}
              disabled={isLoading}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
              {currentSession && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveCurrentSession}
                  className="px-3 py-1"
                >
                  <Save className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500 text-center">
            Pressione Enter para enviar • Apolo responde com base em princípios teológicos reformados
          </div>
        </div>
      </div>
    </div>
  );
}