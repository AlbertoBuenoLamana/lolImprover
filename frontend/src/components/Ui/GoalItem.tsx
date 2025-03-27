import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  IconButton,
  CardActionArea,
  CardActions,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  MoreVert as MoreVertIcon, 
  CheckCircle as CheckCircleIcon,
  Archive as ArchiveIcon,
  Replay as ReplayIcon
} from '@mui/icons-material';
import { Goal } from '../../types';

/**
 * GoalItem
 * 
 * Individual goal item with status
 * 
 * @category ui
 */

export interface GoalItemProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: number) => void;
  onStatusChange?: (goal: Goal, status: 'active' | 'completed' | 'archived') => void;
  showControls?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

const GoalItem: React.FC<GoalItemProps> = ({
  goal,
  onEdit,
  onDelete,
  onStatusChange,
  showControls = true,
  selected = false,
  onClick
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event?: React.MouseEvent<HTMLElement>) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
  };

  const handleEdit = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (onEdit) {
      onEdit(goal);
    }
  };

  const handleDelete = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (onDelete && goal.id !== undefined) {
      onDelete(goal.id);
    }
  };

  const handleStatusChange = (status: 'active' | 'completed' | 'archived', event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (onStatusChange) {
      onStatusChange(goal, status);
    }
    handleMenuClose();
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

  return (
    <Card 
      sx={{ 
        mb: 2, 
        border: selected ? '2px solid #1976d2' : '1px solid transparent',
        bgcolor: selected ? 'rgba(25, 118, 210, 0.04)' : 'background.paper',
        transition: 'all 0.2s'
      }}
    >
      <CardActionArea 
        onClick={onClick}
        disabled={!onClick}
        sx={{ 
          '&.Mui-disabled': { 
            pointerEvents: onClick ? 'auto' : 'none' 
          } 
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" component="h3" gutterBottom>
                {goal.title}
              </Typography>
              <Box display="flex" alignItems="center" mb={1}>
                <Chip
                  label={getStatusLabel(goal.status)}
                  color={getStatusColor(goal.status) as any}
                  size="small"
                  sx={{ mr: 1 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {goal.description}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
      
      {showControls && (
        <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={handleEdit}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={handleDelete}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Status Options">
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
      )}
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleMenuClose()}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={(e) => handleStatusChange('active', e)}>
          <ReplayIcon fontSize="small" sx={{ mr: 1 }} />
          Mark as Active
        </MenuItem>
        <MenuItem onClick={(e) => handleStatusChange('completed', e)}>
          <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
          Mark as Completed
        </MenuItem>
        <MenuItem onClick={(e) => handleStatusChange('archived', e)}>
          <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
          Archive Goal
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default GoalItem;
