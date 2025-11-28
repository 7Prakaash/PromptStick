/**
 * LocalStorage utility functions for PromptStick
 * Handles all data persistence for prompts, folders, and usage tracking
 */

import type { SavedPrompt, Folder, UsageStats } from '@/types';

// Re-export types for convenience
export type { SavedPrompt, Folder, UsageStats };

const STORAGE_KEYS = {
  PROMPTS: 'promptstick_prompts',
  FOLDERS: 'promptstick_folders',
  USAGE: 'promptstick_usage'
};

const LIMITS = {
  DAILY: 5,
  MONTHLY: 50
};

// Helper to get today's date string (YYYY-MM-DD)
const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Helper to get current month string (YYYY-MM)
const getMonthString = (): string => {
  return new Date().toISOString().slice(0, 7);
};

// Custom event to notify components of usage changes
export const dispatchUsageUpdate = () => {
  window.dispatchEvent(new Event('usageUpdated'));
};

// Prompts CRUD
export const savePrompt = (prompt: Omit<SavedPrompt, 'id' | 'timestamp'>): SavedPrompt => {
  const prompts = getAllPrompts();
  const newPrompt: SavedPrompt = {
    ...prompt,
    id: crypto.randomUUID(),
    timestamp: Date.now()
  };
  
  prompts.push(newPrompt);
  localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
  
  return newPrompt;
};

export const getAllPrompts = (): SavedPrompt[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PROMPTS);
  return data ? JSON.parse(data) : [];
};

export const getPromptById = (id: string): SavedPrompt | undefined => {
  const prompts = getAllPrompts();
  return prompts.find(p => p.id === id);
};

export const updatePrompt = (id: string, updates: Partial<SavedPrompt>): void => {
  const prompts = getAllPrompts();
  const index = prompts.findIndex(p => p.id === id);
  
  if (index !== -1) {
    prompts[index] = { ...prompts[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
  }
};

export const deletePrompt = (id: string): void => {
  const prompts = getAllPrompts();
  const filtered = prompts.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(filtered));
};

export const getPromptsByFolder = (folderId?: string): SavedPrompt[] => {
  const prompts = getAllPrompts();
  return prompts.filter(p => p.folderId === folderId);
};

export const toggleFavorite = (id: string): void => {
  const prompts = getAllPrompts();
  const prompt = prompts.find(p => p.id === id);
  
  if (prompt) {
    prompt.isFavorite = !prompt.isFavorite;
    localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
  }
};

// Folders CRUD
export const createFolder = (name: string, parentId?: string): Folder => {
  const folders = getAllFolders();
  const maxOrder = folders.length > 0 ? Math.max(...folders.map(f => f.order || 0)) : 0;
  const newFolder: Folder = {
    id: crypto.randomUUID(),
    name,
    parentId,
    createdAt: Date.now(),
    order: maxOrder + 1
  };
  
  folders.push(newFolder);
  localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  
  return newFolder;
};

export const getAllFolders = (): Folder[] => {
  const data = localStorage.getItem(STORAGE_KEYS.FOLDERS);
  const folders: Folder[] = data ? JSON.parse(data) : [];
  
  // Ensure all folders have an order property
  folders.forEach((folder, index) => {
    if (folder.order === undefined) {
      folder.order = index;
    }
  });
  
  // Sort by order
  return folders.sort((a, b) => (a.order || 0) - (b.order || 0));
};

export const updateFolder = (id: string, updates: Partial<Folder>): void => {
  const folders = getAllFolders();
  const index = folders.findIndex(f => f.id === id);
  
  if (index !== -1) {
    folders[index] = { ...folders[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  }
};

export const deleteFolder = (id: string): void => {
  const folders = getAllFolders();
  const prompts = getAllPrompts();
  
  // Recursively find all descendant folder IDs
  const getAllDescendantIds = (folderId: string): string[] => {
    const childIds = folders
      .filter(f => f.parentId === folderId)
      .map(f => f.id);
    
    const descendantIds = [folderId];
    childIds.forEach(childId => {
      descendantIds.push(...getAllDescendantIds(childId));
    });
    
    return descendantIds;
  };
  
  const folderIdsToDelete = getAllDescendantIds(id);
  
  // Remove folder and all descendants
  const filteredFolders = folders.filter(f => !folderIdsToDelete.includes(f.id));
  localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(filteredFolders));
  
  // Delete all prompts in the folder and its descendants (cascade delete)
  const updatedPrompts = prompts.filter(p => !p.folderId || !folderIdsToDelete.includes(p.folderId));
  localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(updatedPrompts));
};

export const movePromptToFolder = (promptId: string, folderId?: string): void => {
  updatePrompt(promptId, { folderId });
};

export const reorderFolders = (reorderedFolders: Folder[]): void => {
  // Update order property for each folder
  const foldersWithOrder = reorderedFolders.map((folder, index) => ({
    ...folder,
    order: index
  }));
  
  localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(foldersWithOrder));
};

// Usage tracking
export const getUsageStats = (): UsageStats => {
  const data = localStorage.getItem(STORAGE_KEYS.USAGE);
  if (!data) {
    return {
      daily: { date: getTodayString(), count: 0 },
      monthly: { month: getMonthString(), count: 0 },
      totalPrompts: 0
    };
  }
  
  const stats = JSON.parse(data);
  
  // Reset daily count if it's a new day
  if (stats.daily.date !== getTodayString()) {
    stats.daily = { date: getTodayString(), count: 0 };
  }
  
  // Reset monthly count if it's a new month
  if (stats.monthly.month !== getMonthString()) {
    stats.monthly = { month: getMonthString(), count: 0 };
  }
  
  return stats;
};

export const incrementUsage = (): void => {
  const stats = getUsageStats();
  
  stats.daily.count += 1;
  stats.monthly.count += 1;
  stats.totalPrompts += 1;
  
  localStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(stats));
};

export const hasReachedDailyLimit = (): boolean => {
  const stats = getUsageStats();
  return stats.daily.count >= LIMITS.DAILY;
};

export const hasReachedMonthlyLimit = (): boolean => {
  const stats = getUsageStats();
  return stats.monthly.count >= LIMITS.MONTHLY;
};

export const getRemainingDaily = (): number => {
  const stats = getUsageStats();
  return Math.max(0, LIMITS.DAILY - stats.daily.count);
};

export const getRemainingMonthly = (): number => {
  const stats = getUsageStats();
  return Math.max(0, LIMITS.MONTHLY - stats.monthly.count);
};

export const getDailyLimit = (): number => LIMITS.DAILY;
export const getMonthlyLimit = (): number => LIMITS.MONTHLY;

// Clear all data (useful for testing/reset)
export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.PROMPTS);
  localStorage.removeItem(STORAGE_KEYS.FOLDERS);
  localStorage.removeItem(STORAGE_KEYS.USAGE);
};
