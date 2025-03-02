
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChatHistoryMenu from './ChatHistory';
import UserSettingsModal from './UserSettings';
import { UserSettings as UserSettingsType } from '../types';

const Header = () => {
  const [showHistory, setShowHistory] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  
  // Dummy user settings for demonstration - in a real app, this would come from a context or state management
  const [userSettings, setUserSettings] = React.useState<UserSettingsType>({
    username: 'teacher_jane',
    fullName: 'Jane Smith',
    email: 'jane.smith@school.edu',
    profilePicture: 'https://github.com/shadcn.png',
    darkMode: false,
  });

  // Apply dark mode based on user settings
  useEffect(() => {
    if (userSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userSettings.darkMode]);

  // Dummy chat history data - in a real app, this would come from a context or state management
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
      // Handle selecting a chat from history
      setShowHistory(false);
      console.log(`Selected chat with ID: ${chatId}`);
    }
  };

  const handleSaveSettings = (newSettings: UserSettingsType) => {
    setUserSettings(newSettings);
    // No need to manually toggle dark mode here, as the useEffect will handle it
  };

  return (
    <>
      <motion.header 
        className="w-full flex justify-between items-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <button 
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors duration-200"
          onClick={() => setShowHistory(!showHistory)}
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
        
        <Avatar 
          className="h-10 w-10 transition-transform duration-200 hover:scale-105 cursor-pointer"
          onClick={() => setShowSettings(true)}
        >
          <AvatarImage src="https://github.com/shadcn.png" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
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
