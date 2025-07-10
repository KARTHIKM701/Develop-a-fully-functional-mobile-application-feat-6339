import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../lib/database';
import SafeIcon from '../common/SafeIcon';

const { 
  FiArrowLeft, FiUser, FiMail, FiLock, FiEye, FiEyeOff, 
  FiSave, FiAlertCircle, FiCheckCircle 
} = FiIcons;

const UserProfile = () => {
  const navigate = useNavigate();
  const { currentUser, refreshCurrentUser } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize form with current user data
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  // Clear messages when form changes
  useEffect(() => {
    if (error) setError('');
    if (success) setSuccess('');
  }, [name, email, currentPassword, newPassword, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setError('');
    setSuccess('');
    
    // Validate form
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (email && !isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Check if password is being changed
    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        setError('Current password is required to set a new password');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setError('New password and confirmation do not match');
        return;
      }
      
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      // Prepare updates object
      const updates = {
        name,
        email
      };
      
      // Add password if being changed
      if (newPassword && currentPassword) {
        updates.currentPassword = currentPassword;
        updates.password = newPassword;
      }
      
      // Update profile
      const success = await updateUserProfile(currentUser.id, updates);
      
      if (success) {
        setSuccess('Profile updated successfully');
        
        // Refresh current user
        refreshCurrentUser();
        
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'An error occurred while updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
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
              <h1 className="text-2xl font-luxury font-bold text-gold-400">User Profile</h1>
              <p className="text-gray-400">Edit your personal information</p>
            </div>
          </div>
        </div>
        
        {/* Profile Form */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gold-400/20 rounded-2xl p-6">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-black text-3xl font-bold">
              {currentUser?.name?.charAt(0) || currentUser?.username?.charAt(0) || 'U'}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gold-400 mb-2">Basic Information</h3>
              
              {/* Name */}
              <div className="relative">
                <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 text-white placeholder-gray-500"
                />
              </div>
              
              {/* Email */}
              <div className="relative">
                <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 text-white placeholder-gray-500"
                />
              </div>
            </div>
            
            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gold-400 mb-2">Change Password</h3>
              
              {/* Current Password */}
              <div className="relative">
                <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-400" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password"
                  className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 text-white placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gold-400 hover:text-gold-300 transition-colors"
                >
                  <SafeIcon icon={showCurrentPassword ? FiEyeOff : FiEye} />
                </button>
              </div>
              
              {/* New Password */}
              <div className="relative">
                <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 text-white placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gold-400 hover:text-gold-300 transition-colors"
                >
                  <SafeIcon icon={showNewPassword ? FiEyeOff : FiEye} />
                </button>
              </div>
              
              {/* Confirm Password */}
              <div className="relative">
                <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 text-white placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gold-400 hover:text-gold-300 transition-colors"
                >
                  <SafeIcon icon={showConfirmPassword ? FiEyeOff : FiEye} />
                </button>
              </div>
            </div>
            
            {/* Error/Success Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 text-red-400 text-sm p-3 bg-red-400/10 border border-red-400/30 rounded-lg"
              >
                <SafeIcon icon={FiAlertCircle} className="flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 text-green-400 text-sm p-3 bg-green-400/10 border border-green-400/30 rounded-lg"
              >
                <SafeIcon icon={FiCheckCircle} className="flex-shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}
            
            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-black font-semibold py-3 rounded-lg hover:from-gold-500 hover:to-gold-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                  />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiSave} />
                  <span>Save Changes</span>
                </>
              )}
            </motion.button>
            
            {/* Username Note */}
            <div className="text-center text-gray-500 text-xs">
              <p>Username: <span className="text-gray-400">{currentUser?.username}</span></p>
              <p className="mt-1">Note: Username cannot be changed</p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile;