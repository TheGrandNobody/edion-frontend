
import React, { useState, useEffect } from 'react';
import { UserSettings as UserSettingsType, ChatHistoryItem, ChatTab } from '../types';
import ChatHistoryMenu from '../components/ChatHistory';
import UserSettingsModal from '../components/UserSettings';
import { useTheme } from '../hooks/useTheme';
import ChatHeader from '../components/ChatHeader';
import ChatContent from '../components/ChatContent';
import ChatInput from '../components/ChatInput';
import { generateStudentReportPDF } from '../utils/pdfUtils';

const Chat = () => {
  const { isDarkMode, setDarkMode } = useTheme();
  
  // User Settings
  const [userSettings, setUserSettings] = useState<UserSettingsType>({
    username: 'teacher_jane',
    fullName: 'Jane Smith',
    email: 'jane.smith@school.edu',
    profilePicture: '/teacher-profile.png',
    darkMode: isDarkMode,
  });
  const [showSettings, setShowSettings] = useState(false);

  // Chat History
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory] = useState<ChatHistoryItem[]>([
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
  ]);

  // Tabs
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

  const [inputValue, setInputValue] = useState('');
  const navbarHeight = useRef<number>(0);
  const [scrollPosition, setScrollPosition] = useState(0);

  const activeTab = tabs.find((tab) => tab.id === activeTabId)!;

  // Apply dark mode class to body
  useEffect(() => {
    if (userSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userSettings.darkMode]);

  // Measure the navbar height after component mounts
  useEffect(() => {
    const navbar = document.querySelector('.navbar-container');
    if (navbar) {
      navbarHeight.current = navbar.getBoundingClientRect().height;
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setTabs(tabs.map(tab => {
      if (tab.id === activeTabId) {
        return {
          ...tab,
          messages: [...tab.messages, {
            id: tab.messages.length + 1,
            text: inputValue,
            isUser: true,
          }],
        };
      }
      return tab;
    }));

    setInputValue('');

    if (inputValue.toLowerCase().includes('generate') || inputValue.toLowerCase().includes('report')) {
      setTimeout(() => generateStudentReportPDF(activeTabId, tabs, setTabs), 1000);
    }
  };

  const handleNewTab = () => {
    const newTab: ChatTab = {
      id: String(Date.now()),
      title: 'New Chat',
      date: new Date().toLocaleDateString('en-GB'),
      messages: [],
      activePDF: null,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleTabClose = (tabId: string) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const handleHistoryAction = (chatId: string) => {
    if (chatId === '') {
      setShowHistory(false);
    } else {
      // Handle selecting a chat from history
      setShowHistory(false);
      console.log(`Selected chat with ID: ${chatId}`);
      
      // If the tab already exists, switch to it
      const existingTab = tabs.find(tab => tab.id === chatId);
      if (existingTab) {
        setActiveTabId(chatId);
      } else {
        // Find the chat in history
        const selectedChat = chatHistory.find(chat => chat.id === chatId);
        if (selectedChat) {
          // Create a new tab based on selected chat
          const newTab: ChatTab = {
            id: selectedChat.id,
            title: selectedChat.title,
            date: selectedChat.date,
            messages: [{
              id: 1,
              text: selectedChat.lastMessage,
              isUser: false,
            }],
            activePDF: null,
          };
          setTabs([...tabs, newTab]);
          setActiveTabId(newTab.id);
        }
      }
    }
  };

  return (
    <div className="flex h-screen">
      {/* Side Menu */}
      {showHistory && <ChatHistoryMenu history={chatHistory} onSelectChat={handleHistoryAction} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800">
        {/* Top Navigation - Now with floating elements directly on the background */}
        <ChatHeader 
          tabs={tabs}
          activeTabId={activeTabId}
          setActiveTabId={setActiveTabId}
          handleTabClose={handleTabClose}
          handleNewTab={handleNewTab}
          setShowHistory={setShowHistory}
          showHistory={showHistory}
          setShowSettings={setShowSettings}
          userProfilePicture={userSettings.profilePicture}
        />

        {/* Chat Content */}
        <ChatContent 
          activeTab={activeTab} 
          userSettings={userSettings}
        />

        {/* Input Area */}
        <ChatInput 
          inputValue={inputValue} 
          setInputValue={setInputValue} 
          handleSubmit={handleSubmit}
        />
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <UserSettingsModal
          settings={userSettings}
          onClose={() => setShowSettings(false)}
          onSave={(newSettings) => {
            setUserSettings(newSettings);
            setDarkMode(newSettings.darkMode);
          }}
        />
      )}
    </div>
  );
};

export default Chat;
