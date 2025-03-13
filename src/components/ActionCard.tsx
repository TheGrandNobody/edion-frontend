import React from 'react';
import { motion } from 'framer-motion';

interface ActionCardProps {
  icon: string | React.ReactNode;
  title: string;
  color?: string;
  delay?: number;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, color = 'gray', delay = 0 }) => {
  // Get appropriate background classes without any transition for theme changes
  const getBackgroundClasses = () => {
    return 'border border-gray-200/30 dark:border-gray-800/50 bg-white/80 hover:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-900/80';
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
      <div className="flex-shrink-0 mr-3">
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
