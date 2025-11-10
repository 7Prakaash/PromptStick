/**
 * Template Loader Utility
 * Loads and provides access to JSON template files
 */

import textTemplates from '@/data/templates/text-templates.json';
import imageTemplates from '@/data/templates/image-templates.json';
import videoTemplates from '@/data/templates/video-templates.json';

export interface Template {
  id: string;
  name: string;
  description: string;
  template: string;
  keywords: string[];
  defaultLLM?: string;
  defaultTone?: string;
}

export type GeneratorType = 'text' | 'image' | 'video';

/**
 * Get templates for a specific generator type
 */
export function getTemplatesByType(type: GeneratorType): Template[] {
  switch (type) {
    case 'text':
      return textTemplates as Template[];
    case 'image':
      return imageTemplates as Template[];
    case 'video':
      return videoTemplates as Template[];
    default:
      return [];
  }
}

/**
 * Get a specific template by ID and type
 */
export function getTemplateById(id: string, type: GeneratorType): Template | null {
  const templates = getTemplatesByType(type);
  return templates.find(t => t.id === id) || null;
}

/**
 * Get all templates (useful for debugging or admin views)
 */
export function getAllTemplates(): { text: Template[]; image: Template[]; video: Template[] } {
  return {
    text: textTemplates as Template[],
    image: imageTemplates as Template[],
    video: videoTemplates as Template[]
  };
}
