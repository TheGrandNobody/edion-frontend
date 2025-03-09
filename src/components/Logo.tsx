
import React from 'react';
import { motion } from 'framer-motion';

const Logo = () => {
  // Use document class directly for immediate feedback - no state needed
  const isDark = document.documentElement.classList.contains('dark');
  const logoSrc = isDark ? "/white_on_trans.svg" : "/black_on_trans.svg";
  
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
            src={logoSrc} 
            alt="edion logo" 
            className="h-16 w-auto mr-3 theme-change-immediate" 
          />
          <span className="text-5xl font-light tracking-wider theme-change-immediate">edion</span>
        </div>
      </div>
    </motion.div>
  );
};

export default Logo;
