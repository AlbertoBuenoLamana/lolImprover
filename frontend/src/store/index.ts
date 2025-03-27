import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gameSessionReducer from './slices/gameSessionSlice';
import videoReducer from './slices/videoSlice';
import creatorReducer from './slices/creatorSlice';
import goalReducer from './slices/goalSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    gameSessions: gameSessionReducer,
    videos: videoReducer,
    creators: creatorReducer,
    goals: goalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
