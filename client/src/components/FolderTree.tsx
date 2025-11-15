/**
 * FolderTree component
 * Displays folder hierarchy with drag-and-drop support
 * Mobile/Tablet: Horizontal scrolling folder icons with long-press menu
 * Desktop: Traditional vertical list
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, FolderOpen, Plus, ChevronRight, ChevronDown, MoreVertical, Copy } from 'lucide-react';
import { Folder as FolderType, getAllFolders, createFolder, deleteFolder, updateFolder, getPromptsByFolder } from '@/utils/localStorage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface FolderTreeProps {
  onSelectFolder: (folderId?: string) => void;
  selectedFolderId?: string;
  onPromptDrop?: (promptId: string, folderId?: string) => void;
  onPromptClick?: (promptId: string) => void;
}

interface FolderItemProps {
  folder: FolderType;
  selectedFolderId?: string;
  expandedFolders: Set<string>;
  editingFolderId: string | null;
  editingName: string;
  onSelect: (folderId: string) => void;
  onToggle: (folderId: string) => void;
  onDelete: (folderId: string) => void;
  onStartRename: (folder: FolderType) => void;
  onSaveRename: (folderId: string) => void;
  onCancelRename: () => void;
  setEditingName: (name: string) => void;
  onPromptClick?: (promptId: string) => void;
}

interface FolderIconProps {
  folder: FolderType;
  isSelected: boolean;
  onSelect: (folderId: string) => void;
  onDelete: (folderId: string) => void;
  onStartRename: (folder: FolderType) => void;
}

function DroppableFolderWrapper({ 
  folder, 
  children 
}: { 
  folder: FolderType; 
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: folder.id,
  });

  return (
    <div ref={setNodeRef} className={isOver ? 'bg-primary/10 ring-2 ring-primary rounded-md' : ''}>
      {children}
    </div>
  );
}

function PromptListItem({ 
  prompt, 
  onPromptClick 
}: { 
  prompt: any; 
  onPromptClick?: (promptId: string) => void;
}) {
  const [isPromptHovered, setIsPromptHovered] = useState(false);
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: prompt.id,
    data: prompt,
  });
  
  const style = {
    transform: CSS.Translate.toString(transform),
  };
  
  const truncateText = (text: string, maxLength: number = 20) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  const handleCopyPrompt = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(prompt.generatedPrompt);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`text-sm text-muted-foreground py-1 px-2 hover-elevate rounded-md cursor-grab active:cursor-grabbing flex items-center justify-between group ${
        isDragging ? 'opacity-50' : ''
      }`}
      onMouseEnter={() => setIsPromptHovered(true)}
      onMouseLeave={() => setIsPromptHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (onPromptClick) {
          onPromptClick(prompt.id);
        }
      }}
      data-testid={`prompt-item-${prompt.id}`}
      title={prompt.query}
    >
      <span className="truncate">{truncateText(prompt.query)}</span>
      <Button
        variant="ghost"
        size="icon"
        className={`h-5 w-5 flex-shrink-0 transition-opacity ${isPromptHovered ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleCopyPrompt}
        data-testid={`button-copy-${prompt.id}`}
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );
}

function FolderIcon({ folder, isSelected, onSelect, onDelete, onStartRename }: FolderIconProps) {
  const [showMenu, setShowMenu] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    
    longPressTimer.current = setTimeout(() => {
      setShowMenu(true);
    }, 500); // 500ms for long press
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current || !longPressTimer.current) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);
    
    // Cancel long press if finger moves too much
    if (deltaX > 10 || deltaY > 10) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    touchStartPos.current = null;
  };

  const handleClick = () => {
    if (!showMenu) {
      onSelect(folder.id);
    }
  };

  const handleRename = () => {
    setShowMenu(false);
    onStartRename(folder);
  };

  const handleDelete = () => {
    setShowMenu(false);
    onDelete(folder.id);
  };

  return (
    <>
      <div
        className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        data-testid={`folder-icon-${folder.id}`}
      >
        <div
          className={`w-16 h-16 flex items-center justify-center rounded-md transition-colors ${
            isSelected
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover-elevate'
          }`}
        >
          <Folder className="h-8 w-8" />
        </div>
        <span className="text-xs text-center max-w-[80px] truncate" data-testid={`text-folder-name-${folder.id}`}>
          {folder.name}
        </span>
      </div>

      <Dialog open={showMenu} onOpenChange={setShowMenu}>
        <DialogContent data-testid={`dialog-folder-menu-${folder.id}`}>
          <DialogHeader>
            <DialogTitle>{folder.name}</DialogTitle>
            <DialogDescription>Choose an action for this folder</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            <Button
              variant="outline"
              onClick={handleRename}
              data-testid={`menu-rename-${folder.id}`}
            >
              Rename Folder
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              data-testid={`menu-delete-${folder.id}`}
            >
              Delete Folder
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowMenu(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FolderItem({
  folder,
  selectedFolderId,
  expandedFolders,
  editingFolderId,
  editingName,
  onSelect,
  onToggle,
  onDelete,
  onStartRename,
  onSaveRename,
  onCancelRename,
  setEditingName,
  onPromptClick,
}: FolderItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = expandedFolders.has(folder.id);
  const prompts = getPromptsByFolder(folder.id);

  return (
    <div className="space-y-1">
      <div 
        className="flex items-center gap-1 rounded-md transition-colors group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onToggle(folder.id)}
          data-testid={`button-toggle-${folder.id}`}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
        {editingFolderId === folder.id ? (
          <div className="flex-1 flex items-center gap-2">
            <Folder className="h-4 w-4 flex-shrink-0" />
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveRename(folder.id);
                if (e.key === 'Escape') onCancelRename();
              }}
              onBlur={() => onSaveRename(folder.id)}
              autoFocus
              maxLength={20}
              className="h-7 flex-1"
              data-testid={`input-rename-${folder.id}`}
            />
          </div>
        ) : (
          <Button
            variant={selectedFolderId === folder.id ? 'default' : 'ghost'}
            className="flex-1 justify-start"
            onClick={() => onSelect(folder.id)}
            data-testid={`button-folder-${folder.id}`}
          >
            <Folder className="h-4 w-4 mr-2" />
            <span 
              className="truncate"
              data-testid={`text-folder-name-${folder.id}`}
            >
              {folder.name}
            </span>
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              data-testid={`button-menu-${folder.id}`}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => onStartRename(folder)}
              data-testid={`menu-rename-${folder.id}`}
            >
              Rename Folder
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(folder.id)}
              data-testid={`menu-delete-${folder.id}`}
            >
              Delete Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {isExpanded && prompts.length > 0 && (
        <div 
          className={`ml-8 space-y-1 ${prompts.length > 5 ? 'max-h-[200px] overflow-y-auto' : ''}`}
          data-testid={`prompt-list-${folder.id}`}
        >
          {prompts.map((prompt) => (
            <PromptListItem 
              key={prompt.id} 
              prompt={prompt} 
              onPromptClick={onPromptClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderTree({ onSelectFolder, selectedFolderId, onPromptClick }: FolderTreeProps) {
  const [folders, setFolders] = useState<FolderType[]>(getAllFolders());
  const [isAdding, setIsAdding] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    const trimmedName = newFolderName.trim().substring(0, 20);
    const folder = createFolder(trimmedName);
    setFolders(getAllFolders());
    setNewFolderName('');
    setIsAdding(false);
  };

  const handleDeleteFolder = (id: string) => {
    if (confirm('Delete this folder? Prompts inside will be moved to "All Prompts".')) {
      deleteFolder(id);
      setFolders(getAllFolders());
      if (selectedFolderId === id) {
        onSelectFolder(undefined);
      }
    }
  };

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };

  const handleStartRename = (folder: FolderType) => {
    setEditingFolderId(folder.id);
    setEditingName(folder.name);
  };

  const handleSaveRename = (folderId: string) => {
    if (!editingName.trim()) {
      setEditingFolderId(null);
      setEditingName('');
      return;
    }
    
    const trimmedName = editingName.trim().substring(0, 20);
    updateFolder(folderId, { name: trimmedName });
    setFolders(getAllFolders());
    setEditingFolderId(null);
    setEditingName('');
  };

  const handleCancelRename = () => {
    setEditingFolderId(null);
    setEditingName('');
  };

  const AllPromptsDropZone = () => {
    const { setNodeRef, isOver } = useDroppable({
      id: 'all-prompts',
    });

    return (
      <div ref={setNodeRef}>
        <Button
          variant={selectedFolderId === undefined ? 'default' : 'ghost'}
          className={`w-full justify-start transition-colors ${
            isOver ? 'bg-primary/10 ring-2 ring-primary' : ''
          }`}
          onClick={() => onSelectFolder(undefined)}
          data-testid="button-folder-all"
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          All Prompts
        </Button>
      </div>
    );
  };

  return (
    <>
      {/* Desktop View (lg and above) */}
      <div className="hidden lg:block space-y-2" data-testid="container-folder-tree">
        <AllPromptsDropZone />

        {folders.map((folder) => (
          <DroppableFolderWrapper key={folder.id} folder={folder}>
            <FolderItem
              folder={folder}
              selectedFolderId={selectedFolderId}
              expandedFolders={expandedFolders}
              editingFolderId={editingFolderId}
              editingName={editingName}
              onSelect={onSelectFolder}
              onToggle={toggleFolder}
              onDelete={handleDeleteFolder}
              onStartRename={handleStartRename}
              onSaveRename={handleSaveRename}
              onCancelRename={handleCancelRename}
              setEditingName={setEditingName}
              onPromptClick={onPromptClick}
            />
          </DroppableFolderWrapper>
        ))}

        {isAdding ? (
          <div className="flex gap-2">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewFolderName('');
                }
              }}
              onBlur={() => {
                if (!newFolderName.trim()) {
                  setIsAdding(false);
                  setNewFolderName('');
                }
              }}
              autoFocus
              maxLength={20}
              className="flex-1"
              data-testid="input-folder-name"
            />
            <Button size="sm" onClick={handleCreateFolder} data-testid="button-save-folder">
              Add
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={() => setIsAdding(true)}
            data-testid="button-add-folder"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        )}
      </div>

      {/* Mobile/Tablet View (below lg) */}
      <div className="lg:hidden space-y-4" data-testid="container-folder-tree-mobile">
        {/* All Prompts Button */}
        <Button
          variant={selectedFolderId === undefined ? 'default' : 'outline'}
          className="w-full justify-start"
          onClick={() => onSelectFolder(undefined)}
          data-testid="button-folder-all-mobile"
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          All Prompts
        </Button>

        {/* Horizontal Scrolling Folders */}
        <div className="w-full overflow-hidden">
          <div className="overflow-x-auto pb-2" data-testid="container-folders-scroll">
            <div className="flex gap-4">
              {/* Folder Icons */}
              {folders.map((folder) => (
                editingFolderId === folder.id ? (
                  <div key={folder.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="w-16 h-16 flex items-center justify-center rounded-md bg-muted">
                      <Folder className="h-8 w-8" />
                    </div>
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(folder.id);
                        if (e.key === 'Escape') handleCancelRename();
                      }}
                      onBlur={() => handleSaveRename(folder.id)}
                      autoFocus
                      maxLength={20}
                      className="w-20 h-7 text-xs"
                      data-testid={`input-rename-mobile-${folder.id}`}
                    />
                  </div>
                ) : (
                  <FolderIcon
                    key={folder.id}
                    folder={folder}
                    isSelected={selectedFolderId === folder.id}
                    onSelect={onSelectFolder}
                    onDelete={handleDeleteFolder}
                    onStartRename={handleStartRename}
                  />
                )
              ))}

              {/* Add Folder Icon */}
              {isAdding ? (
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-16 h-16 flex items-center justify-center rounded-md bg-muted">
                    <Plus className="h-8 w-8" />
                  </div>
                  <Input
                    placeholder="Name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateFolder();
                      if (e.key === 'Escape') {
                        setIsAdding(false);
                        setNewFolderName('');
                      }
                    }}
                    onBlur={() => {
                      if (newFolderName.trim()) {
                        handleCreateFolder();
                      } else {
                        setIsAdding(false);
                        setNewFolderName('');
                      }
                    }}
                    autoFocus
                    maxLength={20}
                    className="w-20 h-7 text-xs"
                    data-testid="input-folder-name-mobile"
                  />
                </div>
              ) : (
                <div
                  className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer"
                  onClick={() => setIsAdding(true)}
                  data-testid="button-add-folder-mobile"
                >
                  <div className="w-16 h-16 flex items-center justify-center rounded-md bg-muted hover-elevate">
                    <Plus className="h-8 w-8" />
                  </div>
                  <span className="text-xs text-center text-muted-foreground">New</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
