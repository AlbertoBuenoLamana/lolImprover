import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import { VideoTutorial, VideoFormData, VideoProgress as VideoProgressType } from '../../types';

export interface VideoProgress extends VideoProgressType {
  notes?: string;
  watched?: boolean;
}

export interface VideoWithProgress extends VideoTutorial {
  progress?: VideoProgress;
}

interface VideoState {
  videos: VideoTutorial[];
  currentVideo: VideoWithProgress | null;
  loading: boolean;
  error: string | null;
  recentlyWatched: VideoTutorial[];
  bookmarked: VideoTutorial[];
  searchResults: VideoTutorial[];
  categories: any[];
  creators: any[];
}

const initialState: VideoState = {
  videos: [],
  currentVideo: null,
  loading: false,
  error: null,
  recentlyWatched: [],
  bookmarked: [],
  searchResults: [],
  categories: [],
  creators: [],
};

// Get all videos
export const fetchVideos = createAsyncThunk(
  'videos/fetchAll',
  async (
    { 
      creator, 
      title, 
      tag, 
      creator_name, 
      category_id, 
      sort_by = 'published_date', 
      sort_order = 'desc',
      expand = 'creator'
    }: { 
      creator?: string; 
      title?: string; 
      tag?: string; 
      creator_name?: string; 
      category_id?: number; 
      sort_by?: string; 
      sort_order?: string;
      expand?: string;
    } = {}, 
    { getState, rejectWithValue }
  ) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      
      // Build query parameters
      const params = new URLSearchParams();
      
      if (creator) params.append('creator', creator);
      if (title) params.append('title', title);
      if (tag) params.append('tag', tag);
      if (creator_name) params.append('creator_name', creator_name);
      if (category_id) params.append('category_id', category_id.toString());
      if (sort_by) params.append('sort_by', sort_by);
      if (sort_order) params.append('sort_order', sort_order);
      if (expand) params.append('expand', expand);
      
      const queryString = params.toString();
      const url = `/videos/${queryString ? `?${queryString}` : ''}`;
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch videos');
    }
  }
);

// Fetch recently watched videos
export const fetchRecentlyWatched = createAsyncThunk(
  'videos/fetchRecentlyWatched',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      
      const response = await axios.get('/videos/recently-watched/', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch recently watched videos');
    }
  }
);

// Fetch bookmarked videos
export const fetchBookmarkedVideos = createAsyncThunk(
  'videos/fetchBookmarked',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      
      const response = await axios.get('/videos/bookmarked/', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch bookmarked videos');
    }
  }
);

// Search videos with advanced options
export const searchVideos = createAsyncThunk(
  'videos/search',
  async (
    searchParams: {
      q?: string;
      creator_id?: number;
      category_id?: number;
      tags?: string[];
      min_published_date?: string;
      max_published_date?: string;
      watched?: boolean;
      bookmarked?: boolean;
      sort_by?: string;
      sort_order?: string;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      
      // Build query parameters
      const params = new URLSearchParams();
      
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            // Handle array parameters like tags
            value.forEach(item => params.append(key, item));
          } else {
            params.append(key, value.toString());
          }
        }
      });
      
      const url = `/videos/search/?${params.toString()}`;
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to search videos');
    }
  }
);

// Get a single video with progress
export const fetchVideo = createAsyncThunk(
  'videos/fetchOne',
  async (id: number, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      
      // Get video details
      const videoResponse = await axios.get(`/videos/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      
      // Try to get progress if available
      try {
        const progressResponse = await axios.get(`/videos/progress/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        
        return {
          ...videoResponse.data,
          progress: progressResponse.data,
        };
      } catch (progressError) {
        // If no progress exists yet, just return the video
        return videoResponse.data;
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch video');
    }
  }
);

// Create a new video
export const createVideo = createAsyncThunk(
  'videos/create',
  async (videoData: VideoFormData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      
      const response = await axios.post('/videos', {
        ...videoData,
        // Add any missing required fields for the backend
        duration: videoData.duration || 0 // Default duration if not provided
      }, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create video');
    }
  }
);

