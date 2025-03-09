
import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

interface HistoryButtonProps {
  toggleHistory: () => void;
}

const HistoryButton: React.FC<HistoryButtonProps> = ({ toggleHistory }) => {
  return (
    <motion.button 
      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors duration-200 z-20"
      onClick={toggleHistory}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <LayoutGrid className="w-5 h-5" />
    </motion.button>
  );
};

export default HistoryButton;
