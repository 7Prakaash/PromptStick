/**
 * FolderTree component
 * Displays folder hierarchy with drag-and-drop support
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, FolderOpen, Plus, ChevronRight, ChevronDown, MoreVertical } from 'lucide-react';
import { Folder as FolderType, getAllFolders, createFolder, deleteFolder, updateFolder, getPromptsByFolder } from '@/utils/localStorage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDroppable } from '@dnd-kit/core';

interface FolderTreeProps {
  onSelectFolder: (folderId?: string) => void;
  selectedFolderId?: string;
  onPromptDrop?: (promptId: string, folderId?: string) => void;
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
        <div className="ml-8 space-y-1" data-testid={`prompt-list-${folder.id}`}>
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="text-sm text-muted-foreground py-1 px-2 hover-elevate rounded-md cursor-pointer truncate"
              onClick={() => onSelect(folder.id)}
              data-testid={`prompt-item-${prompt.id}`}
            >
              {prompt.query}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderTree({ onSelectFolder, selectedFolderId }: FolderTreeProps) {
  const [folders, setFolders] = useState<FolderType[]>(getAllFolders());
  const [isAdding, setIsAdding] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    const folder = createFolder(newFolderName.trim());
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
    
    updateFolder(folderId, { name: editingName.trim() });
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
    <div className="space-y-2" data-testid="container-folder-tree">
      {/* All Prompts */}
      <AllPromptsDropZone />

      {/* Folder List */}
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
          />
        </DroppableFolderWrapper>
      ))}

      {/* Add Folder */}
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
  );
}
