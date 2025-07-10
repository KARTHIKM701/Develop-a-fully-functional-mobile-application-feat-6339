import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { setSetting, getSetting } from '../lib/database';
import SafeIcon from '../common/SafeIcon';

const { 
  FiArrowLeft, FiSettings, FiToggleLeft, FiToggleRight, 
  FiAlertCircle, FiCheckCircle, FiCloud, FiInfo
} = FiIcons;

const SettingsScreen = () => {
  const navigate = useNavigate();
  const { currentUser, toggleSync, syncEnabled } = useAuth();
  
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!currentUser) return;
      
      try {
        // Get dark mode setting
        const darkModeSetting = getSetting(currentUser.id, 'dark_mode');
        setDarkMode(darkModeSetting === null ? true : darkModeSetting === 'true');
        
        // Get notifications setting
        const notificationsSetting = getSetting(currentUser.id, 'notifications');
        setNotifications(notificationsSetting === 'true');
        
        // Get auto save setting
        const autoSaveSetting = getSetting(currentUser.id, 'auto_save');
        setAutoSave(autoSaveSetting === null ? true : autoSaveSetting === 'true');
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, [currentUser]);

  // Toggle dark mode
  const handleToggleDarkMode = async () => {
    if (!currentUser) return;
    
    try {
      const newValue = !darkMode;
      setDarkMode(newValue);
      
      await setSetting(currentUser.id, 'dark_mode', newValue.toString());
    } catch (error) {
      console.error('Error toggling dark mode:', error);
      setError('Failed to update dark mode setting');
    }
  };

  // Toggle notifications
  const handleToggleNotifications = async () => {
    if (!currentUser) return;
    
    try {
      const newValue = !notifications;
      setNotifications(newValue);
      
      await setSetting(currentUser.id, 'notifications', newValue.toString());
    } catch (error) {
      console.error('Error toggling notifications:', error);
      setError('Failed to update notifications setting');
    }
  };

  // Toggle auto save
  const handleToggleAutoSave = async () => {
    if (!currentUser) return;
    
    try {
      const newValue = !autoSave;
      setAutoSave(newValue);
      
      await setSetting(currentUser.id, 'auto_save', newValue.toString());
    } catch (error) {
      console.error('Error toggling auto save:', error);
      setError('Failed to update auto save setting');
    }
  };

  // Toggle sync
  const handleToggleSync = async () => {
    if (!currentUser || isLoading) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const newValue = !syncEnabled;
      const success = await toggleSync(newValue);
      
      if (success) {
        setSuccess(`Sync ${newValue ? 'enabled' : 'disabled'} successfully`);
      } else {
        setError(`Failed to ${newValue ? 'enable' : 'disable'} sync`);
      }
    } catch (err) {
      console.error('Error toggling sync:', err);
      setError(err.message || 'An error occurred while toggling sync');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear success/error messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="p-2 bg-gold-400/20 border border-gold-400/30 rounded-lg hover:bg-gold-400/30 transition-all duration-300 text-gold-400"
            >
              <SafeIcon icon={FiArrowLeft} className="text-xl" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-luxury font-bold text-gold-400">Settings</h1>
              <p className="text-gray-400">Customize your experience</p>
            </div>
          </div>
        </div>
        
        {/* Settings List */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gold-400/20 rounded-2xl p-6">
          <div className="space-y-6">
            {/* Appearance */}
            <div>
              <h3 className="text-lg font-semibold text-gold-400 mb-4">Appearance</h3>
              
              {/* Dark Mode */}
              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                    <SafeIcon icon={FiSettings} className="text-gray-400" />
                  </div>
                  <span className="text-white">Dark Mode</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleDarkMode}
                  className="text-2xl"
                >
                  <SafeIcon 
                    icon={darkMode ? FiToggleRight : FiToggleLeft} 
                    className={darkMode ? "text-gold-400" : "text-gray-600"} 
                  />
                </motion.button>
              </div>
            </div>
            
            {/* Sync & Backup */}
            <div>
              <h3 className="text-lg font-semibold text-gold-400 mb-4">Sync & Backup</h3>
              
              {/* Cloud Sync */}
              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                    <SafeIcon icon={FiCloud} className="text-gray-400" />
                  </div>
                  <span className="text-white">Cloud Sync</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleSync}
                  disabled={isLoading}
                  className="text-2xl"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"
                    />
                  ) : (
                    <SafeIcon 
                      icon={syncEnabled ? FiToggleRight : FiToggleLeft} 
                      className={syncEnabled ? "text-blue-400" : "text-gray-600"} 
                    />
                  )}
                </motion.button>
              </div>
              
              {/* Auto Save */}
              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                    <SafeIcon icon={FiSettings} className="text-gray-400" />
                  </div>
                  <span className="text-white">Auto Save</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleAutoSave}
                  className="text-2xl"
                >
                  <SafeIcon 
                    icon={autoSave ? FiToggleRight : FiToggleLeft} 
                    className={autoSave ? "text-gold-400" : "text-gray-600"} 
                  />
                </motion.button>
              </div>
            </div>
            
            {/* Notifications */}
            <div>
              <h3 className="text-lg font-semibold text-gold-400 mb-4">Notifications</h3>
              
              {/* Push Notifications */}
              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                    <SafeIcon icon={FiSettings} className="text-gray-400" />
                  </div>
                  <span className="text-white">Push Notifications</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleNotifications}
                  className="text-2xl"
                >
                  <SafeIcon 
                    icon={notifications ? FiToggleRight : FiToggleLeft} 
                    className={notifications ? "text-gold-400" : "text-gray-600"} 
                  />
                </motion.button>
              </div>
            </div>
            
            {/* About */}
            <div>
              <h3 className="text-lg font-semibold text-gold-400 mb-4">About</h3>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiInfo} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm">Origin App v1.0.0</p>
                    <p className="text-gray-400 text-xs mt-1">A comprehensive mobile application with multiple utilities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Error/Success Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 flex items-center space-x-2 text-red-400 text-sm p-3 bg-red-400/10 border border-red-400/30 rounded-lg"
            >
              <SafeIcon icon={FiAlertCircle} className="flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 flex items-center space-x-2 text-green-400 text-sm p-3 bg-green-400/10 border border-green-400/30 rounded-lg"
            >
              <SafeIcon icon={FiCheckCircle} className="flex-shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsScreen;