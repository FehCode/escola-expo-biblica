'use client';

import { useState, useRef, useEffect } from 'react';
import { BookOpen, Lightbulb, Loader2, Save, Download, Calendar, Target, Clock, Star, CheckCircle, Play, Users, Award, TrendingUp, BookMarked, FileText, Share2, RefreshCw, Volume2, VolumeX, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { sanitizeAndFormatResponse } from '@/lib/ai-sanitizer';

interface StudyDay {
  day: number;
  title: string;
  description: string;
  scriptureReferences: string[];
  keyPoints: string[];
  reflectionQuestions: string[];
  memoryVerse?: string;
  prayerFocus?: string;
  practicalExercises?: string[];
  additionalResources?: string[];
  estimatedTime: number; // em minutos
  difficulty: 'fácil' | 'médio' | 'difícil';
  tags: string[];
  isCompleted?: boolean;
  notes?: string;
}

interface StudyPlan {
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  overallObjective: string;
  dailyBreakdown: StudyDay[];
  keyThemes: string[];
  recommendedResources: string[];
  assessmentMethod: string;
  learningObjectives: string[];
  targetAudience: string;
  prerequisites?: string[];
  scheduleType: 'flexível' | 'estruturado' | 'intensivo';
  totalEstimatedHours: number;
  certificates?: boolean;
  communityFeatures?: boolean;
  progressTracking?: boolean;
  createdAt: Date;
  lastAccessed?: Date;
}

export default function StudyGenerator() {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('7');
  const [difficulty, setDifficulty] = useState('iniciante');
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedPlans, setSavedPlans] = useState<StudyPlan[]>([]);
  const [activeDay, setActiveDay] = useState(0);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);
  
  // Novos estados para funcionalidades avançadas
  const [scheduleType, setScheduleType] = useState<'flexível' | 'estruturado' | 'intensivo'>('flexível');
  const [includeCommunity, setIncludeCommunity] = useState(false);
  const [includeCertificate, setIncludeCertificate] = useState(false);
  const [includeProgressTracking, setIncludeProgressTracking] = useState(true);
  const [targetAudience, setTargetAudience] = useState('geral');
  const [customNotes, setCustomNotes] = useState<{[key: number]: string}>({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const scrollToResult = () => {
    resultRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const studyTemplates = [
    {
      id: 'basico',
      name: 'Plano Básico',
      description: 'Estudo fundamental para iniciantes',
      duration: '7',
      difficulty: 'iniciante',
      scheduleType: 'flexível' as const,
      icon: BookOpen,
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'intensivo',
      name: 'Plano Intensivo',
      description: 'Estudo aprofundado para crescimento rápido',
      duration: '21',
      difficulty: 'avançado',
      scheduleType: 'intensivo' as const,
      icon: TrendingUp,
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'grupo',
      name: 'Plano para Grupo',
      description: 'Ideal para estudos em pequenos grupos',
      duration: '14',
      difficulty: 'intermediário',
      scheduleType: 'estruturado' as const,
      icon: Users,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'ministerio',
      name: 'Plano para Ministério',
      description: 'Preparação para líderes e ministérios',
      duration: '30',
      difficulty: 'avançado',
      scheduleType: 'estruturado' as const,
      icon: Award,
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  useEffect(() => {
    if (studyPlan) {
      scrollToResult();
    }
  }, [studyPlan]);

  const saveStudyPlan = () => {
    if (studyPlan) {
      setSavedPlans(prev => [studyPlan, ...prev.slice(0, 9)]); // Keep last 10
      toast({
        title: "Plano Salvo!",
        description: "Seu plano de estudo foi salvo com sucesso.",
      });
    }
  };

  const markDayComplete = (dayIndex: number) => {
    if (!completedDays.includes(dayIndex)) {
      setCompletedDays(prev => [...prev, dayIndex]);
      toast({
        title: "Dia Concluído!",
        description: `Dia ${dayIndex + 1} marcado como concluído.`,
      });
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = studyTemplates.find(t => t.id === templateId);
    if (template) {
      setDuration(template.duration);
      setDifficulty(template.difficulty);
      setScheduleType(template.scheduleType);
      setSelectedTemplate(templateId);
      setShowTemplates(false);
      toast({
        title: "Template Aplicado!",
        description: `Template "${template.name}" aplicado com sucesso.`,
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
        utterance.lang = 'pt-BR';
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

  const sharePlan = async () => {
    if (studyPlan) {
      const shareData = {
        title: `Plano de Estudo: ${studyPlan.title}`,
        text: `Plano de estudo bíblico sobre ${studyPlan.title} - ${studyPlan.duration} dias`,
        url: window.location.href
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          // Try clipboard API with fallback
          try {
            await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`);
            toast({
              title: "Copiado!",
              description: "Link copiado para a área de transferência.",
            });
          } catch (clipboardError) {
            // Fallback: create a temporary textarea to copy text
            const textArea = document.createElement('textarea');
            textArea.value = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
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
                description: "Link copiado para a área de transferência.",
              });
            } catch (execError) {
              throw new Error('Não foi possível copiar o texto');
            } finally {
              document.body.removeChild(textArea);
            }
          }
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

  const updateDayNotes = (dayIndex: number, notes: string) => {
    setCustomNotes(prev => ({
      ...prev,
      [dayIndex]: notes
    }));
  };

  const exportPlanAsJSON = () => {
    if (studyPlan) {
      const dataStr = JSON.stringify(studyPlan, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plano-estudo-${studyPlan.title.toLowerCase().replace(/\s+/g, '-')}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Exportado!",
        description: "Plano exportado como JSON.",
      });
    }
  };

  const downloadPlan = () => {
    if (!studyPlan) return;
    
    const planText = `
PLANO DE ESTUDO BÍBLICO
========================

Título: ${studyPlan.title}
Duração: ${studyPlan.duration}
Dificuldade: ${studyPlan.difficulty}

Descrição:
${studyPlan.description}

Objetivo Geral:
${studyPlan.overallObjective}

Temas Principais:
${studyPlan.keyThemes.map(theme => `- ${theme}`).join('\n')}

Recursos Recomendados:
${studyPlan.recommendedResources.map(resource => `- ${resource}`).join('\n')}

Método de Avaliação:
${studyPlan.assessmentMethod}

CRONOGRAMA DIÁRIO:
=================
${studyPlan.dailyBreakdown.map((day, index) => `
Dia ${index + 1}: ${day.title}
${day.description}

Referências Bíblicas:
${day.scriptureReferences.join(', ')}

Pontos Principais:
${day.keyPoints.map(point => `- ${point}`).join('\n')}

Versículo para Memorizar:
${day.memoryVerse || 'N/A'}

Foco de Oração:
${day.prayerFocus || 'N/A'}

Questões para Reflexão:
${day.reflectionQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
`).join('\n')}
`;

    const blob = new Blob([planText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plano-de-estudo-${topic.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Concluído!",
      description: "Seu plano de estudo foi baixado.",
    });
  };

  const generateStudyPlan = async () => {
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setStudyPlan(null);
    setCompletedDays([]);

    try {
      const response = await fetch('/api/study-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          topic: topic.trim(),
          duration: parseInt(duration),
          difficulty,
          scheduleType,
          includeCommunity,
          includeCertificate,
          includeProgressTracking,
          targetAudience
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate study plan');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Fallbacks para campos obrigatórios
      const fallback = (val: any, def: any) => (val && val.length !== 0 ? val : def);
      const plan = data.studyPlan;
      let alertShown = false;
      if (!plan.title || !plan.description || !plan.dailyBreakdown || plan.dailyBreakdown.length === 0) {
        toast({
          title: "Atenção",
          description: "A resposta da IA veio incompleta. Tente novamente ou reformule o tema para obter um plano mais detalhado.",
          variant: "destructive",
        });
        alertShown = true;
      }

      // Garante que todos os dias tenham campos preenchidos
      const safeDailyBreakdown = (plan.dailyBreakdown || []).map((day: any, idx: number) => ({
        day: day.day || idx + 1,
        title: fallback(day.title, `Dia ${idx + 1}`),
        description: fallback(day.description, `Estudo sobre ${topic} - Dia ${idx + 1}`),
        scriptureReferences: fallback(day.scriptureReferences, ["Salmo 119:105", "2 Timóteo 3:16-17"]),
        keyPoints: fallback(day.keyPoints, ["Crescimento espiritual contínuo", "Aplicação prática da Palavra"]),
        reflectionQuestions: fallback(day.reflectionQuestions, ["Como este estudo transformou minha vida?", "Como continuar crescendo espiritualmente?"]),
        memoryVerse: day.memoryVerse || "Porque Deus amou o mundo de tal maneira... (João 3:16)",
        prayerFocus: day.prayerFocus || "Agradecer a Deus por Sua Palavra viva e transformadora"
      }));

      // Enhance the study plan with additional metadata
      const enhancedPlan: StudyPlan = {
        title: fallback(plan.title, `Plano de Estudo: ${topic}`),
        description: fallback(plan.description, `Um plano de estudo personalizado sobre ${topic}.`),
        duration: plan.duration || `${duration} dias`,
        difficulty: plan.difficulty || difficulty,
        overallObjective: fallback(plan.overallObjective, `Aprofundar o conhecimento sobre ${topic}.`),
        dailyBreakdown: safeDailyBreakdown,
        keyThemes: fallback(plan.keyThemes, [topic, "Estudo bíblico", "Crescimento espiritual"]),
        recommendedResources: fallback(plan.recommendedResources, ["Bíblia", "Caderno de anotações", "Dicionário bíblico"]),
        assessmentMethod: fallback(plan.assessmentMethod, "Reflexão pessoal e aplicação prática dos princípios aprendidos"),
        learningObjectives: fallback(plan.learningObjectives, [
          `Compreender os fundamentos de ${topic}`,
          "Aplicar princípios bíblicos à vida diária",
          "Desenvolver disciplina de estudo bíblico"
        ]),
        scheduleType,
        targetAudience,
        certificates: includeCertificate,
        communityFeatures: includeCommunity,
        progressTracking: includeProgressTracking,
        totalEstimatedHours: parseInt(duration) * 1.5,
        createdAt: new Date(),
        lastAccessed: new Date()
      };

      setStudyPlan(enhancedPlan);
      if (!alertShown && (!plan.keyThemes || plan.keyThemes.length === 0 || !plan.recommendedResources || plan.recommendedResources.length === 0)) {
        toast({
          title: "Aviso",
          description: "Algumas seções do plano podem estar resumidas devido à resposta da IA. Complete manualmente se necessário.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error generating study plan:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao gerar seu plano de estudo. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exampleTopics = [
    {
      topic: "O Sermão do Monte",
      category: "Ensinos de Jesus",
      difficulty: "iniciante",
      duration: "7",
      description: "Estudo dos principais ensinamentos de Jesus no Sermão do Monte"
    },
    {
      topic: "As Parábolas de Jesus",
      category: "Ensinos de Jesus",
      difficulty: "intermediário",
      duration: "14",
      description: "Análise profunda das parábolas de Jesus e seus significados"
    },
    {
      topic: "A Vida de Davi",
      category: "Personagens Bíblicos",
      difficulty: "iniciante",
      duration: "10",
      description: "Estudo da vida de Davi, de pastor a rei de Israel"
    },
    {
      topic: "O Livro de Romanos",
      category: "Estudos de Livros",
      difficulty: "avançado",
      duration: "21",
      description: "Estudo aprofundado da teologia paulina na carta aos Romanos"
    },
    {
      topic: "Os Frutos do Espírito",
      category: "Vida Cristã",
      difficulty: "intermediário",
      duration: "7",
      description: "Desenvolvimento do caráter cristão através dos frutos do Espírito"
    },
    {
      topic: "Profecias Messiânicas",
      category: "Escatologia",
      difficulty: "avançado",
      duration: "30",
      description: "Estudo das profecias sobre o Messias no Antigo Testamento"
    }
  ];

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'iniciante': return 'bg-green-100 text-green-800';
      case 'intermediário': return 'bg-yellow-100 text-yellow-800';
      case 'avançado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-xl p-8 border border-amber-200/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
            <Lightbulb className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
              Gerador de Planos de Estudo com IA
            </h3>
            <p className="text-slate-600 text-sm mt-1">Planos personalizados para estudo bíblico profundo</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {savedPlans.length > 0 && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md">
              {savedPlans.length} salvo{savedPlans.length !== 1 ? 's' : ''}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className="border-amber-300 hover:bg-amber-50"
          >
            <BookMarked className="h-4 w-4 mr-2" />
            Templates
          </Button>
        </div>
      </div>

      {/* Templates de Estudo */}
      {showTemplates && (
        <Card className="mb-6 bg-gradient-to-br from-amber-50 to-white border-amber-200/50 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-amber-800 flex items-center gap-2">
              <BookMarked className="h-5 w-5" />
              Templates de Estudo Pré-definidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {studyTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => applyTemplate(template.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate === template.id
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-amber-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${template.color}`}>
                      <template.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{template.name}</h4>
                      <p className="text-xs text-slate-600">{template.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="secondary" className="text-xs">
                      {template.duration} dias
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        template.difficulty === 'iniciante' ? 'border-green-200 text-green-700' :
                        template.difficulty === 'intermediário' ? 'border-yellow-200 text-yellow-700' :
                        'border-red-200 text-red-700'
                      }`}
                    >
                      {template.difficulty}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configurações Avançadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 p-6 bg-amber-50/50 rounded-xl border border-amber-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              📚 Tema do Estudo
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: O Sermão do Monte, As Parábolas de Jesus..."
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80 backdrop-blur-sm text-slate-700"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              ⏱️ Duração
            </label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-full border-amber-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 dias</SelectItem>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="14">14 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              🎯 Nível de Dificuldade
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80 backdrop-blur-sm text-slate-700"
              disabled={isLoading}
            >
              <option value="iniciante">Iniciante</option>
              <option value="intermediário">Intermediário</option>
              <option value="avançado">Avançado</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              ⚙️ Configurações Avançadas
            </label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg border border-amber-200">
                <Checkbox
                  id="progress-tracking"
                  checked={includeProgressTracking}
                  onCheckedChange={(checked) => setIncludeProgressTracking(checked as boolean)}
                  className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
                <label htmlFor="progress-tracking" className="text-sm font-medium text-slate-700 cursor-pointer">
                  📊 Acompanhamento de Progresso
                </label>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg border border-amber-200">
                <Checkbox
                  id="community"
                  checked={includeCommunity}
                  onCheckedChange={(checked) => setIncludeCommunity(checked as boolean)}
                  className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
                <label htmlFor="community" className="text-sm font-medium text-slate-700 cursor-pointer">
                  👥 Recursos Comunitários
                </label>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg border border-amber-200">
                <Checkbox
                  id="certificate"
                  checked={includeCertificate}
                  onCheckedChange={(checked) => setIncludeCertificate(checked as boolean)}
                  className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
                <label htmlFor="certificate" className="text-sm font-medium text-slate-700 cursor-pointer">
                  🏆 Certificado de Conclusão
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              📅 Tipo de Cronograma
            </label>
            <Select value={scheduleType} onValueChange={(value: any) => setScheduleType(value)}>
              <SelectTrigger className="w-full border-amber-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flexível">Flexível</SelectItem>
                <SelectItem value="estruturado">Estruturado</SelectItem>
                <SelectItem value="intensivo">Intensivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              👥 Público Alvo
            </label>
            <Select value={targetAudience} onValueChange={setTargetAudience}>
              <SelectTrigger className="w-full border-amber-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geral">Geral</SelectItem>
                <SelectItem value="novatos">Novatos na Fé</SelectItem>
                <SelectItem value="líderes">Líderes</SelectItem>
                <SelectItem value="estudiosos">Estudiosos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              💡 Tópicos Sugeridos
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {exampleTopics.map((example, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setTopic(example.topic);
                    setDuration(example.duration);
                    setDifficulty(example.difficulty);
                  }}
                  className="p-3 bg-white/60 rounded-lg border border-amber-200 cursor-pointer hover:bg-amber-50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">
                        {example.topic}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">{example.description}</p>
                    </div>
                    <Badge className={`text-xs ${getDifficultyColor(example.difficulty)}`}>
                      {example.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">
                      {example.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {example.duration} dias
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={generateStudyPlan}
            disabled={!topic.trim() || isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 shadow-lg transition-all transform hover:scale-[1.02]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Plano...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Gerar Plano de Estudo
              </>
            )}
          </Button>
        </div>
      </div>

      {studyPlan && (
        <div ref={resultRef} className="mt-8 space-y-6">
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl">
            <CardHeader className="pb-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl font-bold text-amber-900 mb-2 bg-gradient-to-r from-amber-800 to-orange-800 bg-clip-text text-transparent">
                    {studyPlan.title}
                  </CardTitle>
                  <CardDescription className="text-amber-700 text-lg leading-relaxed">
                    {studyPlan.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`text-lg px-4 py-2 ${getDifficultyColor(studyPlan.difficulty)}`}>
                    {studyPlan.difficulty}
                  </Badge>
                  <Badge className="text-lg px-4 py-2 bg-blue-100 text-blue-800">
                    {studyPlan.duration} dias
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-3 p-4 bg-amber-100/50 rounded-lg">
                  <Clock className="h-6 w-6 text-amber-600" />
                  <div>
                    <p className="text-sm text-amber-700 font-medium">Carga Horária</p>
                    <p className="text-lg font-bold text-amber-800">{studyPlan.totalEstimatedHours}h</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-100/50 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Cronograma</p>
                    <p className="text-lg font-bold text-blue-800 capitalize">{studyPlan.scheduleType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-100/50 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-green-700 font-medium">Público Alvo</p>
                    <p className="text-lg font-bold text-green-800 capitalize">{studyPlan.targetAudience}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-semibold text-slate-800">
                  📋 Visão Geral do Plano
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveStudyPlan}
                    className="border-amber-300 hover:bg-amber-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadPlan}
                    className="border-amber-300 hover:bg-amber-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={sharePlan}
                    className="border-amber-300 hover:bg-amber-50"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h5 className="font-semibold text-slate-800 mb-3 text-lg">🎯 Objetivo Geral:</h5>
                  <p className="text-slate-700 text-base leading-relaxed bg-amber-50 p-4 rounded-lg">
                    {studyPlan.overallObjective}
                  </p>
                </div>
                <div>
                  <h5 className="font-semibold text-slate-800 mb-3 text-lg">📚 Temas Principais:</h5>
                  <div className="flex flex-wrap gap-2">
                    {studyPlan.keyThemes.map((theme, index) => (
                      <Badge key={index} className="bg-amber-100 text-amber-800 border-amber-200">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h5 className="font-semibold text-slate-800 mb-3 text-lg">📖 Método de Avaliação:</h5>
                <p className="text-slate-700 text-base leading-relaxed bg-blue-50 p-4 rounded-lg">
                  {studyPlan.assessmentMethod}
                </p>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-12 bg-amber-100 p-1 rounded-lg">
                  <TabsTrigger value="overview" className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
                    Visão Geral
                  </TabsTrigger>
                  <TabsTrigger value="daily" className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
                    Cronograma Diário
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
                    Recursos
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                  <div>
                    <h5 className="font-semibold text-slate-800 mb-3 text-lg">🎯 Objetivos de Aprendizagem:</h5>
                    <div className="space-y-2">
                      {studyPlan.learningObjectives.map((objective, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-green-800 text-base leading-relaxed">{objective}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-800 mb-3 text-lg">📚 Recursos Recomendados:</h5>
                    <div className="space-y-2">
                      {studyPlan.recommendedResources.map((resource, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-800 text-base leading-relaxed">{resource}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-800 mb-3 text-lg">💡 Dicas para Estudo Efetivo:</h5>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                        <span className="text-amber-600 text-xl font-bold mt-1">•</span>
                        <span className="text-slate-700 text-base leading-relaxed">Mantenha um caderno de anotações para insights</span>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                        <span className="text-amber-600 text-xl font-bold mt-1">•</span>
                        <span className="text-slate-700 text-base leading-relaxed">Ore antes de cada sessão de estudo</span>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                        <span className="text-amber-600 text-xl font-bold mt-1">•</span>
                        <span className="text-slate-700 text-base leading-relaxed">Compartilhe suas descobertas com outros</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="daily" className="mt-6">
                  <div className="space-y-4">
                    {studyPlan.dailyBreakdown.map((day, index) => (
                      <Card key={index} className="border-amber-100 bg-gradient-to-br from-amber-50 to-white shadow-md">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-10 h-10 bg-amber-500 text-white rounded-full font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <CardTitle className="text-lg font-semibold text-slate-800">
                                  {day.title}
                                </CardTitle>
                                <CardDescription className="text-slate-600">
                                  {day.description}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${getDifficultyColor(day.difficulty)}`}>
                                {day.difficulty}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">
                                {day.estimatedTime} min
                              </Badge>
                              {completedDays.includes(index) ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  Concluído
                                </Badge>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => markDayComplete(index)}
                                  className="border-green-300 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Concluir
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <h5 className="font-semibold text-slate-800 mb-2">📖 Referências Bíblicas:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {day.scriptureReferences.map((ref, refIndex) => (
                                    <Badge key={refIndex} className="bg-blue-100 text-blue-800 border-blue-200">
                                      {ref}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h5 className="font-semibold text-slate-800 mb-2">🎯 Pontos Principais:</h5>
                                <div className="space-y-2">
                                  {day.keyPoints.map((point, pointIndex) => (
                                    <div key={pointIndex} className="flex items-start gap-2">
                                      <span className="text-amber-600 font-bold mt-1">•</span>
                                      <span className="text-slate-700 text-sm leading-relaxed">{point}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {day.memoryVerse && (
                                <div>
                                  <h5 className="font-semibold text-slate-800 mb-2">💭 Versículo para Memorizar:</h5>
                                  <p className="text-purple-700 text-base leading-relaxed bg-purple-50 p-3 rounded-lg italic">
                                    {day.memoryVerse}
                                  </p>
                                </div>
                              )}

                              {day.prayerFocus && (
                                <div>
                                  <h5 className="font-semibold text-slate-800 mb-2">🙏 Foco de Oração:</h5>
                                  <p className="text-purple-700 text-base leading-relaxed">{day.prayerFocus}</p>
                                </div>
                              )}
                            </div>

                            <div className="space-y-4">
                              {day.reflectionQuestions.length > 0 && (
                                <div>
                                  <h5 className="font-semibold text-slate-800 mb-2">❓ Questões para Reflexão:</h5>
                                  <div className="space-y-2">
                                    {day.reflectionQuestions.map((question, qIndex) => (
                                      <div key={qIndex} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                        <span className="text-green-600 font-bold text-sm mt-0.5 min-w-[20px]">{qIndex + 1}.</span>
                                        <span className="text-slate-700 text-sm leading-relaxed">{question}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {day.practicalExercises && day.practicalExercises.length > 0 && (
                                <div>
                                  <h5 className="font-semibold text-slate-800 mb-2">🛠️ Exercícios Práticos:</h5>
                                  <div className="space-y-2">
                                    {day.practicalExercises.map((exercise, exIndex) => (
                                      <div key={exIndex} className="flex items-start gap-2">
                                        <span className="text-orange-600 font-bold mt-1">•</span>
                                        <span className="text-slate-700 text-sm leading-relaxed">{exercise}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {day.additionalResources && day.additionalResources.length > 0 && (
                                <div>
                                  <h5 className="font-semibold text-slate-800 mb-2">📚 Recursos Adicionais:</h5>
                                  <div className="space-y-2">
                                    {day.additionalResources.map((resource, resIndex) => (
                                      <div key={resIndex} className="flex items-start gap-2">
                                        <span className="text-indigo-600 font-bold mt-1">•</span>
                                        <span className="text-slate-700 text-sm leading-relaxed">{resource}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div>
                                <h5 className="font-semibold text-slate-800 mb-2">📝 Notas Pessoais:</h5>
                                <textarea
                                  value={customNotes[index] || ''}
                                  onChange={(e) => updateDayNotes(index, e.target.value)}
                                  placeholder="Adicione suas notas e insights aqui..."
                                  className="w-full p-3 border-2 border-amber-200 rounded-lg resize-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 text-slate-700"
                                  rows={3}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="mt-6 space-y-6">
                  <div>
                    <h5 className="font-semibold text-slate-800 mb-3 text-lg">📚 Recursos Complementares:</h5>
                    <div className="space-y-4">
                      {studyPlan.recommendedResources.map((resource, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                          <BookOpen className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <span className="text-indigo-800 text-base leading-relaxed">{resource}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-white shadow-md">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-slate-800 text-lg font-semibold">
                        <Heart className="h-5 w-5 text-red-500" />
                        Sugestões para Estudo em Grupo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                          <span className="text-amber-600 text-xl font-bold mt-1">•</span>
                          <span className="text-slate-700 text-base leading-relaxed">Designe um líder para cada sessão</span>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                          <span className="text-amber-600 text-xl font-bold mt-1">•</span>
                          <span className="text-slate-700 text-base leading-relaxed">Reserve tempo para oração no início e fim</span>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                          <span className="text-amber-600 text-xl font-bold mt-1">•</span>
                          <span className="text-slate-700 text-base leading-relaxed">Incentive a participação de todos</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-white shadow-md">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-slate-800 text-lg font-semibold">
                        <Award className="h-5 w-5 text-amber-600" />
                        Dicas para Aprofundamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                          <span className="text-amber-600 text-xl font-bold mt-1">•</span>
                          <span className="text-slate-700 text-base leading-relaxed">Consulte comentários bíblicos confiáveis</span>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                          <span className="text-amber-600 text-xl font-bold mt-1">•</span>
                          <span className="text-slate-700 text-base leading-relaxed">Estude o contexto histórico e cultural</span>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                          <span className="text-amber-600 text-xl font-bold mt-1">•</span>
                          <span className="text-slate-700 text-base leading-relaxed">Aplique os princípios à sua vida diária</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
