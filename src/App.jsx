import React, { useEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLoader from './components/common/AppLoader';
import './App.css';

// Lazy load components for better performance
const LoginScreen = lazy(() => import('./components/LoginScreen'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const DayPlanner = lazy(() => import('./components/DayPlanner'));
const Gallery = lazy(() => import('./components/Gallery'));
const Camera = lazy(() => import('./components/Camera'));
const NoteTaking = lazy(() => import('./components/NoteTaking'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const SettingsScreen = lazy(() => import('./components/SettingsScreen'));

// Setup native elements for Android
const setupNative = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      // Set status bar
      await StatusBar.setBackgroundColor({ color: '#000000' });
      await StatusBar.setStyle({ style: 'DARK' });
      
      // Hide splash screen
      await SplashScreen.hide();
    } catch (error) {
      console.error('Error setting up native elements:', error);
    }
  }
};

// Routes component
const AppRoutes = () => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <AppLoader />;
  }
  
  return (
    <AnimatePresence mode="wait">
      {!currentUser ? (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Suspense fallback={<AppLoader />}>
            <LoginScreen />
          </Suspense>
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Suspense fallback={<AppLoader />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/planner" element={<DayPlanner />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/camera" element={<Camera />} />
              <Route path="/notes" element={<NoteTaking />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function App() {
  useEffect(() => {
    setupNative();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-white">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;