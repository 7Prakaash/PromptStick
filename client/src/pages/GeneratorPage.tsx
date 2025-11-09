/**
 * GeneratorPage component
 * Unified generator page for text, image, and video prompts
 */

import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import GeneratorForm, { GeneratorParams } from '@/components/GeneratorForm';
import CodeOutput from '@/components/CodeOutput';
import UsageLimitBar from '@/components/UsageLimitBar';
import LimitReachedModal from '@/components/LimitReachedModal';
import { generateTextPrompt } from '@/utils/textPromptGen';
import { generateImagePrompt } from '@/utils/imagePromptGen';
import { generateVideoPrompt } from '@/utils/videoPromptGen';
import {
  savePrompt,
  hasReachedDailyLimit,
  hasReachedMonthlyLimit,
} from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';
import { FileText, Image, Video } from 'lucide-react';

export default function GeneratorPage() {
  const [, params] = useRoute('/generator/:type');
  const type = params?.type as 'text' | 'image' | 'video';
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitType, setLimitType] = useState<'daily' | 'monthly'>('daily');
  const [lastParams, setLastParams] = useState<GeneratorParams | null>(null);
  const [editPromptId, setEditPromptId] = useState<string | null>(null);
  const [initialFormValues, setInitialFormValues] = useState<Partial<GeneratorParams> | undefined>(undefined);
  const { toast } = useToast();

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

  const config = pageConfig[type];
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

    // Simulate generation delay for better UX
    setTimeout(() => {
      let prompt = '';

      if (type === 'text') {
        prompt = generateTextPrompt({
          query: params.query,
          tone: params.tone,
          llm: params.llm,
          style: params.style,
        });
      } else if (type === 'image') {
        prompt = generateImagePrompt({
          query: params.query,
          llm: params.llm,
          style: params.style,
        });
      } else if (type === 'video') {
        prompt = generateVideoPrompt({
          query: params.query,
          llm: params.llm,
          style: params.style,
        });
      }

      setGeneratedPrompt(prompt);
      setIsGenerating(false);

      toast({
        title: 'Prompt Generated!',
        description: 'Your optimized prompt is ready',
      });
    }, 800);
  };

  const handleSave = () => {
    if (!generatedPrompt || !lastParams) return;

    if (editPromptId) {
      // Update existing prompt
      const { updatePrompt } = require('@/utils/localStorage');
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
      setEditPromptId(null);
    } else {
      // Save new prompt
      savePrompt({
        type,
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
    }
  };

  return (
    <div className="min-h-screen py-8" data-testid={`page-generator-${type}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
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

        {/* Two Column Layout */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[2fr,3fr] gap-8">
          {/* Left Column: Form + Usage */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <GeneratorForm
                type={type}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                initialValues={initialFormValues}
              />
            </div>
            <UsageLimitBar />
          </div>

          {/* Right Column: Output */}
          <div>
            <CodeOutput
              prompt={generatedPrompt}
              onSave={handleSave}
              showSave={!!generatedPrompt}
            />
          </div>
        </div>
      </div>

      {/* Limit Modal */}
      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limitType={limitType}
      />
    </div>
  );
}
