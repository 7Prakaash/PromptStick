/**
 * PromptTemplateDialog Component
 * A modal dialog for viewing, customizing, and managing prompt templates
 */

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Copy, Edit3, Check, Save, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Template } from '@/data/templates';
import { savePrompt as savePromptToStorage, getAllPrompts } from '@/utils/localStorage';

interface PromptTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
  onSave?: (prompt: string) => void;
}

interface PlaceholderSegment {
  type: 'text' | 'placeholder';
  content: string;
  originalContent?: string; // Track original placeholder value
  placeholderKey?: string; // Track the clean key (without brackets) for matching
  id: string;
}

export function PromptTemplateDialog({
  open,
  onOpenChange,
  template,
  onSave,
}: PromptTemplateDialogProps) {
  const [isEditable, setIsEditable] = useState(false);
  const [segments, setSegments] = useState<PlaceholderSegment[]>([]);
  const [placeholderValues, setPlaceholderValues] = useState<Map<string, string>>(new Map());
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const placeholderInputRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const { toast } = useToast();

  // Parse prompt into segments when template changes
  useEffect(() => {
    if (template) {
      const parsed = parsePromptIntoSegments(template.prompt);
      setSegments(parsed);
      
      // Extract unique placeholders and initialize values
      const uniquePlaceholders = new Map<string, string>();
      parsed.forEach(seg => {
        if (seg.type === 'placeholder') {
          const cleanKey = seg.content.replace(/[\[\]{}]/g, '');
          if (!uniquePlaceholders.has(cleanKey)) {
            uniquePlaceholders.set(cleanKey, '');
          }
        }
      });
      setPlaceholderValues(uniquePlaceholders);
      
      setIsEditable(false);
      setCopied(false);
      setSaved(false);
    }
  }, [template]);

  // Parse prompt text into segments
  const parsePromptIntoSegments = (text: string): PlaceholderSegment[] => {
    const placeholderRegex = /(\[([^\]]+)\]|\{([^}]+)\})/g;
    const segments: PlaceholderSegment[] = [];
    let lastIndex = 0;
    let match;
    let idCounter = 0;

    while ((match = placeholderRegex.exec(text)) !== null) {
      // Add text before placeholder
      if (match.index > lastIndex) {
        segments.push({
          type: 'text',
          content: text.substring(lastIndex, match.index),
          id: `text-${idCounter++}`,
        });
      }

      // Extract the clean key without brackets
      const cleanKey = match[0].replace(/[\[\]{}]/g, '');
      
      // Add placeholder with original content tracked
      segments.push({
        type: 'placeholder',
        content: match[0],
        originalContent: match[0], // Store original for restoration
        placeholderKey: cleanKey, // Store clean key for matching
        id: `placeholder-${idCounter++}`,
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      segments.push({
        type: 'text',
        content: text.substring(lastIndex),
        id: `text-${idCounter++}`,
      });
    }

    return segments;
  };

  // Get full prompt text from segments, restoring original placeholders if empty
  const getPromptText = (restoreEmptyPlaceholders: boolean = false): string => {
    return segments
      .map((seg) => {
        if (restoreEmptyPlaceholders && seg.type === 'placeholder') {
          // If placeholder is empty or just whitespace, restore original
          const trimmed = seg.content.trim();
          if (!trimmed || trimmed === '') {
            return seg.originalContent || seg.content;
          }
        }
        return seg.content;
      })
      .join('');
  };

  // Handle customize button click
  const handleCustomize = () => {
    setIsEditable(!isEditable);
  };

  // Handle segment content change
  const handleSegmentChange = (id: string, newContent: string) => {
    setSegments((prev) =>
      prev.map((seg) => (seg.id === id ? { ...seg, content: newContent } : seg))
    );
  };

  // Handle copy with fallback
  const handleCopy = async () => {
    const textToCopy = getPromptText();

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for insecure contexts
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Prompt copied to clipboard',
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  // Handle save with validation
  const handleSave = () => {
    if (!template) return;

    // Get prompt text and restore any empty placeholders to defaults
    const textToSave = getPromptText(true);

    if (!textToSave.trim()) {
      toast({
        title: 'Cannot save',
        description: 'Prompt cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    // Check for duplicates using centralized storage
    const savedPrompts = getAllPrompts();
    const isDuplicate = savedPrompts.some((p) => p.generatedPrompt === textToSave);

    if (isDuplicate) {
      toast({
        title: 'Already saved',
        description: 'This prompt is already in your saved prompts',
      });
      return;
    }

    // Save using centralized storage utility
    savePromptToStorage({
      type: template.type,
      name: template.name,
      query: template.name, // Use template name as query
      generatedPrompt: textToSave,
      llm: template.llm || 'GPT-4',
      isFavorite: false,
    });

    // Call onSave callback if provided
    if (onSave) {
      onSave(textToSave);
    }

    setSaved(true);
    toast({
      title: 'Saved!',
      description: 'Prompt saved successfully',
    });

    setTimeout(() => setSaved(false), 2000);
  };

  // Handle placeholder click to focus for editing
  const handlePlaceholderClick = (id: string) => {
    if (isEditable) {
      const ref = placeholderInputRefs.current.get(id);
      if (ref) {
        ref.focus();
        // Select all text
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(ref);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  };

  // Handle input field change for placeholders
  const handleInputFieldChange = (key: string, value: string) => {
    // Update the placeholder values map
    setPlaceholderValues(prev => {
      const newMap = new Map(prev);
      newMap.set(key, value);
      return newMap;
    });

    // Update all matching segments in the prompt using the immutable placeholderKey
    setSegments(prev =>
      prev.map(seg => {
        if (seg.type === 'placeholder' && seg.placeholderKey === key) {
          // If value is empty, restore the original placeholder
          if (value.trim() === '') {
            return { ...seg, content: seg.originalContent || seg.content };
          }
          // Otherwise, update with the new value
          return { ...seg, content: value };
        }
        return seg;
      })
    );
  };

  // Handle dialog close - reset to original state
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && template) {
      // Reset to original template prompt when closing
      const parsed = parsePromptIntoSegments(template.prompt);
      setSegments(parsed);
      
      // Reset placeholder values
      const uniquePlaceholders = new Map<string, string>();
      parsed.forEach(seg => {
        if (seg.type === 'placeholder') {
          const cleanKey = seg.content.replace(/[\[\]{}]/g, '');
          if (!uniquePlaceholders.has(cleanKey)) {
            uniquePlaceholders.set(cleanKey, '');
          }
        }
      });
      setPlaceholderValues(uniquePlaceholders);
      
      // Reset UI state
      setIsEditable(false);
      setCopied(false);
      setSaved(false);
    }
    
    onOpenChange(newOpen);
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0" data-testid="dialog-prompt-template">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2" data-testid="text-dialog-title">
                {template.name}
              </DialogTitle>
              <DialogDescription className="text-base" data-testid="text-dialog-description">
                {template.description}
              </DialogDescription>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Badge variant="outline" data-testid="badge-template-type">
                  {template.type}
                </Badge>
                {template.llm && (
                  <Badge variant="secondary" data-testid="badge-template-llm">
                    Recommended: {template.llm}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4 max-h-[calc(90vh-200px)] overflow-y-auto scroll-smooth">
          <div className="space-y-6">
            {/* Prompt Editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Prompt Template
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant={isEditable ? 'default' : 'outline'}
                    onClick={handleCustomize}
                    data-testid="button-customize"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {isEditable ? 'Done' : 'Customize'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    data-testid="button-copy"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSave}
                    data-testid="button-save"
                  >
                    {saved ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div
                className={`bg-muted/30 p-4 rounded-lg border-2 min-h-[200px] max-h-[400px] overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap ${
                  isEditable
                    ? 'border-primary focus-within:ring-2 focus-within:ring-primary/20'
                    : 'border-transparent'
                }`}
                data-testid="prompt-editor"
              >
                {segments.map((segment) => {
                  if (segment.type === 'text') {
                    return isEditable ? (
                      <span
                        key={segment.id}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          handleSegmentChange(segment.id, e.currentTarget.textContent || '')
                        }
                        className="outline-none"
                        data-testid={`text-segment-${segment.id}`}
                      >
                        {segment.content}
                      </span>
                    ) : (
                      <span key={segment.id} data-testid={`text-segment-${segment.id}`}>
                        {segment.content}
                      </span>
                    );
                  } else {
                    return (
                      <span
                        key={segment.id}
                        ref={(el) => {
                          if (el) placeholderInputRefs.current.set(segment.id, el);
                        }}
                        contentEditable={isEditable}
                        suppressContentEditableWarning
                        onClick={() => handlePlaceholderClick(segment.id)}
                        onBlur={(e) =>
                          handleSegmentChange(segment.id, e.currentTarget.textContent || '')
                        }
                        className={`bg-accent text-accent-foreground px-1.5 py-0.5 rounded border border-accent-foreground/30 font-semibold transition-all ${
                          isEditable
                            ? 'cursor-pointer hover:bg-accent/80 hover:border-accent-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
                            : ''
                        }`}
                        data-testid={`placeholder-segment-${segment.id}`}
                      >
                        {segment.content}
                      </span>
                    );
                  }
                })}
              </div>
            </div>

            {/* Placeholder Input Fields Section - Only shown in Customize mode */}
            {isEditable && placeholderValues.size > 0 && (
              <div className="bg-muted/30 rounded-lg border border-muted" data-testid="section-placeholder-inputs">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="quick-edit" className="border-0">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline" data-testid="button-toggle-quick-edit">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Quick Edit
                      </h3>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        {Array.from(placeholderValues.entries()).map(([key, value]) => (
                          <div key={key} className="flex-1 min-w-[200px]">
                            <Label htmlFor={`input-${key}`} className="text-xs mb-1.5 block" data-testid={`label-${key}`}>
                              {key}
                            </Label>
                            <Input
                              id={`input-${key}`}
                              value={value}
                              onChange={(e) => handleInputFieldChange(key, e.target.value)}
                              placeholder={`Enter ${key.toLowerCase()}...`}
                              className="h-9"
                              data-testid={`input-placeholder-${key}`}
                            />
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}

            {/* Guide Section - Collapsible */}
            <div className="bg-primary/5 rounded-lg border border-primary/10" data-testid="section-guide">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="guide" className="border-0">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline" data-testid="button-toggle-guide">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-primary">How to Use This Prompt</h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3 text-sm">
                      <div className="space-y-1">
                        <p className="font-medium">Understanding Placeholders:</p>
                        <p className="text-muted-foreground">
                          Placeholders are marked with{' '}
                          <code className="px-1.5 py-0.5 bg-primary/10 rounded text-primary font-mono text-xs">
                            [BRACKETS]
                          </code>{' '}
                          or{' '}
                          <code className="px-1.5 py-0.5 bg-primary/10 rounded text-primary font-mono text-xs">
                            &#123;curly braces&#125;
                          </code>
                          . These are variables you need to replace with your specific information.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="font-medium">Quick Tips:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                          <li>Click <strong>Customize</strong> to edit the prompt and placeholders</li>
                          <li>Click any highlighted placeholder to replace it with your own text</li>
                          <li>Use <strong>Copy</strong> to copy the entire prompt to your clipboard</li>
                          <li>Click <strong>Save</strong> to store your customized version</li>
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <p className="font-medium">Pro Tips:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                          <li>Be specific when replacing placeholders - the more detail, the better the AI response</li>
                          <li>You can modify the entire prompt structure, not just the placeholders</li>
                          <li>Try different variations to see what works best for your use case</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
