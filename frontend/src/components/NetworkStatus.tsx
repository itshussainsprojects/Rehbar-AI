// Network Status Component for handling offline/online states
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

interface NetworkStatusProps {
  onRetry?: () => void;
  showRetryButton?: boolean;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  onRetry, 
  showRetryButton = true 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
      setRetryCount(0);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show offline message if already offline
    if (!navigator.onLine) {
      setShowOfflineMessage(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <AnimatePresence>
      {showOfflineMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-4 shadow-lg"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <WifiOff className="w-5 h-5" />
              <div>
                <p className="font-semibold">You're offline</p>
                <p className="text-sm opacity-90">
                  Please check your internet connection. Some features may not work properly.
                </p>
              </div>
            </div>
            
            {showRetryButton && (
              <button
                onClick={handleRetry}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                disabled={retryCount >= 3}
              >
                <RefreshCw className={`w-4 h-4 ${retryCount >= 3 ? 'opacity-50' : ''}`} />
                <span className="text-sm">
                  {retryCount >= 3 ? 'Max retries reached' : 'Retry'}
                </span>
              </button>
            )}
          </div>
        </motion.div>
      )}

      {isOnline && retryCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white p-4 shadow-lg"
        >
          <div className="max-w-4xl mx-auto flex items-center space-x-3">
            <Wifi className="w-5 h-5" />
            <div>
              <p className="font-semibold">Back online!</p>
              <p className="text-sm opacity-90">
                Your connection has been restored. Syncing data...
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Error Boundary for handling authentication errors
interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AuthErrorBoundary extends React.Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.retry} />;
      }

      return <DefaultErrorFallback error={this.state.error!} retry={this.retry} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({
  error,
  retry
}) => {
  const isNetworkError = error.message.includes('offline') || 
                        error.message.includes('network') ||
                        error.message.includes('connection');

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center border border-white/20"
      >
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          {isNetworkError ? (
            <WifiOff className="w-8 h-8 text-red-400" />
          ) : (
            <AlertCircle className="w-8 h-8 text-red-400" />
          )}
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">
          {isNetworkError ? 'Connection Problem' : 'Something went wrong'}
        </h2>

        <p className="text-white/70 mb-6 leading-relaxed">
          {isNetworkError
            ? 'Please check your internet connection and try again.'
            : error.message || 'An unexpected error occurred. Please try again.'}
        </p>

        <div className="space-y-3">
          <button
            onClick={retry}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors border border-white/20"
          >
            Refresh Page
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-white/60 text-sm cursor-pointer hover:text-white/80">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs text-red-300 bg-black/20 p-3 rounded overflow-auto max-h-32">
              {error.stack}
            </pre>
          </details>
        )}
      </motion.div>
    </div>
  );
};

// Hook for handling authentication errors
export const useAuthErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthError = (error: any) => {
    console.error('Authentication error:', error);
    
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error.message?.includes('offline')) {
      errorMessage = 'You appear to be offline. Please check your internet connection and try again.';
    } else if (error.message?.includes('Failed to get document')) {
      errorMessage = 'Database connection failed. Please check your internet connection and try again.';
    } else if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in was cancelled. Please try again.';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    setError(errorMessage);
  };

  const clearError = () => setError(null);

  const executeWithErrorHandling = async <T,>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await operation();
      return result;
    } catch (error) {
      handleAuthError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    isLoading,
    clearError,
    handleAuthError,
    executeWithErrorHandling
  };
};
