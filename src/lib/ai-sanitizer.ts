/**
 * AI Response Sanitizer
 * Cleans up AI responses to prevent code snippets and CSS class names from appearing in the output
 */

/**
 * Sanitizes AI response text to remove unwanted code snippets and CSS class names
 */
export function sanitizeAIResponse(text: string): string {
  let sanitizedText = text;

  // 1. Remove CSS class names that might appear in the text
  const cssClassPatterns = [
    /text-\w+-\d+/g,           // text-green-600, text-indigo-700, etc.
    /bg-\w+-\d+/g,             // bg-indigo-50, bg-green-100, etc.
    /border-\w+-\d+/g,         // border-indigo-200, etc.
    /font-\w+/g,               // font-bold, font-semibold, etc.
    /p-\d+/g,                   // p-4, p-6, etc.
    /m[trblxy]?-\d+/g,          // m-4, mt-2, mx-4, etc.
    /rounded-\w+/g,            // rounded-lg, rounded-xl, etc.
    /shadow-\w+/g,             // shadow-md, shadow-lg, etc.
    /w-\d+/g,                   // w-4, w-6, etc.
    /h-\d+/g,                   // h-4, h-6, etc.
    /flex-\w+/g,               // flex-col, flex-row, etc.
    /grid-cols-\d+/g,          // grid-cols-4, etc.
    /space-[xy]-\d+/g,         // space-x-4, space-y-3, etc.
    /gap-\d+/g,                // gap-3, gap-4, etc.
    /items-\w+/g,              // items-center, items-start, etc.
    /justify-\w+/g,            // justify-center, justify-between, etc.
    /text-\w+/g,               // text-sm, text-lg, text-base, etc.
    /leading-\w+/g,            // leading-relaxed, etc.
    /tracking-\w+/g,           // tracking-wide, etc.
    /whitespace-\w+/g,         // whitespace-nowrap, etc.
    /overflow-\w+/g,           // overflow-hidden, etc.
    /transition-\w+/g,          // transition-all, etc.
    /duration-\d+/g,           // duration-200, etc.
    /ease-\w+/g,               // ease-in-out, etc.
    /hover:\w+/g,              // hover:bg-indigo-50, etc.
    /focus:\w+/g,              // focus:ring-2, etc.
    /active:\w+/g,             // active:bg-indigo-700, etc.
    /disabled:\w+/g,           // disabled:opacity-50, etc.
    /data-\[state=\w+\]:\w+/g, // data-[state=active]:bg-white, etc.
    /min-w-\[\w+\]/g,          // min-w-[20px], etc.
    /max-w-\[\w+\]/g,          // max-w-[400px], etc.
    /min-h-\[\w+\]/g,          // min-h-[40px], etc.
    /max-h-\[\w+\]/g,          // max-h-[96], etc.
  ];

  cssClassPatterns.forEach(pattern => {
    sanitizedText = sanitizedText.replace(pattern, '');
  });

  // 2. Remove HTML/JSX code blocks that might appear
  const codeBlockPatterns = [
    /<[^>]+>/g,                // HTML tags
    /<\/[^>]+>/g,              // Closing HTML tags
    /className="[^"]*"/g,      // JSX className attributes
    /className='[^']*'/g,      // JSX className attributes with single quotes
    /dangerouslySetInnerHTML=\{[^}]*\}/g, // React dangerouslySetInnerHTML
    /style=\{[^}]*\}/g,        // React style attributes
    /key=\{[^}]*\}/g,          // React key attributes
    /onClick=\{[^}]*\}/g,      // React onClick attributes
    /onChange=\{[^}]*\}/g,     // React onChange attributes
    /onKeyPress=\{[^}]*\}/g,   // React onKeyPress attributes
    /onSubmit=\{[^}]*\}/g,     // React onSubmit attributes
    /disabled=\{[^}]*\}/g,     // React disabled attributes
    /required=\{[^}]*\}/g,     // React required attributes
    /placeholder="[^"]*"/g,    // HTML placeholder attributes
    /placeholder='[^']*'/g,    // HTML placeholder attributes with single quotes
    /value="[^"]*"/g,          // HTML value attributes
    /value='[^']*'/g,          // HTML value attributes with single quotes
    /type="[^"]*"/g,           // HTML type attributes
    /type='[^']*'/g,           // HTML type attributes with single quotes
    /name="[^"]*"/g,           // HTML name attributes
    /name='[^']*'/g,           // HTML name attributes with single quotes
    /id="[^"]*"/g,             // HTML id attributes
    /id='[^']*'/g,             // HTML id attributes with single quotes
    /for="[^"]*"/g,            // HTML for attributes
    /for='[^']*'/g,            // HTML for attributes with single quotes
    /href="[^"]*"/g,           // HTML href attributes
    /href='[^']*'/g,           // HTML href attributes with single quotes
    /src="[^"]*"/g,            // HTML src attributes
    /src='[^']*'/g,            // HTML src attributes with single quotes
    /alt="[^"]*"/g,            // HTML alt attributes
    /alt='[^']*'/g,            // HTML alt attributes with single quotes
    /title="[^"]*"/g,          // HTML title attributes
    /title='[^']*'/g,          // HTML title attributes with single quotes
    /aria-\w+="[^"]*"/g,       // ARIA attributes
    /aria-\w+='[^']*'/g,       // ARIA attributes with single quotes
    /role="[^"]*"/g,           // HTML role attributes
    /role='[^']*'/g,           // HTML role attributes with single quotes
    /tabIndex="[^"]*"/g,       // HTML tabIndex attributes
    /tabIndex='[^']*'/g,       // HTML tabIndex attributes with single quotes
    /contentEditable="[^"]*"/g, // HTML contentEditable attributes
    /contentEditable='[^']*'/g, // HTML contentEditable attributes with single quotes
    /spellCheck="[^"]*"/g,     // HTML spellCheck attributes
    /spellCheck='[^']*'/g,     // HTML spellCheck attributes with single quotes
    /autoFocus=\{[^}]*\}/g,    // React autoFocus attributes
    /autoFocus="[^"]*"/g,      // HTML autoFocus attributes
    /autoFocus='[^']*'/g,      // HTML autoFocus attributes with single quotes
    /defaultChecked=\{[^}]*\}/g, // React defaultChecked attributes
    /defaultChecked="[^"]*"/g,  // HTML defaultChecked attributes
    /defaultChecked='[^']*'/g,  // HTML defaultChecked attributes with single quotes
    /defaultValue="[^"]*"/g,    // HTML defaultValue attributes
    /defaultValue='[^']*'/g,    // HTML defaultValue attributes with single quotes
    /accept="[^"]*"/g,         // HTML accept attributes
    /accept='[^']*'/g,         // HTML accept attributes with single quotes
    /multiple=\{[^}]*\}/g,     // React multiple attributes
    /multiple="[^"]*"/g,       // HTML multiple attributes
    /multiple='[^']*'/g,       // HTML multiple attributes with single quotes
    /readOnly=\{[^}]*\}/g,     // React readOnly attributes
    /readOnly="[^"]*"/g,       // HTML readOnly attributes
    /readOnly='[^']*'/g,       // HTML readOnly attributes with single quotes
    /min="[^"]*"/g,            // HTML min attributes
    /min='[^']*'/g,            // HTML min attributes with single quotes
    /max="[^"]*"/g,            // HTML max attributes
    /max='[^']*'/g,            // HTML max attributes with single quotes
    /step="[^"]*"/g,           // HTML step attributes
    /step='[^']*'/g,           // HTML step attributes with single quotes
    /pattern="[^"]*"/g,        // HTML pattern attributes
    /pattern='[^']*'/g,        // HTML pattern attributes with single quotes
    /inputMode="[^"]*"/g,      // HTML inputMode attributes
    /inputMode='[^']*'/g,      // HTML inputMode attributes with single quotes
    /enterKeyHint="[^"]*"/g,   // HTML enterKeyHint attributes
    /enterKeyHint='[^']*'/g,   // HTML enterKeyHint attributes with single quotes
    /autoCapitalize="[^"]*"/g,  // HTML autoCapitalize attributes
    /autoCapitalize='[^']*'/g,  // HTML autoCapitalize attributes with single quotes
    /autoComplete="[^"]*"/g,   // HTML autoComplete attributes
    /autoComplete='[^']*'/g,   // HTML autoComplete attributes with single quotes
    /autoCorrect="[^"]*"/g,    // HTML autoCorrect attributes
    /autoCorrect='[^']*'/g,    // HTML autoCorrect attributes with single quotes
    /autoSave="[^"]*"/g,       // HTML autoSave attributes
    /autoSave='[^']*'/g,       // HTML autoSave attributes with single quotes
    /results="[^"]*"/g,        // HTML results attributes
    /results='[^']*'/g,        // HTML results attributes with single quotes
    /webkitdirectory=\{[^}]*\}/g, // React webkitdirectory attributes
    /webkitdirectory="[^"]*"/g, // HTML webkitdirectory attributes
    /webkitdirectory='[^']*'/g, // HTML webkitdirectory attributes with single quotes
  ];

  codeBlockPatterns.forEach(pattern => {
    sanitizedText = sanitizedText.replace(pattern, '');
  });

  // 3. Remove JavaScript/TypeScript code patterns
  const jsPatterns = [
    /const\s+\w+\s*=\s*[^;]+;/g,    // const declarations
    /let\s+\w+\s*=\s*[^;]+;/g,      // let declarations
    /var\s+\w+\s*=\s*[^;]+;/g,      // var declarations
    /function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/g, // function declarations
    /=>\s*[^;]+;/g,                 // arrow functions
    /import\s+[^;]+;/g,             // import statements
    /export\s+[^;]+;/g,             // export statements
    /return\s+[^;]+;/g,             // return statements
    /console\.[^;]+;/g,             // console statements
    /document\.[^;]+;/g,            // document statements
    /window\.[^;]+;/g,              // window statements
    /navigator\.[^;]+;/g,           // navigator statements
    /localStorage\.[^;]+;/g,        // localStorage statements
    /sessionStorage\.[^;]+;/g,       // sessionStorage statements
    /fetch\([^)]+\);/g,             // fetch calls
    /setTimeout\([^)]+\);/g,         // setTimeout calls
    /setInterval\([^)]+\);/g,        // setInterval calls
    /clearTimeout\([^)]+\);/g,       // clearTimeout calls
    /clearInterval\([^)]+\);/g,      // clearInterval calls
    /addEventListener\([^)]+\);/g,   // addEventListener calls
    /removeEventListener\([^)]+\);/g, // removeEventListener calls
    /querySelector\([^)]+\);/g,      // querySelector calls
    /querySelectorAll\([^)]+\);/g,   // querySelectorAll calls
    /getElementById\([^)]+\);/g,     // getElementById calls
    /getElementsByClassName\([^)]+\);/g, // getElementsByClassName calls
    /getElementsByTagName\([^)]+\);/g, // getElementsByTagName calls
    /createElement\([^)]+\);/g,      // createElement calls
    /appendChild\([^)]+\);/g,        // appendChild calls
    /removeChild\([^)]+\);/g,        // removeChild calls
    /replaceChild\([^)]+\);/g,       // replaceChild calls
    /insertBefore\([^)]+\);/g,       // insertBefore calls
    /cloneNode\([^)]*\);/g,          // cloneNode calls
    /classList\.[^;]+;/g,            // classList operations
    /style\.[^;]+;/g,               // style operations
    /setAttribute\([^)]+\);/g,       // setAttribute calls
    /getAttribute\([^)]+\);/g,       // getAttribute calls
    /removeAttribute\([^)]+\);/g,    // removeAttribute calls
    /hasAttribute\([^)]+\);/g,       // hasAttribute calls
    /toggleAttribute\([^)]+\);/g,    // toggleAttribute calls
    /dataset\.[^;]+;/g,             // dataset operations
    /innerHTML\s*=\s*[^;]+;/g,      // innerHTML assignments
    /outerHTML\s*=\s*[^;]+;/g,      // outerHTML assignments
    /textContent\s*=\s*[^;]+;/g,    // textContent assignments
    /innerText\s*=\s*[^;]+;/g,      // innerText assignments
    /value\s*=\s*[^;]+;/g,          // value assignments
    /checked\s*=\s*[^;]+;/g,        // checked assignments
    /disabled\s*=\s*[^;]+;/g,       // disabled assignments
    /readonly\s*=\s*[^;]+;/g,       // readonly assignments
    /required\s*=\s*[^;]+;/g,       // required assignments
    /multiple\s*=\s*[^;]+;/g,       // multiple assignments
    /selected\s*=\s*[^;]+;/g,       // selected assignments
    /hidden\s*=\s*[^;]+;/g,         // hidden assignments
    /className\s*=\s*[^;]+;/g,      // className assignments
    /id\s*=\s*[^;]+;/g,             // id assignments
    /name\s*=\s*[^;]+;/g,           // name assignments
    /type\s*=\s*[^;]+;/g,           // type assignments
    /placeholder\s*=\s*[^;]+;/g,    // placeholder assignments
    /title\s*=\s*[^;]+;/g,          // title assignments
    /alt\s*=\s*[^;]+;/g,            // alt assignments
    /src\s*=\s*[^;]+;/g,            // src assignments
    /href\s*=\s*[^;]+;/g,           // href assignments
    /target\s*=\s*[^;]+;/g,         // target assignments
    /rel\s*=\s*[^;]+;/g,            // rel assignments
    /method\s*=\s*[^;]+;/g,         // method assignments
    /action\s*=\s*[^;]+;/g,         // action assignments
    /enctype\s*=\s*[^;]+;/g,        // enctype assignments
    /encoding\s*=\s*[^;]+;/g,        // encoding assignments
    /accept\s*=\s*[^;]+;/g,         // accept assignments
    /acceptCharset\s*=\s*[^;]+;/g,  // acceptCharset assignments
    /action\s*=\s*[^;]+;/g,         // action assignments
    /autocomplete\s*=\s*[^;]+;/g,   // autocomplete assignments
    /autocapitalize\s*=\s*[^;]+;/g, // autocapitalize assignments
    /autocorrect\s*=\s*[^;]+;/g,   // autocorrect assignments
    /autosave\s*=\s*[^;]+;/g,       // autosave assignments
    /results\s*=\s*[^;]+;/g,        // results assignments
    /min\s*=\s*[^;]+;/g,            // min assignments
    /max\s*=\s*[^;]+;/g,            // max assignments
    /step\s*=\s*[^;]+;/g,           // step assignments
    /pattern\s*=\s*[^;]+;/g,        // pattern assignments
    /inputmode\s*=\s*[^;]+;/g,      // inputmode assignments
    /enterkeyhint\s*=\s*[^;]+;/g,   // enterkeyhint assignments
    /spellcheck\s*=\s*[^;]+;/g,     // spellcheck assignments
    /contenteditable\s*=\s*[^;]+;/g, // contenteditable assignments
    /tabindex\s*=\s*[^;]+;/g,       // tabindex assignments
    /role\s*=\s*[^;]+;/g,           // role assignments
    /aria-\w+\s*=\s*[^;]+;/g,       // ARIA attribute assignments
  ];

  jsPatterns.forEach(pattern => {
    sanitizedText = sanitizedText.replace(pattern, '');
  });

  // 4. Clean up multiple consecutive spaces and normalize line breaks
  sanitizedText = sanitizedText.replace(/\s+/g, ' ');
  sanitizedText = sanitizedText.replace(/\n\s*\n/g, '\n\n');
  sanitizedText = sanitizedText.replace(/^\s+|\s+$/g, '');

  // 5. Fix common formatting issues after sanitization
  sanitizedText = sanitizedText.replace(/\s+([.,;:!?])/g, '$1'); // Remove space before punctuation
  sanitizedText = sanitizedText.replace(/([.,;:!?])(?=[^\s])/g, '$1 '); // Add space after punctuation

  return sanitizedText;
}

