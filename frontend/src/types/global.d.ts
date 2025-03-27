// Global type declarations
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_API_URL: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

// Extend User interface
declare module '*/types' {
  export interface User {
    id: number;
    username: string;
    email: string;
    is_active: boolean;
    is_admin: boolean;
    created_at?: string;
    updated_at?: string;
    stats?: {
      game_sessions_count: number;
      videos_watched_count: number;
    };
  }
  
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
  
  export interface VideoTutorial {
    id: number;
    title: string;
    creator: string;
    url: string;
    description?: string;
    upload_date?: string;
    video_type: string;
    creator_relation_id?: number;
    key_points?: string;
    tags?: string[];
    category_id?: number;
    kemono_id?: string;
    service?: string;
    creator_id?: string;
    added_date?: string;
    published_date?: string;
    duration_seconds?: number;
  }
}

export {}; 