import { NextRequest, NextResponse } from 'next/server';
import { getTheologicalResponse, getRelatedQuestions } from '@/lib/theological-knowledge';
import { formatResponse } from '@/lib/simple-cleaner';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    try {
      // 使用本地神学知识库获取响应
      const theologicalResponse = getTheologicalResponse(message);
      
      // 获取相关问题建议
      const relatedQuestions = getRelatedQuestions(theologicalResponse.category);
      
      // 构建完整的响应，包含Apolo的个性化和友好风格
      const plainTextResponse = buildPersonalizedResponse(message, theologicalResponse, relatedQuestions);
      
      // 格式化响应
      const formattedResponse = formatResponse(plainTextResponse);

      return NextResponse.json({ 
        response: formattedResponse,
        category: theologicalResponse.category,
        relatedQuestions: relatedQuestions
      });
    } catch (error) {
      console.error('Error generating response:', error);
      
      // 错误响应
      const errorResponse = `<p class="text-red-600"><strong>⚠️ Erro Temporário</strong></p>
<p>Desculpe, estou enfrentando dificuldades técnicas para processar sua pergunta no momento.</p>
<p><strong>O que você pode fazer:</strong></p>
<ul>
<li>Tente novamente em alguns instantes</li>
<li>Verifique sua conexão com a internet</li>
<li>Se o problema persistir, entre em contato com nosso suporte</li>
</ul>
<p><strong>Enquanto isso, reflita sobre:</strong></p>
<p><em>"Toda a Escritura é inspirada por Deus e útil para o ensino..." (2 Timóteo 3:16)</em></p>
<p>Volte em breve para uma resposta completa e personalizada!</p>`;

      return NextResponse.json({ response: errorResponse });
    }
  } catch (error) {
    console.error('Error in chatbot API:', error);
    return NextResponse.json(
      { error: 'Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}

// 构建个性化响应函数
function buildPersonalizedResponse(userMessage: string, theologicalResponse: any, relatedQuestions: string[]): string {
  const greeting = getRandomGreeting();
  const encouragement = getRandomEncouragement();
  
  let response = `🙏 **${greeting}!**

Como Apolo, seu assistente teológico da Escola de Exposição Bíblica, recebo sua pergunta com grande alegria.

${theologicalResponse.content}

`;
  
  // 添加相关问题建议
  if (relatedQuestions.length > 0) {
    response += `🔍 **Perguntas Relacionadas:**

`;
    relatedQuestions.forEach(question => {
      response += `• ${question}\n`;
    });
    response += '\n';
  }
  
  // 添加鼓励的话语
  response += `🙏 **${encouragement}**

*Que o Senhor abençoe seu estudo e ilumine seu entendimento!*`;
  
  return response;
}

// 获取随机问候语
function getRandomGreeting(): string {
  const greetings = [
    "Graça e paz",
    "Alegria em Cristo",
    "Bênçãos em abundância",
    "Paz do Senhor",
    "Alegria na Palavra"
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

// 获取随机鼓励话语
function getRandomEncouragement(): string {
  const encouragements = [
    "Continue buscando o conhecimento das Escrituras",
    "Que sua fé cresça através do estudo",
    "Deus tem grandes planos para seu crescimento espiritual",
    "Sua busca pela verdade é valiosa aos olhos de Deus",
    "Continue firme na Palavra"
  ];
  return encouragements[Math.floor(Math.random() * encouragements.length)];
}