// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// League of Legends Data Dragon
export const DDRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com';
export const DEFAULT_DDRAGON_VERSION = '15.6.1'; // Fallback version if latest can't be fetched

// Champion pool categories
export const CHAMPION_POOL_CATEGORIES = [
  { value: 'blind', label: 'Blind Pick', color: '#2196f3' },
  { value: 'situational', label: 'Situational', color: '#ff9800' },
  { value: 'test', label: 'Testing', color: '#9c27b0' }
]; 