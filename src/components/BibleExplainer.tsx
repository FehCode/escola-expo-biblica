'use client';

import { useState, useRef, useEffect } from 'react';
import { BookOpen, Loader2, Copy, Save, MessageSquare, Download, Share2, RefreshCw, Volume2, VolumeX, History, Star, Heart, Lightbulb, Users, Globe, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { formatAIResponse, formatTheologicalResponse, formatHistoricalResponse, formatPracticalResponse } from '@/lib/ai-formatter';
import { sanitizeAndFormatResponse } from '@/lib/ai-sanitizer';

interface ExplanationSection {
  title: string;
  content: string;
  icon: string;
}

interface BibleExplanation {
  originalText: string;
  context: string;
  theologicalMeaning: string;
  practicalApplication: string;
  biblicalConnections: string;
  keyThemes: string[];
  reflectionQuestions: string[];
  languageAnalysis?: string;
  culturalBackground?: string;
  christologicalFocus?: string;
  applicationSteps?: string[];
  relatedPassages?: string[];
  difficultyLevel: 'iniciante' | 'intermediário' | 'avançado';
  estimatedReadTime: number;
  tags: string[];
}

export default function BibleExplainer() {
  const [input, setInput] = useState('');
  const [explanation, setExplanation] = useState<BibleExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedExplanations, setSavedExplanations] = useState<BibleExplanation[]>([]);
  const [analysisDepth, setAnalysisDepth] = useState<'básico' | 'completo' | 'avançado'>('completo');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('pt');
  const [favorites, setFavorites] = useState<string[]>([]);
  const explanationRef = useRef<HTMLDivElement>(null);

  const scrollToExplanation = () => {
    explanationRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (explanation) {
      scrollToExplanation();
    }
  }, [explanation]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast({
          title: "Copiado!",
          description: `${label} foi copiado para a área de transferência.`,
        });
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          toast({
            title: "Copiado!",
            description: `${label} foi copiado para a área de transferência.`,
          });
        } catch (err) {
          console.error('Fallback copy failed:', err);
          toast({
            title: "Erro",
            description: "Não foi possível copiar o texto. Por favor, copie manualmente.",
            variant: "destructive",
          });
        }
        
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      toast({
        title: "Erro",
        description: "Não foi possível copiar o texto. Por favor, copie manualmente.",
        variant: "destructive",
      });
    }
  };

  const saveExplanation = () => {
    if (explanation) {
      setSavedExplanations(prev => [explanation, ...prev.slice(0, 9)]); // Keep last 10
      toast({
        title: "Salvo!",
        description: "Explicação salva no seu histórico.",
      });
    }
  };

  const toggleFavorite = (text: string) => {
    if (favorites.includes(text)) {
      setFavorites(prev => prev.filter(fav => fav !== text));
      toast({
        title: "Removido dos favoritos",
        description: "Texto removido dos seus favoritos.",
      });
    } else {
      setFavorites(prev => [...prev, text]);
      toast({
        title: "Adicionado aos favoritos!",
        description: "Texto adicionado aos seus favoritos.",
      });
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = selectedLanguage;
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    } else {
      toast({
        title: "Não suportado",
        description: "Seu navegador não suporta síntese de voz.",
        variant: "destructive",
      });
    }
  };

  const shareExplanation = async () => {
    if (explanation) {
      const shareData = {
        title: `Análise Bíblica: ${explanation.originalText.substring(0, 50)}...`,
        text: `Análise bíblica gerada por IA: ${explanation.originalText}`,
        url: window.location.href
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`);
          toast({
            title: "Copiado!",
            description: "Link copiado para a área de transferência.",
          });
        }
      } catch (error) {
        console.error('Error sharing:', error);
        toast({
          title: "Erro",
          description: "Não foi possível compartilhar. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleExplain = async () => {
    if (!input.trim() || isLoading) return;

    const biblicalText = input.trim();
    setInput('');
    setIsLoading(true);
    setExplanation(null);

    try {
      const response = await fetch('/api/bible-explainer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: biblicalText,
          depth: analysisDepth,
          language: selectedLanguage
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get explanation');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Títulos alternativos para maior robustez
      const context = extractSection(data.explanation, 'Contexto Histórico e Cultural')
        || extractSection(data.explanation, 'Contexto')
        || extractSection(data.explanation, 'Histórico')
        || extractSection(data.explanation, 'História')
        || 'Contexto não identificado. Tente reformular sua pergunta.';
      const theologicalMeaning = extractSection(data.explanation, 'Significado Teológico')
        || extractSection(data.explanation, 'Teologia')
        || extractSection(data.explanation, 'Significado')
        || 'Significado teológico não identificado.';
      const practicalApplication = extractSection(data.explanation, 'Aplicações Práticas')
        || extractSection(data.explanation, 'Aplicação')
        || extractSection(data.explanation, 'Aplicações')
        || 'Aplicação prática não identificada.';
      const biblicalConnections = extractSection(data.explanation, 'Conexões Bíblicas')
        || extractSection(data.explanation, 'Conexões')
        || extractSection(data.explanation, 'Relacionamentos')
        || 'Conexões bíblicas não identificadas.';

      // Fallbacks para arrays
      const keyThemes = extractKeyThemes(data.explanation);
      const reflectionQuestions = extractQuestions(data.explanation);

      // Se todos os campos principais vierem vazios, alerta o usuário
      if (!context && !theologicalMeaning && !practicalApplication && !biblicalConnections) {
        toast({
          title: "Atenção",
          description: "A resposta da IA veio incompleta. Tente novamente ou reformule sua pergunta para obter uma análise mais detalhada.",
          variant: "destructive",
        });
      }

      const parsedExplanation: BibleExplanation = {
        originalText: biblicalText,
        context,
        theologicalMeaning,
        practicalApplication,
        biblicalConnections,
        keyThemes: keyThemes.length > 0 ? keyThemes : ['Nenhum tema principal identificado.'],
        reflectionQuestions: reflectionQuestions.length > 0 ? reflectionQuestions : ['Nenhuma questão de reflexão identificada.'],
        languageAnalysis: extractSection(data.explanation, 'Análise Linguística') || extractSection(data.explanation, 'Linguagem') || '',
        culturalBackground: extractSection(data.explanation, 'Contexto Cultural') || extractSection(data.explanation, 'Cultura') || '',
        christologicalFocus: extractSection(data.explanation, 'Foco Cristológico') || extractSection(data.explanation, 'Cristo') || '',
        applicationSteps: extractApplicationSteps(data.explanation),
        relatedPassages: extractRelatedPassages(data.explanation),
        difficultyLevel: extractDifficultyLevel(data.explanation) || 'intermediário',
        estimatedReadTime: Math.ceil(biblicalText.length / 50),
        tags: extractTags(data.explanation)
      };

      setExplanation(parsedExplanation);
    } catch (error) {
      // Log detalhado
      console.error('Erro ao chamar a API do explicador bíblico:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar seu texto. Por favor, tente novamente. Se o erro persistir, tente reformular sua pergunta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractSection = (text: string, sectionTitle: string): string => {
    const patterns = [
      new RegExp(`\\*\\*${sectionTitle}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\n\\*\\*|$)`, 'i'),
      new RegExp(`\\*\\*${sectionTitle}\\*\\*\\s*([\\s\\S]*?)(?=\\n\\n\\*\\*|$)`, 'i'),
      new RegExp(`${sectionTitle}:\\s*([\\s\\S]*?)(?=\\n\\n[A-Z]|$)`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return sanitizeAndFormatResponse(match[1].trim(), 'theological');
      }
    }
    return '';
  };

  const extractKeyThemes = (text: string): string[] => {
    const themesMatch = text.match(/(?:Temas|Principais Temas|Pontos Principais):\s*([\s\S]*?)(?=\n\n|$)/i);
    if (themesMatch) {
      return themesMatch[1].split(/[-•]\s*/).filter(theme => theme.trim().length > 0).map(theme => sanitizeAndFormatResponse(theme.trim(), 'theological'));
    }
    return [];
  };

  const extractQuestions = (text: string): string[] => {
    const questionsMatch = text.match(/(?:Questões|Perguntas|Para Reflexão):\s*([\s\S]*?)(?=\n\n|$)/i);
    if (questionsMatch) {
      return questionsMatch[1].split(/\d+\.\s*/).filter(q => q.trim().length > 0).map(q => sanitizeAndFormatResponse(q.trim(), 'theological'));
    }
    return [];
  };

  const extractApplicationSteps = (text: string): string[] => {
    const stepsMatch = text.match(/(?:Passos|Etapas|Aplicação|Passos Práticos):\s*([\s\S]*?)(?=\n\n|$)/i);
    if (stepsMatch) {
      return stepsMatch[1].split(/\d+\.\s*/).filter(step => step.trim().length > 0).map(step => sanitizeAndFormatResponse(step.trim(), 'practical'));
    }
    return [];
  };

  const extractRelatedPassages = (text: string): string[] => {
    const passagesMatch = text.match(/(?:Passagens|Referências|Textos Relacionados):\s*([\s\S]*?)(?=\n\n|$)/i);
    if (passagesMatch) {
      return passagesMatch[1].split(/[,;]\s*/).filter(passage => passage.trim().length > 0).map(passage => sanitizeAndFormatResponse(passage.trim(), 'theological'));
    }
    return [];
  };

  const extractDifficultyLevel = (text: string): 'iniciante' | 'intermediário' | 'avançado' | null => {
    const difficultyMatch = text.match(/(?:Dificuldade|Nível|Complexidade):\s*(iniciante|intermediário|avançado)/i);
    if (difficultyMatch) {
      return difficultyMatch[1].toLowerCase() as 'iniciante' | 'intermediário' | 'avançado';
    }
    return null;
  };

  const extractTags = (text: string): string[] => {
    const tagsMatch = text.match(/(?:Tags|Palavras-chave|Etiquetas):\s*([\s\S]*?)(?=\n\n|$)/i);
    if (tagsMatch) {
      return tagsMatch[1].split(/[,;]\s*/).filter(tag => tag.trim().length > 0).map(tag => sanitizeAndFormatResponse(tag.trim(), 'general'));
    }
    return [];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleExplain();
    }
  };

  const exampleTexts = [
    {
      text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna. (João 3:16)",
      category: "Salvação",
      difficulty: "iniciante"
    },
    {
      text: "Toda a Escritura é inspirada por Deus e útil para o ensino, para a repreensão, para a correção, para a educação na justiça. (2 Timóteo 3:16)",
      category: "Autoridade Bíblica",
      difficulty: "intermediário"
    },
    {
      text: "Eu sou o caminho, a verdade e a vida. Ninguém vem ao Pai senão por mim. (João 14:6)",
      category: "Cristologia",
      difficulty: "iniciante"
    },
    {
      text: "Portanto, ide, fazei discípulos de todas as nações, batizando-os em nome do Pai, e do Filho, e do Espírito Santo. (Mateus 28:19)",
      category: "Grande Comissão",
      difficulty: "intermediário"
    },
    {
      text: "Mas o fruto do Espírito é: amor, alegria, paz, longanimidade, benignidade, bondade, fidelidade, mansidão, domínio próprio. (Gálatas 5:22-23)",
      category: "Vida no Espírito",
      difficulty: "avançado"
    }
  ];

  return (
    <div className="mt-12 bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-xl p-8 border border-slate-200/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
              Explicador Bíblico com IA
            </h3>
            <p className="text-slate-600 text-sm mt-1">Análise profunda e contextualizada das Escrituras Sagradas</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {savedExplanations.length > 0 && (
            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-md">
              {savedExplanations.length} salvo{savedExplanations.length !== 1 ? 's' : ''}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="border-slate-300 hover:bg-slate-50"
          >
            <History className="h-4 w-4 mr-2" />
            Histórico
          </Button>
        </div>
      </div>
      
      {/* Configurações e Opções */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Profundidade:</span>
          <Select value={analysisDepth} onValueChange={(value: 'básico' | 'completo' | 'avançado') => setAnalysisDepth(value)}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="básico">Básico</SelectItem>
              <SelectItem value="completo">Completo</SelectItem>
              <SelectItem value="avançado">Avançado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Idioma:</span>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt">PT</SelectItem>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="es">ES</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-slate-500" />
          <span className="text-xs text-slate-600">
            {analysisDepth === 'básico' ? 'Análise rápida e direta' : 
             analysisDepth === 'completo' ? 'Análise completa e detalhada' : 
             'Análise acadêmica e profunda'}
          </span>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-grow">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Cole ou digite um texto bíblico aqui para uma análise profunda..."
              className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all bg-white/80 backdrop-blur-sm text-slate-700 placeholder-slate-400"
              rows={6}
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleExplain}
              disabled={!input.trim() || isLoading}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium shadow-lg hover:shadow-xl transition-all h-fit"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Explicar
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('')}
              disabled={!input.trim()}
              className="h-fit px-4 py-3 border-slate-300 hover:bg-slate-50 transition-all"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Histórico de Explicações */}
        {showHistory && savedExplanations.length > 0 && (
          <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200/50 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Análises
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {savedExplanations.map((explanation, index) => (
                  <div
                    key={index}
                    onClick={() => setInput(explanation.originalText)}
                    className="block w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-slate-700 group-hover:text-indigo-700 transition-colors text-sm leading-relaxed line-clamp-2">
                          {explanation.originalText}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {explanation.difficultyLevel}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {explanation.estimatedReadTime} min
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(explanation.originalText);
                        }}
                        className="p-1 h-auto"
                      >
                        <Heart className={`h-4 w-4 ${favorites.includes(explanation.originalText) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!explanation && !isLoading && (
          <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200/50 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Exemplos de textos para explicar:
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exampleTexts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(example.text)}
                    className="block w-full text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs border-indigo-200 text-indigo-700">
                            {example.category}
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              example.difficulty === 'iniciante' ? 'bg-green-100 text-green-800' :
                              example.difficulty === 'intermediário' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {example.difficulty}
                          </Badge>
                        </div>
                        <p className="text-slate-700 group-hover:text-indigo-700 transition-colors leading-relaxed">
                          {example.text}
                        </p>
                      </div>
                      <span className="text-indigo-600 font-medium text-sm mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        {index + 1}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg">
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                  <div className="absolute inset-0 rounded-full bg-indigo-200 opacity-20 animate-pulse"></div>
                </div>
                <div className="text-center space-y-2">
                  <span className="text-slate-700 font-semibold text-lg">Analisando texto bíblico...</span>
                  <span className="text-slate-500 text-sm">Estamos preparando uma análise completa para você</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {explanation && (
          <div ref={explanationRef} className="space-y-6">
            <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white shadow-lg">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-indigo-900 mb-3 flex items-center gap-2">
                      <span className="text-2xl">📖</span>
                      Texto Analisado
                    </CardTitle>
                    <CardDescription className="text-indigo-700 italic text-base leading-relaxed bg-indigo-100/50 p-4 rounded-lg border border-indigo-200">
                      "{explanation.originalText}"
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(explanation.originalText, "Texto bíblico")}
                      className="px-4 py-2 border-indigo-300 hover:bg-indigo-50 transition-all"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveExplanation}
                      className="px-4 py-2 border-indigo-300 hover:bg-indigo-50 transition-all"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Tabs defaultValue="context" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-12 bg-slate-100 p-1 rounded-lg">
                <TabsTrigger value="context" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
                  📚 Contexto
                </TabsTrigger>
                <TabsTrigger value="theology" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
                  ⛪ Teologia
                </TabsTrigger>
                <TabsTrigger value="application" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
                  🎯 Aplicação
                </TabsTrigger>
                <TabsTrigger value="connections" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
                  🔗 Conexões
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="context" className="mt-6">
                <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-white shadow-md">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-indigo-800 text-lg font-semibold">
                      <span className="text-2xl">📚</span>
                      Contexto Histórico e Cultural
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="text-slate-700 leading-relaxed text-base ai-formatted-content"
                      dangerouslySetInnerHTML={{
                        __html: formatHistoricalResponse(
                          explanation.context && explanation.context.trim().startsWith('<')
                            ? explanation.context
                            : `<p>${explanation.context || 'Contexto histórico e cultural do texto está sendo analisado...'}</p>`,
                          {
                            theme: 'light',
                            highlightColor: 'amber',
                            enableEmphasis: true,
                            enableColorCoding: true
                          }
                        )
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="theology" className="mt-6">
                <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white shadow-md">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-purple-800 text-lg font-semibold">
                      <span className="text-2xl">⛪</span>
                      Significado Teológico
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="text-slate-700 leading-relaxed text-base ai-formatted-content"
                      dangerouslySetInnerHTML={{
                        __html: formatTheologicalResponse(
                          explanation.theologicalMeaning && explanation.theologicalMeaning.trim().startsWith('<')
                            ? explanation.theologicalMeaning
                            : `<p>${explanation.theologicalMeaning || 'O significado teológico está sendo elaborado...'}</p>`,
                          {
                            theme: 'light',
                            highlightColor: 'purple',
                            enableEmphasis: true,
                            enableColorCoding: true
                          }
                        )
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="application" className="mt-6">
                <Card className="border-green-100 bg-gradient-to-br from-green-50 to-white shadow-md">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-green-800 text-lg font-semibold">
                      <span className="text-2xl">🎯</span>
                      Aplicações Práticas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="text-slate-700 leading-relaxed text-base ai-formatted-content"
                      dangerouslySetInnerHTML={{
                        __html: formatPracticalResponse(
                          explanation.practicalApplication && explanation.practicalApplication.trim().startsWith('<')
                            ? explanation.practicalApplication
                            : `<p>${explanation.practicalApplication || 'As aplicações práticas estão sendo desenvolvidas...'}</p>`,
                          {
                            theme: 'light',
                            highlightColor: 'green',
                            enableEmphasis: true,
                            enableColorCoding: true
                          }
                        )
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="connections" className="mt-6">
                <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-white shadow-md">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-amber-800 text-lg font-semibold">
                      <span className="text-2xl">🔗</span>
                      Conexões Bíblicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="text-slate-700 leading-relaxed text-base ai-formatted-content"
                      dangerouslySetInnerHTML={{
                        __html: formatAIResponse(
                          explanation.biblicalConnections && explanation.biblicalConnections.trim().startsWith('<')
                            ? explanation.biblicalConnections
                            : `<p>${explanation.biblicalConnections || 'As conexões com outras partes da Bíblia estão sendo identificadas...'}</p>`,
                          {
                            theme: 'light',
                            highlightColor: 'indigo',
                            enableEmphasis: true,
                            enableColorCoding: true
                          }
                        )
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {(explanation.keyThemes.length > 0 || explanation.reflectionQuestions.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {explanation.keyThemes.length > 0 && (
                  <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-amber-800 text-lg font-semibold">
                        <span className="text-2xl">🔑</span>
                        Temas Principais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {explanation.keyThemes.map((theme, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-amber-100/50 rounded-lg">
                            <span className="w-3 h-3 bg-amber-600 rounded-full mt-2 flex-shrink-0 shadow-sm" />
                            <span className="text-amber-800 text-sm leading-relaxed">{theme}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {explanation.reflectionQuestions.length > 0 && (
                  <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-green-800 text-lg font-semibold">
                        <span className="text-2xl">💭</span>
                        Para Reflexão
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {explanation.reflectionQuestions.map((question, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-green-100/50 rounded-lg">
                            <span className="text-green-600 font-semibold text-sm mt-0.5 min-w-[20px]">{index + 1}.</span>
                            <span className="text-green-800 text-sm leading-relaxed">{question}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}