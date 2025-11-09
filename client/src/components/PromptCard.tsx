/**
 * PromptCard component
 * Displays a saved prompt in card format with actions
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Star, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { SavedPrompt } from '@/utils/localStorage';
import { format } from 'date-fns';

interface PromptCardProps {
  prompt: SavedPrompt;
  onCopy: (prompt: SavedPrompt) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (prompt: SavedPrompt) => void;
}

export default function PromptCard({ prompt, onCopy, onDelete, onToggleFavorite, onEdit }: PromptCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const typeColors: Record<string, string> = {
    text: 'bg-primary/10 text-primary',
    image: 'bg-chart-3/10 text-chart-3',
    video: 'bg-chart-5/10 text-chart-5',
  };

  return (
    <Card className="p-4 hover-elevate transition-all" data-testid={`card-prompt-${prompt.id}`}>
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
          <div className="flex items-center gap-1">
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              data-testid="button-expand"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Query */}
        <div
          className="cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <p className="text-sm text-muted-foreground mb-1">Query:</p>
          <p
            className={`text-sm font-medium ${isExpanded ? '' : 'line-clamp-2'}`}
            data-testid="text-query"
          >
            {prompt.query}
          </p>
        </div>

        {/* Generated Prompt Preview */}
        <div
          className="cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <p className="text-sm text-muted-foreground mb-1">Generated:</p>
          <p
            className={`text-sm font-mono bg-muted/50 p-2 rounded ${isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-3'}`}
            data-testid="text-prompt-preview"
          >
            {prompt.generatedPrompt}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t flex-wrap gap-2">
          <span className="text-xs text-muted-foreground" data-testid="text-timestamp">
            {format(new Date(prompt.timestamp), 'MMM d, yyyy')}
          </span>
          <div className="flex gap-1 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(prompt);
              }}
              data-testid="button-edit"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onCopy(prompt);
              }}
              data-testid="button-copy"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(prompt.id);
              }}
              data-testid="button-delete"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
