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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
}

const UserMenu: React.FC<UserMenuProps> = ({ userSettings, setUserSettings }) => {
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  // Disable auto-close during theme change
  const [preventClose, setPreventClose] = useState(false);
  
  // Handle theme toggle with special care to prevent dropdown closing
  const toggleDarkMode = useCallback((e: React.MouseEvent) => {
    // Critical: Prevent default behavior and stop propagation
    e.preventDefault();
    e.stopPropagation();
    
    // Set flag to prevent dropdown from closing
    setPreventClose(true);
    
    // Create new settings object
    const newSettings = {
      ...userSettings,
      darkMode: !userSettings.darkMode
    };
    
    // Update settings in state
    setUserSettings(newSettings);
    
    // Apply theme change to DOM
    // First disable transitions
    document.documentElement.classList.add('disable-transitions');
    
    // Apply class change for theme
    if (newSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to storage
    updateUserSettings(newSettings);
    
    // Force a repaint with minimal DOM manipulation
    const scrollPos = window.scrollY;
    document.body.style.display = 'none';
    document.body.offsetHeight; // Force reflow
    document.body.style.display = '';
    window.scrollTo(0, scrollPos);
    
    // Simple direct update of images
    document.querySelectorAll('img').forEach(img => {
      const currentSrc = img.src;
      if (currentSrc.includes('black_on_white.svg') || currentSrc.includes('white_on_black.svg')) {
        img.src = newSettings.darkMode ? '/black_on_white.svg' : '/white_on_black.svg';
      }
    });
    
    // Notify any components that need to know about theme changes
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { darkMode: newSettings.darkMode, timestamp: Date.now() }
    }));
    
    // Re-enable transitions after a brief delay
    setTimeout(() => {
      document.documentElement.classList.remove('disable-transitions');
      // Clear the prevent close flag with a slight delay to ensure the dropdown stays open
      setTimeout(() => {
        setPreventClose(false);
      }, 100);
    }, 50);
  }, [userSettings, setUserSettings]);

  const goToSettings = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  // This useEffect ensures dropdown stays open during theme changes
  useEffect(() => {
    // When preventClose is set, we want to ensure the dropdown stays open
    if (preventClose && !isOpen) {
      // Delay needed to overcome the re-render timing
      const timeoutId = setTimeout(() => {
        setIsOpen(true);
      }, 10);
      return () => clearTimeout(timeoutId);
    }
  }, [preventClose, isOpen]);

  const handleOpenChange = useCallback((open: boolean) => {
    // If trying to close and we're preventing close, keep it open
    if (!open && preventClose) {
      return;
    }
    setIsOpen(open);
  }, [preventClose]);

  return (
    <div ref={dropdownRef} className="theme-change-immediate">
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
                style={{ objectFit: 'cover', aspectRatio: '1/1' }}
              />
              <AvatarFallback className="theme-change-immediate">{userSettings.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          ref={contentRef}
          align="end" 
          className="w-56 theme-change-immediate" 
          sideOffset={5}
          onEscapeKeyDown={(e) => {
            if (preventClose) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            if (preventClose) {
              e.preventDefault();
            }
          }}
          // This is needed for Radix UI to maintain the content during re-renders
          forceMount={preventClose ? true : undefined}
        >
          <div 
            className="flex items-center justify-between px-2 py-1.5 theme-change-immediate border-b border-border"
          >
            <span className="text-sm font-medium theme-change-immediate">Theme</span>
            <button
              onClick={toggleDarkMode}
              className="p-1 rounded-md hover:bg-secondary theme-change-immediate"
              // This prevents the theme button from stealing focus
              tabIndex={-1}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
            >
              {userSettings.darkMode ? (
                <Sun className="h-4 w-4 theme-change-immediate" />
              ) : (
                <Moon className="h-4 w-4 theme-change-immediate" />
              )}
            </button>
          </div>
          <DropdownMenuItem onClick={goToSettings} className="cursor-pointer theme-change-immediate mt-1">
            <Settings className="mr-2 h-4 w-4 theme-change-immediate" />
            <span className="theme-change-immediate">Settings</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;
