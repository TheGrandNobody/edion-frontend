
import React from 'react';
import { motion } from 'framer-motion';

const Logo = () => {
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
            src="/white_on_black.svg" 
            alt="edion logo" 
            className="h-12 w-auto mr-2" 
          />
          <span className="text-4xl font-light tracking-wider">edion</span>
        </div>
      </div>
    </motion.div>
  );
};

export default Logo;
