/**
 * PromptCard component
 * Displays a saved prompt in card format with actions
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { SavedPrompt } from '@/utils/localStorage';
import { format } from 'date-fns';
import { useDraggable } from '@dnd-kit/core';
import PromptDialog from '@/components/PromptDialog';

interface PromptCardProps {
  prompt: SavedPrompt;
  onCopy: (prompt: SavedPrompt) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSaveEdit: (id: string, updates: { query?: string; generatedPrompt?: string }) => void;
}

export default function PromptCard({ prompt, onCopy, onDelete, onToggleFavorite, onSaveEdit }: PromptCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const typeColors: Record<string, string> = {
    text: 'bg-primary/10 text-primary',
    image: 'bg-chart-3/10 text-chart-3',
    video: 'bg-chart-5/10 text-chart-5',
  };

  const { attributes, listeners, setNodeRef } = useDraggable({
    id: prompt.id,
  });

  return (
    <>
      <Card 
        ref={setNodeRef}
        className="p-4 hover-elevate transition-all cursor-pointer" 
        data-testid={`card-prompt-${prompt.id}`}
        onClick={() => setIsOpen(true)}
        {...attributes}
        {...listeners}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={typeColors[prompt.type]} data-testid="badge-type">
                {prompt.type}
              </Badge>
              <span className="text-xs text-muted-foreground" data-testid="text-llm">
                {prompt.llm}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${prompt.isFavorite ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(prompt.id);
              }}
              data-testid="button-favorite"
            >
              <Star className={`h-4 w-4 ${prompt.isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Generated Prompt Preview */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Generated:</p>
            <p
              className="text-sm font-mono bg-muted/50 p-2 rounded line-clamp-3"
              data-testid="text-prompt-preview"
            >
              {prompt.generatedPrompt}
            </p>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t">
            <span className="text-xs text-muted-foreground" data-testid="text-timestamp">
              {format(new Date(prompt.timestamp), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
      </Card>

      {/* Modal */}
      <PromptDialog
        prompt={prompt}
        open={isOpen}
        onOpenChange={setIsOpen}
        onCopy={onCopy}
        onDelete={onDelete}
        onSaveEdit={onSaveEdit}
      />
    </>
  );
}
