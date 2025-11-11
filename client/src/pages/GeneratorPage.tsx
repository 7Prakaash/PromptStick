/**
 * GeneratorPage component
 * Unified generator page for text, image, and video prompts
 */

import { useState, useEffect, useRef } from 'react';
import { useRoute } from 'wouter';
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
} from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';
import { FileText, Image, Video } from 'lucide-react';

export default function GeneratorPage() {
  const [, params] = useRoute('/generator/:type');
  const type = params?.type as 'text' | 'image' | 'video';
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
  const queryInputRef = useRef<HTMLTextAreaElement>(null);
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
      setIsGenerating(false);
      setIsSaved(false);

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
      setEditPromptId(null);
      setIsSaved(true);
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
      setIsSaved(true);
    }
  };

  const handleRetryAfterNoMatch = () => {
    queryInputRef.current?.focus();
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
          {/* Left Column: Form */}
          <div className="bg-card rounded-lg border p-6">
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

      {/* No Match Dialog */}
      <NoMatchDialog
        isOpen={showNoMatchDialog}
        onClose={() => setShowNoMatchDialog(false)}
        onRetry={handleRetryAfterNoMatch}
      />
    </div>
  );
}
