import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import SafeIcon from '../common/SafeIcon';

const { FiUser, FiLock, FiEye, FiEyeOff, FiAlertCircle } = FiIcons;

const LoginScreen = () => {
  const { login, error, setError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Clear error when inputs change
  useEffect(() => {
    if (error) {
      setError(null);
    }
    if (formError) {
      setFormError('');
    }
  }, [username, password, error, setError, formError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!username.trim()) {
      setFormError('Username is required');
      return;
    }
    
    if (!password.trim()) {
      setFormError('Password is required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Login with credentials
      const success = await login(username, password);
      
      if (!success && !error) {
        setFormError('Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setFormError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-black/80 backdrop-blur-sm border border-gold-400/30 rounded-2xl p-8 shadow-2xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <SafeIcon icon={FiUser} className="text-3xl text-black" />
            </div>
            <h1 className="text-3xl font-luxury font-bold text-gold-400 mb-2">
              Origin App
            </h1>
            <p className="text-gray-400">Sign in to continue</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gold-400/30 rounded-lg focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 text-white placeholder-gray-500 transition-all duration-300"
              />
            </div>

            <div className="relative">
              <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gold-400/30 rounded-lg focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 text-white placeholder-gray-500 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gold-400 hover:text-gold-300 transition-colors"
              >
                <SafeIcon icon={showPassword ? FiEyeOff : FiEye} />
              </button>
            </div>

            {(error || formError) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 text-red-400 text-sm p-3 bg-red-400/10 border border-red-400/30 rounded-lg"
              >
                <SafeIcon icon={FiAlertCircle} className="flex-shrink-0" />
                <span>{error || formError}</span>
              </motion.div>
            )}

            <div className="text-sm text-center text-gray-400">
              <p>Default Users:</p>
              <p className="mt-1">KARTHIK / 7013178749</p>
              <p>USER / 7013178749</p>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-black font-semibold py-3 rounded-lg hover:from-gold-500 hover:to-gold-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full mr-2"
                  />
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Origin App v1.0.0</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;