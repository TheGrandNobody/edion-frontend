import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChatTab, ChatHistoryItem, UserSettings } from '../types';
import { useToast } from './use-toast';

export const useChat = (userSettings: UserSettings) => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialState = location.state || {};
  const { toast } = useToast();
  
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [tabs, setTabs] = useState<ChatTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');

  // Load chat history from localStorage
  useEffect(() => {
    const storedHistory = localStorage.getItem('chatHistory');
    if (storedHistory) {
      try {
        setChatHistory(JSON.parse(storedHistory));
      } catch (error) {
        console.error('Failed to parse chat history:', error);
        setChatHistory([]);
      }
    }
  }, []);

  // Initialize tabs and active tab
  useEffect(() => {
    const savedTabs = localStorage.getItem('chatTabs');
    let loadedTabs: ChatTab[] = [];
    
    try {
      loadedTabs = savedTabs ? JSON.parse(savedTabs) : [];
    } catch (error) {
      console.error('Failed to parse saved tabs:', error);
    }
    
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
    }
    
    setIsLoading(false);
  }, [initialState.selectedChatId, initialState.initialQuery]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeTabId) return;

    const updatedTabs = tabs.map(tab => {
      if (tab.id === activeTabId) {
        const updatedMessages = [
          ...tab.messages,
          {
            id: tab.messages.length + 1,
            text: inputValue,
            isUser: true,
          }
        ];
        
        return {
          ...tab,
          messages: updatedMessages,
        };
      }
      return tab;
    });
    
    setTabs(updatedTabs);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      setTabs(prevTabs => prevTabs.map(tab => {
        if (tab.id === activeTabId) {
          return {
            ...tab,
            messages: [
              ...tab.messages,
              {
                id: tab.messages.length + 1,
                text: "I'm processing your request. How else can I assist you?",
                isUser: false,
              }
            ],
          };
        }
        return tab;
      }));
    }, 1000);

    // Update chat history
    const updatedHistory = chatHistory.map(chat => {
      if (chat.id === activeTabId) {
        return {
          ...chat,
          lastMessage: inputValue,
        };
      }
      return chat;
    });
    
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
  }, [inputValue, activeTabId, tabs, chatHistory]);

  // Create a new tab
  const handleNewTab = useCallback(() => {
    const newTab: ChatTab = {
      id: String(Date.now()),
      title: 'New Chat',
      date: new Date().toLocaleDateString('en-GB'),
      messages: [],
      activePDF: null,
    };
    
    const updatedTabs = [...tabs, newTab];
    setTabs(updatedTabs);
    setActiveTabId(newTab.id);
    
    localStorage.setItem('chatTabs', JSON.stringify(updatedTabs));
    
    const newChatHistoryItem: ChatHistoryItem = {
      id: newTab.id,
      title: newTab.title,
      date: newTab.date,
      lastMessage: '',
    };
    
    const updatedHistory = [newChatHistoryItem, ...chatHistory];
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
  }, [tabs, chatHistory]);

  // Close a tab
  const handleTabClose = useCallback((tabId: string) => {
    if (tabs.length === 1) return;
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
    
    localStorage.setItem('chatTabs', JSON.stringify(newTabs));
  }, [tabs, activeTabId]);

  // Delete a chat
  const handleDeleteChat = useCallback((chatId: string) => {
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    
    const isActiveTab = activeTabId === chatId;
    
    if (isActiveTab) {
      const tabIndex = tabs.findIndex(tab => tab.id === chatId);
      const updatedTabs = tabs.filter(tab => tab.id !== chatId);
      
      if (updatedTabs.length > 0) {
        const newActiveIndex = tabIndex < updatedTabs.length ? tabIndex : updatedTabs.length - 1;
        setActiveTabId(updatedTabs[newActiveIndex].id);
        setTabs(updatedTabs);
      } else {
        const newTab: ChatTab = {
          id: String(Date.now()),
          title: 'New Chat',
          date: new Date().toLocaleDateString('en-GB'),
          messages: [],
          activePDF: null,
        };
        
        setTabs([newTab]);
        setActiveTabId(newTab.id);
        
        const newChatHistoryItem: ChatHistoryItem = {
          id: newTab.id,
          title: newTab.title,
          date: newTab.date,
          lastMessage: '',
        };
        
        setChatHistory([newChatHistoryItem, ...updatedHistory]);
        localStorage.setItem('chatHistory', JSON.stringify([newChatHistoryItem, ...updatedHistory]));
      }
    } else {
      const updatedTabs = tabs.filter(tab => tab.id !== chatId);
      setTabs(updatedTabs);
    }
    
    localStorage.setItem('chatTabs', JSON.stringify(tabs.filter(tab => tab.id !== chatId)));

    toast({
      title: "Chat deleted",
      description: "The chat has been removed from your history",
    });
  }, [activeTabId, tabs, chatHistory, toast]);

  // Return values and functions
  return useMemo(() => ({
    showHistory,
    setShowHistory,
    chatHistory,
    setChatHistory,
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    isLoading,
    inputValue,
    setInputValue,
    handleSubmit,
    handleNewTab,
    handleTabClose,
    handleDeleteChat,
    navigate
  }), [
    showHistory, 
    chatHistory, 
    tabs, 
    activeTabId, 
    isLoading, 
    inputValue, 
    handleSubmit, 
    handleNewTab, 
    handleTabClose, 
    handleDeleteChat, 
    navigate
  ]);
}; 