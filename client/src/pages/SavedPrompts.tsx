/**
 * SavedPrompts Page
 * View, organize, and manage saved prompts with folders
 */

import { useState, useEffect, useRef } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, FileText, Download, Sparkles } from 'lucide-react';
import {
  getAllPrompts,
  getPromptsByFolder,
  getPromptById,
  deletePrompt,
  toggleFavorite,
  movePromptToFolder,
  SavedPrompt,
  savePrompt as savePromptToStorage,
  updatePrompt,
} from '@/utils/localStorage';
import PromptDialog from '@/components/PromptDialog';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';

export default function SavedPrompts() {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [newPrompt, setNewPrompt] = useState({
    type: 'text' as 'text' | 'image' | 'video',
    name: '',
    prompt: '',
    llm: '',
  });

  // AI Model options based on type
  const llmOptions: Record<string, string[]> = {
    text: ['GPT-4', 'GPT-3.5 Turbo', 'Claude', 'Claude Instant', 'Gemini Pro'],
    image: ['DALL-E 3', 'DALL-E 2', 'Midjourney', 'Stable Diffusion', 'Ideogram'],
    video: ['Runway Gen-2', 'Pika', 'Stable Video', 'GPT-4 (Script)'],
  };
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [availablePrompts, setAvailablePrompts] = useState<SavedPrompt[]>([]);
  const [initialPromptOrder, setInitialPromptOrder] = useState<string[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
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

  useEffect(() => {
    if (selectedPromptId && !getPromptById(selectedPromptId)) {
      setSelectedPromptId(null);
      toast({
        title: 'Prompt removed',
        description: 'The selected prompt was deleted',
        variant: 'destructive',
      });
    }
  }, [selectedPromptId, prompts]);

  // Handle click outside to collapse search if empty
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        if (searchQuery === '' && isSearchExpanded) {
          setIsSearchExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery, isSearchExpanded]);

  // Handle scroll to collapse search if empty
  useEffect(() => {
    const handleScroll = () => {
      if (searchQuery === '' && isSearchExpanded) {
        setIsSearchExpanded(false);
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [searchQuery, isSearchExpanded]);

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
    deletePrompt(id);
    loadPrompts();
    toast({
      title: 'Deleted',
      description: 'Prompt removed from library',
    });
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
    loadPrompts();
  };

  const handleSaveEdit = (id: string, updates: { query?: string; generatedPrompt?: string; name?: string }) => {
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

  const handlePromptClick = (promptId: string) => {
    const prompt = getPromptById(promptId);
    if (!prompt) {
      toast({
        title: 'Prompt not found',
        description: 'This prompt may have been deleted',
        variant: 'destructive',
      });
      return;
    }
    setSelectedPromptId(promptId);
  };

  const handleClosePromptDialog = () => {
    setSelectedPromptId(null);
  };

  const selectedPrompt = selectedPromptId ? getPromptById(selectedPromptId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActivePromptId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePromptId(null);

    if (over) {
      const promptId = active.id as string;
      let targetFolderId: string | undefined;
      
      if (over.id === 'all-prompts') {
        targetFolderId = undefined;
      } else if (over.id === 'main-content-area') {
        targetFolderId = selectedFolder;
      } else {
        targetFolderId = over.id as string;
      }
      
      handlePromptDrop(promptId, targetFolderId);
    }
  };

  const handleDragCancel = () => {
    setActivePromptId(null);
  };

  const handleOpenImportModal = () => {
    // Load ALL prompts (both from "All Prompts" and current folder)
    // This allows users to see what's already in the folder and toggle it
    const allPromptsFromRoot = getPromptsByFolder(undefined);
    const promptsInCurrentFolder = selectedFolder ? getPromptsByFolder(selectedFolder) : [];
    
    // Combine both lists, removing duplicates by ID
    const combinedPrompts = [...allPromptsFromRoot];
    promptsInCurrentFolder.forEach(p => {
      if (!combinedPrompts.find(existing => existing.id === p.id)) {
        combinedPrompts.push(p);
      }
    });
    
    // Store the initial order of prompt IDs
    setInitialPromptOrder(combinedPrompts.map(p => p.id));
    setAvailablePrompts(combinedPrompts);
    setShowImportModal(true);
  };

  const handleTogglePromptInFolder = (promptId: string, currentlyInFolder: boolean) => {
    if (currentlyInFolder) {
      // Remove from folder (move back to All Prompts)
      movePromptToFolder(promptId, undefined);
      toast({
        title: 'Removed',
        description: 'Prompt moved back to All Prompts',
      });
    } else {
      // Add to current folder
      movePromptToFolder(promptId, selectedFolder);
      toast({
        title: 'Added',
        description: 'Prompt added to folder',
      });
    }
    
    // Refresh both the current folder view and the modal's combined list
    loadPrompts();
    
    // Reload combined list for the modal
    const allPromptsFromRoot = getPromptsByFolder(undefined);
    const promptsInCurrentFolder = selectedFolder ? getPromptsByFolder(selectedFolder) : [];
    const combinedPrompts = [...allPromptsFromRoot];
    promptsInCurrentFolder.forEach(p => {
      if (!combinedPrompts.find(existing => existing.id === p.id)) {
        combinedPrompts.push(p);
      }
    });
    
    // Sort according to initial order to maintain stable positions
    // Handle edge case: if a prompt isn't in the initial order, keep it at the end
    const sortedPrompts = [...combinedPrompts].sort((a, b) => {
      const indexA = initialPromptOrder.indexOf(a.id);
      const indexB = initialPromptOrder.indexOf(b.id);
      
      // If both are not in initial order, maintain their relative order
      if (indexA === -1 && indexB === -1) return 0;
      // If only A is not in initial order, put it at the end
      if (indexA === -1) return 1;
      // If only B is not in initial order, put it at the end
      if (indexB === -1) return -1;
      
      return indexA - indexB;
    });
    
    setAvailablePrompts(sortedPrompts);
  };

  const handleAddCustomPrompt = () => {
    if (!newPrompt.prompt || !newPrompt.llm) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    savePromptToStorage({
      type: newPrompt.type,
      name: newPrompt.name || undefined,
      query: `Custom ${newPrompt.type} prompt`,
      generatedPrompt: newPrompt.prompt,
      llm: newPrompt.llm,
      folderId: selectedFolder,
      isFavorite: false,
    });

    setNewPrompt({ type: 'text', name: '', prompt: '', llm: '' });
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

  const MainContentDropZone = ({ children }: { children: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: 'main-content-area',
    });

    return (
      <div 
        ref={setNodeRef} 
        className={`transition-colors rounded-md ${isOver ? 'ring-2 ring-primary ring-offset-2' : ''}`}
      >
        {children}
      </div>
    );
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

            {/* Toolbar - Sits above everything */}
            <Card className="p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-3 md:items-center">
                {/* Ad Space - Full width on mobile, maximum expansion on desktop */}
                <div 
                  className={`flex items-center justify-center bg-accent/20 rounded-md px-4 py-2 text-muted-foreground text-sm transition-all duration-300 ease-in-out w-full md:flex-1 ${
                    isSearchExpanded ? 'md:flex-[2]' : 'md:flex-[5]'
                  }`}
                  data-testid="card-ad-placeholder"
                >
                  adspace
                </div>

                {/* Bottom row on mobile, inline on desktop */}
                <div className="flex gap-3 items-center w-full md:w-auto">
                  {/* Expandable Search - Always open on mobile, expandable on desktop */}
                  <div 
                    ref={searchRef}
                    className={`transition-all duration-300 ease-in-out flex-1 ${
                      isSearchExpanded ? 'md:flex-1 md:max-w-xs' : 'md:flex-none'
                    }`}
                  >
                    {/* Search Input - Always visible on mobile, conditional on desktop */}
                    <div className={`relative ${isSearchExpanded ? 'block' : 'block md:hidden'}`}>
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search prompts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search"
                        autoFocus={isSearchExpanded}
                      />
                    </div>
                    
                    {/* Search Icon Button - Hidden on mobile, visible when collapsed on desktop */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsSearchExpanded(true)}
                      data-testid="button-search-expand"
                      className={`${isSearchExpanded ? 'hidden' : 'hidden md:flex'}`}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 md:flex-shrink-0 md:ml-auto">
                    {selectedFolder && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleOpenImportModal}
                        data-testid="button-import-prompts"
                        aria-label="Import from All Prompts"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      onClick={() => setShowAddModal(true)} 
                      data-testid="button-add-custom"
                      aria-label="Add custom prompt"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Layout - Folders and Prompts side by side */}
            <div className="grid lg:grid-cols-[250px,1fr] gap-6 min-w-0">
              {/* Sidebar */}
              <aside className="space-y-6 min-w-0">
                {/* 
                  FOLDERS CARD
                  Full height sidebar for folder navigation
                */}
                <Card className="p-4 max-h-[calc(100vh-16rem)] overflow-y-auto w-full overflow-x-hidden min-w-0">
                  <h3 className="font-semibold mb-3">Folders</h3>
                  <FolderTree
                    onSelectFolder={setSelectedFolder}
                    selectedFolderId={selectedFolder}
                    onPromptClick={handlePromptClick}
                  />
                </Card>

                {/* Video Ad Box - Desktop only */}
                <Card className="hidden lg:flex items-center justify-center w-full aspect-[2/3] bg-accent/20" data-testid="card-video-ad">
                  <span className="text-muted-foreground text-sm">Video Ad Space</span>
                </Card>
              </aside>

              {/* Main Content */}
              <main className="space-y-6 h-[calc(100vh-16rem)] overflow-y-auto">
                <MainContentDropZone>
                  {/* Prompts Grid - Always Grid View */}
                  {filteredPrompts.length === 0 ? (
                    <Card className="h-full flex items-center justify-center p-12" data-testid="card-empty-state">
                      <div className="flex flex-col items-center space-y-6 max-w-md">
                        <div className="rounded-full bg-primary/10 p-6">
                          <Sparkles className="h-12 w-12 text-primary" />
                        </div>
                        <div className="space-y-2 text-center">
                          <h3 className="text-lg font-semibold">No prompts found</h3>
                          <p className="text-sm text-muted-foreground">
                            Start building your prompt library by adding your first prompt
                          </p>
                        </div>
                        <Button onClick={() => setShowAddModal(true)} data-testid="button-add-first">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Prompt
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <div
                      className="grid md:grid-cols-2 gap-4"
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
                </MainContentDropZone>
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
                onValueChange={(value: any) => {
                  setNewPrompt({ ...newPrompt, type: value, llm: '' });
                }}
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
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                placeholder="e.g., Blog Post Generator"
                value={newPrompt.name}
                onChange={(e) => setNewPrompt({ ...newPrompt, name: e.target.value })}
                data-testid="input-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="llm">AI Model</Label>
              <Select
                value={newPrompt.llm}
                onValueChange={(value) => setNewPrompt({ ...newPrompt, llm: value })}
              >
                <SelectTrigger id="llm" data-testid="select-llm">
                  <SelectValue placeholder="Select an AI model" />
                </SelectTrigger>
                <SelectContent>
                  {llmOptions[newPrompt.type].map((model) => (
                    <SelectItem key={model} value={model} data-testid={`option-llm-${model.toLowerCase().replace(/\s+/g, '-')}`}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Import from All Prompts Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-2xl" data-testid="modal-import-prompts">
          <DialogHeader>
            <DialogTitle>Import from All Prompts</DialogTitle>
            <DialogDescription>
              Select prompts to add to this folder or deselect to move them back to All Prompts
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-96">
            {availablePrompts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No prompts available in All Prompts
              </div>
            ) : (
              <div className="space-y-3 pr-4">
                {availablePrompts.map((prompt) => {
                  // Check if prompt is in the current folder by checking its folderId
                  const isInCurrentFolder = prompt.folderId === selectedFolder;
                  
                  return (
                    <div
                      key={prompt.id}
                      className="flex items-start gap-3 p-3 rounded-md border hover-elevate cursor-pointer"
                      data-testid={`import-prompt-${prompt.id}`}
                      onClick={() => handleTogglePromptInFolder(prompt.id, isInCurrentFolder)}
                    >
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isInCurrentFolder}
                          onCheckedChange={() => handleTogglePromptInFolder(prompt.id, isInCurrentFolder)}
                          data-testid={`checkbox-prompt-${prompt.id}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={typeColors[prompt.type]} data-testid={`badge-type-${prompt.id}`}>
                            {prompt.type}
                          </Badge>
                          <span className="text-sm font-medium text-muted-foreground">
                            {prompt.llm}
                          </span>
                        </div>
                        <p className="text-sm font-medium" data-testid={`text-name-${prompt.id}`}>
                          {prompt.name || 'Untitled'}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {prompt.generatedPrompt}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button onClick={() => setShowImportModal(false)} data-testid="button-close-import">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={null}>
        {activePrompt ? (
          <div className="flex flex-col items-center justify-center gap-1 bg-card border rounded-md shadow-lg w-16 h-16 cursor-grabbing">
            <FileText className="h-6 w-6 text-muted-foreground" />
            <Badge className={`${typeColors[activePrompt.type]} text-xs px-1 py-0`} data-testid="badge-type-overlay">
              {activePrompt.type}
            </Badge>
          </div>
        ) : null}
      </DragOverlay>

      {/* Shared Prompt Dialog */}
      {selectedPrompt && (
        <PromptDialog
          prompt={selectedPrompt}
          open={selectedPromptId !== null}
          onOpenChange={(open) => {
            if (!open) {
              handleClosePromptDialog();
            }
          }}
          onCopy={handleCopy}
          onDelete={(id) => {
            handleDelete(id);
            handleClosePromptDialog();
          }}
          onSaveEdit={handleSaveEdit}
        />
      )}
    </DndContext>
  );
}
