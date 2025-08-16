/**
 * Error logging utility for CapStack application
 * Provides centralized error handling and logging functionality
 */

/**
 * Log error to console and potentially external service
 * @param {Error} error - The error object to log
 * @param {string} context - Additional context about where the error occurred
 * @param {Object} metadata - Additional metadata to include with the error
 */
export const logError = (error, context = 'Unknown', metadata = {}) => {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...metadata,
  };

  // Log to console for development
  console.error(`[ERROR ${timestamp}] ${context}:`, errorInfo);

  // In production, you could send to external logging service like Sentry
  // Example: Sentry.captureException(error, { extra: errorInfo });
};

/**
 * Log warning messages
 * @param {string} message - Warning message
 * @param {string} context - Context where warning occurred
 * @param {Object} metadata - Additional metadata
 */
export const logWarning = (message, context = 'Unknown', metadata = {}) => {
  const timestamp = new Date().toISOString();
  const warningInfo = {
    timestamp,
    context,
    message,
    ...metadata,
  };

  console.warn(`[WARNING ${timestamp}] ${context}:`, warningInfo);
};

/**
 * Log info messages
 * @param {string} message - Info message
 * @param {string} context - Context where info occurred
 * @param {Object} metadata - Additional metadata
 */
export const logInfo = (message, context = 'Unknown', metadata = {}) => {
  const timestamp = new Date().toISOString();
  const infoData = {
    timestamp,
    context,
    message,
    ...metadata,
  };

  console.log(`[INFO ${timestamp}] ${context}:`, infoData);
};

/**
 * Async wrapper function to catch and log errors
 * @param {Function} asyncFunction - The async function to wrap
 * @param {string} context - Context for error logging
 * @returns {Function} Wrapped function with error handling
 */
export const withErrorHandling = (asyncFunction, context) => {
  return async (...args) => {
    try {
      return await asyncFunction(...args);
    } catch (error) {
      logError(error, context, { args });
      throw error; // Re-throw to allow caller to handle
    }
  };
};

/**
 * React Error Boundary component for catching React component errors
 */
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logError(error, 'React Error Boundary', {
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return this.props.fallback || null;
    }

    return this.props.children;
  }
}
