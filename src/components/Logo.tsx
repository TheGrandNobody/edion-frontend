
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

const Logo = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <motion.div 
      className="flex items-center justify-center"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="logo-container">
        <div className="flex items-center">
          <img 
            src={isDarkMode ? '/logo-white.png' : '/logo-black.png'} 
            alt="Edion Logo" 
            className="h-8 w-auto mr-2"
          />
          <span className="text-4xl font-light tracking-wider">edion</span>
        </div>
      </div>
    </motion.div>
  );
};

export default Logo;
