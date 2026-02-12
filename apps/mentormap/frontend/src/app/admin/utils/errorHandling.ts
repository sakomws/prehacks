import { showToast } from './notifications';

export const handleApiError = (error: any, operation: string): string => {
  console.error(`Error in ${operation}:`, error);
  
  let errorMessage = 'Unknown error occurred';
  
  if (error instanceof TypeError && error.message.includes('fetch')) {
    errorMessage = 'Network connection error. Please check your internet connection and try again.';
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    // Handle object errors by trying to extract meaningful information
    if (error.detail) {
      errorMessage = typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail);
    } else if (error.message) {
      errorMessage = typeof error.message === 'string' ? error.message : JSON.stringify(error.message);
    } else if (error.error) {
      errorMessage = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
    } else {
      // Last resort: stringify the entire object
      try {
        errorMessage = JSON.stringify(error);
      } catch (stringifyError) {
        errorMessage = 'An error occurred but could not be displayed';
      }
    }
  }
  
  return errorMessage;
};

export const handleApiResponse = async (response: Response, defaultErrorMessage: string): Promise<any> => {
  if (response.ok) {
    return await response.json();
  } else {
    const errorData = await response.json().catch(() => ({ detail: defaultErrorMessage }));
    const errorMessage = typeof errorData.detail === 'string' 
      ? errorData.detail 
      : (typeof errorData.detail === 'object' 
          ? JSON.stringify(errorData.detail) 
          : defaultErrorMessage);
    throw new Error(errorMessage);
  }
};

export const showErrorAlert = (operation: string, error: any) => {
  const errorMessage = handleApiError(error, operation);
  showToast(`Failed to ${operation}: ${errorMessage}`, 'error');
};

export const retryOperation = async (
  operation: () => Promise<any>, 
  maxRetries: number = 3, 
  delay: number = 1000
) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
};