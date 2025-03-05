
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChatHistoryMenu from './ChatHistory';
import UserSettingsModal from './UserSettings';
import { UserSettings as UserSettingsType, ChatHistoryItem } from '../types';

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
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>(getChatHistoryFromStorage());
  
  const [userSettings, setUserSettings] = useState<UserSettingsType>(getUserSettingsFromStorage());

  useEffect(() => {
    if (userSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userSettings.darkMode]);

  useEffect(() => {
    // Update chat history when localStorage changes
    const handleStorageChange = () => {
      setChatHistory(getChatHistoryFromStorage());
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for updates on mount and when returning to the page
    setChatHistory(getChatHistoryFromStorage());
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.pathname]);

  const handleHistoryAction = (chatId: string) => {
    if (chatId !== '') {
      console.log(`Selected chat with ID: ${chatId}`);
      // Only navigate, don't close the history panel
      navigate('/chat', { state: { selectedChatId: chatId } });
    }
  };

  const handleSaveSettings = (newSettings: UserSettingsType) => {
    setUserSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
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
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Avatar 
            className="h-10 w-10 cursor-pointer"
            onClick={() => setShowSettings(true)}
          >
            <AvatarImage src={userSettings.profilePicture} alt="User" />
            <AvatarFallback>{userSettings.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
        </motion.div>
      </motion.header>

      {showHistory && (
        <ChatHistoryMenu 
          history={chatHistory} 
          onSelectChat={handleHistoryAction} 
        />
      )}

      {showSettings && (
        <UserSettingsModal
          settings={userSettings}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
        />
      )}
    </>
  );
};

export default Header;
