import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gameSessionReducer from './slices/gameSessionSlice';
import videoReducer from './slices/videoSlice';
import goalReducer from './slices/goalSlice';
import championPoolReducer from './slices/championPoolSlice';
import creatorReducer from './slices/creatorSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    gameSessions: gameSessionReducer,
    videos: videoReducer,
    goals: goalReducer,
    championPools: championPoolReducer,
    creators: creatorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
