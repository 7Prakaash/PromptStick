/**
 * FolderTree component
 * Displays folder hierarchy with drag-and-drop support
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, FolderOpen, Plus, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { Folder as FolderType, getAllFolders, createFolder, deleteFolder, updateFolder } from '@/utils/localStorage';

interface FolderTreeProps {
  onSelectFolder: (folderId?: string) => void;
  selectedFolderId?: string;
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

  const handleStartRename = (folder: FolderType, event: React.MouseEvent) => {
    event.stopPropagation();
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

  return (
    <div className="space-y-2" data-testid="container-folder-tree">
      {/* All Prompts */}
      <Button
        variant={selectedFolderId === undefined ? 'default' : 'ghost'}
        className="w-full justify-start"
        onClick={() => onSelectFolder(undefined)}
        data-testid="button-folder-all"
      >
        <FolderOpen className="h-4 w-4 mr-2" />
        All Prompts
      </Button>

      {/* Folder List */}
      {folders.map((folder) => (
        <div key={folder.id} className="space-y-1">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => toggleFolder(folder.id)}
              data-testid={`button-toggle-${folder.id}`}
            >
              {expandedFolders.has(folder.id) ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
            {editingFolderId === folder.id ? (
              <div className="flex-1 flex items-center gap-2 ml-6">
                <Folder className="h-4 w-4 flex-shrink-0" />
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename(folder.id);
                    if (e.key === 'Escape') handleCancelRename();
                  }}
                  onBlur={() => handleSaveRename(folder.id)}
                  autoFocus
                  className="h-7 flex-1"
                  data-testid={`input-rename-${folder.id}`}
                />
              </div>
            ) : (
              <Button
                variant={selectedFolderId === folder.id ? 'default' : 'ghost'}
                className="flex-1 justify-start"
                onClick={() => onSelectFolder(folder.id)}
                data-testid={`button-folder-${folder.id}`}
              >
                <Folder className="h-4 w-4 mr-2" />
                <span 
                  className="truncate"
                  onDoubleClick={(e) => handleStartRename(folder, e)}
                  data-testid={`text-folder-name-${folder.id}`}
                >
                  {folder.name}
                </span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleDeleteFolder(folder.id)}
              data-testid={`button-delete-${folder.id}`}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
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
