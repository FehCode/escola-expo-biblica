// 本地神学知识库 - 提供智能响应而不依赖外部API

export interface TheologicalResponse {
  content: string;
  category: string;
  references?: string[];
  relatedTopics?: string[];
}

export interface KnowledgeBaseItem {
  keywords: string[];
  response: TheologicalResponse;
  weight: number;
}

// 神学知识库
const theologicalKnowledgeBase: KnowledgeBaseItem[] = [
  // 解释学相关
  {
    keywords: ['interpretar', 'bíblia', 'hermenêutica', 'interpretação', 'entender'],
    weight: 10,
    response: {
      category: 'Hermenêutica',
      content: `
**A Interpretação Bíblica Correta**

A interpretação bíblica, ou hermenêutica, é a ciência e arte de compreender corretamente as Escrituras. O objetivo principal é descobrir o significado original pretendido pelo autor divino e humano.

**Princípios Fundamentais:**

1. **Contexto é Rei** - Sempre examine o contexto imediato (versículos antes e depois), o contexto do livro, e o contexto bíblico como um todo.

2. **Literal-Histórico-Gramatical** - Interprete as palavras em seu sentido normal e literal, considerando o contexto histórico e as regras gramaticais.

3. **Cristocêntrico** - Toda a Bíblia aponta para Cristo. O Antigo Testamento prepara, os Evangelhos apresentam, e as Epístolas explicam.

4. **Harmonia das Escrituras** - A Bíblia não se contradiz. Passagens difíceis devem ser interpretadas à luz das claras.

**Métodos de Estudo:**
- Análise de contexto histórico-cultural
- Estudo de palavras originais (hebraico/grego)
- Comparação de passagens paralelas
- Aplicação prática contemporânea

Lembre-se: o objetivo não é encontrar novos significados, mas compreender o significado original que Deus já revelou.
      `,
      references: ['2 Timóteo 2:15', '2 Pedro 1:20-21'],
      relatedTopics: ['Exegese', 'Eisegese', 'Contexto Bíblico']
    }
  },

  // 三位一体相关
  {
    keywords: ['trindade', 'deus', 'pai', 'filho', 'espírito santo', 'trindade'],
    weight: 9,
    response: {
      category: 'Teologia Sistemática',
      content: `
**A Doutrina da Trindade**

A Trindade é o mistério central da fé cristã: um só Deus subsistindo em três Pessoas coeternas e coiguais - Pai, Filho e Espírito Santo.

**Definição Bíblica:**
- **Unidade de Deus**: "Ouve, Israel, o SENHOR nosso Deus é o único SENHOR" (Deuteronômio 6:4)
- **Três Pessoas Distintas**: 
  - Pai: Deus (1 Coríntios 8:6)
  - Filho: Deus (João 1:1, 14; 10:30)
  - Espírito Santo: Deus (Atos 5:3-4)

**Características Essenciais:**
1. **Coeternidade** - As três Pessoas existem desde a eternidade
2. **Coigualdade** - Possuem os mesmos atributos divinos
3. **Distinção Pessoal** - Não são três modos ou manifestações, mas Pessoas distintas
4. **Unidade de Essência** - Um só Deus em substância e natureza

**Ilustrações (limitadas):**
- Água: sólido, líquido, gasoso (mesma substância, três estados)
- Sol: luz, calor, radiação (uma fonte, três manifestações)
- Trevo: três folhas, uma planta

**Importância Prática:**
- Base para a salvação (Deus encarnado em Cristo)
- Fundamento para a adoração triúna
- Modelo para relacionamentos (comunhão perfeita)

Esta doutrina protege contra: modalismo (um Deus em modos sucessivos), arianismo (Cristo criado), e politeísmo (três deuses).
      `,
      references: ['Mateus 28:19', '2 Coríntios 13:14', 'João 1:1-3'],
      relatedTopics: ['Deidade de Cristo', 'Pessoa do Espírito Santo', 'Cristologia']
    }
  },

  // 因信称义相关
  {
    keywords: ['justificação', 'fé', 'graça', 'salvação', 'justificar', 'salvo'],
    weight: 9,
    response: {
      category: 'Soteriologia',
      content: `
**Justificação pela Fé**

A justificação é o ato declaratório de Deus pelo qual Ele declara justo o pecador que crê em Jesus Cristo. É o coração do evangelho da graça.

**Definição Precisa:**
- **Não é** um processo de tornar justo (isso é santificação)
- **É** uma declaração legal de justiça imputada
- **Baseada** na obra perfeita de Cristo, não em nossas obras
- **Recebida** mediante fé somente, não por méritos

**Elementos Chave:**

1. **Imputação**:
   - Nosso pecado imputado a Cristo na cruz
   - A justiça de Cristo imputada a nós pela fé
   - "Aquele que não conheceu pecado, ele o fez pecado por nós" (2 Coríntios 5:21)

2. **Graça Soberana**:
   - Iniciativa de Deus, não do homem
   - Dom imerecido, não conquista
   - "Porque pela graça sois salvos, mediante a fé" (Efésios 2:8)

3. **Fé como Instrumento**:
   - A fé não merece a salvação, apenas a recebe
   - É dom de Deus, não obra humana
   - "E isso não vem de vós, é dom de Deus" (Efésios 2:8)

**Resultados da Justificação:**
- Paz com Deus (Romanos 5:1)
- Acesso ao trono da graça (Hebreus 4:16)
- Adoção como filhos (Gálatas 4:4-7)
- Herança eterna (1 Pedro 1:3-5)

**Distorções a Evitar:**
- Legalismo: salvação por obras + fé
- Antinomismo: graça que permite pecar
- Sinergismo: cooperação humana na salvação

A justificação pela fé sola é o artigo pelo qual a igreja permanece ou cai!
      `,
      references: ['Romanos 3:21-28', 'Gálatas 2:16', 'Efésios 2:8-9'],
      relatedTopics: ['Graça', 'Santificação', 'Adoção']
    }
  },

  // 洗礼相关
  {
    keywords: ['batismo', 'batizar', 'água', 'sacramento', 'ordenança'],
    weight: 8,
    response: {
      category: 'Eclesiologia',
      content: `
**O Significado do Batismo**

O batismo é uma ordenança de Cristo que simboliza a união do crente com Ele em Sua morte e ressurreição. É um sinal visível da graça invisível.

**Natureza do Batismo:**
- **Sacramento**: sinal e selo da aliança da graça
- **Ordenança**: mandamento direto de Cristo
- **Símbolo**: representação da realidade espiritual
- **Profissão de fé**: testemunho público da conversão

**Significado Espiritual:**
1. **Identificação com Cristo**:
   - Mortificação do velho homem (Romanos 6:3-4)
   - Ressurreição para nova vida (Colossenses 2:12)
   - União com Cristo em Sua obra

2. **Purificação**:
   - Lavagem espiritual (Atos 22:16)
   - Perdão dos pecados (1 Pedro 3:21)
   - Renovação pelo Espírito (Tito 3:5)

3. **Incorporação**:
   - Membro do corpo de Cristo (1 Coríntios 12:13)
   - Família da fé (Gálatas 3:27)
   - Comunidade da aliança

**Modo de Batismo:**
- **Imersão**: modo bíblico preferencial (simboliza morte e sepultamento)
- **Aspersão/Porção**: prática histórica em algumas tradições
- **Essencial**: o significado, não o modo

**Batismo Infantil:**
- **Visão Pedobatista**: sinal da aliança (como circuncisão)
- **Visão Credobatista**: para professantes da fé somente
- **Acordo**: importância da educação cristã das crianças

**Importância Prática:**
- Não salva, mas testemunha da salvação
- Compromisso com a comunidade cristã
- Lembrança visual da identidade em Cristo

O batismo é uma resposta de fé à graça já recebida, não um meio de obtê-la.
      `,
      references: ['Mateus 28:19', 'Romanos 6:3-4', '1 Pedro 3:21'],
      relatedTopics: ['Ceia do Senhor', 'Discipulado', 'Comunhão']
    }
  },

  // 基督徒生活相关
  {
    keywords: ['vida cristã', 'aplicar', 'dia a dia', 'prática', 'viver', 'fé'],
    weight: 8,
    response: {
      category: 'Vida Cristã Prática',
      content: `
**Vivendo a Fé no Dia a Dia**

A vida cristã não é apenas um conjunto de crenças, mas um relacionamento vivo com Deus que transforma todas as áreas da existência.

**Fundamentos da Vida Cristã:**

1. **Comunhão com Deus**:
   - Oração constante (1 Tessalonicenses 5:17)
   - Leitura da Palavra (Salmo 119:105)
   - Obediência amorosa (João 14:15)
   - "Permanecei em mim, e eu em vós" (João 15:4)

2. **Crescimento Espiritual**:
   - Estudo bíblico sistemático (2 Timóteo 2:15)
   - Participação na igreja local (Hebreus 10:25)
   - Exercício dos dons espirituais (1 Pedro 4:10)
   - Disciplina espiritual (1 Coríntios 9:27)

3. **Testemunho no Mundo**:
   - Integridade no trabalho (Colossenses 3:23)
   - Amor ao próximo (João 13:35)
   - Santidade pessoal (1 Pedro 1:15-16)
   - "Brilhai como luzeiros no mundo" (Filipenses 2:15)

**Áreas Práticas de Aplicação:**

**Família:**
- Casamento cristão (Efésios 5:22-33)
- Educação dos filhos (Efésios 6:4)
- Relacionamentos familiares (Colossenses 3:18-21)

**Trabalho:**
- Excelência como adoração (Colossenses 3:23)
- Ética profissional (Provérbios 11:1)
- Testemunho silencioso (1 Pedro 3:15)

**Finanças:**
- Mordomia fiel (1 Coríntios 4:2)
- Generosidade (2 Coríntios 9:7)
- Contentamento (Hebreus 13:5)

**Sofrimento:**
- Perspectiva eterna (Romanos 8:18)
- Conforto divino (2 Coríntios 1:3-4)
- Propósito transformador (Tiago 1:2-4)

**Ferramentas Práticas:**
- Diário espiritual
- Contaabilidade
- Mentoria
- Pequenos grupos
- Serviço cristão

Lembre-se: a vida cristã é uma jornada de fé, não perfeição. "Perto está o SENHOR dos que têm o coração quebrantado" (Salmo 34:18).
      `,
      references: ['Gálatas 2:20', 'Colossenses 3:17', '1 Pedro 1:15-16'],
      relatedTopics: ['Santificação', 'Oração', 'Testemunho']
    }
  },

  // 祷告相关
  {
    keywords: ['orar', 'oração', 'orar', 'com deus', 'comunicação'],
    weight: 8,
    response: {
      category: 'Oração',
      content: `
**Como Orar Efetivamente**

A oração é a respiração da alma cristã - o meio privilegiado de comunicação com nosso Pai celestial. Jesus não apenas nos ensinou a orar, mas mostrou uma vida de oração.

**O que é Oração:**
- **Comunhão**: relacionamento, não apenas pedidos
- **Adoração**: reconhecimento da grandeza de Deus
- **Confissão**: limpeza do coração
- **Súplica**: apresentação de necessidades
- **Agradecimento**: reconhecimento da bondade divina

**O Modelo de Oração do Pai Nosso (Mateus 6:9-13):**

1. **Relacionamento**: "Pai nosso que estás nos céus"
   - Intimidade filial
   - Reconhecimento da paternidade divina

2. **Adoração**: "Santificado seja o teu nome"
   - Exaltação de Deus
   - Desejo pela Sua glória

3. **Submissão**: "Venha o teu reino, seja feita a tua vontade"
   - Entrega soberana
   - Alinhamento com os propósitos divinos

4. **Dependência**: "O pão nosso de cada dia nos dá hoje"
   - Confiança na provisão
   - Reconhecimento da dependência

5. **Perdão**: "Perdoa-nos as nossas dívidas"
   - Confissão e arrependimento
   - Disposição para perdoar

6. **Proteção**: "Não nos deixes cair em tentação"
   - Reconhecimento da fraqueza
   - Busca da direção divina

**Princípios para Oração Efetiva:**

1. **Fé**: "Peça com fé" (Tiago 1:6)
2. **Em nome de Jesus**: "Tudo quanto pedirdes em meu nome" (João 14:13)
3. **Segundo a vontade de Deus**: "Esta é a confiança que temos" (1 João 5:14)
4. **Perseverança**: "Orai sem cessar" (1 Tessalonicenses 5:17)
5. **Ação de graças**: "Em tudo dai graças" (1 Tessalonicenses 5:18)

**Tipos de Oração:**
- **Contemplativa**: silêncio e meditação
- **Intercessória**: oração por outros
- **De guerra**: batalha espiritual
- **De consagração**: entrega total
- **De agradecimento**: reconhecimento

**Barreiras à Oração Efetiva:**
- Pecado não confessado (Isaías 59:2)
- Motivos errados (Tiago 4:3)
- Falta de perdão (Marcos 11:25)
- Incredulidade (Tiago 1:6-7)

**Dicas Práticas:**
- Estabeleça horários regulares
- Use a Bíblia como guia
- Mantenha um diário de oração
- Ore com outros crentes
- Seja específico e persistente

Lembre-se: a eficácia da oração não depende da eloquência, mas da sinceridade do coração e da fidelidade de Deus.
      `,
      references: ['Mateus 6:5-15', '1 Tessalonicenses 5:17', 'Tiago 5:16'],
      relatedTopics: ['Comunhão com Deus', 'Intercessão', 'Vida de Oração']
    }
  },

  // 圣经结构相关
  {
    keywords: ['bíblia', 'escrituras', 'palavra de deus', 'livro', 'testamento'],
    weight: 7,
    response: {
      category: 'Introdução Bíblica',
      content: `
**A Estrutura da Bíblia**

A Bíblia é a Palavra de Deus inspirada, uma biblioteca divina composta por 66 livros, escritos por cerca de 40 autores ao longo de 1.500 anos.

**Divisões Principais:**

**Antigo Testamento (39 livros):**
- **Pentateuco** (5 livros): Gênesis a Deuteronômio
  - Criação, Queda, Patriarcas, Êxodo, Lei
  - Autor: Tradicionalmente Moisés

- **Livros Históricos** (12 livros): Josué a Ester
  - Conquista de Canaã, Juízes, Reis, Exílio, Retorno
  - História de Israel como nação

- **Livros Poéticos** (5 livros): Jó a Cantares
  - Sabedoria, adoração, vida prática
  - Expressão emocional e espiritual

- **Profetas Maiores** (5 livros): Isaías a Daniel
  - Mensagens proféticas, visões, exílio
  - Chamado ao arrependimento e esperança

- **Profetas Menores** (12 livros): Oséias a Malaquias
  - Mensagens concisas às nações
  - Julgamento e restauração

**Novo Testamento (27 livros):**
- **Evangelhos** (4 livros): Mateus a João
  - Vida, ministério, morte e ressurreição de Cristo
  - Quatro perspectivas complementares

- **Livro Histórico** (1 livro): Atos
  - Nascimento e expansão da igreja
  - Obra do Espírito Santo

- **Epístolas Paulinas** (13 livros): Romanos a Filemom
  - Doutrina, ética, problemas da igreja
  - Teologia e prática cristã

- **Epístolas Gerais** (8 livros): Hebreus a Judas
  - Instruções para crentes em geral
  - Advertências e encorajamentos

- **Profecia** (1 livro): Apocalipse
  - Revelação final, vitória de Cristo
  - Esperança da segunda vinda

**Unidade da Bíblia:**
- **Um só autor**: Deus Espírito Santo
- **Um só tema**: Redenção em Cristo
- **Um só povo**: A igreja de Deus
- **Progressão da revelação**: Cristo como centro

**Línguas Originais:**
- **Hebraico**: A maioria do AT
- **Aramaico**: Partes de Daniel, Esdras
- **Grego Koiné**: Todo o NT

**Manuscritos e Transmissão:**
- Mais de 25.000 manuscritos
- Exatidão notável na transmissão
- Descobertas arqueológicas confirmam

**Como Estudar a Bíblia:**
1. Oração e dependência do Espírito
2. Contexto histórico e literário
3. Interpretação gramatical-histórica
4. Aplicação prática contemporânea
5. Harmonia com outras passagens

A Bíblia é sua própria melhor intérprete. Cada parte deve ser compreendida à luz do todo.
      `,
      references: ['2 Timóteo 3:16-17', '2 Pedro 1:20-21', 'Salmo 119:105'],
      relatedTopics: ['Inspiração', 'Canon', 'Hermenêutica']
    }
  }
];

