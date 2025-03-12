
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Logo = () => {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  
  useEffect(() => {
    // Function to check and update dark mode status
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    // Set up event listener for theme changes
    window.addEventListener('themeChange', updateTheme);
    
    // Initial check
    updateTheme();
    
    // Clean up
    return () => {
      window.removeEventListener('themeChange', updateTheme);
    };
  }, []);
  
  // Determine logo source based on current theme
  const logoSrc = isDark ? "/white_on_trans.svg" : "/black_on_trans.svg";
  
  return (
    <motion.div 
      className="flex items-center justify-center theme-change-immediate"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="logo-container theme-change-immediate">
        <div className="flex items-center theme-change-immediate">
          <img 
            src={logoSrc} 
            alt="edion logo" 
            className="h-24 w-auto mr-2 theme-change-immediate" 
          />
          <span className="text-6xl font-light tracking-wider theme-change-immediate bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">edion</span>
        </div>
      </div>
    </motion.div>
  );
};

export default Logo;
