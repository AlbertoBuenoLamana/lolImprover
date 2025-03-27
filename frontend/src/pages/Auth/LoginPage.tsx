import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { login, clearError } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';

// Validation schema
const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );
  
  // Function to extract error message from potential error object
  const getErrorMessage = (error: any) => {
    if (!error) return null;
    
    // If error is already a string, return it
    if (typeof error === 'string') return error;
    
    // If error is an object with a message property
    if (error.msg) return error.msg;
    
    // If error is an object with another structure, try to extract useful info
    if (typeof error === 'object') {
      if (JSON.stringify(error) !== '{}') {
        return JSON.stringify(error);
      }
    }
    
    // Fallback error message
    return 'An unexpected error occurred';
  };
  
  // Get the redirect path from location state or default to '/'
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  
  useEffect(() => {
    // Clear any previous errors
    dispatch(clearError());
  }, [dispatch]);
  
  useEffect(() => {
    // If already authenticated, redirect
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  const handleSubmit = async (values: { username: string; password: string }) => {
    await dispatch(login(values));
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Sign in to LoL Improve
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {getErrorMessage(error)}
            </Alert>
          )}
          
          <Formik
            initialValues={{ username: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form>
                <Field
                  as={TextField}
                  margin="normal"
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  error={touched.username && Boolean(errors.username)}
                  helperText={touched.username && errors.username}
                  autoFocus
                />
                <Field
                  as={TextField}
                  margin="normal"
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>
                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                  This is a private application. Please contact the administrator for an account.
                </Typography>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
