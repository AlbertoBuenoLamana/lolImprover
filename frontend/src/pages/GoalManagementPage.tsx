import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { 
  fetchGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  updateGoalStatus
} from '../store/slices/goalSlice';
import { AppDispatch, RootState } from '../store';
import GoalList from '../components/Ui/GoalList';
import GoalForm from '../components/Form/GoalForm';
import { Goal, GoalFormData } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel Component
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`goal-tabpanel-${index}`}
      aria-labelledby={`goal-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `goal-tab-${index}`,
    'aria-controls': `goal-tabpanel-${index}`,
  };
};

const GoalManagementPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { goals, loading, error } = useSelector((state: RootState) => state.goals);
  
  const [tabValue, setTabValue] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Goal | undefined>(undefined);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Get filtered goals based on current tab
  const getFilteredGoals = () => {
    switch (tabValue) {
      case 0: // Active goals
        return goals.filter(goal => goal.status === 'active');
      case 1: // Completed goals
        return goals.filter(goal => goal.status === 'completed');
      case 2: // Archived goals
        return goals.filter(goal => goal.status === 'archived');
      case 3: // All goals
        return goals;
      default:
        return goals;
    }
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Load goals
  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      setNotification({
        open: true,
        message: 'Authentication token not found. Please log in again.',
        severity: 'error'
      });
      // Optional: Redirect to login if needed
      // navigate('/login');
      return;
    }
    
    console.log('Token found:', token ? `${token.substring(0, 10)}...` : 'none');
    dispatch(fetchGoals());
  }, [dispatch]);
  
  // Handle open form for creating a new goal
  const handleOpenCreateForm = () => {
    setCurrentGoal(undefined);
    setFormOpen(true);
  };
  
  // Handle open form for editing an existing goal
  const handleOpenEditForm = (goal: Goal) => {
    setCurrentGoal(goal);
    setFormOpen(true);
  };
  
  // Handle close form
  const handleCloseForm = () => {
    setFormOpen(false);
    setCurrentGoal(undefined);
  };
  
  // Handle form submission
  const handleSubmitForm = async (goalData: GoalFormData) => {
    try {
      if (currentGoal?.id) {
        // Update existing goal
        await dispatch(updateGoal({ 
          id: currentGoal.id, 
          goalData 
        }));
        setNotification({
          open: true,
          message: 'Goal updated successfully',
          severity: 'success'
        });
      } else {
        // Create new goal
        await dispatch(createGoal(goalData));
        setNotification({
          open: true,
          message: 'Goal created successfully',
          severity: 'success'
        });
      }
      handleCloseForm();
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to save goal',
        severity: 'error'
      });
    }
  };
  
  // Handle delete goal
  const handleDeleteGoal = async (goalId: number) => {
    try {
      await dispatch(deleteGoal(goalId));
      setNotification({
        open: true,
        message: 'Goal deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to delete goal',
        severity: 'error'
      });
    }
  };
  
  // Handle status change
  const handleStatusChange = async (goal: Goal, newStatus: 'active' | 'completed' | 'archived') => {
    try {
      if (goal.id) {
        await dispatch(updateGoalStatus({ 
          id: goal.id, 
          status: newStatus 
        }));
        
        const statusMessages = {
          active: 'Goal activated successfully',
          completed: 'Goal marked as completed',
          archived: 'Goal archived successfully'
        };
        
        setNotification({
          open: true,
          message: statusMessages[newStatus],
          severity: 'success'
        });
      }
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to update goal status',
        severity: 'error'
      });
    }
  };
  
  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  // If loading and no goals yet
  if (loading && goals.length === 0) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading goals...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Goals
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateForm}
            sx={{ borderRadius: 2 }}
          >
            Create Goal
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 4, bgcolor: 'background.paper', borderRadius: 1, overflow: 'hidden' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                py: 2,
                fontWeight: 'medium',
              } 
            }}
          >
            <Tab label="ACTIVE" {...a11yProps(0)} />
            <Tab label="COMPLETED" {...a11yProps(1)} />
            <Tab label="ARCHIVED" {...a11yProps(2)} />
            <Tab label="ALL GOALS" {...a11yProps(3)} />
          </Tabs>
          
          {/* Tab Panels */}
          <TabPanel value={tabValue} index={0}>
            <GoalList
              goals={getFilteredGoals()}
              title="Active Goals"
              onEdit={handleOpenEditForm}
              onDelete={handleDeleteGoal}
              onStatusChange={handleStatusChange}
              loading={loading}
              emptyMessage="You don't have any active goals. Create one by clicking the 'Create Goal' button."
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <GoalList
              goals={getFilteredGoals()}
              title="Completed Goals"
              onEdit={handleOpenEditForm}
              onDelete={handleDeleteGoal}
              onStatusChange={handleStatusChange}
              loading={loading}
              emptyMessage="You haven't completed any goals yet."
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <GoalList
              goals={getFilteredGoals()}
              title="Archived Goals"
              onEdit={handleOpenEditForm}
              onDelete={handleDeleteGoal}
              onStatusChange={handleStatusChange}
              loading={loading}
              emptyMessage="You don't have any archived goals."
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <GoalList
              goals={getFilteredGoals()}
              title="All Goals"
              onEdit={handleOpenEditForm}
              onDelete={handleDeleteGoal}
              onStatusChange={handleStatusChange}
              loading={loading}
              emptyMessage="You don't have any goals yet. Create one by clicking the 'Create Goal' button."
            />
          </TabPanel>
        </Box>
      </Box>
      
      {/* Goal Form Dialog */}
      <GoalForm
        initialValues={currentGoal}
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        loading={loading}
      />
      
      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default GoalManagementPage;
