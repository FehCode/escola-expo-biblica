import { NextRequest, NextResponse } from 'next/server';
import { callZAIWithFallback } from '@/lib/zai-api';
import { formatSectionedResponse } from '@/lib/ai-formatter';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    const fallbackMarkdown = 'Contexto Histórico e Cultural: Informe o autor, data, gênero literário, público original e contexto político/social. Significado Teológico: Liste doutrinas, palavras-chave, mensagem central e conexão com Cristo. Aplicações Práticas: O que este texto ensina para hoje? Como praticar? Quais desafios? Conexões Bíblicas: Relacione outros textos e explique a narrativa geral. Temas Principais: Liste 3 temas. Para Reflexão: O que Deus está mostrando? Como responder? Que mudança prática fazer?';

    const messages = [
      { role: 'user' as const, content: text }
    ];

    const response = await callZAIWithFallback(messages, undefined, undefined, fallbackMarkdown);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in bible explainer API:', error);
    return NextResponse.json(
      { error: 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}
