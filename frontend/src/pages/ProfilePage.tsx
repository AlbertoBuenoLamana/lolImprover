import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  Avatar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import { updateUserProfile, getCurrentUser } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store';

// Validation schema
const ProfileSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  currentPassword: Yup.string(),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .test(
      'passwords-match',
      'New password is required when current password is provided',
      function (value) {
        return !this.parent.currentPassword || !!value;
      }
    ),
  confirmNewPassword: Yup.string().oneOf(
    [Yup.ref('newPassword')],
    'Passwords must match'
  ),
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error, token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Load user data if needed
  useEffect(() => {
    if (token && !user && !loading) {
      console.log('ProfilePage: Loading user data');
      dispatch(getCurrentUser());
    }
  }, [dispatch, user, loading, token]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSubmit = async (values: any) => {
    // Only include password fields if current password is provided
    const profileData = {
      username: values.username,
      email: values.email,
      ...(values.currentPassword && {
        current_password: values.currentPassword,
        new_password: values.newPassword,
      }),
    };

    try {
      await dispatch(updateUserProfile(profileData)).unwrap();
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // No user data available
  if (!user) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Loading profile data...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Profile
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {user.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Member since:</strong> {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Game Sessions:</strong> {user.stats?.game_sessions_count || 0}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Videos Watched:</strong> {user.stats?.videos_watched_count || 0}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                  <Tab label="Account Settings" id="profile-tab-0" />
                  <Tab label="Statistics" id="profile-tab-1" />
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0}>
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                {updateSuccess && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Profile updated successfully!
                  </Alert>
                )}

                <Formik
                  initialValues={{
                    username: user.username || '',
                    email: user.email || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: '',
                  }}
                  validationSchema={ProfileSchema}
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched }) => (
                    <Form>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            fullWidth
                            id="username"
                            name="username"
                            label="Username"
                            error={touched.username && Boolean(errors.username)}
                            helperText={touched.username && errors.username}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            fullWidth
                            id="email"
                            name="email"
                            label="Email"
                            error={touched.email && Boolean(errors.email)}
                            helperText={touched.email && errors.email}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="subtitle1" gutterBottom>
                            Change Password
                          </Typography>
                        </Grid>

                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            fullWidth
                            id="currentPassword"
                            name="currentPassword"
                            label="Current Password"
                            type="password"
                            error={touched.currentPassword && Boolean(errors.currentPassword)}
                            helperText={touched.currentPassword && errors.currentPassword}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Field
                            as={TextField}
                            fullWidth
                            id="newPassword"
                            name="newPassword"
                            label="New Password"
                            type="password"
                            error={touched.newPassword && Boolean(errors.newPassword)}
                            helperText={touched.newPassword && errors.newPassword}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Field
                            as={TextField}
                            fullWidth
                            id="confirmNewPassword"
                            name="confirmNewPassword"
                            label="Confirm New Password"
                            type="password"
                            error={
                              touched.confirmNewPassword && Boolean(errors.confirmNewPassword)
                            }
                            helperText={
                              touched.confirmNewPassword && errors.confirmNewPassword
                            }
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                              type="submit"
                              variant="contained"
                              color="primary"
                              disabled={loading}
                            >
                              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </Formik>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Game Sessions
                        </Typography>
                        <Typography variant="h3" color="primary">
                          {user.stats?.game_sessions_count || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total sessions recorded
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Win Rate
                        </Typography>
                        <Typography variant="h3" color="primary">
                          {user.stats?.win_rate ? `${user.stats.win_rate}%` : 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Overall win percentage
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Videos Watched
                        </Typography>
                        <Typography variant="h3" color="primary">
                          {user.stats?.videos_watched_count || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Completed tutorials
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Goals Achieved
                        </Typography>
                        <Typography variant="h3" color="primary">
                          {user.stats?.goals_achieved_count || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Completed goals
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ProfilePage;
