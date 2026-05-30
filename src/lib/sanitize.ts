/**
 * Sanitização de texto para persistência (sem DOM/jsdom).
 * Compatível com Vercel serverless — evita isomorphic-dompurify + jsdom (ERR_REQUIRE_ESM).
 *
 * Remove tags HTML, blocos script/style e protocolos perigosos antes de salvar no banco.
 */
export function sanitizeText(value: string): string {
  if (typeof value !== 'string') return '';

  let s = value;

  s = s.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<style\b[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<[^>]+>/g, '');
  s = s
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/gi, "'")
    .replace(/&#x27;/gi, "'");
  s = s.replace(/<[^>]+>/g, '');
  s = s
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '');

  return s.trim();
}
