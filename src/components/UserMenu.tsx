
import React from 'react';
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
  
  const toggleDarkMode = () => {
    const newSettings = {
      ...userSettings,
      darkMode: !userSettings.darkMode
    };
    
    // Update local settings state
    setUserSettings(newSettings);
    
    // Directly manipulate DOM for immediate visual feedback
    if (newSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to storage immediately without requiring "Save Changes"
    updateUserSettings(newSettings);
    
    // Notify components that need to respond to theme changes
    window.dispatchEvent(new Event('themeChange'));
  };

  const goToSettings = () => {
    navigate('/settings');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="theme-change-immediate"
        >
          <Avatar 
            className="h-10 w-10 cursor-pointer theme-change-immediate"
          >
            <AvatarImage src={userSettings.profilePicture} alt="User" className="theme-change-immediate" />
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

export default UserMenu;
