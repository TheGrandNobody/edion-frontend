
import React, { useState, useEffect } from 'react';
import ActionCard from './ActionCard';
import { FileText, PenSquare, AlertTriangle } from 'lucide-react';

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-xl mx-auto">
      <ActionCard
        icon={<FileText className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />}
        title="Generate Report"
        delay={0.3}
      />
      <ActionCard
        icon={<PenSquare className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />}
        title="Generate Exercises"
        delay={0.4}
      />
      <ActionCard
        icon={<AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />}
        title="Prepare an Exam"
        delay={0.5}
      />
    </div>
  );
};

export default ActionCards;
