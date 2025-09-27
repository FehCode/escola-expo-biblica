import { NextRequest, NextResponse } from 'next/server';
import { callGeminiWithFallback } from '@/lib/gemini-api';
import { formatSectionedResponse, parseGeminiResponseToSections } from '@/lib/ai-formatter';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    const fallbackMarkdown = 'Contexto Histórico e Cultural: Informe o autor, data, gênero literário, público original e contexto político/social. Significado Teológico: Liste doutrinas, palavras-chave, mensagem central e conexão com Cristo. Aplicações Práticas: O que este texto ensina para hoje? Como praticar? Quais desafios? Conexões Bíblicas: Relacione outros textos e explique a narrativa geral. Temas Principais: Liste 3 temas. Para Reflexão: O que Deus está mostrando? Como responder? Que mudança prática fazer?';

    const messages = [
      { role: 'user' as const, parts: [{ text: `Explique o seguinte texto bíblico de forma aprofundada, abordando os seguintes pontos em seções claras e distintas, utilizando "##" para cada título de seção:

## Contexto Histórico e Cultural
Quem escreveu, quando, para quem, qual o gênero literário, e o contexto político, social e religioso da época.

## Significado Teológico
Quais as principais doutrinas, palavras-chave, a mensagem central do texto e sua conexão com a pessoa e obra de Cristo (se aplicável).

## Aplicações Práticas
O que este texto nos ensina para a vida hoje? Como podemos aplicar seus princípios em nosso dia a dia? Quais desafios podem surgir na aplicação?

## Conexões Bíblicas
Como este texto se relaciona com outras passagens da Bíblia? Qual o seu lugar na narrativa geral das Escrituras?

## Temas Principais
Liste 3 a 5 temas centrais abordados no texto.

## Para Reflexão e Oração
Quais perguntas este texto levanta para sua vida? Como você pode responder a Deus em oração? Que mudança prática você pode fazer a partir desta leitura?

Texto Bíblico: ${text}` }] }
    ];

    const response = await callGeminiWithFallback(messages);

    const sectionedResponse = parseGeminiResponseToSections(response);

    return NextResponse.json(formatSectionedResponse(sectionedResponse));
  } catch (error) {
    console.error('Error in bible explainer API:', error);
    return NextResponse.json(
      { error: 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}
