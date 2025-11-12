/**
 * Central route utilities for consistent navigation
 */

export type GeneratorType = 'text' | 'image' | 'video';

/**
 * Get the path for a generator type
 */
export function getGeneratorPath(type: GeneratorType): string {
  const paths: Record<GeneratorType, string> = {
    text: '/text-prompt-generator',
    image: '/image-prompt-generator',
    video: '/video-prompt-generator',
  };
  return paths[type];
}

/**
 * Convert template name to URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get template detail path
 */
export function getTemplatePath(categoryId: string): string {
  return `/templates/${categoryId}`;
}
