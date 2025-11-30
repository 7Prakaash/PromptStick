/**
 * GeneratorPage component
 * Unified generator page for text, image, and video prompts
 */

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import GeneratorForm, { GeneratorParams } from '@/components/GeneratorForm';
import CodeOutput from '@/components/CodeOutput';
import LimitReachedModal from '@/components/LimitReachedModal';
import NoMatchDialog from '@/components/NoMatchDialog';
import { generateTextPrompt } from '@/utils/textPromptGen';
import { generateImagePrompt } from '@/utils/imagePromptGen';
import { generateVideoPrompt } from '@/utils/videoPromptGen';
import { getTemplatesByType } from '@/utils/templateLoader';
import { findTemplateMatches } from '@/utils/templateMatcher';
import {
  savePrompt,
  updatePrompt,
  hasReachedDailyLimit,
  hasReachedMonthlyLimit,
  incrementUsage,
  dispatchUsageUpdate,
  getUsageStats,
  getDailyLimit,
  getMonthlyLimit,
  getAllFolders,
} from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';
import { FileText, Image, Video, Sparkles, Zap, Target, Clock, Layers, Palette, Film, PenTool } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface GeneratorPageProps {
  type: 'text' | 'image' | 'video';
}

export default function GeneratorPage({ type }: GeneratorPageProps) {
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showNoMatchDialog, setShowNoMatchDialog] = useState(false);
  const [limitType, setLimitType] = useState<'daily' | 'monthly'>('daily');
  const [lastParams, setLastParams] = useState<GeneratorParams | null>(null);
  const [editPromptId, setEditPromptId] = useState<string | null>(null);
  const [initialFormValues, setInitialFormValues] = useState<Partial<GeneratorParams> | undefined>(undefined);
  const [lastQueryForCycling, setLastQueryForCycling] = useState<string>('');
  const [matchIndex, setMatchIndex] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);
  const [savedPromptId, setSavedPromptId] = useState<string | null>(null);
  const [lastTemplateName, setLastTemplateName] = useState<string | undefined>(undefined);
  const queryInputRef = useRef<HTMLTextAreaElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const [formHeight, setFormHeight] = useState<number | null>(null);
  const { toast} = useToast();

  const [stats, setStats] = useState(getUsageStats());
  const [folders, setFolders] = useState(getAllFolders());
  const dailyLimit = getDailyLimit();
  const monthlyLimit = getMonthlyLimit();
  const dailyPercent = (stats.daily.count / dailyLimit) * 100;
  const monthlyPercent = (stats.monthly.count / monthlyLimit) * 100;

  useEffect(() => {
    const handleUsageUpdate = () => {
      setStats(getUsageStats());
    };
    window.addEventListener('usageUpdated', handleUsageUpdate);
    return () => window.removeEventListener('usageUpdated', handleUsageUpdate);
  }, []);

  useEffect(() => {
    setFolders(getAllFolders());
    
    const handleStorageChange = () => {
      setFolders(getAllFolders());
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('foldersUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('foldersUpdated', handleStorageChange);
    };
  }, []);

  // Measure the form container height using ResizeObserver
  useLayoutEffect(() => {
    const formContainer = formContainerRef.current;
    if (!formContainer) return;

    const measureHeight = () => {
      setFormHeight(formContainer.offsetHeight);
    };

    // Initial measurement
    measureHeight();

    // Use ResizeObserver to track dynamic changes
    const resizeObserver = new ResizeObserver(() => {
      measureHeight();
    });
    resizeObserver.observe(formContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Check for edit prompt or template in sessionStorage
  useEffect(() => {
    const editData = sessionStorage.getItem('editPrompt');
    if (editData) {
      try {
        const editPrompt = JSON.parse(editData);
        if (editPrompt.type === type) {
          setEditPromptId(editPrompt.id);
          setGeneratedPrompt(editPrompt.generatedPrompt);
          setInitialFormValues({
            query: editPrompt.query,
            llm: editPrompt.llm,
            tone: editPrompt.tone,
            style: editPrompt.style || [],
          });
          setLastParams({
            query: editPrompt.query,
            llm: editPrompt.llm,
            tone: editPrompt.tone,
            style: editPrompt.style || [],
          });
        }
        sessionStorage.removeItem('editPrompt');
      } catch (e) {
        console.error('Error loading edit data:', e);
      }
    }

    const templateData = sessionStorage.getItem('template');
    if (templateData) {
      try {
        const template = JSON.parse(templateData);
        sessionStorage.removeItem('template');
      } catch (e) {
        console.error('Error loading template:', e);
      }
    }
  }, [type]);

  const pageConfig = {
    text: {
      icon: FileText,
      title: 'Text Prompt Generator',
      description: 'Generate optimized prompts for text-based AI models',
    },
    image: {
      icon: Image,
      title: 'Image Prompt Generator',
      description: 'Create detailed prompts for image generation models',
    },
    video: {
      icon: Video,
      title: 'Video Prompt Generator',
      description: 'Plan video content with structured prompts',
    },
  };

  const seoContent = {
    text: {
      howItWorks: {
        title: 'How the Text Prompt Generator Works',
        steps: [
          {
            number: 1,
            title: 'Describe Your Goal',
            description: 'Enter a clear description of the text content you want to create. Be specific about the topic, purpose, and any key points you want to cover.',
          },
          {
            number: 2,
            title: 'Select Your AI Model',
            description: 'Choose the target AI model like ChatGPT, Claude, or Gemini. Each model has unique strengths, and your prompt will be optimized accordingly.',
          },
          {
            number: 3,
            title: 'Customize Tone & Style',
            description: 'Pick a tone (professional, casual, creative) and style options to match your needs. This ensures the output aligns with your brand voice.',
          },
          {
            number: 4,
            title: 'Generate & Refine',
            description: 'Click generate to receive your optimized prompt. Copy it directly or edit it further before using it with your preferred AI tool.',
          },
        ],
      },
      benefits: {
        title: 'Benefits & Features',
        items: [
          { icon: Zap, text: 'Instant prompt generation with smart template matching' },
          { icon: Target, text: 'Prompts tailored to specific AI models for better results' },
          { icon: PenTool, text: 'Multiple tone options from formal to creative writing' },
          { icon: Layers, text: 'Style modifiers for detailed, concise, or step-by-step outputs' },
          { icon: Clock, text: 'Save and organize prompts for quick reuse' },
          { icon: Sparkles, text: 'Professional-grade prompts without prompt engineering expertise' },
        ],
      },
      faqs: {
        title: 'Frequently Asked Questions',
        items: [
          {
            question: 'What types of text prompts can I create?',
            answer: 'You can create prompts for blog posts, emails, marketing copy, creative writing, technical documentation, social media content, and much more. The generator adapts to virtually any text-based AI task.',
          },
          {
            question: 'Which AI models are supported?',
            answer: 'PromptStick supports all major text-based AI models including ChatGPT (GPT-4, GPT-3.5), Claude (Anthropic), Gemini (Google), and other popular language models.',
          },
          {
            question: 'How do tone and style options affect my prompt?',
            answer: 'Tone settings adjust the voice (professional, casual, friendly), while style options control the format (detailed explanations, concise summaries, step-by-step guides). Together, they ensure your AI output matches your exact needs.',
          },
          {
            question: 'Can I save my generated prompts?',
            answer: 'Yes, you can save any generated prompt to your personal library. Organize them into folders, mark favorites, and access them anytime for quick reuse.',
          },
          {
            question: 'Is there a limit to how many prompts I can generate?',
            answer: 'Free users have a daily limit of 5 prompts and a monthly limit of 50 prompts. This resets automatically, giving you consistent access to the tool.',
          },
        ],
      },
    },
    image: {
      howItWorks: {
        title: 'How the Image Prompt Generator Works',
        steps: [
          {
            number: 1,
            title: 'Describe Your Vision',
            description: 'Enter a description of the image you want to create. Include details about the subject, setting, mood, and any specific elements you envision.',
          },
          {
            number: 2,
            title: 'Choose Your Platform',
            description: 'Select your target image generator like DALL-E, Midjourney, or Stable Diffusion. Each platform has different prompt syntax and capabilities.',
          },
          {
            number: 3,
            title: 'Apply Visual Styles',
            description: 'Add artistic styles, lighting preferences, camera angles, and other visual modifiers to shape the aesthetic of your generated image.',
          },
          {
            number: 4,
            title: 'Generate & Copy',
            description: 'Get your optimized image prompt ready to paste directly into your favorite AI image generator for stunning visual results.',
          },
        ],
      },
      benefits: {
        title: 'Benefits & Features',
        items: [
          { icon: Palette, text: 'Pre-built artistic style templates for consistent aesthetics' },
          { icon: Target, text: 'Platform-specific optimization for DALL-E, Midjourney, and more' },
          { icon: Layers, text: 'Comprehensive modifier library for lighting, composition, and mood' },
          { icon: Sparkles, text: 'Professional photography and art terminology built-in' },
          { icon: Clock, text: 'Quick generation saves hours of prompt trial and error' },
          { icon: Zap, text: 'Higher-quality AI images with expert-crafted prompts' },
        ],
      },
      faqs: {
        title: 'Frequently Asked Questions',
        items: [
          {
            question: 'What image generators work with these prompts?',
            answer: 'Our prompts are optimized for popular platforms including DALL-E (OpenAI), Midjourney, Stable Diffusion, Leonardo AI, and other major image generation tools.',
          },
          {
            question: 'How do I get better image results?',
            answer: 'Be specific in your description, choose appropriate styles that match your vision, and select the correct target platform. Our generator automatically includes technical details that improve output quality.',
          },
          {
            question: 'What visual styles are available?',
            answer: 'Choose from photorealistic, digital art, oil painting, watercolor, anime, 3D render, cinematic, minimalist, and many more artistic styles to achieve your desired look.',
          },
          {
            question: 'Can I create prompts for commercial use?',
            answer: 'Yes, the prompts you generate are yours to use. However, always check the terms of service of your chosen AI image generator regarding commercial usage rights.',
          },
          {
            question: 'Why are platform-specific prompts important?',
            answer: 'Each AI image generator interprets prompts differently. Midjourney prefers concise, stylistic keywords while DALL-E works better with descriptive sentences. Our tool optimizes for each platform.',
          },
        ],
      },
    },
    video: {
      howItWorks: {
        title: 'How the Video Prompt Generator Works',
        steps: [
          {
            number: 1,
            title: 'Define Your Concept',
            description: 'Describe the video content you want to create, including the subject, action, scene, and overall concept you have in mind.',
          },
          {
            number: 2,
            title: 'Select Video Platform',
            description: 'Choose your target AI video tool like Runway, Pika, or Sora. Each platform has unique capabilities and prompt requirements.',
          },
          {
            number: 3,
            title: 'Add Motion & Style',
            description: 'Specify camera movements, transitions, pacing, and visual styles to control how your video looks and feels.',
          },
          {
            number: 4,
            title: 'Export Your Prompt',
            description: 'Receive a detailed video prompt structured for your chosen platform, ready to generate professional-quality AI video content.',
          },
        ],
      },
      benefits: {
        title: 'Benefits & Features',
        items: [
          { icon: Film, text: 'Prompts structured for AI video generation best practices' },
          { icon: Target, text: 'Platform-specific formatting for Runway, Pika, Sora, and more' },
          { icon: Layers, text: 'Camera movement and transition suggestions included' },
          { icon: Sparkles, text: 'Cinematic terminology for professional-looking results' },
          { icon: Clock, text: 'Skip the learning curve of video prompt engineering' },
          { icon: Zap, text: 'Consistent, high-quality video outputs every time' },
        ],
      },
      faqs: {
        title: 'Frequently Asked Questions',
        items: [
          {
            question: 'Which AI video generators are supported?',
            answer: 'Our prompts work with leading AI video tools including Runway Gen-2/Gen-3, Pika Labs, Sora (OpenAI), Luma Dream Machine, and other text-to-video platforms.',
          },
          {
            question: 'How long can the generated videos be?',
            answer: 'Video length depends on your chosen platform. Most AI video generators create clips from 4 to 16 seconds. Our prompts are optimized for these typical durations.',
          },
          {
            question: 'Can I specify camera movements in my prompt?',
            answer: 'Yes, you can include camera movements like pan, zoom, dolly, and tracking shots. Our style options help you add professional cinematography elements to your prompts.',
          },
          {
            question: 'What makes a good video prompt different from an image prompt?',
            answer: 'Video prompts need to describe motion, timing, and transitions in addition to visual elements. Our generator structures prompts to capture the temporal aspects of video content.',
          },
          {
            question: 'Are these prompts good for commercial video projects?',
            answer: 'The prompts themselves are free to use commercially. Check your AI video platform terms for usage rights on the generated video content.',
          },
          {
            question: 'How do I get the best results from AI video generators?',
            answer: 'Keep your concept focused, choose appropriate styles for your content type, and be specific about camera movements. Our generator handles the technical formatting for optimal results.',
          },
        ],
      },
    },
  };

  const config = pageConfig[type];
  const seo = seoContent[type];
  const Icon = config.icon;

  const handleGenerate = async (params: GeneratorParams) => {
    // Check limits
    if (hasReachedDailyLimit()) {
      setLimitType('daily');
      setShowLimitModal(true);
      return;
    }
    if (hasReachedMonthlyLimit()) {
      setLimitType('monthly');
      setShowLimitModal(true);
      return;
    }

    setIsGenerating(true);
    setLastParams(params);

    // Check if query has changed - reset match index if so
    let currentMatchIndex = matchIndex;
    if (params.query !== lastQueryForCycling) {
      currentMatchIndex = 0;
      setMatchIndex(0);
      setLastQueryForCycling(params.query);
    } else {
      // Same query - increment to next match
      currentMatchIndex = matchIndex + 1;
      setMatchIndex(currentMatchIndex);
    }

    // Simulate generation delay for better UX
    setTimeout(() => {
      let prompt = '';

      // Step 1: Load templates for the current generator type
      const templates = getTemplatesByType(type);

      // Step 2: Find all matching templates sorted by score (get up to 10 matches)
      const allMatches = findTemplateMatches(params.query, templates, 10);

      // Step 3: Wrap around if index exceeds available matches
      if (currentMatchIndex >= allMatches.length && allMatches.length > 0) {
        currentMatchIndex = 0;
        setMatchIndex(0);
        console.log('Cycling back to first match');
      }

      // Step 4: Select the template at the current match index (or null if no matches)
      const matchedTemplate = allMatches[currentMatchIndex] || null;

      // Check if no match found
      if (!matchedTemplate) {
        setIsGenerating(false);
        setShowNoMatchDialog(true);
        return;
      }

      // Log matched template for debugging
      console.log(
        `Match #${currentMatchIndex + 1}:`,
        matchedTemplate.name,
        'with score:',
        matchedTemplate.score
      );

      // Step 5: Generate prompt with template matching + user customization
      if (type === 'text') {
        prompt = generateTextPrompt({
          query: params.query,
          tone: params.tone,
          llm: params.llm,
          style: params.style,
          matchedTemplate: matchedTemplate,
        });
      } else if (type === 'image') {
        prompt = generateImagePrompt({
          query: params.query,
          llm: params.llm,
          style: params.style,
          matchedTemplate: matchedTemplate,
        });
      } else if (type === 'video') {
        prompt = generateVideoPrompt({
          query: params.query,
          llm: params.llm,
          style: params.style,
          matchedTemplate: matchedTemplate,
        });
      }

      setGeneratedPrompt(prompt);
      setLastTemplateName(matchedTemplate.name);
      setIsGenerating(false);
      setIsSaved(false);
      setSavedPromptId(null);

      // Only increment usage counter after successful generation with valid match
      incrementUsage();
      dispatchUsageUpdate();

      toast({
        title: 'Prompt Generated!',
      });
    }, 800);
  };

  const handleEdit = (editedPrompt: string) => {
    setGeneratedPrompt(editedPrompt);
    setIsSaved(false);
  };

  const handleSave = () => {
    if (!generatedPrompt || !lastParams) return;

    if (isSaved) {
      toast({
        title: 'Already saved!',
        description: 'This prompt is already in your library',
      });
      return;
    }

    if (editPromptId) {
      // Update existing prompt
      updatePrompt(editPromptId, {
        query: lastParams.query,
        generatedPrompt,
        llm: lastParams.llm,
        tone: lastParams.tone,
        style: lastParams.style,
      });
      
      toast({
        title: 'Updated!',
        description: 'Prompt updated in your library',
      });
      setSavedPromptId(editPromptId);
      setEditPromptId(null);
      setIsSaved(true);
    } else {
      // Save new prompt
      const newPrompt = savePrompt({
        type,
        name: lastTemplateName,
        query: lastParams.query,
        generatedPrompt,
        llm: lastParams.llm,
        tone: lastParams.tone,
        style: lastParams.style,
        isFavorite: false,
      });

      toast({
        title: 'Saved!',
        description: 'Prompt saved to your library',
      });
      setSavedPromptId(newPrompt.id);
      setIsSaved(true);
    }
  };

  const handleSaveToFolder = (folderId: string) => {
    if (!generatedPrompt || !lastParams) return;

    const folder = folders.find(f => f.id === folderId);

    // If prompt is already saved, move it to the selected folder
    if (isSaved && savedPromptId) {
      updatePrompt(savedPromptId, { folderId });
      
      toast({
        title: 'Moved!',
        description: folder ? `Prompt moved to "${folder.name}"` : 'Prompt moved to folder',
      });
      return;
    }

    // Save new prompt directly to folder
    const newPrompt = savePrompt({
      type,
      name: lastTemplateName,
      query: lastParams.query,
      generatedPrompt,
      llm: lastParams.llm,
      tone: lastParams.tone,
      style: lastParams.style,
      isFavorite: false,
      folderId,
    });

    toast({
      title: 'Saved!',
      description: folder ? `Prompt saved to "${folder.name}"` : 'Prompt saved to folder',
    });
    setSavedPromptId(newPrompt.id);
    setIsSaved(true);
  };

  const handleRetryAfterNoMatch = () => {
    queryInputRef.current?.focus();
  };

  return (
    <div className="min-h-screen py-8" data-testid={`page-generator-${type}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold" data-testid="text-page-title">
                  {config.title}
                </h1>
              </div>
              <p className="text-muted-foreground" data-testid="text-page-description">
                {config.description}
              </p>
            </div>

            {/* Credit Usage Bar */}
            <div className="flex flex-col items-end gap-1" data-testid="usage-counter">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Daily: {stats.daily.count}/{dailyLimit}
                </span>
                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      dailyPercent > 80 ? 'bg-destructive' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(dailyPercent, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Monthly: {stats.monthly.count}/{monthlyLimit}
                </span>
                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      monthlyPercent > 80 ? 'bg-destructive' : 'bg-chart-2'
                    }`}
                    style={{ width: `${Math.min(monthlyPercent, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[2fr,3fr] gap-8">
          {/* Left Column: Form */}
          <div ref={formContainerRef} className="bg-card rounded-lg border p-6">
            <GeneratorForm
              ref={queryInputRef}
              type={type}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              initialValues={initialFormValues}
            />
          </div>

          {/* Right Column: Output */}
          <div>
            <CodeOutput
              prompt={generatedPrompt}
              onSave={handleSave}
              showSave={!!generatedPrompt}
              onEdit={handleEdit}
              maxHeight={formHeight}
              folders={folders}
              onSaveToFolder={handleSaveToFolder}
            />
          </div>
        </div>

        {/* SEO Sections */}
        <div className="max-w-7xl mx-auto mt-16 space-y-16">
          {/* How It Works Section */}
          <section data-testid="section-how-it-works">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">{seo.howItWorks.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {seo.howItWorks.steps.map((step) => (
                <div
                  key={step.number}
                  className="bg-card rounded-lg border p-6"
                  data-testid={`step-${step.number}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                      {step.number}
                    </div>
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Benefits & Features Section */}
          <section data-testid="section-benefits">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">{seo.benefits.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {seo.benefits.items.map((item, index) => {
                const BenefitIcon = item.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-card rounded-lg border"
                    data-testid={`benefit-${index}`}
                  >
                    <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
                      <BenefitIcon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm leading-relaxed">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FAQ Section */}
          <section data-testid="section-faq">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">{seo.faqs.title}</h2>
            <div className="bg-card rounded-lg border">
              <Accordion type="single" collapsible className="w-full">
                {seo.faqs.items.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`faq-${index}`}
                    className="px-6"
                    data-testid={`faq-${index}`}
                  >
                    <AccordionTrigger className="text-left py-5 hover:no-underline">
                      <span className="font-medium">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        </div>
      </div>

      {/* Limit Modal */}
      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limitType={limitType}
      />

      {/* No Match Dialog */}
      <NoMatchDialog
        isOpen={showNoMatchDialog}
        onClose={() => setShowNoMatchDialog(false)}
        onRetry={handleRetryAfterNoMatch}
      />
    </div>
  );
}
