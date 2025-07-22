// Network Utilities for Handling Offline/Online States and Firestore Connectivity

import { enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from '../config/firebase';

// Network status management
class NetworkManager {
  private isOnline: boolean = navigator.onLine;
  private retryQueue: Array<() => Promise<any>> = [];
  private retryInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(isOnline: boolean) => void> = [];

  constructor() {
    this.setupEventListeners();
    this.setupFirestoreNetworkHandling();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 Network: Back online');
      this.isOnline = true;
      this.enableFirestore();
      this.processRetryQueue();
      this.notifyListeners(true);
    });

    window.addEventListener('offline', () => {
      console.log('📴 Network: Gone offline');
      this.isOnline = false;
      this.disableFirestore();
      this.notifyListeners(false);
    });
  }

  private async setupFirestoreNetworkHandling() {
    try {
      if (this.isOnline) {
        await enableNetwork(db);
      } else {
        await disableNetwork(db);
      }
    } catch (error) {
      console.warn('Firestore network setup failed:', error);
    }
  }

  private async enableFirestore() {
    try {
      await enableNetwork(db);
      console.log('✅ Firestore network enabled');
    } catch (error) {
      console.warn('Failed to enable Firestore network:', error);
    }
  }

  private async disableFirestore() {
    try {
      await disableNetwork(db);
      console.log('📴 Firestore network disabled');
    } catch (error) {
      console.warn('Failed to disable Firestore network:', error);
    }
  }

  private processRetryQueue() {
    if (this.retryQueue.length === 0) return;

    console.log(`🔄 Processing ${this.retryQueue.length} queued operations`);
    
    const queue = [...this.retryQueue];
    this.retryQueue = [];

    queue.forEach(async (operation) => {
      try {
        await operation();
      } catch (error) {
        console.error('Retry operation failed:', error);
      }
    });
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(listener => {
      try {
        listener(isOnline);
      } catch (error) {
        console.error('Network listener error:', error);
      }
    });
  }

  // Public methods
  public getNetworkStatus(): boolean {
    return this.isOnline;
  }

  public addNetworkListener(listener: (isOnline: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public queueForRetry(operation: () => Promise<any>) {
    this.retryQueue.push(operation);
  }

  public async waitForConnection(timeout: number = 30000): Promise<boolean> {
    if (this.isOnline) return true;

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve(false);
      }, timeout);

      const removeListener = this.addNetworkListener((isOnline) => {
        if (isOnline) {
          clearTimeout(timeoutId);
          removeListener();
          resolve(true);
        }
      });
    });
  }
}

// Create singleton instance
export const networkManager = new NetworkManager();

// Retry mechanism for failed operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Check network status before attempting
      if (!networkManager.getNetworkStatus()) {
        console.log(`⏳ Waiting for network connection (attempt ${attempt})`);
        const connected = await networkManager.waitForConnection(10000);
        if (!connected) {
          throw new Error('Network connection timeout');
        }
      }

      const result = await operation();
      
      if (attempt > 1) {
        console.log(`✅ Operation succeeded on attempt ${attempt}`);
      }
      
      return result;
    } catch (error: any) {
      lastError = error;
      
      console.warn(`❌ Operation failed on attempt ${attempt}:`, error.message);

      // Don't retry for certain errors
      if (
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/popup-blocked' ||
        error.code === 'permission-denied' ||
        error.message.includes('cancelled')
      ) {
        throw error;
      }

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
}

// Enhanced error handling for Firestore operations
export function handleFirestoreError(error: any): string {
  console.error('Firestore error:', error);

  if (error.code === 'unavailable') {
    return 'Service temporarily unavailable. Please check your internet connection and try again.';
  }
  
  if (error.code === 'permission-denied') {
    return 'Permission denied. Please sign out and sign back in.';
  }
  
  if (error.code === 'not-found') {
    return 'Requested data not found. Please refresh the page and try again.';
  }
  
  if (error.code === 'already-exists') {
    return 'Data already exists. Please refresh the page.';
  }
  
  if (error.code === 'resource-exhausted') {
    return 'Service quota exceeded. Please try again later.';
  }
  
  if (error.code === 'failed-precondition') {
    return 'Operation failed due to system state. Please refresh the page and try again.';
  }
  
  if (error.code === 'aborted') {
    return 'Operation was aborted. Please try again.';
  }
  
  if (error.code === 'out-of-range') {
    return 'Invalid request parameters. Please refresh the page and try again.';
  }
  
  if (error.code === 'unimplemented') {
    return 'Feature not available. Please contact support.';
  }
  
  if (error.code === 'internal') {
    return 'Internal server error. Please try again later.';
  }
  
  if (error.code === 'deadline-exceeded') {
    return 'Request timeout. Please check your internet connection and try again.';
  }
  
  if (error.message?.includes('offline')) {
    return 'You appear to be offline. Please check your internet connection and try again.';
  }
  
  if (error.message?.includes('Failed to get document')) {
    return 'Database connection failed. Please check your internet connection and try again.';
  }

  // Generic fallback
  return 'An unexpected error occurred. Please check your internet connection and try again.';
}

// Network status hook for React components
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(networkManager.getNetworkStatus());

  React.useEffect(() => {
    const removeListener = networkManager.addNetworkListener(setIsOnline);
    return removeListener;
  }, []);

  return isOnline;
}

// Utility to check if error is network-related
export function isNetworkError(error: any): boolean {
  const networkErrorCodes = [
    'unavailable',
    'deadline-exceeded',
    'network-request-failed'
  ];

  const networkErrorMessages = [
    'offline',
    'network',
    'connection',
    'timeout',
    'Failed to get document because the client is offline'
  ];

  if (error.code && networkErrorCodes.includes(error.code)) {
    return true;
  }

  if (error.message) {
    return networkErrorMessages.some(msg => 
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }

  return false;
}

// Enhanced operation wrapper with offline support
export async function executeWithOfflineSupport<T>(
  operation: () => Promise<T>,
  fallback?: () => T,
  queueForRetry: boolean = true
): Promise<T> {
  try {
    return await withRetry(operation);
  } catch (error: any) {
    if (isNetworkError(error)) {
      console.log('🔄 Network error detected, handling gracefully');
      
      if (queueForRetry && networkManager) {
        networkManager.queueForRetry(operation);
        console.log('📝 Operation queued for retry when online');
      }
      
      if (fallback) {
        console.log('🔄 Using fallback value');
        return fallback();
      }
    }
    
    throw error;
  }
}

// React import for the hook
declare const React: any;
