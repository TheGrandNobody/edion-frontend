
import React, { useState, useEffect } from 'react';
import ActionCard from './ActionCard';
import { FileText, GraduationCap, BookOpen, HelpCircle, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
        title="Generate report"
        color="purple"
        delay={0.1}
      />
      <ActionCard
        icon={<GraduationCap className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />}
        title="Generate exercises"
        color="blue"
        delay={0.2}
      />
      <ActionCard
        icon={<BookOpen className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />}
        title="Plan a lesson"
        color="amber"
        delay={0.3}
      />
      <ActionCard
        icon={<HelpCircle className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />}
        title="Seek advice"
        color="green"
        delay={0.4}
      />
      <Popover>
        <PopoverTrigger asChild>
          <div>
            <ActionCard
              icon={<ChevronDown className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />}
              title="More"
              color="gray"
              delay={0.5}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-2 w-48">
          <div className="flex flex-col space-y-1">
            <button className="text-left px-3 py-2 hover:bg-accent rounded-md text-sm">
              Create quiz
            </button>
            <button className="text-left px-3 py-2 hover:bg-accent rounded-md text-sm">
              Provide feedback
            </button>
            <button className="text-left px-3 py-2 hover:bg-accent rounded-md text-sm">
              Simplify concept
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ActionCards;
