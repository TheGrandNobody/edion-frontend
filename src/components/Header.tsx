
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChatHistoryMenu from './ChatHistory';
import UserSettingsModal from './UserSettings';
import { UserSettings as UserSettingsType } from '../types';

// Get user settings from localStorage or use default
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

const Header = () => {
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Get user settings from localStorage
  const [userSettings, setUserSettings] = useState<UserSettingsType>(getUserSettingsFromStorage());

  // Apply dark mode based on user settings
  useEffect(() => {
    if (userSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userSettings.darkMode]);

  // Dummy chat history data
  const chatHistory = [
    {
      id: '1',
      title: 'Generate 3 Student Reports',
      date: '11/02/2024',
      lastMessage: 'The reports have been generated successfully.',
    },
    {
      id: '2',
      title: 'Civil War Quiz',
      date: '10/02/2024',
      lastMessage: 'Quiz has been created and saved.',
    },
  ];

  const handleHistoryAction = (chatId: string) => {
    if (chatId === '') {
      setShowHistory(false);
    } else {
      // Navigate to the chat page with the selected chat ID
      setShowHistory(false);
      console.log(`Selected chat with ID: ${chatId}`);
      navigate('/chat', { state: { selectedChatId: chatId } });
    }
  };

  const handleSaveSettings = (newSettings: UserSettingsType) => {
    setUserSettings(newSettings);
    // Save settings to localStorage for persistence
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
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
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors duration-200"
          onClick={() => setShowHistory(!showHistory)}
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

      {/* Side Menu */}
      {showHistory && <ChatHistoryMenu history={chatHistory} onSelectChat={handleHistoryAction} />}

      {/* Settings Modal */}
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
