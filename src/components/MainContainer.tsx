
import React from 'react';
import { motion } from 'framer-motion';

interface MainContainerProps {
  children: React.ReactNode;
}

const MainContainer: React.FC<MainContainerProps> = ({ children }) => {
  return (
    <motion.div 
      className="w-full max-w-2xl mx-auto mt-10 mb-24 p-8 bg-card rounded-xl shadow-sm"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default MainContainer;
