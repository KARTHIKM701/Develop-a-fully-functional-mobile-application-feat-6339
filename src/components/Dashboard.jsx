import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { getTasks, getMedia, getNotes } from '../lib/database';
import { syncWithServer, isSyncDue } from '../lib/sync';
import SafeIcon from '../common/SafeIcon';

const { 
  FiCalendar, FiImage, FiCamera, FiEdit3, FiLogOut, 
  FiUser, FiSettings, FiRefreshCw, FiCheckCircle 
} = FiIcons;

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout, syncEnabled } = useAuth();
  const [stats, setStats] = useState({
    tasks: 0,
    photos: 0,
    videos: 0,
    notes: 0
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  // Apps definition
  const apps = [
    {
      id: 'planner',
      name: 'Day Planner',
      icon: FiCalendar,
      color: 'from-blue-500 to-blue-700',
      description: 'Organize your daily activities'
    },
    {
      id: 'gallery',
      name: 'Gallery',
      icon: FiImage,
      color: 'from-purple-500 to-purple-700',
      description: 'View photos and videos'
    },
    {
      id: 'camera',
      name: 'Camera',
      icon: FiCamera,
      color: 'from-green-500 to-green-700',
      description: 'Capture moments'
    },
    {
      id: 'notes',
      name: 'Notes',
      icon: FiEdit3,
      color: 'from-orange-500 to-orange-700',
      description: 'Take and save notes'
    }
  ];

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      if (!currentUser) return;
      
      try {
        // Get tasks
        const tasks = getTasks(currentUser.id);
        
        // Get media
        const media = getMedia(currentUser.id);
        const photos = media.filter(item => item.type === 'image').length;
        const videos = media.filter(item => item.type === 'video').length;
        
        // Get notes
        const notes = getNotes(currentUser.id);
        
        // Update stats
        setStats({
          tasks: tasks.length,
          photos: photos,
          videos: videos,
          notes: notes.length
        });
        
        // Check if sync is due
        if (syncEnabled) {
          const syncDue = await isSyncDue(currentUser.id);
          if (syncDue) {
            handleSync();
          }
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    
    loadStats();
  }, [currentUser, syncEnabled]);

  const handleAppClick = (appId) => {
    navigate(`/${appId}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSync = async () => {
    if (isSyncing || !currentUser) return;
    
    setIsSyncing(true);
    setSyncStatus('Syncing...');
    
    try {
      const result = await syncWithServer(currentUser.id);
      
      if (result.success) {
        const totalSynced = 
          result.syncedItems.tasks + 
          result.syncedItems.media + 
          result.syncedItems.notes;
          
        setSyncStatus(`Synced ${totalSynced} items`);
        
        // Clear status after 3 seconds
        setTimeout(() => {
          setSyncStatus(null);
        }, 3000);
      } else {
        setSyncStatus(`Sync failed: ${result.error}`);
        
        // Clear status after 3 seconds
        setTimeout(() => {
          setSyncStatus(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error syncing:', error);
      setSyncStatus('Sync error');
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setSyncStatus(null);
      }, 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/profile')}
              className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center cursor-pointer"
            >
              <SafeIcon icon={FiUser} className="text-xl text-black" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-luxury font-bold text-gold-400">
                Welcome, {currentUser?.name || currentUser?.username || 'User'}
              </h1>
              <p className="text-gray-400">Origin App</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {syncEnabled && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSync}
                disabled={isSyncing}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  isSyncing
                    ? 'bg-blue-500/20 text-blue-400 cursor-not-allowed'
                    : 'bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-blue-400'
                }`}
              >
                <SafeIcon 
                  icon={isSyncing ? FiRefreshCw : syncStatus ? FiCheckCircle : FiRefreshCw} 
                  className={`text-xl ${isSyncing ? 'animate-spin' : ''}`} 
                />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/settings')}
              className="p-3 bg-gray-700/30 border border-gray-600/30 rounded-lg hover:bg-gray-700/50 transition-all duration-300 text-gray-300"
            >
              <SafeIcon icon={FiSettings} className="text-xl" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-red-400"
            >
              <SafeIcon icon={FiLogOut} className="text-xl" />
            </motion.button>
          </div>
        </div>
        
        {/* Sync Status */}
        {syncStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg p-2 mb-6 text-center text-sm"
          >
            {syncStatus}
          </motion.div>
        )}

        {/* Apps Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {apps.map((app) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAppClick(app.id)}
              className="cursor-pointer group"
            >
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gold-400/20 rounded-2xl p-4 hover:border-gold-400/40 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className={`w-14 h-14 bg-gradient-to-br ${app.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <SafeIcon icon={app.icon} className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-gold-400 transition-colors">
                  {app.name}
                </h3>
                <p className="text-gray-400 text-xs">
                  {app.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8 bg-gray-900/50 backdrop-blur-sm border border-gold-400/20 rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-gold-400 mb-4">Quick Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.tasks}</div>
              <div className="text-sm text-gray-400">Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.photos}</div>
              <div className="text-sm text-gray-400">Photos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.videos}</div>
              <div className="text-sm text-gray-400">Videos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.notes}</div>
              <div className="text-sm text-gray-400">Notes</div>
            </div>
          </div>
        </motion.div>
        
        {/* Device Info */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Origin App v1.0.0</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;