
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ActionCardProps {
  icon: string | React.ReactNode;
  title: string;
  color?: string;
  delay?: number;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, color = 'gray', delay = 0 }) => {
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  
  useEffect(() => {
    // Function to check and update dark mode status
    const updateTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
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
  
  // Get appropriate background and hover colors based on the color prop and dark mode
  const getBackgroundClasses = () => {
    const baseClasses = 'transition-all duration-200 border border-gray-200/30 dark:border-gray-800/50';
    
    if (isDarkMode) {
      return `${baseClasses} bg-gray-900/50 hover:bg-gray-900/80`;
    }
    
    return `${baseClasses} bg-white/80 hover:bg-white`;
  };

  return (
    <motion.div 
      className={`flex items-center py-2.5 px-6 rounded-full shadow-sm backdrop-blur-sm cursor-pointer ${getBackgroundClasses()}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay, ease: "easeOut" }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex-shrink-0 mr-3 theme-change-immediate">
        {typeof icon === 'string' ? (
          <span className="text-xl theme-change-immediate">{icon}</span>
        ) : (
          icon
        )}
      </div>
      <span className="text-sm font-medium theme-change-immediate">{title}</span>
    </motion.div>
  );
};

export default ActionCard;
