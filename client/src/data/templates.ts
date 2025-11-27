/**
 * Template categories and prompts for different LLM use cases
 * These are pre-built prompts that users can browse and use as starting points
 */

export interface Template {
  id: string;
  name: string;
  description: string;
  prompt: string;
  type: 'text' | 'image' | 'video';
  llm?: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templates: Template[];
}

export const templateCategories: TemplateCategory[] = [
  {
    id: 'content-writing',
    name: 'Content Writing',
    description: 'Blog posts, articles, and creative writing',
    icon: 'PenTool',
    templates: [
      {
        id: 'blog-post',
        name: 'Blog Post Generator',
        description: 'Create engaging blog posts on any topic',
        prompt: 'Write a comprehensive blog post about [TOPIC]. Include an engaging introduction, 3-5 main sections with subheadings, practical examples, and a conclusion with actionable takeaways. Tone: [TONE]. Target audience: [AUDIENCE]. Write a comprehensive blog post about [TOPIC]. Include an engaging introduction, 3-5 main sections with subheadings, practical examples, and a conclusion with actionable takeaways. Tone: [TONE]. Target audience: [AUDIENCE]. Write a comprehensive blog post about [TOPIC]. Include an engaging introduction, 3-5 main sections with subheadings, practical examples, and a conclusion with actionable takeaways. Tone: [TONE]. Target audience: [AUDIENCE]. Write a comprehensive blog post about [TOPIC]. Include an engaging introduction, 3-5 main sections with subheadings, practical examples, and a conclusion with actionable takeaways. Tone: [TONE]. Target audience: [AUDIENCE]. Write a comprehensive blog post about [TOPIC]. Include an engaging introduction, 3-5 main sections with subheadings, practical examples, and a conclusion with actionable takeaways. Tone: [TONE]. Target audience: [AUDIENCE].',
        type: 'text',
        llm: 'GPT-4'
      },
      {
        id: 'social-media',
        name: 'Social Media Post',
        description: 'Craft compelling social media content',
        prompt: 'Create [NUMBER] engaging social media posts about [TOPIC] for [PLATFORM]. Each post should be platform-appropriate length, include relevant hashtags, and have a clear call-to-action. Tone: [TONE].',
        type: 'text',
        llm: 'Claude'
      },
      {
        id: 'product-description',
        name: 'Product Description',
        description: 'Write persuasive product descriptions',
        prompt: 'Write a compelling product description for [PRODUCT]. Highlight key features, benefits, and unique selling points. Include technical specifications if relevant. Target customer: [CUSTOMER_TYPE]. Length: [LENGTH] words.',
        type: 'text',
        llm: 'GPT-4'
      }
    ]
  },
  {
    id: 'code-development',
    name: 'Code & Development',
    description: 'Programming, debugging, and technical documentation',
    icon: 'Code',
    templates: [
      {
        id: 'code-review',
        name: 'Code Review',
        description: 'Get detailed code reviews and suggestions',
        prompt: 'Review the following [LANGUAGE] code for best practices, performance, security issues, and maintainability. Provide specific suggestions for improvement:\n\n[CODE]',
        type: 'text',
        llm: 'GPT-4'
      },
      {
        id: 'debug-helper',
        name: 'Debug Helper',
        description: 'Identify and fix bugs in your code',
        prompt: 'I\'m getting this error in my [LANGUAGE] code: [ERROR_MESSAGE]. Here\'s the relevant code:\n\n[CODE]\n\nHelp me understand what\'s causing this error and provide a fix with explanation.',
        type: 'text',
        llm: 'Claude'
      },
      {
        id: 'api-documentation',
        name: 'API Documentation',
        description: 'Generate clear API documentation',
        prompt: 'Create comprehensive API documentation for the following endpoint(s). Include request/response examples, parameters, error codes, and usage notes:\n\n[API_DETAILS]',
        type: 'text',
        llm: 'GPT-4'
      }
    ]
  },
  {
    id: 'creative-design',
    name: 'Creative & Design',
    description: 'Image generation and creative concepts',
    icon: 'Palette',
    templates: [
      {
        id: 'logo-design',
        name: 'Logo Design',
        description: 'Generate unique logo concepts',
        prompt: 'Design a modern, minimalist logo for [COMPANY/BRAND]. Industry: [INDUSTRY]. Style: [STYLE]. Color scheme: [COLORS]. The logo should convey [BRAND_VALUES]. Include company name: [YES/NO].',
        type: 'image',
        llm: 'DALL-E 3'
      },
      {
        id: 'product-mockup',
        name: 'Product Mockup',
        description: 'Create product visualization mockups',
        prompt: 'Create a realistic product mockup of [PRODUCT] in [SETTING/CONTEXT]. Style: [STYLE]. Lighting: [LIGHTING]. Perspective: [ANGLE]. Background: [BACKGROUND_DESCRIPTION]. High quality, professional photography style.',
        type: 'image',
        llm: 'Midjourney'
      },
      {
        id: 'character-design',
        name: 'Character Design',
        description: 'Design unique characters',
        prompt: 'Design a [CHARACTER_TYPE] character with the following traits: [DESCRIPTION]. Art style: [STYLE]. Clothing: [OUTFIT_DESCRIPTION]. Setting: [ENVIRONMENT]. Mood: [MOOD]. Full body view, detailed, high quality.',
        type: 'image',
        llm: 'Stable Diffusion'
      }
    ]
  },
  {
    id: 'video-content',
    name: 'Video Content',
    description: 'Video scripts and storyboards',
    icon: 'Video',
    templates: [
      {
        id: 'youtube-script',
        name: 'YouTube Script',
        description: 'Create engaging video scripts',
        prompt: 'Write a YouTube video script about [TOPIC]. Length: [DURATION] minutes. Include: hook (first 10 seconds), introduction, main content with timestamps, call-to-action, and outro. Tone: [TONE]. Target audience: [AUDIENCE].',
        type: 'text',
        llm: 'Claude'
      },
      {
        id: 'video-storyboard',
        name: 'Video Storyboard',
        description: 'Plan your video shot by shot',
        prompt: 'Create a detailed storyboard for a [DURATION]-second video about [TOPIC]. Include: scene descriptions, camera angles, transitions, dialogue/voiceover notes, and visual elements for each shot. Purpose: [PURPOSE].',
        type: 'text',
        llm: 'GPT-4'
      },
      {
        id: 'short-video-concept',
        name: 'Short Video Concept',
        description: 'Generate TikTok/Reels ideas',
        prompt: 'Generate [NUMBER] creative short-form video concepts for [PLATFORM] about [TOPIC/NICHE]. Each concept should include: hook, visual style, key moments, text overlays, and trending audio suggestions. Target: [AUDIENCE].',
        type: 'text',
        llm: 'GPT-4'
      }
    ]
  },
  {
    id: 'business-marketing',
    name: 'Business & Marketing',
    description: 'Marketing copy, emails, and business content',
    icon: 'Briefcase',
    templates: [
      {
        id: 'email-campaign',
        name: 'Email Campaign',
        description: 'Craft effective email sequences',
        prompt: 'Create a [NUMBER]-email sequence for [CAMPAIGN_PURPOSE]. Target audience: [AUDIENCE]. Each email should include: compelling subject line, engaging opening, value proposition, and clear CTA. Tone: [TONE].',
        type: 'text',
        llm: 'Claude'
      },
      {
        id: 'landing-page-copy',
        name: 'Landing Page Copy',
        description: 'Write high-converting landing pages',
        prompt: 'Write landing page copy for [PRODUCT/SERVICE]. Include: attention-grabbing headline, subheadline, benefit-focused sections, social proof elements, objection handling, and persuasive CTA. Target customer: [CUSTOMER_PROFILE].',
        type: 'text',
        llm: 'GPT-4'
      },
      {
        id: 'press-release',
        name: 'Press Release',
        description: 'Professional press releases',
        prompt: 'Write a professional press release for [EVENT/ANNOUNCEMENT]. Include: compelling headline, dateline, lead paragraph with key info, quotes from stakeholders, company boilerplate, and contact information. Tone: professional and newsworthy.',
        type: 'text',
        llm: 'GPT-4'
      }
    ]
  },
  {
    id: 'education-learning',
    name: 'Education & Learning',
    description: 'Study guides, explanations, and tutorials',
    icon: 'BookOpen',
    templates: [
      {
        id: 'study-guide',
        name: 'Study Guide',
        description: 'Create comprehensive study materials',
        prompt: 'Create a detailed study guide for [SUBJECT/TOPIC]. Include: key concepts, definitions, examples, practice questions with answers, and memory aids. Difficulty level: [LEVEL]. Format for easy review.',
        type: 'text',
        llm: 'Claude'
      },
      {
        id: 'eli5-explanation',
        name: 'ELI5 Explanation',
        description: 'Explain complex topics simply',
        prompt: 'Explain [COMPLEX_TOPIC] like I\'m five years old. Use simple analogies, everyday examples, and avoid jargon. Make it engaging and easy to understand while maintaining accuracy.',
        type: 'text',
        llm: 'GPT-4'
      },
      {
        id: 'tutorial',
        name: 'Step-by-Step Tutorial',
        description: 'Create detailed how-to guides',
        prompt: 'Create a step-by-step tutorial for [TASK/SKILL]. Include: prerequisites, required materials/tools, numbered steps with clear instructions, tips for common mistakes, and troubleshooting advice. Target skill level: [BEGINNER/INTERMEDIATE/ADVANCED].',
        type: 'text',
        llm: 'GPT-4'
      }
    ]
  }
];
