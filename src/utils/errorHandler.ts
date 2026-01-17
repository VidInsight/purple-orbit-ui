/**
 * Centralized Error Handler Utility
 * Provides consistent error handling and user-friendly error messages
 */

import i18n from '@/i18n/config';

export interface ApiErrorResponse {
  status?: string;
  code?: number;
  message?: string | null;
  error?: string;
  detail?: string;
  data?: {
    message?: string;
    error?: string;
    detail?: string;
    errors?: Record<string, string[]>;
  };
  errors?: Record<string, string[]>;
  traceId?: string;
  timestamp?: string;
}

export interface ParsedError {
  title: string;
  description: string;
  statusCode?: number;
  fieldErrors?: Record<string, string>;
  originalError?: unknown;
}

/**
 * Parse API error response to extract user-friendly error message
 */
export const parseApiError = async (response: Response): Promise<ParsedError> => {
  let errorData: ApiErrorResponse = {};
  
  try {
    const text = await response.text();
    if (text) {
      errorData = JSON.parse(text);
    }
  } catch {
    // If parsing fails, use status text
    errorData = { message: response.statusText || 'Unknown error' };
  }

  const statusCode = response.status;
  const language = i18n.language || 'en';

  // Extract error message from various possible response formats
  const rawErrorMessage = 
    errorData.message ||
    errorData.error ||
    errorData.detail ||
    (errorData.data && (errorData.data.message || errorData.data.error || errorData.data.detail)) ||
    response.statusText ||
    'Unknown error';

  // Extract field-specific errors if available
  const fieldErrors = errorData.errors || errorData.data?.errors;

  // Normalize error message to lowercase for comparison
  const normalizedMessage = String(rawErrorMessage).toLowerCase();

  // Map status codes to user-friendly messages
  let title = '';
  let description = rawErrorMessage;

  if (statusCode >= 500) {
    // Server errors
    title = i18n.t('common:errors.server.title', { defaultValue: 'Server Error' });
    if (statusCode === 500) {
      description = i18n.t('common:errors.server.500', { defaultValue: 'Internal server error. Our team has been notified.' });
    } else if (statusCode === 502) {
      description = i18n.t('common:errors.server.502', { defaultValue: 'Bad gateway. The server is temporarily unavailable.' });
    } else if (statusCode === 503) {
      description = i18n.t('common:errors.server.503', { defaultValue: 'Service unavailable. Please try again later.' });
    } else if (statusCode === 504) {
      description = i18n.t('common:errors.server.504', { defaultValue: 'Gateway timeout. The server took too long to respond.' });
    } else {
      description = i18n.t('common:errors.server.description', { defaultValue: 'An error occurred on the server. Please try again later.' });
    }
  } else if (statusCode >= 400) {
    // Client errors
    title = i18n.t('common:errors.client.title', { defaultValue: 'Error' });
    
    // Check for specific error patterns in the message
    if (statusCode === 400 || statusCode === 401 || statusCode === 403) {
      // Login/authentication related errors - check multiple conditions
      const isAuthError = 
        normalizedMessage.includes('invalid') || 
        normalizedMessage.includes('credential') || 
        normalizedMessage.includes('password') || 
        normalizedMessage.includes('username') || 
        normalizedMessage.includes('email') ||
        normalizedMessage.includes('login') || 
        normalizedMessage.includes('authentication') ||
        normalizedMessage.includes('unauthorized') ||
        normalizedMessage.includes('forbidden') ||
        normalizedMessage.includes('incorrect') ||
        normalizedMessage.includes('wrong') ||
        normalizedMessage === 'bad request' ||
        normalizedMessage === 'badrequest' ||
        normalizedMessage.trim() === 'bad request' ||
        rawErrorMessage.toLowerCase().trim() === 'bad request';
      
      // For 401/403, always treat as auth error
      if (statusCode === 401 || statusCode === 403) {
        description = i18n.t('common:errors.auth.invalidCredentials', { 
          defaultValue: 'Invalid username or password. Please check your credentials and try again.' 
        });
      } 
      // For 400, check if it's an auth error or generic error
      else if (statusCode === 400) {
        // If message is just "Bad Request" or similar technical message, assume it's auth-related
        const isGenericBadRequest = 
          normalizedMessage === 'bad request' ||
          normalizedMessage === 'badrequest' ||
          normalizedMessage.trim() === 'bad request' ||
          rawErrorMessage.toLowerCase().trim() === 'bad request' ||
          /^400\s|bad\s+request$/i.test(rawErrorMessage.trim());
        
        if (isAuthError || isGenericBadRequest) {
          // For login endpoints, generic "Bad Request" usually means invalid credentials
          description = i18n.t('common:errors.auth.invalidCredentials', { 
            defaultValue: 'Invalid username or password. Please check your credentials and try again.' 
          });
        } else {
          // Use the original error message if it's user-friendly
          description = rawErrorMessage || i18n.t('common:errors.client.400', { defaultValue: 'Invalid request. Please check your input and try again.' });
        }
      }
    } else if (statusCode === 404) {
      description = i18n.t('common:errors.client.404', { defaultValue: 'The requested resource was not found.' });
    } else if (statusCode === 409) {
      // Registration/conflict errors
      if (
        normalizedMessage.includes('email') && 
        (normalizedMessage.includes('exist') || normalizedMessage.includes('already') || normalizedMessage.includes('registered') || normalizedMessage.includes('taken'))
      ) {
        description = i18n.t('common:errors.auth.emailExists', { 
          defaultValue: 'This email address is already registered. Please use a different email or try logging in.' 
        });
      } else if (
        normalizedMessage.includes('username') && 
        (normalizedMessage.includes('exist') || normalizedMessage.includes('already') || normalizedMessage.includes('taken'))
      ) {
        description = i18n.t('common:errors.auth.usernameExists', { 
          defaultValue: 'This username is already taken. Please choose a different username.' 
        });
      } else {
        description = rawErrorMessage || i18n.t('common:errors.client.409', { defaultValue: 'A conflict occurred. This resource may already exist.' });
      }
    } else if (statusCode === 422) {
      // Validation errors - use the original message if available
      description = rawErrorMessage || i18n.t('common:errors.client.422', { defaultValue: 'Validation error. Please check your input.' });
    } else if (statusCode === 429) {
      description = i18n.t('common:errors.client.429', { defaultValue: 'Too many requests. Please wait a moment and try again.' });
    } else {
      // For other 4xx errors, try to use the original message if it's user-friendly
      // Check if the message looks like a technical error (contains status codes, stack traces, etc.)
      const isTechnicalError = /^\d+|stack|trace|error\s+at|exception/i.test(rawErrorMessage);
      if (isTechnicalError) {
        description = i18n.t('common:errors.client.description', { defaultValue: 'An unexpected error occurred.' });
      } else {
        description = rawErrorMessage || i18n.t('common:errors.client.description', { defaultValue: 'An unexpected error occurred.' });
      }
    }
  } else {
    // Other errors
    title = i18n.t('common:errors.generic.title', { defaultValue: 'Error' });
    description = rawErrorMessage || i18n.t('common:errors.generic.description', { defaultValue: 'Something went wrong. Please try again.' });
  }

  return {
    title,
    description,
    statusCode,
    fieldErrors: fieldErrors ? Object.fromEntries(
      Object.entries(fieldErrors).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join(', ') : String(value)
      ])
    ) : undefined,
    originalError: errorData,
  };
};

/**
 * Handle network errors (offline, timeout, etc.)
 */
export const parseNetworkError = (error: unknown): ParsedError => {
  const language = i18n.language || 'en';

  if (error instanceof TypeError && error.message.includes('fetch')) {
    // Network error
    return {
      title: i18n.t('common:errors.network.title', { defaultValue: 'Network Error' }),
      description: i18n.t('common:errors.network.description', { 
        defaultValue: 'Unable to connect to the server. Please check your internet connection and try again.' 
      }),
    };
  }

  if (error instanceof Error) {
    // Check for timeout
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return {
        title: i18n.t('common:errors.network.title', { defaultValue: 'Network Error' }),
        description: i18n.t('common:errors.network.timeout', { 
          defaultValue: 'Request timed out. Please try again.' 
        }),
      };
    }

    // Check for offline
    if (!navigator.onLine) {
      return {
        title: i18n.t('common:errors.network.title', { defaultValue: 'Network Error' }),
        description: i18n.t('common:errors.network.offline', { 
          defaultValue: 'You are currently offline. Please check your internet connection.' 
        }),
      };
    }

    // Generic error message
    return {
      title: i18n.t('common:errors.generic.title', { defaultValue: 'Error' }),
      description: error.message || i18n.t('common:errors.generic.description', { 
        defaultValue: 'Something went wrong. Please try again.' 
      }),
      originalError: error,
    };
  }

  // Unknown error
  return {
    title: i18n.t('common:errors.generic.title', { defaultValue: 'Error' }),
    description: i18n.t('common:errors.generic.description', { 
      defaultValue: 'Something went wrong. Please try again.' 
    }),
    originalError: error,
  };
};

