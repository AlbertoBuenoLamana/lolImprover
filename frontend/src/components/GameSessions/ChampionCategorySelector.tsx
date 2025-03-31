import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Divider, 
  Paper,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import ChampionCard from '../Ui/ChampionCard';
import { CHAMPION_POOL_CATEGORIES } from '../../config';
import { ChampionPool, ChampionPoolEntry } from '../../store/slices/championPoolSlice';

interface ChampionCategorySelectorProps {
  pools: ChampionPool[];
  loading: boolean;
  onSelectChampion: (championName: string) => void;
  selectedChampionName?: string;
}

const ChampionCategorySelector: React.FC<ChampionCategorySelectorProps> = ({
  pools,
  loading,
  onSelectChampion,
  selectedChampionName = ''
}) => {
  const [currentCategory, setCurrentCategory] = useState<number>(0);

  // Handler for tab changes
  const handleCategoryChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentCategory(newValue);
  };

  // Get all champions from the category
  const getChampionsByCategory = (category: 'blind' | 'situational' | 'test') => {
    return pools.flatMap(pool => 
      pool.champions.filter(champion => 
        champion.category === category || 
        (!champion.category && category === 'blind')
      )
    );
  };

  // Get champions for the current selected category
  const getCurrentCategoryChampions = () => {
    const categoryValues = ['blind', 'situational', 'test'] as const;
    if (currentCategory === 0) {
      // All champions
      return pools.flatMap(pool => pool.champions);
    } else {
      return getChampionsByCategory(categoryValues[currentCategory - 1]);
    }
  };

  // Group champions by pool name for the current category
  const groupedChampions = pools.reduce((acc, pool) => {
    const filteredChampions = currentCategory === 0 
      ? pool.champions 
      : pool.champions.filter(champion => {
          const categoryValues = ['blind', 'situational', 'test'] as const;
          return champion.category === categoryValues[currentCategory - 1] || 
                 (!champion.category && categoryValues[currentCategory - 1] === 'blind');
        });
    
    if (filteredChampions.length > 0) {
      acc[pool.name] = filteredChampions;
    }
    return acc;
  }, {} as Record<string, ChampionPoolEntry[]>);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (pools.length === 0) {
    return null;
  }

  return (
    <Box>
      {/* Category tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs 
          value={currentCategory} 
          onChange={handleCategoryChange}
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
          <Tab label="All Champions" />
          {CHAMPION_POOL_CATEGORIES.map((category) => {
            const champCount = getChampionsByCategory(category.value as 'blind' | 'situational' | 'test').length;
            return (
              <Tab 
                key={category.value}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {category.label}
                    {champCount > 0 && (
                      <Chip 
                        label={champCount} 
                        size="small" 
                        sx={{ ml: 1, height: 20, minWidth: 20 }} 
                      />
                    )}
                  </Box>
                }
              />
            );
          })}
        </Tabs>
      </Paper>

      {/* Champions by pool */}
      {Object.keys(groupedChampions).length > 0 ? (
        Object.entries(groupedChampions).map(([poolName, champions]) => (
          <Box key={poolName} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              {poolName}
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {champions.map((champion) => (
                <ChampionCard
                  key={champion.champion_id}
                  championId={champion.champion_id}
                  championName={champion.champion_name}
                  size="small"
                  showActions={false}
                  category={champion.category || 'blind'}
                  notes={champion.notes}
                  selected={selectedChampionName === champion.champion_name}
                  onClick={() => onSelectChampion(champion.champion_name)}
                />
              ))}
            </Box>
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ my: 2 }}>
          No champions found in this category.
        </Typography>
      )}
    </Box>
  );
};

export default ChampionCategorySelector; 