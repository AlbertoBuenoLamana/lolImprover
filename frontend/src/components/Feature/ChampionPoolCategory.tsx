import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Collapse, 
  IconButton, 
  Grid, 
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import ChampionCard from '../Ui/ChampionCard';
import { ChampionPoolEntry } from '../../store/slices/championPoolSlice';

/**
 * ChampionPoolCategory
 * 
 * Component for displaying champions in a specific pool category
 * 
 * @category feature
 */

export interface ChampionPoolCategoryProps {
  title: string;
  subtitle?: string;
  color: string;
  champions: ChampionPoolEntry[];
  onRemoveChampion?: (championId: string) => void;
  onAddChampion?: (champion: Omit<ChampionPoolEntry, 'id' | 'pool_id'>) => void;
  loading?: boolean;
  availableChampions?: { id: string; name: string }[];
  expanded?: boolean;
  categoryValue: 'blind' | 'situational' | 'test';
}

const ChampionPoolCategory: React.FC<ChampionPoolCategoryProps> = ({
  title,
  subtitle,
  color,
  champions,
  onRemoveChampion,
  onAddChampion,
  loading = false,
  availableChampions = [],
  expanded = true,
  categoryValue
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(expanded);
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [selectedChampion, setSelectedChampion] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };
  
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setSelectedChampion('');
    setNotes('');
  };
  
  const handleAddChampion = () => {
    if (selectedChampion && onAddChampion) {
      const champion = availableChampions.find(c => c.id === selectedChampion);
      if (champion) {
        onAddChampion({
          champion_id: champion.id,
          champion_name: champion.name,
          notes: notes || undefined
        });
        handleCloseAddDialog();
      }
    }
  };

  return (
    <Paper 
      sx={{ 
        mb: 3, 
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${color}`,
        boxShadow: 'none'
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          backgroundColor: color,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {onAddChampion && (
            <Tooltip title="Add Champion">
              <IconButton 
                size="small" 
                onClick={handleOpenAddDialog} 
                sx={{ color: 'white', mr: 1 }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
          
          <IconButton 
            size="small" 
            onClick={handleToggleExpand} 
            sx={{ color: 'white' }}
          >
            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </Box>
      </Box>
      
      <Collapse in={isExpanded}>
        <Box sx={{ p: 2 }}>
          {champions.length > 0 ? (
            <Grid container spacing={2}>
              {champions.map((champion) => (
                <Grid item key={champion.champion_id}>
                  <ChampionCard
                    championId={champion.champion_id}
                    championName={champion.champion_name}
                    onRemove={onRemoveChampion ? () => onRemoveChampion(champion.champion_id) : undefined}
                    notes={champion.notes}
                    category={categoryValue}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No champions in this category. Click the + icon to add champions.
            </Typography>
          )}
        </Box>
      </Collapse>
      
      {/* Add Champion Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Champion to {title}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="champion-select-label">Champion</InputLabel>
              <Select
                labelId="champion-select-label"
                value={selectedChampion}
                label="Champion"
                onChange={(e) => setSelectedChampion(e.target.value as string)}
              >
                {availableChampions.map((champion) => (
                  <MenuItem key={champion.id} value={champion.id}>
                    {champion.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Notes (optional)"
              variant="outlined"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button 
            onClick={handleAddChampion} 
            variant="contained" 
            color="primary"
            disabled={!selectedChampion}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ChampionPoolCategory;
