/**
 * Humanized Response Helper Utility
 * Provides standardized, empathetic API responses for better user experience
 */

const responseHelpers = {
  // Success responses
  success: (message, data = null, statusCode = 200) => {
    return {
      success: true,
      message: message,
      data: data,
      status: statusCode
    };
  },

  // Error responses
  error: (message, error = null, statusCode = 400) => {
    return {
      success: false,
      message: message,
      error: error?.message || error,
      status: statusCode
    };
  },

  // Validation error responses
  validationError: (errors, message = 'Please check your input and try again.') => {
    return {
      success: false,
      message: message,
      errors: errors,
      status: 422
    };
  },

  // Not found responses
  notFound: (resource = 'Resource') => {
    return {
      success: false,
      message: `${resource} not found. We couldn't find what you're looking for. 🔍`,
      status: 404
    };
  },

  // Unauthorized responses
  unauthorized: (message = 'Access denied. Please log in to continue. 🔐') => {
    return {
      success: false,
      message: message,
      status: 401
    };
  },

  // Forbidden responses
  forbidden: (message = 'You don\'t have permission to perform this action. ⚠️') => {
    return {
      success: false,
      message: message,
      status: 403
    };
  },

  // Server error responses
  serverError: (error = null) => {
    return {
      success: false,
      message: 'Oops! Something went wrong on our end. Our team has been notified. 🛠️',
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      status: 500
    };
  },

  // Humanized messages for common scenarios
  messages: {
    created: (resource) => `${resource} created successfully! 🎉`,
    updated: (resource) => `${resource} updated successfully! ✨`,
    deleted: (resource) => `${resource} deleted successfully. 🗑️`,
    loggedIn: (name) => `Welcome back, ${name}! Great to see you again! 👋`,
    registered: (name) => `Welcome aboard, ${name}! Your account has been created successfully. 🎊`,
    loggedOut: 'You\'ve been logged out successfully. See you soon! 👋'
  }
};

module.exports = responseHelpers;
