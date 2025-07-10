import React from 'react';
import { motion } from 'framer-motion';

const AppLoader = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-24 h-24 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="w-12 h-12 text-black"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
            <path d="M13 8l4 4-4 4"></path>
          </svg>
        </motion.div>
        
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-2xl font-luxury font-bold text-gold-400 mb-2"
        >
          Origin App
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-gray-400 mb-8"
        >
          Loading your experience...
        </motion.p>
        
        <motion.div
          animate={{ 
            rotate: 360,
            transition: { 
              duration: 1,
              repeat: Infinity,
              ease: "linear" 
            }
          }}
          className="w-10 h-10 border-2 border-gold-400 border-t-transparent rounded-full mx-auto"
        />
      </div>
    </div>
  );
};

export default AppLoader;