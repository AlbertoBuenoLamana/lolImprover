import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  CircularProgress, 
  Grid, 
  Tabs, 
  Tab, 
  Paper,
  Divider,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from '../../api/axios';
import ChampionCard from '../Ui/ChampionCard';
import { DDRAGON_BASE_URL, DEFAULT_DDRAGON_VERSION } from '../../config';

/**
 * ChampionPoolSelector
 * 
 * Component for selecting champions from a list
 * 
 * @category feature
 */

export interface ChampionPoolSelectorProps {
  onSelectChampion: (championId: string, championName: string) => void;
  selectedChampionId?: string;
  excludeChampionIds?: string[];
}

interface Champion {
  id: string;
  key: string;
  name: string;
  title: string;
  tags: string[];
  image: {
    full: string;
  };
}

// Role map for filtering champions based on tags
const ROLE_MAP: Record<number, string[]> = {
  0: [], // All champions
  1: ['Fighter', 'Tank'], // Top
  2: ['Fighter', 'Tank', 'Assassin'], // Jungle
  3: ['Mage', 'Assassin'], // Mid
  4: ['Marksman', 'Support'], // Bot
  5: ['Support', 'Tank', 'Mage'] // Support
};

// Role labels
const ROLE_LABELS = ['All Champions', 'Top', 'Jungle', 'Mid', 'Bot', 'Support'];

const ChampionPoolSelector: React.FC<ChampionPoolSelectorProps> = ({
  onSelectChampion,
  selectedChampionId = '',
  excludeChampionIds = []
}) => {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [ddragonVersion, setDDragonVersion] = useState(DEFAULT_DDRAGON_VERSION);
  
  // Fetch champions from Data Dragon API
  useEffect(() => {
    const fetchChampions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First try to get the latest version
        try {
          const versionResponse = await fetch(`${DDRAGON_BASE_URL}/api/versions.json`);
          const versionData = await versionResponse.json();
          if (versionData && versionData.length > 0) {
            setDDragonVersion(versionData[0]);
          }
        } catch (err) {
          console.warn('Could not fetch latest Data Dragon version, using default:', DEFAULT_DDRAGON_VERSION);
        }
        
        // Then fetch champions data
        const response = await fetch(
          `${DDRAGON_BASE_URL}/cdn/${ddragonVersion}/data/en_US/champion.json`
        );
        
        const responseData = await response.json();
        
        if (responseData && responseData.data) {
          const championsData = Object.values(responseData.data) as Champion[];
          setChampions(championsData);
        } else {
          setError('Invalid champions data structure');
        }
      } catch (error) {
        console.error('Error fetching champions:', error);
        setError('Failed to fetch champions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChampions();
  }, [ddragonVersion]);
  
  // Filter champions based on search term and role
  const filteredChampions = champions.filter(champion => {
    // Filter out excluded champions
    if (excludeChampionIds.includes(champion.id)) {
      return false;
    }
    
    // Filter by role if not in the "All" tab
    if (currentTab > 0) {
      const roleTags = ROLE_MAP[currentTab];
      if (roleTags.length > 0 && (!champion.tags || !champion.tags.some(tag => roleTags.includes(tag)))) {
        return false;
      }
    }
    
    // Filter by search term
    if (searchTerm.trim() === '') {
      return true;
    }
    
    return champion.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Group champions by first letter for the "All Champions" tab
  const groupedChampions = filteredChampions.reduce((groups, champion) => {
    const firstLetter = champion.name.charAt(0).toUpperCase();
    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }
    groups[firstLetter].push(champion);
    return groups;
  }, {} as Record<string, Champion[]>);
  
  // Sort the keys alphabetically
  const sortedGroups = Object.keys(groupedChampions).sort();
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };
  
  // Handle champion selection
  const handleSelectChampion = (championId: string, championName: string) => {
    onSelectChampion(championId, championName);
  };
  
  // Render error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>Error Loading Champions</Typography>
        <Typography variant="body2">{error}</Typography>
      </Alert>
    );
  }
  
  return (
    <Box>
      {/* Search field */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search champions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Box>
      
      {/* Loading state */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {/* Role tabs */}
          <Paper sx={{ mb: 2 }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                minHeight: '48px',
                '& .MuiTab-root': {
                  minHeight: '48px',
                  textTransform: 'none'
                }
              }}
            >
              {ROLE_LABELS.map((label, index) => (
                <Tab key={index} label={label} />
              ))}
            </Tabs>
          </Paper>
          
          {/* Champions display - Alphabetically grouped in All tab */}
          {currentTab === 0 && sortedGroups.length > 0 && (
            <Box>
              {sortedGroups.map(letter => (
                <Box key={letter} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>{letter}</Typography>
                  <Divider sx={{ mb: 1 }} />
                  <Grid container spacing={1}>
                    {groupedChampions[letter].map((champion) => (
                      <Grid item key={champion.id}>
                        <ChampionCard
                          championId={champion.id}
                          championName={champion.name}
                          onClick={() => handleSelectChampion(champion.id, champion.name)}
                          selected={selectedChampionId === champion.id}
                          showActions={false}
                          size="small"
                          version={ddragonVersion}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Box>
          )}
          
          {/* Champions display - Grid layout for role tabs */}
          {currentTab > 0 && (
            <Grid container spacing={1}>
              {filteredChampions.map((champion) => (
                <Grid item key={champion.id}>
                  <ChampionCard
                    championId={champion.id}
                    championName={champion.name}
                    onClick={() => handleSelectChampion(champion.id, champion.name)}
                    selected={selectedChampionId === champion.id}
                    showActions={false}
                    size="small"
                    version={ddragonVersion}
                  />
                </Grid>
              ))}
            </Grid>
          )}
          
          {/* No results message */}
          {filteredChampions.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No champions found matching your criteria.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ChampionPoolSelector;
