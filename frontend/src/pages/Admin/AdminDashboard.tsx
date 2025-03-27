import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  Checkbox,
  FormControlLabel,
  Divider,
  Grid,
} from '@mui/material';
import { register, clearError } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import axios from '../../api/axios';
import { User } from '../../types';

// Validation schema for new user
const UserCreateSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  is_admin: Yup.boolean(),
});

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    if (!(user as any)?.is_admin) return;
    
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (error: any) {
        setError(error.response?.data?.detail || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [token, user]);

  const handleCreateUser = async (values: { username: string; email: string; password: string; is_admin: boolean }) => {
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axios.post('/users', values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`User ${response.data.username} created successfully!`);
      
      // Add the new user to the list
      setUsers([...users, response.data]);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to create user');
    }
  };

  if (!(user as any)?.is_admin) {
    return (
      <Container>
        <Box sx={{ my: 4 }}>
          <Alert severity="error">You don't have admin privileges to access this page.</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Create New User
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}
              
              <Formik
                initialValues={{ username: '', email: '', password: '', is_admin: false }}
                validationSchema={UserCreateSchema}
                onSubmit={handleCreateUser}
              >
                {({ errors, touched, values, handleChange }) => (
                  <Form>
                    <Field
                      as={TextField}
                      margin="normal"
                      fullWidth
                      id="username"
                      label="Username"
                      name="username"
                      error={touched.username && Boolean(errors.username)}
                      helperText={touched.username && errors.username}
                    />
                    
                    <Field
                      as={TextField}
                      margin="normal"
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                    
                    <Field
                      as={TextField}
                      margin="normal"
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                    />
                    
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="is_admin"
                          checked={values.is_admin}
                          onChange={handleChange}
                          color="primary"
                        />
                      }
                      label="Grant Admin Privileges"
                    />
                    
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Create User
                    </Button>
                  </Form>
                )}
              </Formik>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Existing Users ({users.length})
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <p>Loading users...</p>
                </Box>
              ) : (
                <Box>
                  {users.map((user) => (
                    <Box key={user.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                      <Typography variant="subtitle1">
                        {user.username} {user.is_admin && '(Admin)'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminDashboard; 