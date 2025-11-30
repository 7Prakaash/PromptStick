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
import { FileText, Image, Video } from 'lucide-react';

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
