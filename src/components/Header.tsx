
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Settings, Moon, Sun } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChatHistoryMenu from './ChatHistory';
import { UserSettings as UserSettingsType, ChatHistoryItem } from '../types';
import { useToast } from "@/hooks/use-toast";
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getUserSettingsFromStorage = (): UserSettingsType => {
  const storedSettings = localStorage.getItem('userSettings');
  if (storedSettings) {
    return JSON.parse(storedSettings);
  }
  return {
    username: 'teacher_jane',
    fullName: 'Jane Smith',
    email: 'jane.smith@school.edu',
    profilePicture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    darkMode: false,
  };
};

const getChatHistoryFromStorage = (): ChatHistoryItem[] => {
  const storedHistory = localStorage.getItem('chatHistory');
  if (storedHistory) {
    return JSON.parse(storedHistory);
  }
  return [];
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>(getChatHistoryFromStorage());
  
  const [userSettings, setUserSettings] = useState<UserSettingsType>(getUserSettingsFromStorage());

  // Hide header on settings page
  if (location.pathname === '/settings') {
    return null;
  }

  useEffect(() => {
    // Apply theme from user settings and force it to propagate
    const applyTheme = () => {
      if (userSettings.darkMode) {
        document.documentElement.classList.add('dark');
        setTheme('dark');
        console.log('Setting theme to dark from Header');
      } else {
        document.documentElement.classList.remove('dark');
        setTheme('light');
        console.log('Setting theme to light from Header');
      }
    };
    
    applyTheme();
    
    // Force the theme to be applied after a short delay to ensure it propagates
    const timeoutId = setTimeout(applyTheme, 50);
    return () => clearTimeout(timeoutId);
  }, [userSettings.darkMode, setTheme]);

  useEffect(() => {
    const handleStorageChange = () => {
      const newSettings = getUserSettingsFromStorage();
      setChatHistory(getChatHistoryFromStorage());
      setUserSettings(newSettings);
      
      // Ensure theme is updated if settings change in another tab/window
      if (newSettings.darkMode) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      } else {
        setTheme('light');
        document.documentElement.classList.remove('dark');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    setChatHistory(getChatHistoryFromStorage());
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.pathname, setTheme]);

  const handleHistoryAction = (chatId: string) => {
    if (chatId !== '') {
      console.log(`Selected chat with ID: ${chatId}`);
      navigate('/chat', { state: { selectedChatId: chatId } });
    }
  };

  const handleDeleteChat = (chatId: string) => {
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    
    const storedTabs = localStorage.getItem('chatTabs');
    if (storedTabs) {
      const tabs = JSON.parse(storedTabs);
      const updatedTabs = tabs.filter((tab: any) => tab.id !== chatId);
      localStorage.setItem('chatTabs', JSON.stringify(updatedTabs));
    }

    window.dispatchEvent(new CustomEvent('chatDeleted', { detail: { chatId } }));
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const goToSettings = () => {
    navigate('/settings');
  };

  const toggleDarkMode = () => {
    const newSettings = {
      ...userSettings,
      darkMode: !userSettings.darkMode
    };
    
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
    setUserSettings(newSettings);
    
    // Theme will be updated via useEffect
    toast({
      title: `${newSettings.darkMode ? 'Dark' : 'Light'} mode enabled`,
      description: `Theme has been switched to ${newSettings.darkMode ? 'dark' : 'light'} mode`,
    });
  };

  // Handle closing the history menu when clicking outside
  const handleOutsideClick = (e: React.MouseEvent) => {
    if (showHistory) {
      setShowHistory(false);
    }
  };

  return (
    <>
      <motion.header 
        className="w-full flex justify-between items-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.button 
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors duration-200 z-20"
          onClick={toggleHistory}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LayoutGrid className="w-5 h-5" />
        </motion.button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Avatar 
                className="h-10 w-10 cursor-pointer"
              >
                <AvatarImage src={userSettings.profilePicture} alt="User" />
                <AvatarFallback>{userSettings.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-sm font-medium">Theme</span>
              <button
                onClick={toggleDarkMode}
                className="p-1 rounded-md hover:bg-secondary"
              >
                {userSettings.darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={goToSettings} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.header>

      {showHistory && (
        <>
          <div 
            className="fixed inset-0 z-5" 
            onClick={() => setShowHistory(false)}
          />
          <ChatHistoryMenu 
            history={chatHistory} 
            onSelectChat={handleHistoryAction}
            onDeleteChat={handleDeleteChat}
          />
        </>
      )}
    </>
  );
};

export default Header;