// 获取最佳匹配的响应
export function getTheologicalResponse(question: string): TheologicalResponse {
  const normalizedQuestion = question.toLowerCase().trim();
  
  // 计算每个知识库项目的匹配分数
  const scoredItems = theologicalKnowledgeBase.map(item => {
    let score = 0;
    
    // 关键词匹配
    item.keywords.forEach(keyword => {
      if (normalizedQuestion.includes(keyword.toLowerCase())) {
        score += item.weight;
      }
    });
    
    // 部分匹配
    item.keywords.forEach(keyword => {
      const words = keyword.toLowerCase().split(' ');
      words.forEach(word => {
        if (normalizedQuestion.includes(word)) {
          score += item.weight * 0.3;
        }
      });
    });
    
    return { item, score };
  });
  
  // 按分数排序
  scoredItems.sort((a, b) => b.score - a.score);
  
  // 如果没有匹配项，返回默认响应
  if (scoredItems[0].score === 0) {
    return {
      category: 'Geral',
      content: `
**Resposta Geral**

Obrigado por sua pergunta! Como assistente teológico, estou aqui para ajudar com suas dúvidas bíblicas e espirituais.

**Como posso ajudar:**
- Interpretação de passagens bíblicas
- Explicação de doutrinas cristãs
- Orientação para vida cristã prática
- Respostas sobre teologia sistemática
- Ajuda com hermenêutica bíblica

**Para uma resposta mais específica, tente perguntar sobre:**
- "Como interpretar [passagem bíblica]?"
- "O que a Bíblia diz sobre [tópico]?"
- "Explique a doutrina da [doutrina]?"
- "Como aplicar [princípio] no dia a dia?"

**Lembre-se:**
- "Toda a Escritura é inspirada por Deus" (2 Timóteo 3:16)
- "Cristo é o centro de todas as Escrituras"
- "O Espírito Santo guia em toda a verdade"
- "A Bíblia é sua própria melhor intérprete"

Por favor, reformule sua pergunta ou seja mais específico sobre o tema que deseja estudar. Estou aqui para ajudar em sua jornada de fé!
      `,
      references: ['2 Timóteo 3:16-17', 'Salmo 119:105'],
      relatedTopics: ['Estudo Bíblico', 'Teologia', 'Vida Cristã']
    };
  }
  
  // 返回最佳匹配
  return scoredItems[0].item.response;
}

