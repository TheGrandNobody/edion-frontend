
import React, { useState, useEffect } from 'react';
import ActionCard from './ActionCard';
import { FileText, GraduationCap, BarChart, Code, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

const ActionCards = () => {
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  
  useEffect(() => {
    // Function to check and update dark mode status
    const updateTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Set up event listener for theme changes
    window.addEventListener('themeChange', updateTheme);
    
    // Initial check
    updateTheme();
    
    // Clean up
    return () => {
      window.removeEventListener('themeChange', updateTheme);
    };
  }, []);

  return (
    <div className="flex flex-wrap gap-3 w-full justify-center">
      <ActionCard
        icon={<FileText className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />}
        title="Generate Report"
        color="purple"
        delay={0.1}
      />
      <ActionCard
        icon={<GraduationCap className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />}
        title="Generate Exercises"
        color="blue"
        delay={0.2}
      />
      <ActionCard
        icon={<BarChart className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />}
        title="Analyze Data"
        color="amber"
        delay={0.3}
      />
      <ActionCard
        icon={<Code className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />}
        title="Create Code"
        color="green"
        delay={0.4}
      />
      <ActionCard
        icon={<MoreHorizontal className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />}
        title="More"
        color="gray"
        delay={0.5}
      />
    </div>
  );
};

export default ActionCards;
