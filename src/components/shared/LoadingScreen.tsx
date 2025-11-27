'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  isLoading, 
  progress = 0, 
  message = "Loading..." 
}) => {
  const [dots, setDots] = useState('');

  // Animated dots effect (but not for cache messages)
  useEffect(() => {
    if (!isLoading || message.includes('cache')) {
      return;
    }
    
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) {
          return '';
        }
        return `${prev}.`;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading, message]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-cursor flex items-center justify-center bg-background gpu-accelerated"
        >
          {/* Simple geometric loading animation */}
          <div className="flex flex-col items-center space-y-6">
            {/* Minimalist atomic loader */}
            <div className="relative w-12 h-12 md:w-16 md:h-16">
              <motion.div
                className="absolute inset-0 border-2 border-accent-primary/30 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "linear",
                  repeatType: "loop"
                }}
              />
              <motion.div
                className="absolute inset-2 border-2 border-accent-primary/50 rounded-full border-t-accent-primary"
                animate={{ rotate: -360 }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "linear",
                  repeatType: "loop"
                }}
              />
              <motion.div
                className="absolute inset-4 w-4 h-4 md:w-8 md:h-8 bg-accent-primary/80 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  repeatType: "loop"
                }}
              />
            </div>

            {/* Loading text with animated dots */}
            <div className="text-center">
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base md:text-lg font-medium text-foreground mb-2"
              >
                {message.includes('cache') ? message : `${message}${dots}`}
              </motion.p>
              
              {/* Progress bar if progress is provided */}
              {progress > 0 && (
                <div className="w-48 md:w-64 h-1 bg-surface-primary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
              )}
              
              {progress > 0 && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xs md:text-sm text-foreground/70 mt-2"
                >
                  {Math.round(progress)}% Complete
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(LoadingScreen);
