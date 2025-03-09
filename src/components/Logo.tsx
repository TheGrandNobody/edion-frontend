
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

const Logo = () => {
  const { theme, resolvedTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<string | undefined>(undefined);
  
  // Listen for theme changes from multiple sources with optimized response
  useEffect(() => {
    const updateTheme = () => {
      const userSettings = localStorage.getItem('userSettings');
      const darkModePreference = userSettings ? JSON.parse(userSettings).darkMode : false;
      
      // Use document class directly for most immediate response
      const isDarkMode = document.documentElement.classList.contains('dark');
      const effectiveTheme = isDarkMode ? 'dark' : 'light';
      
      setCurrentTheme(effectiveTheme);
      
      console.log('Logo theme check:', { 
        resolvedTheme, 
        theme, 
        darkModePreference,
        effectiveTheme,
        documentClassList: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      });
    };
    
    // Update initially and on every render
    updateTheme();
    
    // Listen for storage events (when settings change)
    window.addEventListener('storage', updateTheme);
    
    // Also listen for custom theme change events - with higher priority
    window.addEventListener('themeChange', updateTheme);
    
    return () => {
      window.removeEventListener('storage', updateTheme);
      window.removeEventListener('themeChange', updateTheme);
    };
  }, [theme, resolvedTheme]);

  // Use document class directly for immediate feedback
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  // Choose logo based on theme
  const logoSrc = isDarkMode ? "/white_on_trans.svg" : "/black_on_trans.svg";
  
  console.log('Logo rendering with:', { currentTheme, isDarkMode, logoSrc });

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
            src={logoSrc} 
            alt="edion logo" 
            className="h-16 w-auto mr-3" 
          />
          <span className="text-5xl font-light tracking-wider">edion</span>
        </div>
      </div>
    </motion.div>
  );
};

export default Logo;
