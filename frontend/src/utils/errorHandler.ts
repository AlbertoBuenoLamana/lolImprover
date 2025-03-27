/**
 * Extracts a meaningful error message from different types of error responses
 */
export const extractErrorMessage = (error: any): string => {
  // For axios error responses
  if (error.response) {
    // Handle detailed API errors from our backend
    if (error.response.data && error.response.data.detail) {
      return error.response.data.detail;
    }
    
    // Handle validation errors (often an array of field errors)
    if (error.response.data && Array.isArray(error.response.data)) {
      return error.response.data.map((err: any) => err.msg).join(', ');
    }
    
    // Generic HTTP status error
    return `Error ${error.response.status}: ${error.response.statusText}`;
  }
  
  // For network errors when request was made but no response received
  if (error.request) {
    return 'No response received from server. Please check your connection.';
  }
  
  // For error messages as strings
  if (typeof error === 'string') {
    return error;
  }
  
  // For other errors with message property
  if (error.message) {
    return error.message;
  }
  
  // Default fallback
  return 'An unknown error occurred';
};

export default {
  extractErrorMessage
}; 