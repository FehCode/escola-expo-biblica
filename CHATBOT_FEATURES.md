# Enhanced Chatbot Features

## Visão Geral

O chatbot aprimorado "Apolo" agora inclui funcionalidades avançadas de histórico, memória, respostas rápidas e um layout visual limpo e moderno.

## Funcionalidades Implementadas

### 1. Histórico de Conversas

- **Sessões Salvas**: Cada conversa é salva como uma sessão separada
- **Títulos Automáticos**: Geração automática de títulos baseados na primeira mensagem
- **Carregamento Rápido**: Acesso rápido a conversas anteriores
- **Exportação de Sessões**: Exporte conversas individuais em formato JSON
- **Exclusão de Sessões**: Remoção de conversas indesejadas

### 2. Memória e Contexto

- **Contexto Contínuo**: O chatbot mantém o contexto da conversa atual
- **Histórico de Sessão**: Cada sessão preserva seu próprio histórico
- **Referência Cruzada**: Possibilidade de referenciar mensagens anteriores
- **Persistência Local**: Dados salvos no localStorage do navegador

### 3. Respostas Rápidas

- **Categorias Organizadas**: Respostas pré-definidas por categorias:
  - Hermenêutica
  - Teologia
  - Vida Cristã
  - Soteriologia
  - Sacramentos
  - Oração

- **Interface Visual**: Cards coloridos com ícones representativos
- **Clique Único**: Basta clicar para usar uma resposta rápida
- **Personalização**: Possibilidade de adicionar novas respostas rápidas

### 4. Layout Visual Limpo

- **Design Moderno**: Interface limpa e profissional
- **Cores Harmoniosas**: Paleta de cores baseada em indigo e roxo
- **Responsivo**: Adaptação a diferentes tamanhos de tela
- **Animações Suaves**: Transições e animações elegantes
- **Tipografia Clara**: Fontes legíveis e bem espaçadas

### 5. Configurações Avançadas

#### Geral
- **Respostas em Voz**: Ativa/desativa respostas de voz automáticas
- **Salvar Automaticamente**: Salva sessões automaticamente
- **Idioma**: Suporte para Português, Inglês e Espanhol
- **Estilo de Resposta**: Detalhado, Conciso ou Acadêmico

#### Aparência
- **Tema**: Claro, Escuro ou Automático
- **Tamanho da Fonte**: Pequeno, Médio ou Grande
- **Personalização Visual**: Opções de cores e layout

#### Avançado
- **Tom Teológico**: Configuração para tradição reformada
- **Profundidade**: Nível de detalhe nas respostas
- **Contexto**: Manutenção de histórico conversacional

### 6. Gerenciamento de Dados

- **Exportação Completa**: Exporte todas as configurações e conversas
- **Importação de Dados**: Restaure dados previamente exportados
- **Limpeza de Dados**: Remoção completa de todos os dados
- **Backup Automático**: Salvo automaticamente no localStorage

### 7. Acessibilidade

- **Navegação por Teclado**: Suporte completo para navegação por teclado
- **Leitor de Tela**: Compatível com leitores de tela
- **Contraste Alto**: Opções de alto contraste para melhor visibilidade
- **Respostas em Voz**: Síntese de voz para respostas do bot

## Componentes Técnicos

### Arquivos Principais

1. **EnhancedChatbot.tsx**: Componente principal do chatbot
2. **ChatbotSettings.tsx**: Modal de configurações
3. **scroll-area.tsx**: Componente de rolagem personalizada

### Interfaces

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  category?: string;
  isFavorite?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastAccessed: Date;
  category?: string;
}

interface QuickReply {
  id: string;
  text: string;
  category: string;
  icon: any;
  color: string;
}
```

### Tecnologias Utilizadas

- **React**: Framework principal
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **Radix UI**: Componentes de UI acessíveis
- **Lucide React**: Ícones
- **LocalStorage**: Armazenamento local
- **Web Speech API**: Síntese de voz

## Como Usar

### Iniciando uma Conversa

1. Acesse a página do chatbot
2. Use as respostas rápidas ou digite sua própria pergunta
3. A conversa será salva automaticamente

### Gerenciando Sessões

1. Clique no botão "Histórico" no header
2. Visualize todas as sessões salvas
3. Clique em uma sessão para carregá-la
4. Use os botões de exportar ou excluir conforme necessário

### Configurando Preferências

1. Clique no ícone de engrenagem (⚙️) no header
2. Navegue pelas abas: Geral, Aparência, Avançado, Dados
3. Ajuste as configurações conforme sua preferência
4. As configurações são salvas automaticamente

### Exportando/Importando Dados

1. Acesse as configurações
2. Vá para a aba "Dados"
3. Use "Exportar Dados" para baixar um arquivo JSON
4. Use "Importar Dados" para carregar dados previamente exportados

## Melhorias Futuras

- [ ] Sincronização com nuvem
- [ ] Modo offline
- [ ] Integração com banco de dados bíblico
- [ ] Tradução em tempo real
- [ ] Modo multiusuário
- [ ] Análise de sentimentos
- [ ] Sugestões inteligentes baseadas no histórico
- [ ] Integração com redes sociais
- [ ] Modo de apresentação
- [ ] Temas personalizáveis

## Contribuição

Este projeto está em constante desenvolvimento. Sinta-se à vontade para contribuir com novas funcionalidades ou melhorias.

## Licença

Este projeto faz parte da Escola de Exposição Bíblica e está sob sua licença.