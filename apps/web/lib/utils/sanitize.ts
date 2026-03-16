import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content for safe rendering with dangerouslySetInnerHTML.
 * Currently all note content is rendered as text (React auto-escapes),
 * so this is only needed if/when we add rich text/markdown rendering.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'h1', 'h2', 'h3'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}