/**
 * Handle API response errors
 */
export const handleApiError = async (response: Response): Promise<never> => {
  const parsedError = await parseApiError(response);
  const error = new Error(parsedError.description);
  (error as any).parsedError = parsedError;
  throw error;
};

/**
 * Handle any error (network, API, or unknown)
 */
export const handleError = async (error: unknown): Promise<ParsedError> => {
  if (error instanceof Response) {
    return parseApiError(error);
  }

  if (error instanceof Error) {
    // Check if it's already a parsed error
    if ((error as any).parsedError) {
      return (error as any).parsedError;
    }

    // Check for special error codes
    if (error.message === 'INVALID_CREDENTIALS') {
      return {
        title: i18n.t('common:errors.client.title', { defaultValue: 'Error' }),
        description: i18n.t('common:errors.auth.invalidCredentials', { 
          defaultValue: 'Invalid username or password. Please check your credentials and try again.' 
        }),
      };
    }

    // Check for network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return parseNetworkError(error);
    }

    // Check if error message contains auth-related keywords
    const normalizedMessage = error.message.toLowerCase();
    if (
      (normalizedMessage.includes('invalid') || normalizedMessage.includes('incorrect')) &&
      (normalizedMessage.includes('credential') || normalizedMessage.includes('password') || normalizedMessage.includes('username') || normalizedMessage.includes('email'))
    ) {
      return {
        title: i18n.t('common:errors.client.title', { defaultValue: 'Error' }),
        description: i18n.t('common:errors.auth.invalidCredentials', { 
          defaultValue: 'Invalid username or password. Please check your credentials and try again.' 
        }),
      };
    }
  }

  return parseNetworkError(error);
};

/**
 * Extract user-friendly error message from any error
 */
export const getErrorMessage = async (error: unknown): Promise<string> => {
  const parsed = await handleError(error);
  return parsed.description;
};

/**
 * Extract error title from any error
 */
export const getErrorTitle = async (error: unknown): Promise<string> => {
  const parsed = await handleError(error);
  return parsed.title;
};

/**
 * Wrapper for API calls that handles errors consistently
 * Use this in service functions to standardize error handling
 */
export const handleApiResponse = async <T>(
  response: Response,
  defaultErrorMessage?: string
): Promise<T> => {
  if (!response.ok) {
    const parsedError = await parseApiError(response);
    const error = new Error(parsedError.description);
    (error as any).parsedError = parsedError;
    throw error;
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error(
      defaultErrorMessage || 
      i18n.t('common:errors.api.parse', { defaultValue: 'Failed to parse server response.' })
    );
  }
};

