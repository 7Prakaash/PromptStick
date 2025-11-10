/**
 * FolderTree component
 * Displays folder hierarchy with drag-and-drop support
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, FolderOpen, Plus, Trash2, ChevronRight, ChevronDown, GripVertical } from 'lucide-react';
import { Folder as FolderType, getAllFolders, createFolder, deleteFolder, updateFolder, reorderFolders } from '@/utils/localStorage';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FolderTreeProps {
  onSelectFolder: (folderId?: string) => void;
  selectedFolderId?: string;
  onPromptDrop?: (promptId: string, folderId?: string) => void;
}

interface SortableFolderItemProps {
  folder: FolderType;
  selectedFolderId?: string;
  expandedFolders: Set<string>;
  editingFolderId: string | null;
  editingName: string;
  onSelect: (folderId: string) => void;
  onToggle: (folderId: string) => void;
  onDelete: (folderId: string) => void;
  onStartRename: (folder: FolderType, event: React.MouseEvent) => void;
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

function SortableFolderItem({
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
}: SortableFolderItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-1">
      <div className="flex items-center gap-1 rounded-md transition-colors">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
          data-testid={`button-drag-${folder.id}`}
        >
          <GripVertical className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onToggle(folder.id)}
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
              onDoubleClick={(e) => onStartRename(folder, e)}
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
          onClick={() => onDelete(folder.id)}
          data-testid={`button-delete-${folder.id}`}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFolders((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const reordered = arrayMove(items, oldIndex, newIndex);
        reorderFolders(reordered);
        return reordered;
      });
    }
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={[folder.id]}
              strategy={verticalListSortingStrategy}
            >
              <SortableFolderItem
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
            </SortableContext>
          </DndContext>
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
