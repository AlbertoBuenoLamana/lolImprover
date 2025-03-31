import React from 'react';
import { Alert, Box, Typography } from '@mui/material';

/**
 * ErrorDisplay
 * 
 * Component for displaying error messages
 * 
 * @category ui
 */

export interface ErrorDisplayProps {
  error: string | null;
  showDetails?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, showDetails = false }) => {
  if (!error) return null;

  return (
    <Box my={3}>
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography variant="body1" fontWeight="medium">
          {typeof error === 'string' ? error : 'An error occurred'}
        </Typography>
        {showDetails && typeof error === 'object' && (
          <Typography variant="body2" component="pre" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(error, null, 2)}
          </Typography>
        )}
      </Alert>
    </Box>
  );
};

export default ErrorDisplay; 