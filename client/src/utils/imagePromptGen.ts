/**
 * Image prompt generation utility
 * Generates optimized prompts for image generation models (DALL-E, Midjourney, Stable Diffusion)
 */

interface ImagePromptOptions {
  query: string;
  style?: string[];
  llm: string;
}

/**
 * Generate an optimized image generation prompt
 */
export const generateImagePrompt = (options: ImagePromptOptions): string => {
  const { query, style = [], llm } = options;
  
  let prompt = query;
  
  // Add style modifiers
  const styleEnhancements: string[] = [];
  
  if (style.includes('photorealistic')) {
    styleEnhancements.push('photorealistic', 'high quality', '8k resolution');
  }
  
  if (style.includes('artistic')) {
    styleEnhancements.push('artistic', 'creative interpretation', 'expressive');
  }
  
  if (style.includes('minimalist')) {
    styleEnhancements.push('minimalist design', 'clean', 'simple composition');
  }
  
  if (style.includes('detailed')) {
    styleEnhancements.push('highly detailed', 'intricate', 'fine details');
  }
  
  if (style.includes('vibrant')) {
    styleEnhancements.push('vibrant colors', 'saturated', 'vivid');
  }
  
  if (style.includes('cinematic')) {
    styleEnhancements.push('cinematic lighting', 'dramatic', 'film quality');
  }
  
  // LLM-specific optimizations
  if (llm === 'DALL-E 3') {
    // DALL-E 3 works best with natural language descriptions
    if (styleEnhancements.length > 0) {
      prompt += `, ${styleEnhancements.join(', ')}`;
    }
    // Add quality markers
    if (!style.includes('photorealistic')) {
      prompt += ', high quality, detailed';
    }
  }
  
  if (llm === 'Midjourney') {
    // Midjourney uses parameter syntax
    const params: string[] = [];
    
    if (styleEnhancements.length > 0) {
      prompt += `, ${styleEnhancements.join(', ')}`;
    }
    
    // Add common Midjourney parameters
    if (style.includes('photorealistic')) {
      params.push('--style raw');
    }
    
    if (style.includes('artistic')) {
      params.push('--stylize 1000');
    }
    
    params.push('--v 6');
    params.push('--ar 16:9');
    
    if (params.length > 0) {
      prompt += ' ' + params.join(' ');
    }
  }
  
  if (llm === 'Stable Diffusion') {
    // Stable Diffusion works well with detailed keyword lists
    if (styleEnhancements.length > 0) {
      prompt += ', ' + styleEnhancements.join(', ');
    }
    
    // Add quality boosters
    prompt += ', masterpiece, best quality, sharp focus';
    
    // Add negative prompt guidance
    prompt += '\n\nNegative prompt: blurry, low quality, distorted, deformed';
  }
  
  return prompt.trim();
};

/**
 * Get suggested styles for image prompts
 */
export const getImageStyleOptions = (): string[] => {
  return [
    'photorealistic',
    'artistic',
    'minimalist',
    'detailed',
    'vibrant',
    'cinematic',
    'abstract',
    'cartoon',
    '3d-render'
  ];
};
