// Common types for the LoL Improve application

// Game Session Types
export interface GameSession {
  id: number;
  user_id: number;
  date: string;
  champion: string;
  enemy_champion: string;
  player_character: string;
  enemy_character: string;
  result: 'win' | 'loss';
  kda: string;
  cs: number;
  vision_score: number;
  mood_rating: number;
  goals: Record<string, boolean>;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface GameSessionFormData {
  date: string;
  champion: string;
  enemy_champion: string;
  player_character?: string;  // For backward compatibility
  enemy_character?: string;   // For backward compatibility
  result: 'win' | 'loss';
  kda: string;
  cs: number;
  vision_score: number;
  mood_rating: number;
  goals: Array<{ title: string; achieved: boolean }>;
  notes: string;
}

export interface GameSessionCreate {
  player_character: string;
  enemy_character: string;
  result: string;  // Win/Lose
  mood_rating: number;  // 1-5 scale
  goals?: Record<string, boolean>;
  notes?: string;
  date?: string;
}

// Video Tutorial Types
export interface VideoTutorial {
  id: number;
  title: string;
  url: string;
  description: string;
  duration: number;
  created_at: string;
  updated_at: string;
  creator_id: number;
  tags: string[];
  progress?: number | VideoProgress; // Allow both number and VideoProgress
}

export interface VideoFormData {
  title: string;
  url: string;
  description: string;
  tags: string[];
  duration?: number;
}

export interface VideoProgress {
  id: number;
  is_watched: boolean;
  watch_progress: number;
  personal_notes?: string;
  last_watched: string;
  user_id: number;
  video_id: number;
  notes?: string;
  watched?: boolean;
  created_at: string;
  updated_at: string;
}

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
  is_admin?: boolean;  // Add is_admin field
  stats?: {
    game_sessions_count: number;
    videos_watched_count: number;
  };
}

// Form Types
export interface FormikTouched<T> {
  [key: string]: boolean | FormikTouched<T[keyof T]> | FormikTouched<T[keyof T]>[];
}

export interface FormikErrors<T> {
  [key: string]: string | string[] | FormikErrors<T[keyof T]> | FormikErrors<T[keyof T]>[];
}
