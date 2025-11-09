/**
 * LocalStorage utility functions for PromptStick
 * Handles all data persistence for prompts, folders, and usage tracking
 */

export interface SavedPrompt {
  id: string;
  type: 'text' | 'image' | 'video';
  query: string;
  generatedPrompt: string;
  llm: string;
  tone?: string;
  style?: string[];
  timestamp: number;
  folderId?: string;
  isFavorite: boolean;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: number;
}

export interface UsageStats {
  daily: {
    date: string;
    count: number;
  };
  monthly: {
    month: string;
    count: number;
  };
  totalPrompts: number;
}

const STORAGE_KEYS = {
  PROMPTS: 'promptstick_prompts',
  FOLDERS: 'promptstick_folders',
  USAGE: 'promptstick_usage'
};

const LIMITS = {
  DAILY: 50,
  MONTHLY: 500
};

// Helper to get today's date string (YYYY-MM-DD)
const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Helper to get current month string (YYYY-MM)
const getMonthString = (): string => {
  return new Date().toISOString().slice(0, 7);
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
  
  // Update usage stats
  incrementUsage();
  
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
  const newFolder: Folder = {
    id: crypto.randomUUID(),
    name,
    parentId,
    createdAt: Date.now()
  };
  
  folders.push(newFolder);
  localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  
  return newFolder;
};

export const getAllFolders = (): Folder[] => {
  const data = localStorage.getItem(STORAGE_KEYS.FOLDERS);
  return data ? JSON.parse(data) : [];
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
  
  // Remove folder
  const filteredFolders = folders.filter(f => f.id !== id && f.parentId !== id);
  localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(filteredFolders));
  
  // Move prompts in deleted folder to root
  const updatedPrompts = prompts.map(p => 
    p.folderId === id ? { ...p, folderId: undefined } : p
  );
  localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(updatedPrompts));
};

export const movePromptToFolder = (promptId: string, folderId?: string): void => {
  updatePrompt(promptId, { folderId });
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

const incrementUsage = (): void => {
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
