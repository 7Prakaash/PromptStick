/**
 * GeneratorForm component
 * Form for inputting prompt parameters and generating optimized prompts
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, X } from 'lucide-react';

interface GeneratorFormProps {
  type: 'text' | 'image' | 'video';
  onGenerate: (params: GeneratorParams) => void;
  isGenerating?: boolean;
  initialValues?: Partial<GeneratorParams>;
}

export interface GeneratorParams {
  query: string;
  llm: string;
  tone?: string;
  style: string[];
}

export default function GeneratorForm({ type, onGenerate, isGenerating = false, initialValues }: GeneratorFormProps) {
  const [query, setQuery] = useState(initialValues?.query || '');
  const [llm, setLlm] = useState(initialValues?.llm || '');
  const [tone, setTone] = useState(initialValues?.tone || 'professional');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(initialValues?.style || []);

  useEffect(() => {
    if (initialValues) {
      setQuery(initialValues.query || '');
      setLlm(initialValues.llm || '');
      setTone(initialValues.tone || 'professional');
      setSelectedStyles(initialValues.style || []);
    }
  }, [initialValues]);

  // LLM options based on type
  const llmOptions: Record<string, string[]> = {
    text: ['GPT-4', 'GPT-3.5 Turbo', 'Claude', 'Claude Instant', 'Gemini Pro'],
    image: ['DALL-E 3', 'DALL-E 2', 'Midjourney', 'Stable Diffusion', 'Ideogram'],
    video: ['Runway Gen-2', 'Pika', 'Stable Video', 'GPT-4 (Script)'],
  };

  // Style options based on type
  const styleOptions: Record<string, string[]> = {
    text: ['detailed', 'concise', 'step-by-step', 'with-examples', 'expert'],
    image: ['photorealistic', 'artistic', 'minimalist', 'detailed', 'vibrant', 'cinematic'],
    video: ['short-form', 'long-form', 'tutorial', 'cinematic', 'with-narration'],
  };

  // Tone options (only for text)
  const toneOptions = ['professional', 'casual', 'creative', 'technical', 'friendly', 'formal'];

  const handleStyleToggle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !llm) return;

    onGenerate({
      query: query.trim(),
      llm,
      tone: type === 'text' ? tone : undefined,
      style: selectedStyles,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-generator">
      {/* Query Input */}
      <div className="space-y-2">
        <Label htmlFor="query" className="text-base font-semibold">
          What do you want to create?
        </Label>
        <Textarea
          id="query"
          placeholder={`Describe your ${type} prompt in detail...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-32 resize-y"
          data-testid="input-query"
        />
        <p className="text-xs text-muted-foreground">
          Be as specific as possible for better results
        </p>
      </div>

      {/* LLM Selection */}
      <div className="space-y-2">
        <Label htmlFor="llm" className="text-base font-semibold">
          Target Model
        </Label>
        <Select value={llm} onValueChange={setLlm}>
          <SelectTrigger id="llm" data-testid="select-llm">
            <SelectValue placeholder="Select an AI model" />
          </SelectTrigger>
          <SelectContent>
            {llmOptions[type].map((model) => (
              <SelectItem key={model} value={model} data-testid={`option-llm-${model.toLowerCase().replace(/\s+/g, '-')}`}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tone Selection (text only) */}
      {type === 'text' && (
        <div className="space-y-2">
          <Label htmlFor="tone" className="text-base font-semibold">
            Tone
          </Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger id="tone" data-testid="select-tone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {toneOptions.map((t) => (
                <SelectItem key={t} value={t} data-testid={`option-tone-${t}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Generate Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!query.trim() || !llm || isGenerating}
        data-testid="button-generate"
      >
        <Sparkles className="mr-2 h-5 w-5" />
        {isGenerating ? 'Generating...' : 'Generate Prompt'}
      </Button>
    </form>
  );
}
