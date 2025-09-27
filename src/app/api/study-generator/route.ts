import { NextRequest, NextResponse } from 'next/server';
import { callZAIWithFallback } from '@/lib/zai-api';
import { sanitizeAndFormatResponse } from '@/lib/ai-sanitizer';

export const runtime = 'nodejs';

interface StudyDay {
  day: number;
  title: string;
  description: string;
  scriptureReferences: string[];
  keyPoints: string[];
  reflectionQuestions: string[];
  memoryVerse?: string;
  prayerFocus?: string;
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
}

export async function POST(request: NextRequest) {
  try {
    const { topic, duration, difficulty } = await request.json();
    
    if (!topic) {
      return NextResponse.json({ error: 'Tema é obrigatório' }, { status: 400 });
    }

    try {
      const enhancedSystemPrompt = `Você é um especialista em educação teológica e design de currículos bíblicos com experiência em criação de planos de estudo estruturados. Sua tarefa é criar planos de estudo detalhados e personalizados.

Crie um plano de estudo bíblico completo em formato JSON com a seguinte estrutura exata:

{
  "title": "Título do plano de estudo",
  "description": "Descrição geral do plano",
  "duration": "${duration} dias",
  "difficulty": "${difficulty}",
  "overallObjective": "Objetivo geral do plano de estudo",
  "dailyBreakdown": [
    {
      "day": 1,
      "title": "Título do dia 1",
      "description": "Descrição detalhada do dia 1",
      "scriptureReferences": ["Referência 1", "Referência 2"],
      "keyPoints": ["Ponto principal 1", "Ponto principal 2", "Ponto principal 3"],
      "reflectionQuestions": ["Questão 1", "Questão 2"],
      "memoryVerse": "Versículo para memorizar",
      "prayerFocus": "Foco de oração"
    }
  ],
  "keyThemes": ["Tema 1", "Tema 2", "Tema 3"],
  "recommendedResources": ["Recurso 1", "Recurso 2"],
  "assessmentMethod": "Método de avaliação"
}

Instruções específicas:
1. Adapte o conteúdo ao nível de dificuldade: ${difficulty}
2. Crie exatamente ${duration} dias de estudo
3. Cada dia deve ter referências bíblicas relevantes e específicas
4. Inclua pontos principais, questões para reflexão, versículos para memorizar e focos de oração
5. Os temas devem ser relevantes ao tópico principal: ${topic}
6. Forneça recursos recomendados apropriados e específicos
7. Inclua um método claro de avaliação
8. Seja criativo e prático nas sugestões diárias
9. Inclua aplicações práticas para a vida cristã
10. Certifique-se de que cada dia construa sobre o anterior

📝 **Qualidade do Conteúdo:**
- Seja específico e detalhado em cada seção
- Inclua referências bíblicas reais e relevantes
- Crie pontos principais acionáveis e práticos
- Desenvolva questões reflexivas profundas
- Escolha versículos significativos para memorização
- Sugira focos de oração específicos e relevantes

Responda APENAS com o JSON válido, sem texto adicional.`;

      const response = await callZAIWithFallback(
        [
          {
            role: 'system',
            content: enhancedSystemPrompt
          },
          {
            role: 'user',
            content: `Crie um plano de estudo bíblico detalhado sobre o tema "${topic}" com duração de ${duration} dias para nível ${difficulty}.`
          }
        ], 
        0.7, 
        2500,
        // Enhanced fallback JSON response
        JSON.stringify({
          title: `Plano de Estudo: ${topic}`,
          description: `Um plano de estudo bíblico completo sobre ${topic}, projetado para ${duration} dias de estudo intensivo e reflexivo.`,
          duration: `${duration} dias`,
          difficulty: difficulty,
          overallObjective: `Aprofundar o conhecimento sobre ${topic} através de estudo sistemático das Escrituras, oração e aplicação prática.`,
          dailyBreakdown: generateEnhancedDailyBreakdown(parseInt(duration), topic, difficulty),
          keyThemes: [topic, "Crescimento espiritual", "Estudo bíblico", "Aplicação prática"],
          recommendedResources: [
            "Bíblia de estudo com notas e referências",
            "Caderno de anotações para reflexões pessoais",
            "Dicionário bíblico para consulta rápida",
            "Comentários bíblicos sobre o tema",
            "Hinário para cânticos de adoração"
          ],
          assessmentMethod: "Avaliação através de: 1) Autoavaliação diária, 2) Compartilhamento em grupo, 3) Aplicação prática dos princípios aprendidos, 4) Memorização dos versículos propostos"
        }, null, 2)
      );

      // Try to parse the response as JSON
      let studyPlan: StudyPlan;
      try {
        // Extract JSON from the response if it's wrapped in markdown code blocks
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/{[\s\S]*}/);
        const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
        studyPlan = JSON.parse(jsonString);
        
        // Ensure the study plan has the correct structure
        studyPlan = {
          title: sanitizeAndFormatResponse(studyPlan.title || `Plano de Estudo: ${topic}`, 'practical'),
          description: sanitizeAndFormatResponse(studyPlan.description || `Um plano de estudo personalizado sobre ${topic}.`, 'practical'),
          duration: studyPlan.duration || `${duration} dias`,
          difficulty: studyPlan.difficulty || difficulty,
          overallObjective: sanitizeAndFormatResponse(studyPlan.overallObjective || `Aprofundar o conhecimento sobre ${topic}.`, 'practical'),
          dailyBreakdown: studyPlan.dailyBreakdown || generateEnhancedDailyBreakdown(parseInt(duration), topic, difficulty),
          keyThemes: (studyPlan.keyThemes || [topic]).map(theme => sanitizeAndFormatResponse(theme, 'theological')),
          recommendedResources: (studyPlan.recommendedResources || ["Bíblia", "Caderno de anotações"]).map(resource => sanitizeAndFormatResponse(resource, 'practical')),
          assessmentMethod: sanitizeAndFormatResponse(studyPlan.assessmentMethod || "Autoavaliação e aplicação prática", 'practical')
        };
        
        // Ensure each day has the correct structure
        studyPlan.dailyBreakdown = studyPlan.dailyBreakdown.map((day, index) => ({
          day: day.day || index + 1,
          title: sanitizeAndFormatResponse(day.title || `Dia ${index + 1}`, 'practical'),
          description: sanitizeAndFormatResponse(day.description || `Estudo sobre ${topic} - Dia ${index + 1}`, 'practical'),
          scriptureReferences: day.scriptureReferences || [],
          keyPoints: (day.keyPoints || []).map(point => sanitizeAndFormatResponse(point, 'practical')),
          reflectionQuestions: (day.reflectionQuestions || []).map(q => sanitizeAndFormatResponse(q, 'practical')),
          memoryVerse: day.memoryVerse ? sanitizeAndFormatResponse(day.memoryVerse, 'theological') : undefined,
          prayerFocus: day.prayerFocus ? sanitizeAndFormatResponse(day.prayerFocus, 'practical') : undefined
        }));
        
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        // Fallback to structured object
        studyPlan = {
          title: sanitizeAndFormatResponse(`Plano de Estudo: ${topic}`, 'practical'),
          description: sanitizeAndFormatResponse(`Um plano de estudo personalizado sobre ${topic} para ${duration} dias, adaptado para nível ${difficulty}.`, 'practical'),
          duration: `${duration} dias`,
          difficulty: difficulty,
          overallObjective: sanitizeAndFormatResponse(`Aprofundar o conhecimento sobre ${topic} através de estudo sistemático.`, 'practical'),
          dailyBreakdown: generateEnhancedDailyBreakdown(parseInt(duration), topic, difficulty),
          keyThemes: [topic, "Estudo bíblico", "Crescimento espiritual"].map(theme => sanitizeAndFormatResponse(theme, 'theological')),
          recommendedResources: ["Bíblia", "Caderno de anotações", "Dicionário bíblico"].map(resource => sanitizeAndFormatResponse(resource, 'practical')),
          assessmentMethod: sanitizeAndFormatResponse("Reflexão pessoal e aplicação prática dos princípios aprendidos", 'practical')
        };
      }

      return NextResponse.json({ studyPlan });
    } catch (aiError) {
      console.error('Error calling ZAI API:', aiError);
      
      // Enhanced fallback study plan when AI service is not available
      const fallbackStudyPlan: StudyPlan = {
        title: sanitizeAndFormatResponse(`Plano de Estudo: ${topic}`, 'practical'),
        description: sanitizeAndFormatResponse(`Um plano de estudo bíblico completo sobre ${topic}, projetado para ${duration} dias de estudo intensivo e reflexivo.`, 'practical'),
        duration: `${duration} dias`,
        difficulty: difficulty,
        overallObjective: sanitizeAndFormatResponse(`Aprofundar o conhecimento sobre ${topic} através de estudo sistemático das Escrituras, oração e aplicação prática.`, 'practical'),
        dailyBreakdown: generateEnhancedDailyBreakdown(parseInt(duration), topic, difficulty),
        keyThemes: [topic, "Crescimento espiritual", "Estudo bíblico", "Aplicação prática", "Vida de oração"].map(theme => sanitizeAndFormatResponse(theme, 'theological')),
        recommendedResources: [
          "Bíblia de estudo com notas e referências",
          "Caderno de anotações para reflexões pessoais",
          "Dicionário bíblico para consulta rápida",
          "Comentários bíblicos sobre o tema",
          "Hinário para cânticos de adoração",
          "Canetas coloridas para marcação textual"
        ].map(resource => sanitizeAndFormatResponse(resource, 'practical')),
        assessmentMethod: sanitizeAndFormatResponse("Avaliação através de: 1) Autoavaliação diária, 2) Compartilhamento em grupo, 3) Aplicação prática dos princípios aprendidos, 4) Memorização dos versículos propostos", 'practical')
      };

      return NextResponse.json({ studyPlan: fallbackStudyPlan });
    }
  } catch (error) {
    console.error('Error in study generator API:', error);
    return NextResponse.json(
      { error: 'Desculpe, ocorreu um erro ao gerar seu plano de estudo. Por favor, tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}

function generateEnhancedDailyBreakdown(duration: number, topic: string, difficulty: string): StudyDay[] {
  const days: StudyDay[] = [];
  const difficultyLevels = {
    'iniciante': 'Introdução ao tema',
    'intermediário': 'Aprofundamento teológico',
    'avançado': 'Estudo expositivo detalhado'
  };
  
  for (let i = 1; i <= duration; i++) {
    days.push({
      day: i,
      title: `Dia ${i}: ${getEnhancedDayTitle(i, duration, topic, difficulty)}`,
      description: `Estudo aprofundado sobre ${topic} - ${difficultyLevels[difficulty as keyof typeof difficultyLevels] || 'Estudo bíblico'}.`,
      scriptureReferences: getEnhancedScriptureReferences(i, topic),
      keyPoints: getEnhancedKeyPoints(i, topic),
      reflectionQuestions: getEnhancedReflectionQuestions(i, topic),
      memoryVerse: getEnhancedMemoryVerse(i),
      prayerFocus: getEnhancedPrayerFocus(i, topic)
    });
  }
  
  return days;
}

function getEnhancedDayTitle(day: number, duration: number, topic: string, difficulty: string): string {
  const titles = [
    "Introdução ao tema e contexto bíblico",
    "Contexto histórico e cultural",
    "Análise textual e estrutura literária",
    "Princípios fundamentais extraídos",
    "Aplicações práticas para a vida cristã",
    "Estudo aprofundado e exegese",
    "Reflexão e meditação na Palavra",
    "Compartilhamento e testemunho",
    "Integração e aplicação transformadora",
    "Consolidação e crescimento espiritual",
    "Projeto de vida baseado nos princípios",
    "Compromisso e continuidade no estudo"
  ];
  
  if (day <= titles.length) {
    return titles[day - 1];
  }
  
  return `Continuação do estudo aprofundado sobre ${topic}`;
}

function getEnhancedScriptureReferences(day: number, topic: string): string[] {
  const scriptureSets = [
    ["João 3:16-21", "Romanos 8:28-39"],
    ["Salmo 23:1-6", "Isaías 41:10"],
    ["Filipenses 4:10-13", "2 Coríntios 12:7-10"],
    ["Provérbios 3:5-8", "Tiago 1:5-8"],
    ["Mateus 6:25-34", "Salmo 37:3-7"],
    ["Gálatas 5:16-26", "Efésios 4:17-32"],
    ["Colossenses 3:12-17", "1 Tessalonicenses 5:16-18"],
    ["Hebreus 11:1-6", "2 Coríntios 5:6-10"],
    ["Romanos 12:1-2", "Efésios 4:22-24"],
    ["1 Pedro 1:3-9", "Tiago 1:2-4"],
    ["Apocalipse 3:14-22", "Mateus 25:14-30"],
    ["2 Timóteo 3:14-17", "Salmo 119:105-112"]
  ];
  
  return scriptureSets[day - 1] || ["Salmo 119:105", "2 Timóteo 3:16-17"];
}

function getEnhancedKeyPoints(day: number, topic: string): string[] {
  const baseKeyPoints = [
    ["Compreensão da importância do tema", "Contextualização histórica", "Relevância contemporânea"],
    ["Análise do cenário histórico", "Compreensão do público original", "Identificação dos propósitos divinos"],
    ["Estrutura literária do texto", "Identificação de gêneros literários", "Métodos de interpretação"],
    ["Extração de princípios eternos", "Identificação de verdades centrais", "Fundamentação teológica"],
    ["Aplicação no dia a dia", "Transformação de caráter", "Impacto no relacionamento com Deus"],
    ["Estudo exegético detalhado", "Análise de linguagem original", "Compreensão profunda do texto"],
    ["Meditação transformadora", "Oração baseada na Palavra", "Intimidade com Deus"],
    ["Importância do compartilhamento", "Testemunho transformador", "Influência na comunidade"],
    ["Integração de verdades", "Transformação integral", "Crescimento espiritual contínuo"],
    ["Consolidação do aprendizado", "Compromisso com mudança", "Perseverança na fé"],
    ["Elaboração de projeto de vida", "Planejamento espiritual", "Metas de crescimento"],
    ["Compromisso de continuidade", "Disciplina espiritual", "Legado espiritual"]
  ];
  
  return baseKeyPoints[day - 1] || ["Crescimento espiritual contínuo", "Aplicação prática da Palavra"];
}

function getEnhancedReflectionQuestions(day: number, topic: string): string[] {
  const reflectionSets = [
    ["Como este tema impacta minha compreensão de Deus?", "De que forma posso aplicar estes princípios hoje?", "Quais mudanças preciso fazer em minha vida?"],
    ["Como o contexto histórico ilumina minha compreensão?", "Quais paralelos existem entre o público original e eu?", "Como Deus falava naquele tempo e fala hoje?"],
    ["Como a estrutura literária ajuda na interpretação?", "Que ferramentas de estudo posso usar?", "Como evitar interpretações errôneas?"],
    ["Quais verdades são absolutas e quais são culturais?", "Como distinguir princípios de aplicações?", "Qual é o cerne deste ensino?"],
    ["Como transformar conhecimento em ação?", "Quais obstáculos impedem minha aplicação?", "Como este ensino muda meus relacionamentos?"],
    ["Como aprofundar meu entendimento?", "Quais recursos adicionais devo consultar?", "Como ensinar outros sobre este tema?"],
    ["Como criar um hábito de meditação?", "Qual a diferença entre leitura e meditação?", "Como ouvir a Deus através da Palavra?"],
    ["Por que compartilhar é importante?", "Como testemunhar com graça e verdade?", "Quem precisa ouvir o que aprendi?"],
    ["Como integrar verdades aparentemente contraditórias?", "Qual o equilíbrio entre graça e verdade?", "Como este tema se relaciona com outros?"],
    ["Como avaliar meu crescimento espiritual?", "Quais frutos estou vendo em minha vida?", "Onde preciso de mais transformação?"],
    ["Como criar um plano de ação?", "Quais metas espirituais devo estabelecer?", "Como manter disciplina espiritual?"],
    ["Como este estudo impactou minha visão de futuro?", "Qual legado espiritual desejo deixar?", "Como continuar crescendo?"]
  ];
  
  return reflectionSets[day - 1] || ["Como este estudo transformou minha vida?", "Como continuar crescendo espiritualmente?"];
}

function getEnhancedMemoryVerse(day: number): string {
  const verses = [
    "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna. (João 3:16)",
    "Toda a Escritura é inspirada por Deus e útil para o ensino, para a repreensão, para a correção, para a educação na justiça. (2 Timóteo 3:16)",
    "Eu sou o caminho, a verdade e a vida. Ninguém vem ao Pai senão por mim. (João 14:6)",
    "Tudo posso naquele que me fortalece. (Filipenses 4:13)",
    "Confia ao Senhor as tuas obras, e os teus pensamentos serão estabelecidos. (Provérbios 16:3)",
    "Mas os que esperam no Senhor renovarão as suas forças. (Isaías 40:31)",
    "O Senhor é o meu pastor; nada me faltará. (Salmo 23:1)",
    "Porque eu sei bem os planos que tenho para vocês, diz o Senhor. (Jeremias 29:11)",
    "Tudo fez formoso em seu tempo. (Eclesiastes 3:11)",
    "A graça do Senhor Jesus Cristo seja com todos. (Apocalipse 22:21)",
    "Tornando-se vós imitadores de mim, como eu também o sou de Cristo. (1 Coríntios 11:1)",
    "Portanto, quer comais, quer bebais ou façais outra coisa qualquer, fazei tudo para a glória de Deus. (1 Coríntios 10:31)"
  ];
  
  return verses[day - 1] || verses[0];
}

function getEnhancedPrayerFocus(day: number, topic: string): string {
  const focuses = [
    "Agradecer a Deus por Sua Palavra viva e transformadora",
    "Pedir sabedoria e entendimento espiritual para compreender",
    "Orar por coração ensinável e receptivo ao Espírito Santo",
    "Buscar força divina para aplicar os princípios aprendidos",
    "Interceder por oportunidades de compartilhar o aprendido",
    "Clamar por transformação interior e renovação mental",
    "Pedir direção divina para decisões importantes baseadas na Palavra",
    "Orar por sensibilidade para ouvir a voz de Deus",
    "Agradecer pelo crescimento espiritual e transformação experimentada",
    "Consagrar a vida a Deus para continuar aprendendo e servindo",
    "Pedir disciplina e perseverança no estudo bíblico",
    "Orar por um coração comprometido com a vontade de Deus"
  ];
  
  return focuses[day - 1] || focuses[0];
}