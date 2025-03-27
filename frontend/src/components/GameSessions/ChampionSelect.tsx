import React, { useEffect, useState } from 'react';
import { 
  Autocomplete, 
  TextField, 
  Box, 
  Avatar, 
  Typography, 
  CircularProgress,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getAllChampions, ChampionData } from '../../services/riotDataService';

interface ChampionSelectProps {
  id: string;
  name: string;
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string | undefined;
}

const ChampionSelect: React.FC<ChampionSelectProps> = ({
  id,
  name,
  label,
  value = '',
  onChange,
  error,
  helperText,
}) => {
  const [champions, setChampions] = useState<ChampionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchChampions = async () => {
      try {
        setLoading(true);
        const championsData = await getAllChampions();
        setChampions(championsData);
      } catch (error) {
        console.error('Error fetching champion data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChampions();
  }, []);
  
  // Find the selected champion object based on name
  const selectedChampion = champions.find(champion => champion.name === value) || null;
  
  return (
    <Autocomplete
      id={id}
      options={champions}
      loading={loading}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.name === value.name}
      value={selectedChampion}
      onChange={(event, newValue) => {
        onChange(newValue?.name || '');
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          name={name}
          label={label}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                {loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon color="action" />}
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={option.imageUrl}
              alt={option.name}
              sx={{ width: 24, height: 24, mr: 1 }}
            />
            <Typography>{option.name}</Typography>
          </Box>
        </Box>
      )}
      noOptionsText="No champions found"
      loadingText="Loading champions..."
      filterOptions={(options, { inputValue }) => {
        const searchTerm = inputValue.toLowerCase();
        return options.filter(option => 
          option.name.toLowerCase().includes(searchTerm)
        );
      }}
    />
  );
};

export default ChampionSelect; 