// Update an existing video
export const updateVideo = createAsyncThunk(
  'videos/update',
  async ({ id, videoData }: { id: number; videoData: VideoFormData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      
      const response = await axios.put(`/videos/${id}`, {
        ...videoData,
        // Add any missing required fields for the backend
        duration: videoData.duration || 0 // Default duration if not provided
      }, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update video');
    }
  }
);

// Delete a video
export const deleteVideo = createAsyncThunk(
  'videos/delete',
  async (id: number, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      
      await axios.delete(`/videos/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete video');
    }
  }
);

// Import videos from JSON
export const importVideos = createAsyncThunk(
  'videos/import',
  async (videosData: any[], { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      
      const response = await axios.post('/videos/import', videosData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to import videos');
    }
  }
);

// Update video progress
export const updateVideoProgress = createAsyncThunk(
  'videos/updateProgress',
  async (
    { videoId, progressData }: { 
      videoId: number; 
      progressData: { 
        is_watched?: boolean; 
        watch_progress?: number; 
        personal_notes?: string; 
      } 
    }, 
    { getState, rejectWithValue }
  ) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      
      const response = await axios.post(`/videos/${videoId}/progress`, progressData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return {
        videoId,
        progress: response.data,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update video progress');
    }
  }
);

// Fetch video categories
export const fetchCategories = createAsyncThunk(
  'videos/fetchCategories',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      
      const response = await axios.get('/videos/categories/', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch categories');
    }
  }
);

// Fetch creators
export const fetchCreators = createAsyncThunk(
  'videos/fetchCreators',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      
      const response = await axios.get('/videos/creators/', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch creators');
    }
  }
);

const videoSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    clearCurrentVideo: (state) => {
      state.currentVideo = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch all videos
    builder.addCase(fetchVideos.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchVideos.fulfilled, (state, action: PayloadAction<VideoTutorial[]>) => {
      state.loading = false;
      state.videos = action.payload;
    });
    builder.addCase(fetchVideos.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Fetch a single video
    builder.addCase(fetchVideo.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchVideo.fulfilled, (state, action: PayloadAction<VideoWithProgress>) => {
      state.loading = false;
      state.currentVideo = action.payload;
    });
    builder.addCase(fetchVideo.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Fetch recently watched videos
    builder.addCase(fetchRecentlyWatched.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchRecentlyWatched.fulfilled, (state, action: PayloadAction<VideoTutorial[]>) => {
      state.loading = false;
      state.recentlyWatched = action.payload;
    });
    builder.addCase(fetchRecentlyWatched.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Fetch bookmarked videos
    builder.addCase(fetchBookmarkedVideos.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchBookmarkedVideos.fulfilled, (state, action: PayloadAction<VideoTutorial[]>) => {
      state.loading = false;
      state.bookmarked = action.payload;
    });
    builder.addCase(fetchBookmarkedVideos.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Search videos
    builder.addCase(searchVideos.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(searchVideos.fulfilled, (state, action: PayloadAction<VideoTutorial[]>) => {
      state.loading = false;
      state.searchResults = action.payload;
    });
    builder.addCase(searchVideos.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Import videos
    builder.addCase(importVideos.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(importVideos.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(importVideos.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Update video progress
    builder.addCase(updateVideoProgress.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateVideoProgress.fulfilled, (state, action) => {
      state.loading = false;
      if (state.currentVideo && state.currentVideo.id === action.payload.videoId) {
        state.currentVideo.progress = action.payload.progress;
      }
    });
    builder.addCase(updateVideoProgress.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Create video
    builder.addCase(createVideo.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createVideo.fulfilled, (state, action: PayloadAction<VideoTutorial>) => {
      state.loading = false;
      state.videos.push(action.payload);
    });
    builder.addCase(createVideo.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Update video
    builder.addCase(updateVideo.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateVideo.fulfilled, (state, action: PayloadAction<VideoTutorial>) => {
      state.loading = false;
      const index = state.videos.findIndex(video => video.id === action.payload.id);
      if (index !== -1) {
        state.videos[index] = action.payload;
      }
      if (state.currentVideo && state.currentVideo.id === action.payload.id) {
        const progress = state.currentVideo.progress;
        state.currentVideo = { 
          ...action.payload,
          progress 
        };
      }
    });
    builder.addCase(updateVideo.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Delete video
    builder.addCase(deleteVideo.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteVideo.fulfilled, (state, action: PayloadAction<number>) => {
      state.loading = false;
      state.videos = state.videos.filter(video => video.id !== action.payload);
      if (state.currentVideo && state.currentVideo.id === action.payload) {
        state.currentVideo = null;
      }
    });
    builder.addCase(deleteVideo.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Fetch categories
    builder.addCase(fetchCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.categories = action.payload;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Fetch creators
    builder.addCase(fetchCreators.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCreators.fulfilled, (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.creators = action.payload;
    });
    builder.addCase(fetchCreators.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearCurrentVideo, clearError, clearSearchResults } = videoSlice.actions;
export default videoSlice.reducer;
