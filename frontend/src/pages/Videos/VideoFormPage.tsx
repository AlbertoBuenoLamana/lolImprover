import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  fetchVideo, 
  createVideo, 
  updateVideo, 
  clearCurrentVideo 
} from '../../store/slices/videoSlice';
import { RootState, AppDispatch } from '../../store';
import { VideoFormData, VideoTutorial } from '../../types';

// YouTube URL validation regex
const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;

// Validation schema
const VideoSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  url: Yup.string()
    .required('URL is required')
    .matches(youtubeUrlRegex, 'Must be a valid YouTube URL'),
  description: Yup.string().required('Description is required'),
  tags: Yup.array().of(
    Yup.string().required('Tag cannot be empty')
  ),
});

const VideoFormPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const { currentVideo, loading, error } = useSelector(
    (state: RootState) => state.videos as {
      currentVideo: VideoTutorial | null;
      loading: boolean;
      error: string | null;
    }
  );
  
  const isEditMode = !!id;
  
  // Initial form values
  const initialValues: VideoFormData = {
    title: '',
    url: '',
    description: '',
    tags: [],
  };
  
  useEffect(() => {
    // If in edit mode, fetch the video
    if (isEditMode && id) {
      dispatch(fetchVideo(parseInt(id)));
    }
    
    // Clear current video when component unmounts
    return () => {
      dispatch(clearCurrentVideo());
    };
  }, [dispatch, isEditMode, id]);
  
  // Prepare form values from current video
  const getFormValues = (): VideoFormData => {
    if (isEditMode && currentVideo) {
      return {
        title: currentVideo.title,
        url: currentVideo.url,
        description: currentVideo.description || '',
        tags: currentVideo.tags || [],
      };
    }
    return initialValues;
  };
  
  const handleSubmit = async (values: VideoFormData) => {
    if (isEditMode && id) {
      await dispatch(updateVideo({ id: parseInt(id), videoData: values }));
    } else {
      await dispatch(createVideo(values));
    }
    
    navigate('/video-tutorials');
  };
  
  if (isEditMode && loading && !currentVideo) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/video-tutorials')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isEditMode ? 'Edit Video Tutorial' : 'Add Video Tutorial'}
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ p: 3 }}>
          <Formik
            initialValues={getFormValues()}
            validationSchema={VideoSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, setFieldValue }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      id="title"
                      name="title"
                      label="Title"
                      error={touched.title && Boolean(errors.title)}
                      helperText={touched.title && errors.title}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      id="url"
                      name="url"
                      label="YouTube URL"
                      placeholder="https://www.youtube.com/watch?v=..."
                      error={touched.url && Boolean(errors.url)}
                      helperText={touched.url && errors.url}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      id="description"
                      name="description"
                      label="Description"
                      multiline
                      rows={4}
                      error={touched.description && Boolean(errors.description)}
                      helperText={touched.description && errors.description}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">Tags</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Add tags to categorize this video (e.g., "beginner", "mid lane", "Yasuo")
                      </Typography>
                    </Box>
                    
                    <FieldArray name="tags">
                      {({ push, remove }) => (
                        <Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {values.tags.map((tag: string, index: number) => (
                              <Chip
                                key={index}
                                label={tag}
                                onDelete={() => remove(index)}
                                color="primary"
                              />
                            ))}
                            {values.tags.length === 0 && (
                              <Typography variant="body2" color="text.secondary">
                                No tags added yet
                              </Typography>
                            )}
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                              label="Add a tag"
                              variant="outlined"
                              size="small"
                              sx={{ mr: 1 }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.target as HTMLInputElement;
                                  const value = input.value.trim();
                                  if (value) {
                                    push(value);
                                    input.value = '';
                                  }
                                }
                              }}
                            />
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<AddIcon />}
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling?.querySelector('input') as HTMLInputElement;
                                const value = input?.value.trim();
                                if (value) {
                                  push(value);
                                  input.value = '';
                                }
                              }}
                            >
                              Add
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </FieldArray>
                  </Grid>
                  
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/video-tutorials')}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <CircularProgress size={24} />
                        ) : isEditMode ? (
                          'Update Video'
                        ) : (
                          'Add Video'
                        )}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  );
};

export default VideoFormPage;
