import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface ActionCardProps {
  icon: string | React.ReactNode;
  title: string;
  description: string;
  color?: string;
  delay?: number;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, description, color = 'gray', delay = 0 }) => {
  return (
    <motion.div 
      className={cn(
        "flex items-start py-3 px-4 rounded-xl shadow-sm backdrop-blur-sm cursor-pointer w-full max-w-md",
        "border border-gray-200/30 dark:border-gray-800/50",
        "bg-white/80 hover:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-900/80"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex-shrink-0 mr-4 pt-1">
        {typeof icon === 'string' ? (
          <span className="text-xl">{icon}</span>
        ) : (
          icon
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</span>
      </div>
    </motion.div>
  );
};

export default ActionCard;
