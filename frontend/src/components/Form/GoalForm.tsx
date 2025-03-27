import React from 'react';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Goal, GoalFormData } from '../../types';

/**
 * GoalForm
 * 
 * Form for creating and editing goals
 * 
 * @category form
 */

interface GoalFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: GoalFormData) => void;
  initialValues?: Goal;
  goal?: Goal; // For backwards compatibility
  title?: string; // For backwards compatibility
  loading?: boolean;
}

const GoalSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be at most 100 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(5, 'Description must be at least 5 characters')
    .max(500, 'Description must be at most 500 characters'),
  status: Yup.string()
    .oneOf(['active', 'completed', 'archived'], 'Invalid status')
    .required('Status is required')
});

const GoalForm: React.FC<GoalFormProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialValues, 
  goal, // For backwards compatibility
  title, // For backwards compatibility
  loading = false 
}) => {
  const getInitialValues = (): GoalFormData => {
    // Use goal prop if provided (for backwards compatibility), otherwise use initialValues
    const valueSource = goal || initialValues;
    
    return {
      title: valueSource?.title || '',
      description: valueSource?.description || '',
      status: valueSource?.status || 'active'
    };
  };

  const handleSubmit = (values: GoalFormData) => {
    onSubmit({
      ...values,
      ...((goal?.id || initialValues?.id) ? { id: goal?.id || initialValues?.id } : {})
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        {title || (goal || initialValues ? 'Edit Goal' : 'Create New Goal')}
      </DialogTitle>
      
      <Formik
        initialValues={getInitialValues()}
        validationSchema={GoalSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, touched, values, handleChange, handleBlur, isValid, dirty }) => (
          <Form>
            <DialogContent>
              <Field
                as={TextField}
                autoFocus
                name="title"
                label="Goal Title"
                fullWidth
                variant="outlined"
                margin="normal"
                error={touched.title && Boolean(errors.title)}
                helperText={touched.title && errors.title}
                disabled={loading}
              />
              
              <Field
                as={TextField}
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                margin="normal"
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
                disabled={loading}
              />
              
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel id="status-label">Status</InputLabel>
                <Field
                  as={Select}
                  labelId="status-label"
                  name="status"
                  label="Status"
                  disabled={loading}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Field>
                <ErrorMessage name="status" component="div" />
              </FormControl>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                onClick={onClose} 
                color="inherit"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="contained" 
                color="primary"
                disabled={loading || !(isValid && dirty)}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
              >
                {loading ? 'Saving...' : (goal || initialValues ? 'Update' : 'Create')}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default GoalForm;