/**
 * Enhanced sanitization for theological content
 */
export function sanitizeTheologicalResponse(text: string): string {
  let sanitized = sanitizeAIResponse(text);
  
  // Preserve biblical references while removing code
  sanitized = sanitized.replace(/(\d+\s*[A-Za-zçãõáéíóúâêîôûàü]+\s+\d+:\d+(?:-\d+)?)/g, '$1');
  
  // Preserve emphasis markers
  sanitized = sanitized.replace(/\*\*(.*?)\*\*/g, '**$1**');
  sanitized = sanitized.replace(/\*(.*?)\*/g, '*$1*');
  sanitized = sanitized.replace(/\*\*\*(.*?)\*\*\*/g, '***$1***');
  
  return sanitized;
}

/**
 * Sanitize and format AI response for display
 */
export function sanitizeAndFormatResponse(text: string, type: 'general' | 'theological' | 'practical' | 'historical' = 'general'): string {
  let sanitizedText: string;
  
  switch (type) {
    case 'theological':
      sanitizedText = sanitizeTheologicalResponse(text);
      break;
    case 'practical':
    case 'historical':
      sanitizedText = sanitizeAIResponse(text);
      break;
    default:
      sanitizedText = sanitizeAIResponse(text);
  }
  
  return sanitizedText;
}