import { NextRequest, NextResponse } from 'next/server';
import { callGroqWithFallback } from '@/lib/groq-api';
import { formatSectionedResponse, parseChatResponseToSections } from '@/lib/ai-formatter';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    console.log('Bible Explainer - Input Text:', text);

    const promptContent = `Explique o seguinte texto bíblico de forma aprofundada, abordando os seguintes pontos em seções claras e distintas, utilizando "##" para cada título de seção:\n\n## Contexto Histórico e Cultural\nQuem escreveu, quando, para quem, qual o gênero literário, e o contexto político, social e religioso da época.\n\n## Significado Teológico\nQuais as principais doutrinas, palavras-chave, a mensagem central do texto e sua conexão com a pessoa e obra de Cristo (se aplicável).\n\n## Aplicações Práticas\nO que este texto nos ensina para a vida hoje? Como podemos aplicar seus princípios em nosso dia a dia? Quais desafios podem surgir na aplicação?\n\n## Conexões Bíblicas\nComo este texto se relaciona com outras passagens da Bíblia? Qual o seu lugar na narrativa geral das Escrituras?\n\n## Temas Principais\nListe 3 a 5 temas centrais abordados no texto.\n\n## Para Reflexão e Oração\nQuais perguntas este texto levanta para sua vida? Como você pode responder a Deus em oração? Que mudança prática você pode fazer a partir desta leitura?\n\nTexto Bíblico: ${text}`;

    const messages = [
      { role: 'system' as const, content: promptContent }
    ];
    console.log('Bible Explainer - Messages sent to Groq:', JSON.stringify(messages, null, 2));

    const response = await callGroqWithFallback(messages);
    console.log('Bible Explainer - Raw Groq response:', response);

    const sectionedResponse = parseChatResponseToSections(response);
    console.log('Bible Explainer - Parsed sectioned response:', sectionedResponse);

    if (!sectionedResponse || sectionedResponse.length === 0) {
      console.error('Bible Explainer - No sections parsed from Groq response.');
      return NextResponse.json(
        { error: 'Desculpe, não consegui gerar uma explicação estruturada para este texto. Por favor, tente com outro texto ou reformule sua solicitação.' },
        { status: 500 }
      );
    }

    return NextResponse.json(formatSectionedResponse(sectionedResponse));
  } catch (error) {
    console.error('Error in bible explainer API:', error);
    return NextResponse.json(
      { error: 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}
