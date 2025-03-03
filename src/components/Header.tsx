
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChatHistoryMenu from './ChatHistory';
import UserSettingsModal from './UserSettings';
import { UserSettings as UserSettingsType, ChatHistoryItem, ChatTab, ChatMessage } from '../types';
import { useTheme } from '../hooks/useTheme';

const Header = () => {
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { isDarkMode, setDarkMode } = useTheme();
  
  // Dummy user settings for demonstration
  const [userSettings, setUserSettings] = useState<UserSettingsType>({
    username: 'teacher_jane',
    fullName: 'Jane Smith',
    email: 'jane.smith@school.edu',
    profilePicture: '/teacher-profile.png',
    darkMode: isDarkMode,
  });

  // Chat tab management
  const [tabs, setTabs] = useState<ChatTab[]>([
    {
      id: '1',
      title: 'Drafting a report for Justin',
      date: '24/06/2024',
      messages: [
        {
          id: 1,
          text: 'Hey Edion, can you generate a report for one of my students?',
          isUser: true,
        },
        {
          id: 2,
          text: 'Of course. Please provide any necessary documents, notes or work from said student.\n\nFurthermore, attach a draft or reference for how you would want the report to be structured, or select one which you have previously completed.',
          isUser: false,
        },
      ],
      activePDF: null,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);

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
    setDarkMode(newSettings.darkMode);
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
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors duration-200 transform hover:scale-105"
          onClick={() => setShowHistory(!showHistory)}
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <Avatar 
          className="h-10 w-10 transition-transform duration-200 hover:scale-105 cursor-pointer"
          onClick={() => setShowSettings(true)}
        >
          <AvatarImage src={userSettings.profilePicture} alt="User" />
          <AvatarFallback>JS</AvatarFallback>
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
