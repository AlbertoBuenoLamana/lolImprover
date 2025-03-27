import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField,
  InputAdornment,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Divider,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  MoreVert as MoreVertIcon, 
  CheckCircle as CheckCircleIcon,
  Archive as ArchiveIcon,
  Replay as ReplayIcon
} from '@mui/icons-material';
import { Goal } from '../../types';
import GoalItem from './GoalItem';

/**
 * GoalList
 * 
 * List of active goals
 * 
 * @category ui
 */

export interface GoalListProps {
  goals: Goal[];
  title?: string;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: number) => void;
  onStatusChange?: (goal: Goal, newStatus: 'active' | 'completed' | 'archived') => void;
  onGoalSelect?: (goal: Goal) => void;
  selectedGoalIds?: number[];
  showControls?: boolean;
  emptyMessage?: string;
  loading?: boolean;
}

const GoalList: React.FC<GoalListProps> = ({ 
  goals,
  title = "Goals",
  onEdit,
  onDelete,
  onStatusChange,
  onGoalSelect,
  selectedGoalIds = [],
  showControls = true,
  emptyMessage = "No goals found.",
  loading = false
}) => {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedGoalId, setSelectedGoalId] = React.useState<number | null>(null);
  
  // Filter goals by search term and status
  const filteredGoals = goals.filter(goal => {
    const matchesSearch = 
      goal.title.toLowerCase().includes(filter.toLowerCase()) || 
      goal.description.toLowerCase().includes(filter.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      goal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, goalId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedGoalId(goalId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGoalId(null);
  };

  const handleStatusChange = (status: 'active' | 'completed' | 'archived') => {
    if (selectedGoalId) {
      onStatusChange && onStatusChange(goals.find(g => g.id === selectedGoalId) || goals[0], status);
      handleMenuClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      case 'archived':
        return 'default';
      default:
        return 'primary';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (goals.length === 0) {
    return (
      <Box sx={{ py: 3 }}>
        <Typography variant="body1" align="center">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          {title}
        </Typography>
      </Box>
      
      {/* Search and filter controls */}
      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search goals..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        
        <FormControl component="fieldset">
          <FormLabel component="legend">Status</FormLabel>
          <RadioGroup
            row
            name="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <FormControlLabel value="all" control={<Radio />} label="All" />
            <FormControlLabel value="active" control={<Radio />} label="Active" />
            <FormControlLabel value="completed" control={<Radio />} label="Completed" />
            <FormControlLabel value="archived" control={<Radio />} label="Archived" />
          </RadioGroup>
        </FormControl>
      </Box>
      
      {/* Goals list */}
      <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1 }}>
        {filteredGoals.map((goal, index) => (
          <React.Fragment key={goal.id}>
            {index > 0 && <Divider />}
            <ListItem 
              alignItems="flex-start"
              sx={{ 
                px: 3, 
                py: 2,
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center">
                    <Typography variant="h6" component="span">
                      {goal.title}
                    </Typography>
                    <Chip
                      label={getStatusLabel(goal.status)}
                      color={getStatusColor(goal.status) as any}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
                secondary={
                  <Typography
                    sx={{ display: 'block', mt: 1 }}
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {goal.description}
                  </Typography>
                }
              />
              <ListItemSecondaryAction sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => onEdit && onEdit(goal)}
                  size="small"
                  sx={{ color: 'primary.main' }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  edge="end" 
                  aria-label="delete" 
                  onClick={() => onDelete && goal.id !== undefined && onDelete(goal.id)}
                  size="small"
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon />
                </IconButton>
                <IconButton 
                  edge="end" 
                  aria-label="more"
                  onClick={(e) => goal.id !== undefined && handleMenuOpen(e, goal.id)}
                  size="small"
                >
                  <MoreVertIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
      
      {/* Status change menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusChange('active')}>
          <ReplayIcon fontSize="small" sx={{ mr: 1 }} />
          Mark as Active
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('completed')}>
          <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
          Mark as Completed
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('archived')}>
          <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
          Archive Goal
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default GoalList;
