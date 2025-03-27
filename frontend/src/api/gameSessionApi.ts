import axiosInstance from './axios';
import { GameSession, GameSessionFormData, GameSessionCreate } from '../types';

const GAME_SESSIONS_URL = '/game-sessions/';

// Fetch all game sessions
export const fetchGameSessions = async (): Promise<GameSession[]> => {
  try {
    const response = await axiosInstance.get(GAME_SESSIONS_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching game sessions:', error);
    throw error;
  }
};

// Fetch a single game session by ID
export const fetchGameSession = async (id: number): Promise<GameSession> => {
  try {
    const response = await axiosInstance.get(`${GAME_SESSIONS_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching game session ${id}:`, error);
    throw error;
  }
};

// Create a new game session
export const createGameSession = async (sessionData: GameSessionCreate): Promise<GameSession> => {
  try {
    console.log('Creating game session with data:', sessionData);
    const response = await axiosInstance.post(GAME_SESSIONS_URL, sessionData);
    return response.data;
  } catch (error) {
    console.error('Error creating game session:', error);
    throw error;
  }
};

// Update an existing game session
export const updateGameSession = async (id: number, sessionData: GameSessionCreate): Promise<GameSession> => {
  try {
    const response = await axiosInstance.put(`${GAME_SESSIONS_URL}${id}/`, sessionData);
    return response.data;
  } catch (error) {
    console.error(`Error updating game session ${id}:`, error);
    throw error;
  }
};

// Delete a game session
export const deleteGameSession = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${GAME_SESSIONS_URL}${id}/`);
  } catch (error) {
    console.error(`Error deleting game session ${id}:`, error);
    throw error;
  }
}; 