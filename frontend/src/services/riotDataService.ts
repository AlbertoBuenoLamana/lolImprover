import axios from 'axios';

interface Champion {
  id: string;
  name: string;
  image: {
    full: string;
  };
}

export interface ChampionData {
  id: string;
  name: string;
  imageUrl: string;
}

// Cache for the version and champions to avoid unnecessary API calls
let cachedVersion: string | null = null;
let cachedChampions: ChampionData[] | null = null;

/**
 * Fetches the latest Data Dragon version
 */
export const getLatestVersion = async (): Promise<string> => {
  if (cachedVersion) return cachedVersion;
  
  try {
    const response = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = response.data as string[];
    cachedVersion = versions[0]; // First item is the latest version
    return versions[0]; // Return directly to avoid null type
  } catch (error) {
    console.error('Error fetching Data Dragon version:', error);
    return '15.6.1'; // Fallback to a known version if API fails
  }
};

/**
 * Gets the URL for a champion icon
 */
export const getChampionIconUrl = (championName: string, version: string): string => {
  // Some champion names need to be adjusted for Data Dragon
  const adjustedName = championName
    .replace(/\s+/g, '') // Remove spaces
    .replace(/[.']/g, '') // Remove periods and apostrophes
    .replace('&Willump', '') // Handle Nunu & Willump special case
    .replace('Wukong', 'MonkeyKing'); // Wukong is actually MonkeyKing in the API
  
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${adjustedName}.png`;
};

/**
 * Fetches all champions data from Data Dragon API
 */
export const getAllChampions = async (): Promise<ChampionData[]> => {
  if (cachedChampions) return cachedChampions;
  
  try {
    const version = await getLatestVersion();
    const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);
    
    const championsData = response.data.data as Record<string, Champion>;
    const championsArray: ChampionData[] = Object.values(championsData).map((champion: Champion) => ({
      id: champion.id,
      name: champion.name,
      imageUrl: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image.full}`
    }));
    
    cachedChampions = championsArray;
    return championsArray;
  } catch (error) {
    console.error('Error fetching champions data:', error);
    return [];
  }
};

/**
 * Clears the cache, useful when you want to force a refresh
 */
export const clearCache = (): void => {
  cachedVersion = null;
  cachedChampions = null;
};

export default {
  getLatestVersion,
  getChampionIconUrl,
  getAllChampions,
  clearCache,
}; 