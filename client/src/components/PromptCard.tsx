/**
 * PromptCard component
 * Displays a saved prompt in card format with actions
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Star } from 'lucide-react';
import { SavedPrompt } from '@/utils/localStorage';
import { format } from 'date-fns';

interface PromptCardProps {
  prompt: SavedPrompt;
  onCopy: (prompt: SavedPrompt) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function PromptCard({ prompt, onCopy, onDelete, onToggleFavorite }: PromptCardProps) {
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
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${prompt.isFavorite ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => onToggleFavorite(prompt.id)}
            data-testid="button-favorite"
          >
            <Star className={`h-4 w-4 ${prompt.isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Query */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">Query:</p>
          <p className="text-sm font-medium line-clamp-2" data-testid="text-query">
            {prompt.query}
          </p>
        </div>

        {/* Generated Prompt Preview */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">Generated:</p>
          <p className="text-sm font-mono bg-muted/50 p-2 rounded line-clamp-3" data-testid="text-prompt-preview">
            {prompt.generatedPrompt}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground" data-testid="text-timestamp">
            {format(new Date(prompt.timestamp), 'MMM d, yyyy')}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(prompt)}
              data-testid="button-copy"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(prompt.id)}
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
