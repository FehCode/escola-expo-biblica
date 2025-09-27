/**
 * AI Response Formatter
 * Enhanced visual formatting for AI-generated responses with italics, colors, bold, and bold+italic combinations
 */

export interface FormatOptions {
  theme?: 'light' | 'dark';
  highlightColor?: string;
  enableEmphasis?: boolean;
  enableColorCoding?: boolean;
}

const defaultOptions: FormatOptions = {
  theme: 'light',
  highlightColor: 'indigo',
  enableEmphasis: true,
  enableColorCoding: true,
};

// Color themes for different types of content
const colorThemes = {
  light: {
    primary: 'text-indigo-700',
    secondary: 'text-purple-600', 
    accent: 'text-green-600',
    warning: 'text-amber-600',
    important: 'text-red-600',
    subtle: 'text-slate-600',
    background: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  dark: {
    primary: 'text-indigo-300',
    secondary: 'text-purple-300',
    accent: 'text-green-300',
    warning: 'text-amber-300',
    important: 'text-red-300',
    subtle: 'text-slate-300',
    background: 'bg-indigo-900/20',
    border: 'border-indigo-700',
  }
};

/**
 * Format AI response with enhanced visual styling
 */
export function formatAIResponse(text: string, options: FormatOptions = {}): string {
  const opts = { ...defaultOptions, ...options };
  const colors = colorThemes[opts.theme as keyof typeof colorThemes];
  
  let formattedText = text;

  // 1. Format bold text (**text**)
  if (opts.enableEmphasis) {
    formattedText = formattedText.replace(
      /\*\*(.*?)\*\*/g, 
      (match, content) => `<strong class="font-bold text-slate-900">${content}</strong>`
    );
  }

  // 2. Format italic text (*text*)
  if (opts.enableEmphasis) {
    formattedText = formattedText.replace(
      /\*([^*]+)\*/g, 
      (match, content) => `<em class="italic text-slate-700">${content}</em>`
    );
  }

  // 3. Format bold+italic text (***text***)
  if (opts.enableEmphasis) {
    formattedText = formattedText.replace(
      /\*\*\*(.*?)\*\*\*/g, 
      (match, content) => `<strong class="font-bold italic text-slate-900">${content}</strong>`
    );
  }

  // 4. Color code important theological terms
  if (opts.enableColorCoding) {
    const theologicalTerms = [
      { terms: ['Deus', 'Deus Pai', 'Deus Filho', 'Deus Espírito Santo', 'Trindade'], color: colors.primary },
      { terms: ['Jesus', 'Cristo', 'Messias', 'Senhor', 'Salvador'], color: colors.primary },
      { terms: ['Espírito Santo', 'Consolador', 'Paráclito'], color: colors.secondary },
      { terms: ['Bíblia', 'Escrituras', 'Palavra de Deus', 'Revelação'], color: colors.accent },
      { terms: ['Igreja', 'Corpo de Cristo', 'Comunidade'], color: colors.warning },
      { terms: ['Salvação', 'Justificação', 'Santificação', 'Glorificação'], color: colors.important },
      { terms: ['Fé', 'Graça', 'Amor', 'Esperança'], color: colors.accent },
      { terms: ['Pecado', 'Morte', 'Inferno', 'Julgamento'], color: colors.important },
    ];

    theologicalTerms.forEach(({ terms, color }) => {
      const pattern = new RegExp(`\\b(${terms.join('|')})\\b`, 'gi');
      formattedText = formattedText.replace(
        pattern, 
        (match) => `<span class="${color} font-semibold">${match}</span>`
      );
    });
  }

  // 5. Format Bible references (Genesis 1:1, João 3:16, etc.)
  if (opts.enableColorCoding) {
    const bibleRefPattern = /\b([1-3]?\s*[A-Za-zçãõáéíóúâêîôûàü]+\s+\d+:\d+(?:-\d+)?)\b/g;
    formattedText = formattedText.replace(
      bibleRefPattern,
      (match) => `<span class="${colors.primary} font-medium underline decoration-dotted decoration-indigo-300">${match}</span>`
    );
  }

  // 6. Format numbered lists and bullet points
  formattedText = formattedText.replace(
    /^(\d+\.\s*)(.+)$/gm,
    (match, number, content) => `<span class="${colors.primary} font-semibold">${number}</span>${content}`
  );

  formattedText = formattedText.replace(
    /^([•\-\*]\s*)(.+)$/gm,
    (match, bullet, content) => `<span class="${colors.accent} font-medium">${bullet}</span>${content}`
  );

  // 7. Highlight key phrases in quotes
  formattedText = formattedText.replace(
    /"([^"]+)"/g,
    (match, quote) => `<span class="${colors.background} px-1 py-0.5 rounded border ${colors.border} italic text-slate-700">"${quote}"</span>`
  );

  // 8. Format emphasis words (important, crucial, essential, etc.)
  if (opts.enableColorCoding) {
    const emphasisWords = ['importante', 'crucial', 'essencial', 'fundamental', 'vital', 'chave', 'principal'];
    const emphasisPattern = new RegExp(`\\b(${emphasisWords.join('|')})\\b`, 'gi');
    formattedText = formattedText.replace(
      emphasisPattern,
      (match) => `<span class="${colors.warning} font-bold uppercase tracking-wide text-sm">${match}</span>`
    );
  }

  // 9. Add paragraph spacing and line breaks
  formattedText = formattedText.replace(/\n\n/g, '</p><p class="mb-4 text-slate-700 leading-relaxed">');
  formattedText = formattedText.replace(/\n/g, '<br />');

  // 10. Wrap in paragraph tags
  if (!formattedText.startsWith('<')) {
    formattedText = `<p class="mb-4 text-slate-700 leading-relaxed">${formattedText}</p>`;
  }

  return formattedText;
}

