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

**Significado Teológico:**
- Doutrinas e verdades centrais do texto
- Significado das palavras-chave no original (grego/hebraico)
- Mensagem teológica principal
- Implicações para a compreensão de Deus e Seu plano
- Conexões com a teologia sistemática

**Aplicações Práticas:**
- Como aplicar este texto na vida cristã contemporânea
- Princípios eternos extraídos do texto
- Desafios e encorajamentos para hoje
- Ações concretas sugeridas
- Exemplos práticos de aplicação

**Conexões Bíblicas:**
- Referências a outros textos bíblicos relacionados
- Como este texto se encaixa na narrativa bíblica geral
- Conexões com o Antigo e/ou Novo Testamento
- Progresso da revelação bíblica
- Tipologia e profecia (quando aplicável)

**Temas Principais:**
- Liste 3-5 temas principais usando formato: • Tema 1
- • Tema 2
- • Tema 3
- • Tema 4
- • Tema 5

**Para Reflexão:**
- Crie 2-3 questões para reflexão pessoal usando formato: 1. Questão...
- 2. Questão...
- 3. Questão...

Use uma linguagem acessível mas teologicamente precisa. Mantenha o foco na centralidade de Cristo e na glória de Deus. Inclua referências bíblicas específicas sempre que relevante.

📝 **Formatação:**
- Use **negrito** para termos teológicos importantes
- Use *itálico* para ênfase suave
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
        // Enhanced fallback response
        `**Contexto Histórico e Cultural:**
Este texto bíblico foi escrito em um contexto histórico específico que molda sua mensagem e significado. O autor escreveu para um público particular, enfrentando circunstâncias únicas que influenciaram a mensagem divina.

**Significado Teológico:**
A passagem revela verdades fundamentais sobre o caráter de Deus, Sua vontade e Seu relacionamento com a humanidade. O significado teológico aponta para a natureza de Deus e Seu plano redentor através de Cristo.

**Aplicações Práticas:**
Podemos aplicar este texto em nossas vidas através da meditação, oração e obediência aos princípios aqui apresentados. A aplicação prática transforma conhecimento em ação e fé em obras.

**Conexões Bíblicas:**
Este texto se relaciona com o ensino geral das Escrituras sobre a revelação de Deus à humanidade. As conexões bíblicas nos mostram a unidade das Escrituras e o progresso da revelação divina.

**Temas Principais:**
• Revelação divina
• Relacionamento com Deus
• Propósito eterno
• Graça e verdade
• Transformação espiritual

**Para Reflexão:**
1. Como este texto impacta minha compreensão de Deus?
2. De que forma posso aplicar estes princípios em minha vida diária?
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