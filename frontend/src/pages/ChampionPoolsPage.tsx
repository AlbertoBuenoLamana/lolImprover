import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  Tabs, 
  Tab, 
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  Paper,
  CircularProgress,
  Alert,
  Badge,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchChampionPools, 
  createChampionPool, 
  updateChampionPool, 
  deleteChampionPool,
  ChampionPool,
  ChampionPoolEntry
} from '../store/slices/championPoolSlice';
import ChampionPoolSelector from '../components/Feature/ChampionPoolSelector';
import ChampionCard from '../components/Ui/ChampionCard';
import ErrorDisplay from '../components/Ui/ErrorDisplay';
import CustomSnackbar from '../components/Ui/CustomSnackbar';
import { CHAMPION_POOL_CATEGORIES } from '../config';

/**
 * ChampionPoolsPage
 * 
 * Page for managing champion pools
 * 
 * @category page
 */

export interface ChampionPoolsPageProps {
  // No specific props needed
}

// Local champion interface matching the structure we use in the component
interface Champion {
  id: string;
  name: string;
  category: 'blind' | 'situational' | 'test';
}

const ChampionPoolsPage: React.FC<ChampionPoolsPageProps> = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { pools, loading, error } = useSelector((state: RootState) => state.championPools);
  
  // Local state
  const [currentTab, setCurrentTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPool, setCurrentPool] = useState<ChampionPool | null>(null);
  const [poolName, setPoolName] = useState('');
  const [poolDescription, setPoolDescription] = useState('');
  const [selectedChampions, setSelectedChampions] = useState<Champion[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Fetch champion pools on mount
  useEffect(() => {
    dispatch(fetchChampionPools());
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleOpenDialog = (pool?: ChampionPool) => {
    if (pool) {
      // Edit mode
      setEditMode(true);
      setCurrentPool(pool);
      setPoolName(pool.name);
      setPoolDescription(pool.description || '');
      
      // Convert ChampionPoolEntry to Champion for local state
      const champions = pool.champions.map(c => {
        // Ensure the category is one of the allowed literal types
        const category = c.category as 'blind' | 'situational' | 'test' || 'blind';
        return {
          id: c.champion_id,
          name: c.champion_name,
          category: category
        };
      });
      
      setSelectedChampions(champions);
    } else {
      // Create mode
      setEditMode(false);
      setCurrentPool(null);
      setPoolName('');
      setPoolDescription('');
      setSelectedChampions([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddChampion = (championId: string, championName: string) => {
    // Explicitly type the category to be one of the allowed literals
    const category: 'blind' | 'situational' | 'test' = 
      currentTab === 0 ? 'blind' : 
      currentTab === 1 ? 'situational' : 
      'test';
      
    const champion: Champion = { 
      id: championId, 
      name: championName,
      category: category
    };
    
    // Check if champion is already in the pool (regardless of category)
    if (!selectedChampions.some(c => c.id === championId)) {
      setSelectedChampions([...selectedChampions, champion]);
    }
  };

  const handleRemoveChampion = (championId: string) => {
    setSelectedChampions(selectedChampions.filter(c => c.id !== championId));
  };

  const handleSavePool = () => {
    if (!poolName.trim()) {
      setSnackbar({
        open: true,
        message: 'Pool name is required',
        severity: 'error'
      });
      return;
    }

    // Map selected champions to the format expected by the API
    const champions = selectedChampions.map(champ => ({
      champion_id: champ.id,
      champion_name: champ.name,
      category: champ.category
    }));

    // Create full pool data with all fields
    const poolData = {
      name: poolName,
      description: poolDescription,
      champions
    };

    console.log('Saving pool with data:', poolData);

    if (editMode && currentPool) {
      dispatch(updateChampionPool({ 
        id: currentPool.id!, 
        poolData 
      }));
    } else {
      dispatch(createChampionPool(poolData));
    }

    setSnackbar({
      open: true,
      message: editMode ? 'Champion pool updated successfully' : 'Champion pool created successfully',
      severity: 'success'
    });
    
    handleCloseDialog();
  };

  const handleDeletePool = (id: number) => {
    if (window.confirm('Are you sure you want to delete this champion pool?')) {
      dispatch(deleteChampionPool(id));
      setSnackbar({
        open: true,
        message: 'Champion pool deleted successfully',
        severity: 'success'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Get champions for current category tab
  const getChampionsByCategory = (category: 'blind' | 'situational' | 'test') => {
    return selectedChampions.filter(c => c.category === category);
  };

  // Render error state
  const renderError = () => {
    if (!error) return null;
    
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="subtitle1">{error}</Typography>
      </Alert>
    );
  };

  // Render champion pools
  const renderChampionPools = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return renderError();
    }

    if (!pools || pools.length === 0) {
      return (
        <Box textAlign="center" my={4}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No champion pools found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Create your first champion pool to organize your champions by role and preference.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Create Champion Pool
          </Button>
        </Box>
      );
    }

    return (
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {pools.map((pool) => (
          <Grid item xs={12} sm={6} md={4} key={pool.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6" component="h2">
                    {pool.name}
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpenDialog(pool)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeletePool(pool.id!)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                
                {pool.description && (
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {pool.description}
                  </Typography>
                )}
                
                <Divider sx={{ my: 1 }} />
                
                {/* Display category chips */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {['blind', 'situational', 'test'].map((category) => {
                    const championsInCategory = pool.champions.filter(c => 
                      c.category === category || (!c.category && category === 'blind')
                    );
                    if (championsInCategory.length > 0) {
                      const categoryInfo = CHAMPION_POOL_CATEGORIES.find(c => c.value === category);
                      return (
                        <Chip 
                          key={category}
                          label={`${categoryInfo?.label || category} (${championsInCategory.length})`}
                          sx={{ 
                            backgroundColor: categoryInfo?.color || '#e0e0e0',
                            color: 'white'
                          }}
                          size="small"
                        />
                      );
                    }
                    return null;
                  }).filter(Boolean)}
                </Box>
                
                <Box display="flex" flexWrap="wrap" gap={1} mb={1} mt={1}>
                  {pool.champions && pool.champions.length > 0 ? (
                    pool.champions.map((champion) => (
                      <ChampionCard
                        key={champion.champion_id}
                        championId={String(champion.champion_id)}
                        championName={champion.champion_name}
                        size="small"
                        showActions={false}
                        category={champion.category || 'blind'}
                        notes={champion.notes}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No champions in this pool yet.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Champion pool dialog content
  const renderPoolDialog = () => {
    const blindPickChampions = getChampionsByCategory('blind');
    const situationalChampions = getChampionsByCategory('situational');
    const testingChampions = getChampionsByCategory('test');
    
    return (
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Champion Pool' : 'Create New Champion Pool'}
        </DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <TextField
              fullWidth
              label="Pool Name"
              value={poolName}
              onChange={(e) => setPoolName(e.target.value)}
              margin="normal"
              required
              error={poolName.trim() === ''}
              helperText={poolName.trim() === '' ? 'Pool name is required' : ''}
            />
            <TextField
              fullWidth
              label="Description"
              value={poolDescription}
              onChange={(e) => setPoolDescription(e.target.value)}
              margin="normal"
              multiline
              rows={2}
            />
            
            <Box mt={2}>
              <Typography variant="subtitle1" gutterBottom>Champion Categories</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Add champions to different categories within your pool. You can add the same champion to multiple categories.
              </Typography>
              <Tabs 
                value={currentTab} 
                onChange={handleTabChange} 
                aria-label="champion categories"
                variant="fullWidth"
              >
                {CHAMPION_POOL_CATEGORIES.map((category, index) => {
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
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 'bold'
                      }}
                    />
                  );
                })}
              </Tabs>
            </Box>
            
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                {currentTab === 0 ? 'Blind Pick Champions' : 
                 currentTab === 1 ? 'Situational Champions' : 'Testing Champions'}:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {currentTab === 0 && (
                    blindPickChampions.length > 0 ? (
                      blindPickChampions.map((champion) => (
                        <ChampionCard
                          key={champion.id}
                          championId={String(champion.id)}
                          championName={champion.name}
                          size="small"
                          showActions={true}
                          onRemove={() => handleRemoveChampion(champion.id)}
                          category="blind"
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No blind pick champions selected. Add champions from below.
                      </Typography>
                    )
                  )}
                  
                  {currentTab === 1 && (
                    situationalChampions.length > 0 ? (
                      situationalChampions.map((champion) => (
                        <ChampionCard
                          key={champion.id}
                          championId={String(champion.id)}
                          championName={champion.name}
                          size="small"
                          showActions={true}
                          onRemove={() => handleRemoveChampion(champion.id)}
                          category="situational"
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No situational champions selected. Add champions from below.
                      </Typography>
                    )
                  )}
                  
                  {currentTab === 2 && (
                    testingChampions.length > 0 ? (
                      testingChampions.map((champion) => (
                        <ChampionCard
                          key={champion.id}
                          championId={String(champion.id)}
                          championName={champion.name}
                          size="small"
                          showActions={true}
                          onRemove={() => handleRemoveChampion(champion.id)}
                          category="test"
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No testing champions selected. Add champions from below.
                      </Typography>
                    )
                  )}
                </Box>
              </Paper>
              
              <ChampionPoolSelector 
                onSelectChampion={handleAddChampion}
                selectedChampionId=""
                excludeChampionIds={selectedChampions.map(c => c.id)}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSavePool} 
            variant="contained" 
            color="primary"
            disabled={!poolName.trim()}
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Champion Pools
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Pool
        </Button>
      </Box>
      
      <Typography variant="body1" paragraph>
        Organize your champions into pools based on your preferences and strategies. Each pool can contain champions for blind pick, situational play, and testing.
      </Typography>
      
      {renderError()}
      {renderChampionPools()}
      {renderPoolDialog()}
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </Container>
  );
};

export default ChampionPoolsPage;
