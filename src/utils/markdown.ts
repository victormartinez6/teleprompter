/**
 * Utilitário para processamento básico de Markdown no teleprompter
 */

export interface MarkdownConfig {
  enableBold: boolean;
  enableItalic: boolean;
  enableHeaders: boolean;
  enableLineBreaks: boolean;
}

export const DEFAULT_MARKDOWN_CONFIG: MarkdownConfig = {
  enableBold: true,
  enableItalic: true,
  enableHeaders: true,
  enableLineBreaks: true,
};

/**
 * Converte texto markdown básico para HTML
 */
export function parseMarkdown(text: string, config: MarkdownConfig = DEFAULT_MARKDOWN_CONFIG): string {
  let html = text;

  if (config.enableHeaders) {
    // Headers (# ## ###)
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold mb-4">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mb-4">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mb-6">$1</h1>');
  }

  if (config.enableBold) {
    // Bold (**texto** ou __texto__)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong class="font-bold">$1</strong>');
  }

  if (config.enableItalic) {
    // Italic (*texto* ou _texto_)
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');
  }

  if (config.enableLineBreaks) {
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="mb-4">');
    html = html.replace(/\n/g, '<br>');
    
    // Wrap in paragraph tags if not already wrapped
    if (!html.startsWith('<')) {
      html = `<p class="mb-4">${html}</p>`;
    }
  }

  return html;
}

/**
 * Remove formatação markdown do texto (para contagem de palavras, etc.)
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '') // Headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/__(.*?)__/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1') // Italic
    .replace(/_(.*?)_/g, '$1') // Italic
    .replace(/\n{2,}/g, '\n\n') // Multiple line breaks
    .trim();
}

/**
 * Detecta se o texto contém formatação markdown
 */
export function hasMarkdownFormatting(text: string): boolean {
  const markdownPatterns = [
    /^#{1,6}\s+/m, // Headers
    /\*\*.*?\*\*/, // Bold
    /__.*?__/, // Bold
    /\*.*?\*/, // Italic
    /_.*?_/, // Italic
  ];

  return markdownPatterns.some(pattern => pattern.test(text));
}

/**
 * Converte HTML básico de volta para markdown
 */
export function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p><p[^>]*>/gi, '\n\n')
    .replace(/<\/?p[^>]*>/gi, '')
    .trim();
}
