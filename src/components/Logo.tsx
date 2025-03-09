
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

const Logo = () => {
  const { theme, resolvedTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    // Use resolvedTheme which properly detects the system preference
    setCurrentTheme(resolvedTheme);
    console.log('Theme updated in Logo:', { resolvedTheme, theme, currentTheme: resolvedTheme });
  }, [theme, resolvedTheme]);

  // Only render the correct logo once we've determined the theme
  const logoSrc = currentTheme === 'dark' ? "/white_on_trans.svg" : "/black_on_trans.svg";
  
  console.log('Logo rendering with:', { currentTheme, logoSrc });

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
            className="h-12 w-auto mr-2" 
          />
          <span className="text-4xl font-light tracking-wider">edion</span>
        </div>
      </div>
    </motion.div>
  );
};

export default Logo;
