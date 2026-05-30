import DOMPurify from 'isomorphic-dompurify';

/**
 * Remove tags HTML/scripts (mitigação XSS antes de persistir texto livre).
 */
export function sanitizeText(value: string): string {
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}
