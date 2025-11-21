/**
 * Type definitions for PromptStick
 * These types are used throughout the application and will be ready for Supabase integration
 */

export interface SavedPrompt {
  id: string;
  type: 'text' | 'image' | 'video';
  name?: string;
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
  order: number;
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
