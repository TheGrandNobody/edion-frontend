
import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ActionCardProps {
  icon: string | React.ReactNode;
  title: string;
  delay?: number;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, delay = 0 }) => {
  return (
    <motion.div 
      className="action-card"
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
