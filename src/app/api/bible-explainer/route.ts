import { NextRequest, NextResponse } from 'next/server';
import { callZAIWithFallback } from '@/lib/zai-api';
import { formatSectionedResponse } from '@/lib/ai-formatter';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Texto bíblico é obrigatório' }, { status: 400 });
    }

    try {
      const enhancedSystemPrompt = `Você é um especialista em hermenêutica bíblica e teologia reformada com vasta experiência em exegese e ensino bíblico. Sua tarefa é explicar textos bíblicos de forma clara, precisa e contextualizada.

Forneça explicações estruturadas que incluam estas seções exatas com os títulos marcados em negrito:

**Contexto Histórico e Cultural:**
- Autor e data aproximada da escrita
- Contexto histórico e cultural do período
- Público original e propósito do texto
- Informações sobre o gênero literário
- Detalhes sobre o cenário político e social da época

- Conexões com a teologia sistemática

- Exemplos práticos de aplicação

- Tipologia e profecia (quando aplicável)

- • Tema 5

Use uma linguagem acessível mas teologicamente precisa. Mantenha o foco na centralidade de Cristo e na glória de Deus. Inclua referências bíblicas específicas sempre que relevante.

- Use bullet points (•) para listas
- Inclua referências bíblicas no formato (Livro Capítulo:Versículo)
- Seja específico e detalhado em cada seção`;

      const response = await callZAIWithFallback(
        [
          {
            role: 'system',
            content: enhancedSystemPrompt
          },
          {
            role: 'user',
            content: `Por favor, explique o seguinte texto bíblico de forma detalhada e estruturada: "${text}"`
          }
        ], 
        0.7, 
        2000,
          `**Contexto Histórico e Cultural:**
Autor: (Desconhecido ou conforme o livro)
Data aproximada: (Insira período)
Gênero literário: (Narrativa, poesia, profecia, epístola, etc.)
Público original: (Descreva o público)
Cenário político/social: (Descreva brevemente)

**Significado Teológico:**
Principais doutrinas: (Liste pelo menos 2)
Palavras-chave no original: (Explique termos importantes)
Mensagem central: (Resuma em 1-2 frases)
Conexão com Cristo: (Como aponta para Jesus ou o plano de Deus)

**Aplicações Práticas:**
1. O que este texto ensina para minha vida hoje?
2. Como posso praticar este princípio?
3. Quais desafios e encorajamentos encontro aqui?

**Conexões Bíblicas:**
Outros textos relacionados: (Liste referências)
Como se encaixa na narrativa geral: (Explique)
Tipologia/profecia: (Se aplicável)

**Temas Principais:**
• Tema 1
• Tema 2
• Tema 3

**Para Reflexão:**
1. O que Deus está me mostrando neste texto?
2. Como posso responder a este ensino?
3. Que mudança prática posso fazer esta semana?
`;
3. Como esta passagem aponta para Cristo e Sua obra redentora?`
      );

      // Return the raw response - formatting will be handled by the client component
      return NextResponse.json({ explanation: response });
    } catch (aiError) {
      console.error('Error calling ZAI API:', aiError);
      
      // Enhanced fallback response when AI service is not available
      const fallbackResponse = `**Contexto Histórico e Cultural:**
Este texto bíblico foi escrito em um contexto histórico específico que molda sua mensagem e significado. O autor escreveu para um público particular, enfrentando circunstâncias únicas que influenciaram a mensagem divina.

**Significado Teológico:**
A passagem revela verdades fundamentais sobre o caráter de Deus, Sua vontade e Seu relacionamento com a humanidade. O significado teológico aponta para a natureza de Deus e Seu plano redentor.

**Aplicações Práticas:**
Podemos aplicar este texto em nossas vidas através da meditação, oração e obediência aos princípios aqui apresentados. A aplicação prática transforma conhecimento em ação e fé em obras.

**Conexões Bíblicas:**
Este texto se relaciona com o ensino geral das Escrituras sobre a revelação de Deus à humanidade. As conexões bíblicas nos mostram a unidade das Escrituras.`;

      return NextResponse.json({ explanation: fallbackResponse });
    }
  } catch (error) {
    console.error('Error in bible explainer API:', error);
    return NextResponse.json(
      { error: 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}

function extractSection(text: string, sectionTitle: string): string {
  const patterns = [
    new RegExp(`\\*\\*${sectionTitle}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\n\\*\\*|$)`, 'i'),
    new RegExp(`\\*\\*${sectionTitle}\\*\\*\\s*([\\s\\S]*?)(?=\\n\\n\\*\\*|$)`, 'i'),
    new RegExp(`${sectionTitle}:\\s*([\\s\\S]*?)(?=\\n\\n[A-Z]|$)`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return '';
}