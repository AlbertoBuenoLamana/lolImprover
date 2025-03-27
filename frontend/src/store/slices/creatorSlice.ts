import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import { Creator, CreatorFormData } from '../../types';
import axios from '../../api/axios';
import { extractErrorMessage } from '../../utils/errorHandler';

// Define types locally
type Creator = {
  id: number;
  name: string;
  description?: string;
  website?: string;
};

type CreatorFormData = {
  name: string;
  description?: string;
  website?: string;
};

interface CreatorState {
  creators: Creator[];
  selectedCreator: Creator | null;
  loading: boolean;
  error: string | null;
}

const initialState: CreatorState = {
  creators: [],
  selectedCreator: null,
  loading: false,
  error: null,
};

// Fetch all creators
export const fetchCreators = createAsyncThunk(
  'creators/fetchAll',
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
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Fetch a single creator
export const fetchCreator = createAsyncThunk(
  'creators/fetchOne',
  async (id: number, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      
      const response = await axios.get(`/videos/creators/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Create a new creator
export const createCreator = createAsyncThunk(
  'creators/create',
  async (creatorData: CreatorFormData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      
      const response = await axios.post('/videos/creators/', creatorData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Update an existing creator
export const updateCreator = createAsyncThunk(
  'creators/update',
  async ({ id, creatorData }: { id: number; creatorData: CreatorFormData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      
      const response = await axios.put(`/videos/creators/${id}`, creatorData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Delete a creator
export const deleteCreator = createAsyncThunk(
  'creators/delete',
  async (id: number, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      
      await axios.delete(`/videos/creators/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      
      return id;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Set creator for a video
export const setVideoCreator = createAsyncThunk(
  'creators/setVideoCreator',
  async ({ videoId, creatorId }: { videoId: number; creatorId: number }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      
      const response = await axios.put(`/videos/${videoId}/set-creator/${creatorId}`, {}, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const creatorSlice = createSlice({
  name: 'creators',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCreator: (state, action: PayloadAction<Creator | null>) => {
      state.selectedCreator = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all creators
    builder.addCase(fetchCreators.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCreators.fulfilled, (state, action: PayloadAction<Creator[]>) => {
      state.loading = false;
      state.creators = action.payload;
    });
    builder.addCase(fetchCreators.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Fetch single creator
    builder.addCase(fetchCreator.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCreator.fulfilled, (state, action: PayloadAction<Creator>) => {
      state.loading = false;
      state.selectedCreator = action.payload;
    });
    builder.addCase(fetchCreator.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Create creator
    builder.addCase(createCreator.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createCreator.fulfilled, (state, action: PayloadAction<Creator>) => {
      state.loading = false;
      state.creators.push(action.payload);
    });
    builder.addCase(createCreator.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Update creator
    builder.addCase(updateCreator.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateCreator.fulfilled, (state, action: PayloadAction<Creator>) => {
      state.loading = false;
      const index = state.creators.findIndex((creator: Creator) => creator.id === action.payload.id);
      if (index !== -1) {
        state.creators[index] = action.payload;
      }
      if (state.selectedCreator && state.selectedCreator.id === action.payload.id) {
        state.selectedCreator = action.payload;
      }
    });
    builder.addCase(updateCreator.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Delete creator
    builder.addCase(deleteCreator.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteCreator.fulfilled, (state, action: PayloadAction<number>) => {
      state.loading = false;
      state.creators = state.creators.filter((creator: Creator) => creator.id !== action.payload);
      if (state.selectedCreator && state.selectedCreator.id === action.payload) {
        state.selectedCreator = null;
      }
    });
    builder.addCase(deleteCreator.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, setSelectedCreator } = creatorSlice.actions;
export default creatorSlice.reducer; 