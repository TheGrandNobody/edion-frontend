
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChatTab, ChatHistoryItem, ChatMessage, UserSettings } from '../types';
import { useToast } from '@/hooks/use-toast';

interface ChatContextType {
  userSettings: UserSettings;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  chatHistory: ChatHistoryItem[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatHistoryItem[]>>;
  tabs: ChatTab[];
  setTabs: React.Dispatch<React.SetStateAction<ChatTab[]>>;
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  getActiveTab: () => ChatTab | undefined;
  handleSubmit: (e: React.FormEvent) => void;
  handleEditMessage: (messageId: number, newText: string) => void;
  handleNewTab: () => void;
  handleTabClose: (tabId: string) => void;
  handleHistoryAction: (chatId: string) => void;
  handleDeleteChat: (chatId: string) => void;
  handleSaveSettings: (newSettings: UserSettings) => void;
  handleReorderTabs: (newTabOrder: ChatTab[]) => void;
  generatePDF: (tabId: string) => Promise<void>;
  scrollToBottom: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

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

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  const [userSettings, setUserSettings] = useState<UserSettings>(getUserSettingsFromStorage());
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [tabs, setTabs] = useState<ChatTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = React.useRef<HTMLDivElement | null>(null);

  const getActiveTab = () => tabs.find(tab => tab.id === activeTabId);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Import the generateStudentReportPDF function
  const generatePDF = async (tabId: string) => {
    const { generateStudentReportPDF } = await import('../utils/pdfUtils');
    await generateStudentReportPDF(tabId, tabs, setTabs);
  };

  useEffect(() => {
    const storedHistory = localStorage.getItem('chatHistory');
    if (storedHistory) {
      setChatHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    if (userSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userSettings.darkMode]);

  useEffect(() => {
    const activeTab = getActiveTab();
    if (activeTab && activeTab.messages.length > 0) {
      scrollToBottom();
    }
  }, [tabs, activeTabId]);

  useEffect(() => {
    const handleChatDeleted = (event: CustomEvent) => {
      const { chatId } = event.detail;
      
      const tabExists = tabs.some(tab => tab.id === chatId);
      
      if (tabExists) {
        const updatedTabs = tabs.filter(tab => tab.id !== chatId);
        setTabs(updatedTabs);
        
        if (activeTabId === chatId && updatedTabs.length > 0) {
          setActiveTabId(updatedTabs[0].id);
        }
        
        localStorage.setItem('chatTabs', JSON.stringify(updatedTabs));
      }
      
      const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
      setChatHistory(updatedHistory);
    };
    
    window.addEventListener('chatDeleted', handleChatDeleted as EventListener);
    
    return () => {
      window.removeEventListener('chatDeleted', handleChatDeleted as EventListener);
    };
  }, [tabs, activeTabId, chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeTab = getActiveTab();
    if (!inputValue.trim() || !activeTab) return;

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

    setTimeout(scrollToBottom, 50);

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
      
      setTimeout(scrollToBottom, 50);
    }, 1000);

    if (inputValue.toLowerCase().includes('generate') || inputValue.toLowerCase().includes('report')) {
      setTimeout(() => generatePDF(activeTabId), 2000);
    }
    
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
  };

  const handleEditMessage = (messageId: number, newText: string) => {
    const activeTab = getActiveTab();
    if (!activeTab) return;

    const updatedTabs = tabs.map(tab => {
      if (tab.id === activeTabId) {
        const updatedMessages = tab.messages.map(msg => {
          if (msg.id === messageId) {
            return {
              ...msg,
              text: newText
            };
          }
          return msg;
        });
        
        return {
          ...tab,
          messages: updatedMessages,
        };
      }
      return tab;
    });
    
    setTabs(updatedTabs);
    localStorage.setItem('chatTabs', JSON.stringify(updatedTabs));
    
    toast({
      title: "Message updated",
      description: "Your message has been successfully edited",
    });
  };

  const handleNewTab = () => {
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
  };

  const handleTabClose = (tabId: string) => {
    if (tabs.length === 1) return;
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
    
    localStorage.setItem('chatTabs', JSON.stringify(newTabs));
  };

  const handleHistoryAction = (chatId: string) => {
    if (chatId === '') {
      setShowHistory(false);
      return;
    }
    
    setShowHistory(false);
    
    const existingTab = tabs.find(tab => tab.id === chatId);
    
    if (existingTab) {
      setActiveTabId(chatId);
    } else {
      const selectedChat = chatHistory.find(chat => chat.id === chatId);
      
      if (selectedChat) {
        const newTab: ChatTab = {
          id: selectedChat.id,
          title: selectedChat.title,
          date: selectedChat.date,
          messages: [{
            id: 1,
            text: selectedChat.title,
            isUser: true,
          },
          {
            id: 2,
            text: "Hello! I'm here to help. What can I assist you with today?",
            isUser: false,
          }],
          activePDF: null,
        };
        
        const updatedTabs = [...tabs, newTab];
        setTabs(updatedTabs);
        setActiveTabId(newTab.id);
        
        localStorage.setItem('chatTabs', JSON.stringify(updatedTabs));
      }
    }
  };

  const handleDeleteChat = (chatId: string) => {
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
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  const handleReorderTabs = (newTabOrder: ChatTab[]) => {
    setTabs(newTabOrder);
    localStorage.setItem('chatTabs', JSON.stringify(newTabOrder));
  };

  return (
    <ChatContext.Provider value={{
      userSettings,
      showHistory,
      setShowHistory,
      chatHistory,
      setChatHistory,
      tabs,
      setTabs,
      activeTabId,
      setActiveTabId,
      inputValue,
      setInputValue,
      getActiveTab,
      handleSubmit,
      handleEditMessage,
      handleNewTab,
      handleTabClose,
      handleHistoryAction,
      handleDeleteChat,
      handleSaveSettings,
      handleReorderTabs,
      generatePDF,
      scrollToBottom,
    }}>
      {children}
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && typeof child.type !== 'string') {
          return React.cloneElement(child as React.ReactElement<any>, { chatContainerRef });
        }
        return child;
      })}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
