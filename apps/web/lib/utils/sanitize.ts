import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content for safe rendering in the contentEditable editor.
 * Allows formatting tags used by execCommand and the checklist feature.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 's', 'strike', 'del',
      'a', 'p', 'br', 'div', 'span',
      'ul', 'ol', 'li',
      'code', 'pre', 'blockquote',
      'h1', 'h2', 'h3',
      'label', 'input',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'type', 'checked', 'class', 'style'],
  });
}
