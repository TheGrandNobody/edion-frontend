
import React from 'react';
import { motion } from 'framer-motion';

interface MainContainerProps {
  children: React.ReactNode;
}

const MainContainer: React.FC<MainContainerProps> = ({ children }) => {
  return (
    <motion.div 
      className="w-full max-w-[95%] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto mt-4 sm:mt-6 md:mt-10 mb-16 sm:mb-20 md:mb-24 p-4 sm:p-6 md:p-8 bg-card rounded-xl shadow-sm"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default MainContainer;
