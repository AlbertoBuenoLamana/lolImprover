import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gameSessionReducer from './slices/gameSessionSlice';
import videoReducer from './slices/videoSlice';
import creatorReducer from './slices/creatorSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    gameSessions: gameSessionReducer,
    videos: videoReducer,
    creators: creatorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
