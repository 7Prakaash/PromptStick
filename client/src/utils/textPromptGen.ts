/**
 * Text prompt generation utility
 * Generates optimized prompts for text-based LLMs (GPT, Claude, etc.)
 */

interface TextPromptOptions {
  query: string;
  tone?: string;
  llm: string;
  style?: string[];
}

/**
 * Generate an optimized text prompt based on user inputs
 */
export const generateTextPrompt = (options: TextPromptOptions): string => {
  const { query, tone = 'professional', llm, style = [] } = options;
  
  let prompt = '';
  
  // Add role/context setting if needed
  if (style.includes('expert')) {
    prompt += 'You are an expert in this field. ';
  }
  
  // Add tone instruction
  const toneMap: Record<string, string> = {
    professional: 'Maintain a professional and informative tone.',
    casual: 'Use a casual, conversational tone.',
    creative: 'Be creative and imaginative in your response.',
    technical: 'Provide detailed technical information with precision.',
    friendly: 'Be warm, friendly, and approachable.',
    formal: 'Use formal language and proper business etiquette.'
  };
  
  if (tone && toneMap[tone]) {
    prompt += toneMap[tone] + ' ';
  }
  
  // Add the main query
  prompt += query;
  
  // Add style modifiers
  if (style.includes('detailed')) {
    prompt += '\n\nProvide a comprehensive and detailed response with examples.';
  }
  
  if (style.includes('concise')) {
    prompt += '\n\nKeep the response concise and to the point.';
  }
  
  if (style.includes('step-by-step')) {
    prompt += '\n\nBreak down your response into clear, numbered steps.';
  }
  
  if (style.includes('with-examples')) {
    prompt += '\n\nInclude relevant examples to illustrate your points.';
  }
  
  // LLM-specific optimizations
  if (llm === 'Claude') {
    // Claude responds well to XML-style tags
    if (style.includes('structured')) {
      prompt = `<task>\n${prompt}\n</task>\n\nProvide a well-structured response.`;
    }
  }
  
  if (llm === 'GPT-4') {
    // GPT-4 benefits from explicit format instructions
    if (style.includes('formatted')) {
      prompt += '\n\nFormat your response with clear headings and bullet points where appropriate.';
    }
  }
  
  return prompt.trim();
};

/**
 * Get suggested styles for text prompts
 */
export const getTextStyleOptions = (): string[] => {
  return [
    'detailed',
    'concise',
    'step-by-step',
    'with-examples',
    'expert',
    'structured',
    'formatted'
  ];
};

/**
 * Get available tone options
 */
export const getToneOptions = (): string[] => {
  return [
    'professional',
    'casual',
    'creative',
    'technical',
    'friendly',
    'formal'
  ];
};
