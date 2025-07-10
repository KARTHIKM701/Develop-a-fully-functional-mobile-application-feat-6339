import React, { createContext, useContext, useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { initDatabase, authenticateUser, getUserById } from '../lib/database';
import { isSyncEnabled, setSyncEnabled } from '../lib/sync';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncEnabled, setSyncEnabledState] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Initialize database
        await initDatabase();
        
        // Check for stored user
        const { value: userId } = await Preferences.get({ key: 'currentUserId' });
        
        if (userId) {
          // Get user from database
          const user = getUserById(userId);
          
          if (user) {
            setCurrentUser(user);
            
            // Check if sync is enabled
            const syncStatus = await isSyncEnabled(userId);
            setSyncEnabledState(syncStatus);
          } else {
            // User not found in database, clear stored ID
            await Preferences.remove({ key: 'currentUserId' });
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setError(null);
      
      // Authenticate user
      const user = authenticateUser(username, password);
      
      if (!user) {
        setError('Invalid username or password');
        return false;
      }
      
      // Store user ID
      await Preferences.set({
        key: 'currentUserId',
        value: user.id
      });
      
      // Set current user
      setCurrentUser(user);
      
      // Check if sync is enabled
      const syncStatus = await isSyncEnabled(user.id);
      setSyncEnabledState(syncStatus);
      
      return true;
    } catch (err) {
      console.error('Error during login:', err);
      setError(err.message || 'An error occurred during login');
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear stored user ID
      await Preferences.remove({ key: 'currentUserId' });
      
      // Clear current user
      setCurrentUser(null);
      setSyncEnabledState(false);
      
      return true;
    } catch (err) {
      console.error('Error during logout:', err);
      setError(err.message || 'An error occurred during logout');
      return false;
    }
  };

  // Toggle sync
  const toggleSync = async (enabled) => {
    if (!currentUser) return false;
    
    try {
      // Update sync status
      const success = await setSyncEnabled(currentUser.id, enabled);
      
      if (success) {
        setSyncEnabledState(enabled);
      }
      
      return success;
    } catch (err) {
      console.error('Error toggling sync:', err);
      setError(err.message || 'An error occurred while toggling sync');
      return false;
    }
  };

  // Update current user after profile changes
  const refreshCurrentUser = () => {
    if (currentUser) {
      const user = getUserById(currentUser.id);
      if (user) {
        setCurrentUser(user);
      }
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    syncEnabled,
    login,
    logout,
    toggleSync,
    refreshCurrentUser,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};