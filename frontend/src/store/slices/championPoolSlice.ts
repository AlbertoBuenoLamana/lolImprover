import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '../../api/axios';
import { API_BASE_URL } from '../../config';

// Types
export interface ChampionPoolEntry {
  id?: number;
  champion_id: string;
  champion_name: string;
  notes?: string;
  pool_id?: number;
  category?: 'blind' | 'situational' | 'test';
  created_at?: string;
}

export interface ChampionPool {
  id?: number;
  user_id?: number;
  name: string;
  description?: string;
  category?: 'blind' | 'situational' | 'test';
  champions: ChampionPoolEntry[];
  created_at?: string;
  updated_at?: string;
}

export interface ChampionPoolState {
  pools: ChampionPool[];
  currentPool: ChampionPool | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ChampionPoolState = {
  pools: [],
  currentPool: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchChampionPools = createAsyncThunk(
  'championPools/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/champion-pools');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch champion pools');
    }
  }
);

export const fetchChampionPoolsByCategory = createAsyncThunk(
  'championPools/fetchByCategory',
  async (category: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/champion-pools?category=${category}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch champion pools by category');
    }
  }
);

export const fetchChampionPool = createAsyncThunk(
  'championPools/fetchOne',
  async (poolId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/champion-pools/${poolId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch champion pool');
    }
  }
);

export const createChampionPool = createAsyncThunk(
  'championPools/create',
  async (poolData: Omit<ChampionPool, 'id' | 'user_id'>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/champion-pools', poolData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create champion pool');
    }
  }
);

export const updateChampionPool = createAsyncThunk(
  'championPools/update',
  async ({ id, poolData }: { id: number; poolData: Partial<ChampionPool> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/champion-pools/${id}`, poolData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update champion pool');
    }
  }
);

export const deleteChampionPool = createAsyncThunk(
  'championPools/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await axios.delete(`/champion-pools/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete champion pool');
    }
  }
);

export const addChampionToPool = createAsyncThunk(
  'championPools/addChampion',
  async ({ poolId, champion }: { poolId: number; champion: Omit<ChampionPoolEntry, 'id' | 'pool_id'> }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/champion-pools/${poolId}/champions`, champion);
      return { poolId, champion: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to add champion to pool');
    }
  }
);

export const removeChampionFromPool = createAsyncThunk(
  'championPools/removeChampion',
  async ({ poolId, championId }: { poolId: number; championId: string }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/champion-pools/${poolId}/champions/${championId}`);
      return { poolId, championId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to remove champion from pool');
    }
  }
);

export const fetchPooledChampions = createAsyncThunk(
  'championPools/fetchPooledChampions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/champion-pools/champions/all`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch pooled champions');
    }
  }
);

export const fetchChampionsByCategory = createAsyncThunk(
  'championPools/fetchChampionsByCategory',
  async (category: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/champion-pools/champions/category/${category}`);
      return { category, champions: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch champions by category');
    }
  }
);

// Slice
const championPoolSlice = createSlice({
  name: 'championPools',
  initialState,
  reducers: {
    clearCurrentPool: (state) => {
      state.currentPool = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all pools
      .addCase(fetchChampionPools.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChampionPools.fulfilled, (state, action) => {
        state.loading = false;
        state.pools = action.payload;
      })
      .addCase(fetchChampionPools.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch pools by category
      .addCase(fetchChampionPoolsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChampionPoolsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.pools = action.payload;
      })
      .addCase(fetchChampionPoolsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch single pool
      .addCase(fetchChampionPool.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChampionPool.fulfilled, (state, action) => {
        state.currentPool = action.payload;
        state.loading = false;
      })
      .addCase(fetchChampionPool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create pool
      .addCase(createChampionPool.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChampionPool.fulfilled, (state, action) => {
        state.loading = false;
        state.pools.push(action.payload);
        state.currentPool = action.payload;
      })
      .addCase(createChampionPool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update pool
      .addCase(updateChampionPool.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChampionPool.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pools.findIndex(pool => pool.id === action.payload.id);
        if (index !== -1) {
          state.pools[index] = action.payload;
        }
        state.currentPool = action.payload;
      })
      .addCase(updateChampionPool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete pool
      .addCase(deleteChampionPool.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChampionPool.fulfilled, (state, action) => {
        state.loading = false;
        state.pools = state.pools.filter(pool => pool.id !== action.payload);
        if (state.currentPool && state.currentPool.id === action.payload) {
          state.currentPool = null;
        }
      })
      .addCase(deleteChampionPool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add champion to pool
      .addCase(addChampionToPool.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addChampionToPool.fulfilled, (state, action) => {
        const { poolId, champion } = action.payload;
        
        // Update current pool if it's the one being modified
        if (state.currentPool && state.currentPool.id === poolId) {
          state.currentPool.champions.push(champion);
        }
        
        // Update pools array
        const poolIndex = state.pools.findIndex(pool => pool.id === poolId);
        if (poolIndex !== -1) {
          if (!state.pools[poolIndex].champions) {
            state.pools[poolIndex].champions = [];
          }
          state.pools[poolIndex].champions.push(champion);
        }
        
        state.loading = false;
      })
      .addCase(addChampionToPool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Remove champion from pool
      .addCase(removeChampionFromPool.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeChampionFromPool.fulfilled, (state, action) => {
        const { poolId, championId } = action.payload;
        
        // Update current pool if it's the one being modified
        if (state.currentPool && state.currentPool.id === poolId) {
          state.currentPool.champions = state.currentPool.champions.filter(
            c => c.champion_id !== championId
          );
        }
        
        // Update pools array
        const poolIndex = state.pools.findIndex(pool => pool.id === poolId);
        if (poolIndex !== -1 && state.pools[poolIndex].champions) {
          state.pools[poolIndex].champions = state.pools[poolIndex].champions.filter(
            c => c.champion_id !== championId
          );
        }
        
        state.loading = false;
      })
      .addCase(removeChampionFromPool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentPool, clearError } = championPoolSlice.actions;
export default championPoolSlice.reducer; 