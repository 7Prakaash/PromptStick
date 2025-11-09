/**
 * CodeOutput component
 * Displays generated prompts in a code-snippet style container with copy functionality
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Check, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeOutputProps {
  prompt: string;
  onSave?: () => void;
  showSave?: boolean;
}

export default function CodeOutput({ prompt, onSave, showSave = true }: CodeOutputProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Prompt copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  if (!prompt) {
    return (
      <Card className="p-8 flex items-center justify-center min-h-64" data-testid="card-output-empty">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Your generated prompt will appear here</p>
          <p className="text-xs text-muted-foreground">Fill in the form and click Generate</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-testid="container-output">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" data-testid="text-output-title">Generated Prompt</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
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
          {showSave && onSave && (
            <Button
              variant="default"
              size="sm"
              onClick={onSave}
              data-testid="button-save"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
        </div>
      </div>

      {/* Code Container */}
      <Card className="relative overflow-hidden" data-testid="card-output">
        <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground">prompt.txt</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-destructive/50" />
            <div className="w-3 h-3 rounded-full bg-primary/50" />
            <div className="w-3 h-3 rounded-full bg-chart-2/50" />
          </div>
        </div>
        <div className="p-6 bg-card">
          <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words" data-testid="text-output-content">
            {prompt}
          </pre>
        </div>
      </Card>
    </div>
  );
}
