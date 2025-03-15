import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
}

const UserMenu: React.FC<UserMenuProps> = ({ userSettings, setUserSettings }) => {
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isManuallyControlled, setIsManuallyControlled] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Navigate to settings
  const goToSettings = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  // Handle theme toggle - completely disconnected from dropdown state
  const toggleDarkMode = useCallback((e: React.MouseEvent) => {
    // Prevent default behavior but don't try to manage dropdown state here
    e.preventDefault();
    e.stopPropagation();
    
    // Take manual control of the dropdown
    setIsManuallyControlled(true);
    
    // Apply theme change
    const newSettings = {
      ...userSettings,
      darkMode: !userSettings.darkMode
    };
    
    // First toggle the class
    document.documentElement.classList.toggle('dark', newSettings.darkMode);
    
    // Then update state
    setUserSettings(newSettings);
    updateUserSettings(newSettings);
    
    // Notify about theme change
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { darkMode: newSettings.darkMode, timestamp: Date.now() }
    }));
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    
    // Release control after a delay
    timeoutRef.current = window.setTimeout(() => {
      setIsManuallyControlled(false);
    }, 300) as unknown as number;
  }, [userSettings, setUserSettings]);
  
  // Master control of dropdown open state
  const handleOpenChange = useCallback((nextOpen: boolean) => {
    // Only allow state changes if we're not manually controlling
    if (isManuallyControlled) {
      return;
    }
    
    setIsOpen(nextOpen);
  }, [isManuallyControlled]);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={dropdownRef}>
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <motion.div
            ref={buttonRef}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="theme-change-immediate focus:outline-none cursor-pointer"
          >
            <Avatar 
              className="h-10 w-10 cursor-pointer theme-change-immediate focus:ring-0 focus:ring-offset-0"
            >
              <AvatarImage 
                src={userSettings.profilePicture} 
                alt="User" 
                className="theme-change-immediate object-cover"
              />
              <AvatarFallback className="theme-change-immediate">{userSettings.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 theme-change-immediate" 
          sideOffset={5}
        >
          <div 
            className="flex items-center justify-between px-2 py-1.5 theme-change-immediate border-b border-border"
          >
            <span className="text-sm font-medium theme-change-immediate">Theme</span>
            <button
              onClick={toggleDarkMode}
              className="p-1 rounded-md hover:bg-secondary theme-change-immediate"
              tabIndex={-1}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {userSettings.darkMode ? (
                <Sun className="h-4 w-4 theme-change-immediate" />
              ) : (
                <Moon className="h-4 w-4 theme-change-immediate" />
              )}
            </button>
          </div>
          <DropdownMenuItem 
            onClick={goToSettings} 
            className="cursor-pointer theme-change-immediate mt-1"
          >
            <Settings className="mr-2 h-4 w-4 theme-change-immediate" />
            <span className="theme-change-immediate">Settings</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;
