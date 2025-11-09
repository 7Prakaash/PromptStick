/**
 * PromptCard component
 * Displays a saved prompt in card format with actions
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Copy, Trash2, Star, Edit, Save, X } from 'lucide-react';
import { SavedPrompt } from '@/utils/localStorage';
import { format } from 'date-fns';

interface PromptCardProps {
  prompt: SavedPrompt;
  onCopy: (prompt: SavedPrompt) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSaveEdit: (id: string, updates: { query?: string; generatedPrompt?: string }) => void;
}

export default function PromptCard({ prompt, onCopy, onDelete, onToggleFavorite, onSaveEdit }: PromptCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuery, setEditedQuery] = useState(prompt.query);
  const [editedPrompt, setEditedPrompt] = useState(prompt.generatedPrompt);
  const typeColors: Record<string, string> = {
    text: 'bg-primary/10 text-primary',
    image: 'bg-chart-3/10 text-chart-3',
    video: 'bg-chart-5/10 text-chart-5',
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedQuery(prompt.query);
    setEditedPrompt(prompt.generatedPrompt);
  };

  const handleSave = () => {
    const updates: { query?: string; generatedPrompt?: string } = {};
    
    if (editedQuery.trim() && editedQuery !== prompt.query) {
      updates.query = editedQuery.trim();
    }
    
    if (editedPrompt.trim() && editedPrompt !== prompt.generatedPrompt) {
      updates.generatedPrompt = editedPrompt.trim();
    }
    
    if (Object.keys(updates).length > 0) {
      onSaveEdit(prompt.id, updates);
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedQuery(prompt.query);
    setEditedPrompt(prompt.generatedPrompt);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(prompt.id);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setIsEditing(false);
      setEditedQuery(prompt.query);
      setEditedPrompt(prompt.generatedPrompt);
    }
  };

  return (
    <>
      <Card 
        className="p-4 hover-elevate transition-all cursor-pointer" 
        data-testid={`card-prompt-${prompt.id}`}
        onClick={() => setIsOpen(true)}
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

          {/* Query Preview */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Query:</p>
            <p className="text-sm font-medium line-clamp-2" data-testid="text-query">
              {prompt.query}
            </p>
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
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-prompt-details">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <Badge className={typeColors[prompt.type]} data-testid="badge-type-modal">
                {prompt.type}
              </Badge>
              <span className="text-sm text-muted-foreground" data-testid="text-llm-modal">
                {prompt.llm}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground" data-testid="text-timestamp-modal">
              {format(new Date(prompt.timestamp), 'MMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Query */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Query:</p>
              {isEditing ? (
                <Textarea
                  value={editedQuery}
                  onChange={(e) => setEditedQuery(e.target.value)}
                  className="min-h-20 text-sm resize-y"
                  data-testid="textarea-edit-query"
                />
              ) : (
                <p className="text-sm" data-testid="text-query-modal">
                  {prompt.query}
                </p>
              )}
            </div>

            {/* Generated Prompt */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Generated Prompt:</p>
              {isEditing ? (
                <Textarea
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  className="min-h-64 font-mono text-sm resize-y"
                  data-testid="textarea-edit-prompt"
                />
              ) : (
                <p
                  className="text-sm font-mono bg-muted/50 p-4 rounded whitespace-pre-wrap"
                  data-testid="text-prompt-full"
                >
                  {prompt.generatedPrompt}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap pt-4 border-t">
              {isEditing ? (
                <>
                  <Button
                    variant="default"
                    onClick={handleSave}
                    data-testid="button-save"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleCancel}
                    data-testid="button-cancel"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="default"
                    onClick={handleStartEdit}
                    data-testid="button-edit"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => onCopy(prompt)}
                    data-testid="button-copy"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    data-testid="button-delete"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
