// User types
export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface UserRegistration {
  username: string;
  email: string;
  password: string;
}

// Game Session types
export interface GameSession {
  id: number;
  date: string;
  player_character: string;
  enemy_character: string;
  result: string;
  mood_rating: number;
  goals: Record<string, any> | null;
  notes?: string;
  user_id: number;
}

export interface GameSessionFormData {
  player_character: string;
  enemy_character: string;
  result: string;
  mood_rating: number;
  goals?: Record<string, any>;
  notes?: string;
  date?: string;
}

// Video Tutorial types
export interface VideoTutorial {
  id: number;
  title: string;
  creator: string;
  url: string;
  description?: string;
  upload_date?: string;
  video_type: string;
  creator_relation_id?: number;
}

export interface VideoProgress {
  id: number;
  is_watched: boolean;
  watch_progress: number;
  personal_notes?: string;
  last_watched: string;
  user_id: number;
  video_id: number;
}

export interface VideoWithProgress extends VideoTutorial {
  progress?: VideoProgress;
}

export interface VideoImportData {
  title: string;
  creator: string;
  url: string;
  description?: string;
  upload_date?: string;
  video_type: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  detail: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Creator types
export interface Creator {
  id: number;
  name: string;
  description?: string;
  website?: string;
}

export interface CreatorFormData {
  name: string;
  description?: string;
  website?: string;
}
