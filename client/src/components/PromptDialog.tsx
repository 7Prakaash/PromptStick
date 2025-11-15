/**
 * PromptDialog component
 * Reusable dialog for viewing and editing prompt details
 */

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Copy, Trash2, Edit, Save, X } from 'lucide-react';
import { SavedPrompt } from '@/utils/localStorage';
import { format } from 'date-fns';

interface PromptDialogProps {
  prompt: SavedPrompt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopy: (prompt: SavedPrompt) => void;
  onDelete: (id: string) => void;
  onSaveEdit: (id: string, updates: { query?: string; generatedPrompt?: string }) => void;
}

export default function PromptDialog({
  prompt,
  open,
  onOpenChange,
  onCopy,
  onDelete,
  onSaveEdit,
}: PromptDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(prompt.generatedPrompt);

  const typeColors: Record<string, string> = {
    text: 'bg-primary/10 text-primary',
    image: 'bg-chart-3/10 text-chart-3',
    video: 'bg-chart-5/10 text-chart-5',
  };

  useEffect(() => {
    setEditedPrompt(prompt.generatedPrompt);
  }, [prompt]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedPrompt(prompt.generatedPrompt);
  };

  const handleSave = () => {
    if (editedPrompt.trim() && editedPrompt !== prompt.generatedPrompt) {
      onSaveEdit(prompt.id, { generatedPrompt: editedPrompt.trim() });
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPrompt(prompt.generatedPrompt);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(prompt.id);
    onOpenChange(false);
  };

  const handleOpenChangeInternal = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setIsEditing(false);
      setEditedPrompt(prompt.generatedPrompt);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChangeInternal}>
      <DialogContent className="max-w-3xl max-h-[90vh] w-[95vw] sm:w-full p-4 sm:p-6" data-testid="dialog-prompt-details">
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

        <div className="space-y-4 mt-4 w-full">
          {/* Generated Prompt */}
          <div className="w-full">
            <p className="text-sm font-medium text-muted-foreground mb-2">Generated Prompt:</p>
            {isEditing ? (
              <Textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="min-h-64 font-mono text-sm resize-y"
                data-testid="textarea-edit-prompt"
              />
            ) : (
              <div className="max-h-64 sm:max-h-96 overflow-y-auto scrollbar-hide">
                <p
                  className="text-sm font-mono bg-muted/50 p-3 sm:p-4 rounded whitespace-pre-wrap min-w-0"
                  style={{ overflowWrap: 'anywhere' }}
                  data-testid="text-prompt-full"
                >
                  {prompt.generatedPrompt}
                </p>
              </div>
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
  );
}
