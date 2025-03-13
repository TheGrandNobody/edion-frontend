import React, { useRef, useEffect, useState } from 'react';
import { Settings, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserSettings } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateUserSettings } from '../utils/storageUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatUserMenuProps {
  userSettings: UserSettings;
  setUserSettings: (newSettings: UserSettings) => void;
}

const ChatUserMenu: React.FC<ChatUserMenuProps> = ({ userSettings, setUserSettings }) => {
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  // Handle clicks outside to remove focus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        // Remove focus from the button when clicking outside
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Listen for theme changes to keep dropdown open
  useEffect(() => {
    const handleThemeChange = () => {
      // Ensure dropdown stays open after theme change
      setTimeout(() => {
        setIsOpen(true);
      }, 50);
    };
    
    window.addEventListener('themeChanged', handleThemeChange);
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);
  
  const toggleDarkMode = (e: React.MouseEvent) => {
    // Prevent the dropdown from closing
    e.preventDefault();
    e.stopPropagation();
    
    const newSettings = {
      ...userSettings,
      darkMode: !userSettings.darkMode
    };
    
    // Update local settings state
    setUserSettings(newSettings);
    
    // First, disable all transitions
    document.documentElement.classList.add('disable-transitions');
    
    // Directly manipulate DOM for immediate visual feedback
    if (newSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to storage immediately without requiring "Save Changes"
    updateUserSettings(newSettings);
    
    // Force a repaint to ensure the theme change is applied
    document.body.style.display = 'none';
    document.body.offsetHeight; // Force a reflow
    document.body.style.display = '';
    
    // Force all images to reload
    document.querySelectorAll('img').forEach(img => {
      const currentSrc = img.src;
      if (currentSrc.includes('black_on_white.svg') || currentSrc.includes('white_on_black.svg')) {
        img.src = '';
        setTimeout(() => {
          img.src = newSettings.darkMode ? '/black_on_white.svg' : '/white_on_black.svg';
        }, 10);
      }
    });
    
    // Notify components that need to respond to theme changes with more detailed event
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { darkMode: newSettings.darkMode, timestamp: Date.now() }
    }));
    
    // Re-enable transitions after a small delay
    setTimeout(() => {
      document.documentElement.classList.remove('disable-transitions');
    }, 1);
  };

  const goToSettings = () => {
    navigate('/settings');
    setIsOpen(false); // Close dropdown after navigation
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.div
          ref={buttonRef}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="theme-change-immediate focus:outline-none"
          onClick={handleAvatarClick}
        >
          <Avatar 
            className="h-10 w-10 cursor-pointer theme-change-immediate focus:ring-0 focus:ring-offset-0"
          >
            <AvatarImage 
              src={userSettings.profilePicture} 
              alt="User" 
              className="theme-change-immediate object-cover"
              style={{ objectFit: 'cover', aspectRatio: '1/1' }}
            />
            <AvatarFallback className="theme-change-immediate">{userSettings.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 theme-change-immediate">
        <div className="flex items-center justify-between px-2 py-1.5 theme-change-immediate">
          <span className="text-sm font-medium theme-change-immediate">Theme</span>
          <button
            onClick={toggleDarkMode}
            className="p-1 rounded-md hover:bg-secondary theme-change-immediate"
            onMouseDown={(e) => e.preventDefault()}
          >
            {userSettings.darkMode ? (
              <Sun className="h-4 w-4 theme-change-immediate" />
            ) : (
              <Moon className="h-4 w-4 theme-change-immediate" />
            )}
          </button>
        </div>
        <DropdownMenuSeparator className="theme-change-immediate" />
        <DropdownMenuItem onClick={goToSettings} className="cursor-pointer theme-change-immediate">
          <Settings className="mr-2 h-4 w-4 theme-change-immediate" />
          <span className="theme-change-immediate">Settings</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatUserMenu; 