// 获取所有可用类别
export function getAvailableCategories(): string[] {
  const categories = new Set<string>();
  theologicalKnowledgeBase.forEach(item => {
    categories.add(item.response.category);
  });
  return Array.from(categories).sort();
}

// 获取相关问题建议
export function getRelatedQuestions(category: string): string[] {
  const related: string[] = [];
  
  theologicalKnowledgeBase.forEach(item => {
    if (item.response.category === category) {
      related.push(...item.response.relatedTopics?.map(topic => 
        `O que é ${topic}?`
      ) || []);
    }
  });
  
  return [...new Set(related)].slice(0, 3);
}

// 搜索知识库
export function searchKnowledgeBase(query: string): TheologicalResponse[] {
  const normalizedQuery = query.toLowerCase();
  const results: TheologicalResponse[] = [];
  
  theologicalKnowledgeBase.forEach(item => {
    let match = false;
    
    // 检查关键词匹配
    item.keywords.forEach(keyword => {
      if (normalizedQuery.includes(keyword.toLowerCase())) {
        match = true;
      }
    });
    
    // 检查内容匹配
    if (item.response.content.toLowerCase().includes(normalizedQuery)) {
      match = true;
    }
    
    if (match) {
      results.push(item.response);
    }
  });
  
  return results;
}