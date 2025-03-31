import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  CircularProgress,
  Tooltip,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { 
  fetchCreators, 
  createCreator, 
  updateCreator, 
  deleteCreator,
  clearCreatorError,
  Creator
} from '../../store/slices/creatorSlice';
import { AppDispatch, RootState } from '../../store';

// Form data type for creating/editing creators
type CreatorFormData = {
  name: string;
  description?: string;
  platform: string;
  platform_id: string;
  url?: string;
};

const CreatorsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { creators, loading, error } = useSelector((state: RootState) => state.creators);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<CreatorFormData>({
    name: '',
    description: '',
    platform: 'youtube',
    platform_id: '',
    url: '',
  });
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  
  // Fetch creators on component mount
  useEffect(() => {
    dispatch(fetchCreators());
  }, [dispatch]);
  
  // Handle opening the dialog for creating a new creator
  const handleOpenCreateDialog = () => {
    setFormData({
      name: '',
      description: '',
      platform: 'youtube',
      platform_id: '',
      url: '',
    });
    setDialogMode('create');
    setOpenDialog(true);
  };
  
  // Handle opening the dialog for editing an existing creator
  const handleOpenEditDialog = (creator: Creator) => {
    setSelectedCreator(creator);
    setFormData({
      name: creator.name,
      description: creator.description || '',
      platform: creator.platform || 'youtube',
      platform_id: creator.platform_id || '',
      url: creator.url || '',
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };
  
  // Handle closing the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCreator(null);
  };
  
  // Handle form data changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: CreatorFormData) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (dialogMode === 'create') {
        await dispatch(createCreator(formData)).unwrap();
        setSnackbar({
          open: true,
          message: 'Creator created successfully',
          severity: 'success',
        });
      } else if (dialogMode === 'edit' && selectedCreator) {
        await dispatch(updateCreator({ id: selectedCreator.id, creatorData: formData })).unwrap();
        setSnackbar({
          open: true,
          message: 'Creator updated successfully',
          severity: 'success',
        });
      }
      handleCloseDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: typeof err === 'string' ? err : 'An error occurred',
        severity: 'error',
      });
    }
  };
  
  // Handle creator deletion
  const handleDeleteCreator = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this creator? This action cannot be undone.')) {
      try {
        await dispatch(deleteCreator(id)).unwrap();
        setSnackbar({
          open: true,
          message: 'Creator deleted successfully',
          severity: 'success',
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: typeof err === 'string' ? err : 'An error occurred',
          severity: 'error',
        });
      }
    }
  };
  
  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false,
    }));
    if (error) {
      dispatch(clearCreatorError());
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              Creators
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Manage content creators for your video tutorials
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
            >
              Add Creator
            </Button>
          </Grid>
        </Grid>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Website</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {creators.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        No creators found. Click "Add Creator" to create one.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  creators.map((creator) => (
                    <TableRow key={creator.id}>
                      <TableCell>{creator.name}</TableCell>
                      <TableCell>{creator.description || '—'}</TableCell>
                      <TableCell>
                        {creator.url ? (
                          <a href={creator.url} target="_blank" rel="noopener noreferrer">
                            {creator.url}
                          </a>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton 
                            onClick={() => handleOpenEditDialog(creator)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            onClick={() => handleDeleteCreator(creator.id)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Videos">
                          <IconButton 
                            component={RouterLink}
                            to={`/video-tutorials?creator=${creator.id}`}
                            size="small"
                            color="primary"
                          >
                            <VideoLibraryIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {/* Creator Form Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
          <DialogTitle>
            {dialogMode === 'create' ? 'Add New Creator' : 'Edit Creator'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Creator Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="url"
              label="Website URL"
              type="url"
              fullWidth
              variant="outlined"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
              disabled={!formData.name.trim()}
            >
              {dialogMode === 'create' ? 'Create' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Success/Error Snackbar */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default CreatorsPage; 