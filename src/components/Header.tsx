
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import ChatHistoryMenu from './ChatHistory';
import UserMenu from './UserMenu';
import HistoryButton from './HistoryButton';
import { UserSettings as UserSettingsType, ChatHistoryItem } from '../types';
import { getUserSettingsFromStorage, getChatHistoryFromStorage } from '../utils/storageUtils';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>(getChatHistoryFromStorage());
  const [userSettings, setUserSettings] = useState<UserSettingsType>(getUserSettingsFromStorage());

  // Settings page still needs UserMenu for theme toggle, but not the full header
  const isSettingsPage = location.pathname === '/settings';

  useEffect(() => {
    const handleStorageChange = () => {
      const newSettings = getUserSettingsFromStorage();
      setChatHistory(getChatHistoryFromStorage());
      setUserSettings(newSettings);
    };

    window.addEventListener('storage', handleStorageChange);
    
    setChatHistory(getChatHistoryFromStorage());
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.pathname]);

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

  // If on settings page, only show UserMenu for theme toggle
  if (isSettingsPage) {
    return (
      <motion.div 
        className="absolute top-6 right-6 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <UserMenu userSettings={userSettings} setUserSettings={setUserSettings} />
      </motion.div>
    );
  }

  return (
    <>
      <motion.header 
        className="w-full flex justify-between items-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <HistoryButton toggleHistory={toggleHistory} />
        <UserMenu userSettings={userSettings} setUserSettings={setUserSettings} />
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
