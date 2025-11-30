/**
 * CodeOutput component
 * Displays generated prompts in a code-snippet style container with copy functionality
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Copy, Check, Save, Edit, CheckCheck, ChevronDown, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Folder } from '@/types';

interface CodeOutputProps {
  prompt: string;
  onSave?: () => void;
  showSave?: boolean;
  onEdit?: (editedPrompt: string) => void;
  maxHeight?: number | null;
  folders?: Folder[];
  onSaveToFolder?: (folderId: string) => void;
}

export default function CodeOutput({ prompt, onSave, showSave = true, onEdit, maxHeight, folders = [], onSaveToFolder }: CodeOutputProps) {
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
      <Card 
        className="p-8 flex items-center justify-center" 
        style={maxHeight ? { height: `${maxHeight}px` } : { minHeight: '16rem' }}
        data-testid="card-output-empty"
      >
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Your generated prompt will appear here</p>
          <p className="text-xs text-muted-foreground">Fill in the form and click Generate</p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="relative overflow-hidden flex flex-col" 
      style={maxHeight ? { height: `${maxHeight}px` } : { minHeight: '16rem' }}
      data-testid="card-output"
    >
      {/* Header with actions */}
      <div className="px-4 py-3 border-b flex items-center justify-between gap-2 shrink-0 flex-wrap">
        <h3 className="text-lg font-semibold" data-testid="text-output-title">Generated Prompt</h3>
        <div className="flex gap-2 flex-wrap">
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
            <DropdownMenu>
              <div className="flex">
                <Button
                  variant="default"
                  size="sm"
                  onClick={onSave}
                  className="rounded-r-none border-r-0"
                  data-testid="button-save"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="rounded-l-none px-2"
                    data-testid="button-save-dropdown"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </div>
              <DropdownMenuContent align="end" data-testid="menu-save-to-folder">
                <DropdownMenuItem
                  onClick={onSave}
                  data-testid="menu-item-save-default"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save to Library
                </DropdownMenuItem>
                {folders.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    {folders.map((folder) => (
                      <DropdownMenuItem
                        key={folder.id}
                        onClick={() => onSaveToFolder?.(folder.id)}
                        data-testid={`menu-item-folder-${folder.id}`}
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        {folder.name}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Code header */}
      <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between shrink-0">
        <span className="text-xs font-mono text-muted-foreground">prompt.txt</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-destructive/50" />
          <div className="w-3 h-3 rounded-full bg-primary/50" />
          <div className="w-3 h-3 rounded-full bg-chart-2/50" />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="p-6 bg-card flex-1 overflow-y-auto" data-testid="container-output">
        {isEditing ? (
          <Textarea
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            className="font-mono text-sm leading-relaxed min-h-64 resize-none h-full"
            data-testid="textarea-edit-output"
          />
        ) : (
          <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words" data-testid="text-output-content">
            {prompt}
          </pre>
        )}
      </div>
    </Card>
  );
}
