
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChatTab, ChatHistoryItem, UserSettings } from '../types';
import { useToast } from "@/hooks/use-toast";
import ChatHistoryMenu from '../components/ChatHistory';
import { ChatProvider } from '../contexts/ChatContext';
import ChatNavbar from '../components/ChatNavbar';
import ChatContent from '../components/ChatContent';

const getUserSettingsFromStorage = (): UserSettings => {
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

const Chat = () => {
  const location = useLocation();
  const initialState = location.state || {};
  const { toast } = useToast();
  
  const [userSettings] = useState<UserSettings>(getUserSettingsFromStorage());
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [tabs, setTabs] = useState<ChatTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedHistory = localStorage.getItem('chatHistory');
    if (storedHistory) {
      setChatHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    const savedTabs = localStorage.getItem('chatTabs');
    let loadedTabs: ChatTab[] = savedTabs ? JSON.parse(savedTabs) : [];
    
    if (initialState.selectedChatId) {
      const existingTabIndex = loadedTabs.findIndex(tab => tab.id === initialState.selectedChatId);
      
      if (existingTabIndex >= 0) {
        setActiveTabId(initialState.selectedChatId);
        setTabs(loadedTabs);
      } else {
        const storedHistory = localStorage.getItem('chatHistory');
        const history = storedHistory ? JSON.parse(storedHistory) : [];
        const selectedChat = history.find((chat: ChatHistoryItem) => chat.id === initialState.selectedChatId);
        
        if (selectedChat) {
          const newTab: ChatTab = {
            id: selectedChat.id,
            title: selectedChat.title,
            date: selectedChat.date,
            messages: [
              {
                id: 1,
                text: initialState.initialQuery || selectedChat.title,
                isUser: true,
              },
              {
                id: 2,
                text: "Hello! I'm here to help. What can I assist you with today?",
                isUser: false,
              }
            ],
            activePDF: null,
          };
          
          loadedTabs = [newTab, ...loadedTabs];
          setTabs(loadedTabs);
          setActiveTabId(newTab.id);
          
          localStorage.setItem('chatTabs', JSON.stringify(loadedTabs));
        }
      }
    } else if (loadedTabs.length > 0) {
      setTabs(loadedTabs);
      setActiveTabId(loadedTabs[0].id);
    } else {
      // Create a default tab if no tabs exist - this is the key fix
      const defaultTab: ChatTab = {
        id: String(Date.now()),
        title: 'New Chat',
        date: new Date().toLocaleDateString('en-GB'),
        messages: [],
        activePDF: null,
      };
      setTabs([defaultTab]);
      setActiveTabId(defaultTab.id);
      
      localStorage.setItem('chatTabs', JSON.stringify([defaultTab]));
      
      // Add to history as well
      const newHistoryItem: ChatHistoryItem = {
        id: defaultTab.id,
        title: 'New Chat',
        date: defaultTab.date,
        lastMessage: '',
      };
      
      const updatedHistory = [newHistoryItem, ...chatHistory];
      setChatHistory(updatedHistory);
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    }
    
    setIsLoading(false);
  }, [initialState.selectedChatId, initialState.initialQuery, chatHistory]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Loading chat...</p>
      </div>
    );
  }

  return (
    <ChatProvider>
      <div className="flex h-screen">
        {showHistory && (
          <ChatHistoryMenu 
            history={chatHistory} 
            onSelectChat={(chatId) => {
              const existingTab = tabs.find(tab => tab.id === chatId);
              if (existingTab) {
                setActiveTabId(chatId);
                setShowHistory(false);
              }
            }} 
            onDeleteChat={(chatId) => {
              toast({
                title: "Chat deleted",
                description: "The chat has been removed from your history",
              });
              setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
            }} 
          />
        )}

        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-950">
          <ChatNavbar />
          <ChatContent />
        </div>
      </div>
    </ChatProvider>
  );
};

export default Chat;
