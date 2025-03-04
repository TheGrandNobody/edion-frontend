
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  Folder, 
  Download, 
  Pencil, 
  RefreshCw, 
  Send, 
  Mic,
  Paperclip
} from 'lucide-react';
import { 
  ChatMessage, 
  ChatTab, 
  UserSettings as UserSettingsType, 
  ChatHistoryItem 
} from '../types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChatBubble from '../components/ChatBubble';
import PDFViewer from '../components/PDFViewer';
import TabBar from '../components/TabBar';
import ChatHistoryMenu from '../components/ChatHistory';
import UserSettingsModal from '../components/UserSettings';
import { generateStudentReportPDF } from '../utils/pdfUtils';

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

const Chat = () => {
  const location = useLocation();
  const initialState = location.state || {};
  
  const [userSettings, setUserSettings] = useState<UserSettingsType>(getUserSettingsFromStorage());
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [tabs, setTabs] = useState<ChatTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const navbarHeight = useRef<number>(0);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Get active tab using activeTabId
  const getActiveTab = () => tabs.find(tab => tab.id === activeTabId);

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
          setActiveTabId(selectedChat.id);
          
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

  useEffect(() => {
    if (userSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userSettings.darkMode]);

  useEffect(() => {
    const navbar = document.querySelector('.navbar-container');
    if (navbar) {
      navbarHeight.current = navbar.getBoundingClientRect().height;
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        setScrollPosition(chatContainerRef.current.scrollTop);
      }
    };

    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const generatePDF = async (tabId: string) => {
    await generateStudentReportPDF(tabId, tabs, setTabs);
  };

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

  const handleSaveSettings = (newSettings: UserSettingsType) => {
    setUserSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Loading chat...</p>
      </div>
    );
  }

  const activeTab = getActiveTab();
  if (!activeTab) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">No active chat found. Please try again or start a new chat.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {showHistory && <ChatHistoryMenu history={chatHistory} onSelectChat={handleHistoryAction} />}

      <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-950">
        <div className="navbar-container sticky top-0 z-10 flex items-center justify-between px-2 sm:px-4 py-3 bg-transparent">
          <button
            className="p-2 hover:bg-white/40 dark:hover:bg-gray-900 rounded-lg text-gray-700 dark:text-gray-200 flex items-center justify-center"
            onClick={() => setShowHistory(!showHistory)}
          >
            <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <div className="flex-1 bg-white/60 dark:bg-black/60 backdrop-blur-md rounded-lg shadow-lg p-1.5 mx-2 border border-gray-200/10 dark:border-gray-800/40">
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onTabChange={setActiveTabId}
              onTabClose={handleTabClose}
              onNewTab={handleNewTab}
            />
          </div>
          
          <button
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0 shadow-lg ml-3"
            onClick={() => setShowSettings(true)}
          >
            <Avatar>
              <AvatarImage src={userSettings.profilePicture} alt="Profile" />
              <AvatarFallback>{userSettings.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          {activeTab.activePDF && (
            <div className="w-full md:w-1/2 border-r border-gray-200 dark:border-gray-800 overflow-hidden">
              <PDFViewer pdfUrl={activeTab.activePDF} darkMode={userSettings.darkMode} />
            </div>
          )}

          <div className={`flex-1 flex flex-col ${activeTab.activePDF ? 'hidden md:flex md:w-1/2' : 'w-full'}`}>
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-28"
            >
              <div className="w-full mx-auto" style={{ maxWidth: 'min(100%, 800px)', width: '100%', padding: '0 4px', boxSizing: 'border-box' }}>
                {activeTab.messages.map((message, index) => (
                  <div 
                    key={message.id} 
                    className="mb-6"
                  >
                    <ChatBubble message={message} darkMode={userSettings.darkMode} />
                    {message.pdfUrl && !message.isUser && (
                      <div className="ml-10 mt-2 flex flex-wrap gap-2">
                        <button className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 dark:bg-gray-900 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm backdrop-blur-sm">
                          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Download</span>
                        </button>
                        <button className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 dark:bg-gray-900 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm backdrop-blur-sm">
                          <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Edit</span>
                        </button>
                        <button className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 dark:bg-gray-900 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm backdrop-blur-sm">
                          <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Regenerate report</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Detached input field container */}
            <div className="absolute bottom-6 left-0 right-0 px-3 sm:px-6">
              <div className="w-full mx-auto" style={{ maxWidth: 'min(100%, 800px)', width: '100%', padding: '0 4px', boxSizing: 'border-box' }}>
                <div className="bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800/50 backdrop-blur-md rounded-xl shadow-lg">
                  <form onSubmit={handleSubmit} className="relative">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask anything"
                      className="w-full px-4 py-3 sm:py-3.5 pr-24 bg-transparent rounded-xl focus:outline-none text-sm text-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
                    />
                    <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 sm:space-x-2">
                      <button
                        type="button"
                        className="p-1.5 sm:p-2 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 rounded-lg text-gray-500 dark:text-gray-400 backdrop-blur-sm"
                      >
                        <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 sm:p-2 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 rounded-lg text-gray-500 dark:text-gray-400 backdrop-blur-sm"
                      >
                        <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        type="submit"
                        className="p-1.5 sm:p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
                      >
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <UserSettingsModal
          settings={userSettings}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
};

export default Chat;
