
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ActionCardProps {
  icon: string | React.ReactNode;
  title: string;
  delay?: number;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, delay = 0 }) => {
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  // Update theme state on any theme change
  useEffect(() => {
    const updateTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Check initially and on every render
    updateTheme();
    
    // Listen for storage events
    window.addEventListener('storage', updateTheme);
    
    // Listen for custom theme change events with higher priority
    window.addEventListener('themeChange', updateTheme);
    
    return () => {
      window.removeEventListener('storage', updateTheme);
      window.removeEventListener('themeChange', updateTheme);
    };
  }, []);

  // Adjust card styling based on theme
  const cardClass = `action-card ${isDarkMode ? 'dark-card' : 'light-card'}`;

  return (
    <motion.div 
      className={cardClass}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex-shrink-0">
        {typeof icon === 'string' ? (
          <span className="text-xl">{icon}</span>
        ) : (
          icon
        )}
      </div>
      <span className="text-sm font-medium">{title}</span>
    </motion.div>
  );
};

export default ActionCard;
