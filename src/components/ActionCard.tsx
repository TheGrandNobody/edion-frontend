
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ActionCardProps {
  icon: string | React.ReactNode;
  title: string;
  delay?: number;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, delay = 0 }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Update dark mode status on mount and when theme changes
  useEffect(() => {
    const updateThemeStatus = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Set initial state
    updateThemeStatus();
    
    // Listen for theme changes
    window.addEventListener('themeChange', updateThemeStatus);
    
    return () => {
      window.removeEventListener('themeChange', updateThemeStatus);
    };
  }, []);
  
  // Determine card class based on current theme - without transitions for instant theme switching
  const cardClass = `action-card ${isDarkMode ? 'dark-card' : 'light-card'} theme-change-immediate`;

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
