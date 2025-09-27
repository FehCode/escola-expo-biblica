'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatAIResponse, formatTheologicalResponse, formatHistoricalResponse, formatPracticalResponse } from '@/lib/ai-formatter';

export default function AIFormattingDemo() {
  // Sample AI responses to demonstrate formatting
  const sampleResponses = {
    basic: `**A importância da hermenêutica** na interpretação bíblica não pode ser subestimada. Quando estudamos as Escrituras, precisamos entender o *contexto histórico* e o significado original dos textos.

***Princípios fundamentais*** incluem:
1. Análise do contexto
2. Compreensão do gênero literário  
3. Consideração do público original

Como disse *Agostinho*: "O Novo Testamento está escondido no Antigo, e o Antigo é revelado no Novo." Esta citação mostra a **unidade das Escrituras**.`,

    theological: `A **doutrina da Trindade** é fundamental para a teologia cristã. Em *João 1:1*, vemos que "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus."

***Aspectos essenciais*** da Trindade:
• Uma só essência divina
• Três pessoas distintas: Pai, Filho e Espírito Santo
• Co-iguais e co-eternos

A **justificação pela fé** em *Romanos 3:28* demonstra que somos salvos pela graça mediante a fé em **Jesus Cristo**. Este é um *princípio crucial* da teologia reformada.`,

    historical: `O **contexto histórico** do primeiro século era marcado pela *dominação romana* e expectativas messiânicas.

***Fatores importantes***:
1. Ocupação romana da Judeia
2. Diversidade religiosa (fariseus, saduceus, essênios)
3. Expectativa de um Messias político

A *cultura judaica* valorizava a **Torá** e as tradições dos anciãos. **Jesus** nasceu neste contexto complexo, quando o *povo de Israel* aguardava libertação.`,

    practical: `**Aplicação prática** dos ensinamentos de Jesus requer *transformação diária*.

***Como aplicar***:
• Ore diariamente buscando a direção de **Deus**
• Pratique o *amor ao próximo* como Cristo nos amou
• Participe ativamente na **Igreja**

A **santificação** é um processo contínuo. Como diz *Filipenses 2:12*: "desenvolvei a vossa salvação com temor e tremor." Isto demonstra a importância da ***cooperação*** com o Espírito Santo.`
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          Demonstração de Formatação Avançada de Respostas IA
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Esta demonstração mostra como as respostas geradas por IA são formatadas com 
          <strong className="text-indigo-600"> negrito</strong>, 
          <em className="text-purple-600"> itálico</em>, 
          <strong className="text-green-600 italic"> negrito+itálico</strong>, e 
          <span className="text-amber-600"> cores temáticas</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Formatting */}
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-indigo-800">Formatação Básica</CardTitle>
              <Badge className="bg-indigo-100 text-indigo-700">formatAIResponse</Badge>
            </div>
            <CardDescription className="text-indigo-600">
              Formatação geral com ênfase e cores básicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="ai-formatted-content text-slate-700"
              dangerouslySetInnerHTML={{ 
                __html: formatAIResponse(sampleResponses.basic, {
                  theme: 'light',
                  highlightColor: 'indigo',
                  enableEmphasis: true,
                  enableColorCoding: true
                })
              }}
            />
          </CardContent>
        </Card>

        {/* Theological Formatting */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-800">Formatação Teológica</CardTitle>
              <Badge className="bg-purple-100 text-purple-700">formatTheologicalResponse</Badge>
            </div>
            <CardDescription className="text-purple-600">
              Otimizada para conteúdo teológico e doutrinário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="ai-formatted-content text-slate-700"
              dangerouslySetInnerHTML={{ 
                __html: formatTheologicalResponse(sampleResponses.theological, {
                  theme: 'light',
                  highlightColor: 'purple',
                  enableEmphasis: true,
                  enableColorCoding: true
                })
              }}
            />
          </CardContent>
        </Card>

        {/* Historical Formatting */}
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-amber-800">Formatação Histórica</CardTitle>
              <Badge className="bg-amber-100 text-amber-700">formatHistoricalResponse</Badge>
            </div>
            <CardDescription className="text-amber-600">
              Focada em contexto histórico e cultural
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="ai-formatted-content text-slate-700"
              dangerouslySetInnerHTML={{ 
                __html: formatHistoricalResponse(sampleResponses.historical, {
                  theme: 'light',
                  highlightColor: 'amber',
                  enableEmphasis: true,
                  enableColorCoding: true
                })
              }}
            />
          </CardContent>
        </Card>

        {/* Practical Formatting */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-800">Formatação Prática</CardTitle>
              <Badge className="bg-green-100 text-green-700">formatPracticalResponse</Badge>
            </div>
            <CardDescription className="text-green-600">
              Ideal para aplicações práticas e orientações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="ai-formatted-content text-slate-700"
              dangerouslySetInnerHTML={{ 
                __html: formatPracticalResponse(sampleResponses.practical, {
                  theme: 'light',
                  highlightColor: 'green',
                  enableEmphasis: true,
                  enableColorCoding: true
                })
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Features Legend */}
      <Card className="border-slate-200 bg-slate-50">
        <CardHeader>
          <CardTitle className="text-slate-800">Recursos de Formatação</CardTitle>
          <CardDescription className="text-slate-600">
            Legendas dos elementos de formatação disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-indigo-700">Ênfase Textual</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li><strong className="font-bold">Negrito</strong> - Termos importantes</li>
                <li><em className="italic">Itálico</em> - Ênfase suave</li>
                <li><strong className="font-bold italic">Negrito+Itálico</strong> - Máxima ênfase</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-700">Cores Temáticas</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li><span className="text-indigo-600 font-semibold">Azul</span> - Termos divinos</li>
                <li><span className="text-purple-600 font-semibold">Roxo</span> - Conceitos teológicos</li>
                <li><span className="text-green-600 font-semibold">Verde</span> - Aplicações práticas</li>
                <li><span className="text-amber-600 font-semibold">Âmbar</span> - Contexto histórico</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700">Elementos Estruturais</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>Referências bíblicas sublinhadas</li>
                <li>Listas numeradas e com marcadores</li>
                <li>Citações com fundo destacado</li>
                <li>Termos de ênfase em maiúsculas</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-amber-700">Tipos de Formatação</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>formatAIResponse - Uso geral</li>
                <li>formatTheologicalResponse - Teologia</li>
                <li>formatHistoricalResponse - História</li>
                <li>formatPracticalResponse - Aplicações</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}