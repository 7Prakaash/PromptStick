/**
 * SavedPrompts Page
 * View, organize, and manage saved prompts with folders
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PromptCard from '@/components/PromptCard';
import FolderTree from '@/components/FolderTree';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Grid3x3, List, FileText } from 'lucide-react';
import {
  getAllPrompts,
  getPromptsByFolder,
  deletePrompt,
  toggleFavorite,
  movePromptToFolder,
  SavedPrompt,
  savePrompt as savePromptToStorage,
  updatePrompt,
} from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

export default function SavedPrompts() {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    type: 'text' as 'text' | 'image' | 'video',
    query: '',
    prompt: '',
    llm: '',
  });
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadPrompts();
  }, [selectedFolder]);

  const loadPrompts = () => {
    // Always use getPromptsByFolder - when selectedFolder is undefined,
    // it returns prompts with no folderId (i.e., prompts in "All Prompts")
    const allPrompts = getPromptsByFolder(selectedFolder);
    setPrompts(allPrompts);
  };

  const handleCopy = async (prompt: SavedPrompt) => {
    try {
      await navigator.clipboard.writeText(prompt.generatedPrompt);
      toast({
        title: 'Copied!',
        description: 'Prompt copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this prompt?')) {
      deletePrompt(id);
      loadPrompts();
      toast({
        title: 'Deleted',
        description: 'Prompt removed from library',
      });
    }
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
    loadPrompts();
  };

  const handleSaveEdit = (id: string, updates: { query?: string; generatedPrompt?: string }) => {
    updatePrompt(id, updates);
    loadPrompts();
    toast({
      title: 'Updated!',
      description: 'Prompt has been updated',
    });
  };

  const handlePromptDrop = (promptId: string, folderId?: string) => {
    movePromptToFolder(promptId, folderId);
    loadPrompts();
    toast({
      title: 'Moved!',
      description: `Prompt moved to ${folderId ? 'folder' : 'All Prompts'}`,
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActivePromptId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePromptId(null);

    if (over && active.id !== over.id) {
      const promptId = active.id as string;
      const targetFolderId = over.id === 'all-prompts' ? undefined : (over.id as string);
      handlePromptDrop(promptId, targetFolderId);
    }
  };

  const handleDragCancel = () => {
    setActivePromptId(null);
  };

  const handleAddCustomPrompt = () => {
    if (!newPrompt.query || !newPrompt.prompt || !newPrompt.llm) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    savePromptToStorage({
      type: newPrompt.type,
      query: newPrompt.query,
      generatedPrompt: newPrompt.prompt,
      llm: newPrompt.llm,
      folderId: selectedFolder,
      isFavorite: false,
    });

    setNewPrompt({ type: 'text', query: '', prompt: '', llm: '' });
    setShowAddModal(false);
    loadPrompts();
    
    toast({
      title: 'Added!',
      description: 'Custom prompt saved to library',
    });
  };

  const filteredPrompts = prompts.filter(p =>
    p.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.generatedPrompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activePrompt = activePromptId 
    ? getAllPrompts().find(p => p.id === activePromptId)
    : null;

  const typeColors: Record<string, string> = {
    text: 'bg-primary/10 text-primary',
    image: 'bg-chart-3/10 text-chart-3',
    video: 'bg-chart-5/10 text-chart-5',
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="min-h-screen py-8" data-testid="page-saved-prompts">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="text-page-title">
                Saved Prompts
              </h1>
              <p className="text-muted-foreground" data-testid="text-page-description">
                Manage and organize your prompt library
              </p>
            </div>

            {/* Layout */}
            <div className="grid lg:grid-cols-[250px,1fr] gap-6">
              {/* Sidebar */}
              <aside className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Folders</h3>
                  <FolderTree
                    onSelectFolder={setSelectedFolder}
                    selectedFolderId={selectedFolder}
                  />
                </Card>
              </aside>

            {/* Main Content */}
            <main className="space-y-6">
              {/* Toolbar */}
              <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search prompts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setViewMode('grid')}
                      className={viewMode === 'grid' ? 'bg-accent' : ''}
                      data-testid="button-view-grid"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setViewMode('list')}
                      className={viewMode === 'list' ? 'bg-accent' : ''}
                      data-testid="button-view-list"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => setShowAddModal(true)} data-testid="button-add-custom">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Prompts Grid/List */}
              {filteredPrompts.length === 0 ? (
                <Card className="p-12 text-center" data-testid="card-empty-state">
                  <p className="text-muted-foreground mb-4">No prompts found</p>
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Prompt
                  </Button>
                </Card>
              ) : (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid md:grid-cols-2 gap-4'
                      : 'space-y-4'
                  }
                  data-testid="container-prompts"
                >
                  {filteredPrompts.map((prompt) => (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                      onCopy={handleCopy}
                      onDelete={handleDelete}
                      onToggleFavorite={handleToggleFavorite}
                      onSaveEdit={handleSaveEdit}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      </div>

      {/* Add Custom Prompt Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent data-testid="modal-add-custom">
          <DialogHeader>
            <DialogTitle>Add Custom Prompt</DialogTitle>
            <DialogDescription>
              Manually add a prompt to your library
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={newPrompt.type}
                onValueChange={(value: any) => setNewPrompt({ ...newPrompt, type: value })}
              >
                <SelectTrigger id="type" data-testid="select-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="query">Query/Description</Label>
              <Input
                id="query"
                placeholder="What was this prompt for?"
                value={newPrompt.query}
                onChange={(e) => setNewPrompt({ ...newPrompt, query: e.target.value })}
                data-testid="input-query"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="llm">AI Model</Label>
              <Input
                id="llm"
                placeholder="e.g., GPT-4, DALL-E 3"
                value={newPrompt.llm}
                onChange={(e) => setNewPrompt({ ...newPrompt, llm: e.target.value })}
                data-testid="input-llm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Paste your prompt here..."
                value={newPrompt.prompt}
                onChange={(e) => setNewPrompt({ ...newPrompt, prompt: e.target.value })}
                className="min-h-32"
                data-testid="input-prompt"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomPrompt} data-testid="button-save">
              Add Prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={null}>
        {activePrompt ? (
          <div className="flex items-center gap-2 bg-card border rounded-md shadow-lg px-3 py-2 cursor-grabbing">
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Badge className={`${typeColors[activePrompt.type]} flex-shrink-0`} data-testid="badge-type-overlay">
              {activePrompt.type}
            </Badge>
            <span className="text-sm font-medium truncate max-w-[200px]">
              {activePrompt.query}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
