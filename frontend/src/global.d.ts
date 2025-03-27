// Global type declarations

import { User, Creator, CreatorFormData, VideoTutorial } from './types';

// Ensure these types are available globally
declare global {
  interface User {
    id: number;
    username: string;
    email: string;
    is_active: boolean;
    is_admin: boolean;
  }

  interface Creator {
    id: number;
    name: string;
    description?: string;
    website?: string;
  }

  interface CreatorFormData {
    name: string;
    description?: string;
    website?: string;
  }

  interface VideoTutorial {
    id: number;
    title: string;
    creator: string;
    url: string;
    description?: string;
    upload_date?: string;
    video_type: string;
    creator_relation_id?: number;
  }
} 