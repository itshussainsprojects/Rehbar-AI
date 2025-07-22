const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Firebase errors
  if (err.code && err.code.startsWith('auth/')) {
    const message = getFirebaseErrorMessage(err.code);
    error = { message, statusCode: 400 };
  }

  // Gemini API errors
  if (err.message && err.message.includes('QUOTA_EXCEEDED')) {
    const message = 'API quota exceeded. Please try again later.';
    error = { message, statusCode: 429 };
  }

  if (err.message && err.message.includes('SAFETY')) {
    const message = 'Content blocked by safety filters';
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/user-not-found': 'No user found with this email address',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'Email address is already in use',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/too-many-requests': 'Too many requests. Please try again later',
    'auth/operation-not-allowed': 'Operation not allowed',
    'auth/invalid-credential': 'Invalid credentials provided'
  };

  return errorMessages[errorCode] || 'Authentication error occurred';
};

module.exports = errorHandler;