/**
 * Format specific types of AI responses
 */
export function formatTheologicalResponse(text: string, options: FormatOptions = {}): string {
  const opts = { ...defaultOptions, ...options, highlightColor: 'purple' };
  return formatAIResponse(text, opts);
}

export function formatPracticalResponse(text: string, options: FormatOptions = {}): string {
  const opts = { ...defaultOptions, ...options, highlightColor: 'green' };
  return formatAIResponse(text, opts);
}

export function formatHistoricalResponse(text: string, options: FormatOptions = {}): string {
  const opts = { ...defaultOptions, ...options, highlightColor: 'amber' };
  return formatAIResponse(text, opts);
}

/**
 * Format response with custom highlighting for specific terms
 */
export function formatWithCustomHighlights(
  text: string, 
  customHighlights: Array<{ terms: string[]; color: string }>,
  options: FormatOptions = {}
): string {
  let formattedText = formatAIResponse(text, options);
  
  customHighlights.forEach(({ terms, color }) => {
    const pattern = new RegExp(`\\b(${terms.join('|')})\\b`, 'gi');
    formattedText = formattedText.replace(
      pattern,
      (match) => `<span class="${color} font-semibold">${match}</span>`
    );
  });
  
  return formattedText;
}

/**
 * Create a formatted response with sections
 */
export function formatSectionedResponse(sections: Array<{ title: string; content: string; type?: string }>): string {
  return sections.map((section, index) => {
    const sectionType = section.type || 'default';
    let titleClass = 'text-lg font-bold mb-3 ';
    let contentClass = 'mb-6 ';
    
    switch (sectionType) {
      case 'theological':
        titleClass += 'text-purple-800';
        contentClass += 'text-purple-900/90';
        break;
      case 'practical':
        titleClass += 'text-green-800';
        contentClass += 'text-green-900/90';
        break;
      case 'historical':
        titleClass += 'text-amber-800';
        contentClass += 'text-amber-900/90';
        break;
      default:
        titleClass += 'text-indigo-800';
        contentClass += 'text-slate-800';
    }
    
    return `
      <div class="mb-6 last:mb-0">
        <h3 class="${titleClass} flex items-center gap-2">
          <span class="text-2xl">${getSectionIcon(sectionType)}</span>
          ${section.title}
        </h3>
        <div class="${contentClass} leading-relaxed">
          ${formatAIResponse(section.content)}
        </div>
      </div>
    `;
  }).join('');
}

function getSectionIcon(type: string): string {
  const icons = {
    theological: '⛪',
    practical: '🎯',
    historical: '📚',
    default: '📖'
  };
  return icons[type as keyof typeof icons] || icons.default;
}