/**
 * CodeOutput component
 * Displays generated prompts in a code-snippet style container with copy functionality
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Save, Edit, CheckCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeOutputProps {
  prompt: string;
  onSave?: () => void;
  showSave?: boolean;
  onEdit?: (editedPrompt: string) => void;
}

export default function CodeOutput({ prompt, onSave, showSave = true, onEdit }: CodeOutputProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(prompt);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      const textToCopy = isEditing ? editedPrompt : prompt;
      await navigator.clipboard.writeText(textToCopy);
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

  const handleEdit = () => {
    setIsEditing(true);
    setEditedPrompt(prompt);
  };

  const handleDoneEditing = () => {
    setIsEditing(false);
    if (onEdit) {
      onEdit(editedPrompt);
    }
    toast({
      title: 'Changes saved!',
      description: 'Your edits have been applied',
    });
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
          {isEditing ? (
            <Button
              variant="default"
              size="sm"
              onClick={handleDoneEditing}
              data-testid="button-done-editing"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Done
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              data-testid="button-edit"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
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
          {isEditing ? (
            <Textarea
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              className="font-mono text-sm leading-relaxed min-h-64 resize-y"
              data-testid="textarea-edit-output"
            />
          ) : (
            <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words" data-testid="text-output-content">
              {prompt}
            </pre>
          )}
        </div>
      </Card>
    </div>
  );
}
