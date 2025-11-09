/**
 * Video prompt generation utility
 * Generates optimized prompts for video generation and video content planning
 */

interface VideoPromptOptions {
  query: string;
  style?: string[];
  llm: string;
}

/**
 * Generate an optimized video prompt or script outline
 */
export const generateVideoPrompt = (options: VideoPromptOptions): string => {
  const { query, style = [], llm } = options;
  
  let prompt = '';
  
  // Add structural guidance for video content
  prompt += 'Create a detailed video concept for: ' + query;
  
  // Add style-specific instructions
  if (style.includes('short-form')) {
    prompt += '\n\nFormat: 15-60 second short-form video (TikTok/Reels/Shorts)';
    prompt += '\nInclude: Hook (first 3 seconds), main content, and call-to-action';
  }
  
  if (style.includes('long-form')) {
    prompt += '\n\nFormat: 5-15 minute long-form video (YouTube)';
    prompt += '\nInclude: Introduction, main content sections with timestamps, and conclusion';
  }
  
  if (style.includes('tutorial')) {
    prompt += '\n\nStyle: Educational tutorial';
    prompt += '\nInclude: Clear step-by-step instructions, visual demonstrations, and key takeaways';
  }
  
  if (style.includes('cinematic')) {
    prompt += '\n\nStyle: Cinematic production';
    prompt += '\nInclude: Shot descriptions, camera movements, lighting notes, and mood/atmosphere';
  }
  
  if (style.includes('animated')) {
    prompt += '\n\nStyle: Animated video';
    prompt += '\nInclude: Animation style, character descriptions, transitions, and visual effects';
  }
  
  // Add common video elements
  const includeElements: string[] = [];
  
  if (style.includes('with-narration')) {
    includeElements.push('Voiceover script with timing');
  }
  
  if (style.includes('with-music')) {
    includeElements.push('Music/audio suggestions');
  }
  
  if (style.includes('with-text-overlays')) {
    includeElements.push('On-screen text overlays and captions');
  }
  
  if (includeElements.length > 0) {
    prompt += '\n\nInclude: ' + includeElements.join(', ');
  }
  
  // LLM-specific formatting
  if (llm === 'GPT-4') {
    prompt += '\n\nProvide the output in a structured format with clear sections.';
  }
  
  if (llm === 'Claude') {
    prompt += '\n\nOrganize the response with clear headings and detailed descriptions for each scene/section.';
  }
  
  // Add technical specifications if needed
  if (style.includes('professional')) {
    prompt += '\n\nInclude: Technical specifications (resolution, aspect ratio, frame rate recommendations)';
  }
  
  return prompt.trim();
};

/**
 * Get suggested styles for video prompts
 */
export const getVideoStyleOptions = (): string[] => {
  return [
    'short-form',
    'long-form',
    'tutorial',
    'cinematic',
    'animated',
    'with-narration',
    'with-music',
    'with-text-overlays',
    'professional',
    'casual-vlog'
  ];
};
