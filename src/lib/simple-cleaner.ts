/**
 * Simple cleaner for chatbot responses
 * Removes HTML/CSS artifacts and improves spacing
 */

export function cleanResponse(text: string): string {
  let cleaned = text;
  
  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // Remove specific problematic patterns mentioned by user
  cleaned = cleaned.replace(/•\s*[^">]*?(text-\w+-\d+|font-\w+|bg-\w+|p-\d+|m[trblxy]?-\d+|rounded-\w+|shadow-\w+|w-\d+|h-\d+|flex-\w+|gap-\d+|items-\w+|justify-\w+|leading-\w+|tracking-\w+|whitespace-\w+|overflow-\w+|transition-\w+|duration-\d+|ease-\w+|hover:\w+|focus:\w+|active:\w+|disabled:\w+|data-\[state=\w+\]:\w+|min-w-\[\d+px\])[^">]*?">([^<]*)/g, '• $2');
  
  // Remove standalone CSS classes
  cleaned = cleaned.replace(/\b(text-\w+-\d+|font-\w+|bg-\w+|p-\d+|m[trblxy]?-\d+|rounded-\w+|shadow-\w+|w-\d+|h-\d+|flex-\w+|gap-\d+|items-\w+|justify-\w+|leading-\w+|tracking-\w+|whitespace-\w+|overflow-\w+|transition-\w+|duration-\d+|ease-\w+|hover:\w+|focus:\w+|active:\w+|disabled:\w+|data-\[state=\w+\]:\w+|min-w-\[\d+px\])\b/g, '');
  
  // Remove JSX attributes
  cleaned = cleaned.replace(/className="[^"]*"/g, '');
  cleaned = cleaned.replace(/className='[^']*'/g, '');
  cleaned = cleaned.replace(/dangerouslySetInnerHTML=\{[^}]*\}/g, '');
  cleaned = cleaned.replace(/style=\{[^}]*\}/g, '');
  
  // Fix spacing
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/(\d+)\.(\s*)([A-Z])/g, '$1. $3');
  cleaned = cleaned.replace(/•\s*([^•])/g, '• $1');
  cleaned = cleaned.replace(/\*\*\s*([^*]+)\s*\*\*/g, '**$1**');
  
  // Remove orphaned quotes
  cleaned = cleaned.replace(/^"\s*|\s*"$/g, '');
  cleaned = cleaned.replace(/'\s*$/g, '');
  cleaned = cleaned.replace(/^\s*'/g, '');
  
  // Clean up extra spaces
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/^\s+|\s+$/g, '');
  
  return cleaned;
}

export function formatResponse(text: string): string {
  const cleaned = cleanResponse(text);
  
  // Split into paragraphs
  const paragraphs = cleaned.split('\n\n').filter(p => p.trim());
  
  let formatted = '';
  
  paragraphs.forEach(paragraph => {
    const trimmed = paragraph.trim();
    if (!trimmed) return;
    
    // Handle headers
    if (trimmed.startsWith('🙏 **')) {
      formatted += `<div class="text-center mb-6">
        <p class="text-2xl mb-2">${trimmed.replace('🙏 **', '🙏')}</p>
        <h3 class="text-xl font-bold text-indigo-700">${trimmed.match(/🙏 \*\*(.*?)\*\*/)?.[1] || ''}</h3>
      </div>`;
      return;
    }
    
    // Handle section headers
    if (trimmed.match(/^\*\*.*?\*\*:\s*$/)) {
      formatted += `<h4 class="text-lg font-bold text-indigo-700 mb-4 mt-6 pb-2 border-b border-gray-200">
        ${trimmed.replace(/^\*\*(.*?)\*\*:\s*$/, '$1')}
      </h4>`;
      return;
    }
    
    // Handle emoji section headers
    if (trimmed.startsWith('🔍 **')) {
      formatted += `<h4 class="text-lg font-bold text-purple-600 mb-4 mt-6 flex items-center gap-2">
        <span>🔍</span>
        ${trimmed.replace(/^🔍 \*\*(.*?)\*\*:\s*$/, '$1')}
      </h4>`;
      return;
    }
    
    // Handle numbered lists
    if (trimmed.match(/^\d+\.\s/)) {
      const items = trimmed.split(/\n+/);
      items.forEach(item => {
        const match = item.match(/^(\d+\.\s*)(.*)$/);
        if (match) {
          formatted += `<div class="flex items-start mb-2">
            <span class="text-indigo-700 font-bold mr-2 min-w-[20px]">${match[1]}</span>
            <span class="flex-1">${match[2]}</span>
          </div>`;
        }
      });
      return;
    }
    
    // Handle bullet points
    if (trimmed.includes('•')) {
      const items = trimmed.split(/\n+/);
      items.forEach(item => {
        const match = item.match(/•\s*(.*)$/);
        if (match) {
          formatted += `<div class="flex items-start mb-2">
            <span class="text-green-600 mr-2">•</span>
            <span class="flex-1">${match[1]}</span>
          </div>`;
        }
      });
      return;
    }
    
    // Regular paragraph
    formatted += `<p class="mb-4 text-slate-700 leading-relaxed text-justify">${trimmed}</p>`;
  });
  
  return formatted;
}