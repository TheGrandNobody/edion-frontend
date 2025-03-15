import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserSettings as UserSettingsType, ChatTab } from '../types';
import PDFViewer from '../components/PDFViewer';
import ChatHistoryMenu from '../components/ChatHistory';
import ChatHeader from '../components/ChatHeader';
import ChatMessages from '../components/ChatMessages';
import ChatInput from '../components/ChatInput';
import { useChat } from '../hooks/use-chat';
import { updateUserSettings } from '../utils/storageUtils';
import { useToast } from '@/hooks/use-toast';

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
  const [userSettings, setUserSettings] = useState<UserSettingsType>(getUserSettingsFromStorage());
  const navigate = useNavigate();
  // Add this state to force re-renders
  const [forceUpdate, setForceUpdate] = useState(0);
  // Track if this is the first load
  const isInitialMount = useRef(true);
  const { toast } = useToast();

  const {
    showHistory,
    setShowHistory,
    chatHistory,
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
  } = useChat(userSettings);

  const getActiveTab = () => tabs.find(tab => tab.id === activeTabId);

  useEffect(() => {
    // Apply theme immediately on first load
    if (isInitialMount.current) {
      // First, disable all transitions
      document.documentElement.classList.add('disable-transitions');
      
      // Apply theme change
      if (userSettings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Re-enable transitions after a small delay
      setTimeout(() => {
        document.documentElement.classList.remove('disable-transitions');
      }, 1);
      
      isInitialMount.current = false;
      return;
    }
    
    // For subsequent theme changes
    // First, disable all transitions
    document.documentElement.classList.add('disable-transitions');
    
    // Apply theme change
    if (userSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Force a re-render of components that depend on theme
    setForceUpdate(prev => prev + 1);
    
    // Re-enable transitions after a small delay to ensure theme is applied
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('disable-transitions');
    }, 1);
    
    return () => clearTimeout(timer);
  }, [userSettings.darkMode]);

  // Listen for theme changes from other components
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      const { darkMode } = event.detail;
      if (darkMode !== userSettings.darkMode) {
        setUserSettings(prev => ({
          ...prev,
          darkMode
        }));
      }
    };
    
    window.addEventListener('themeChanged', handleThemeChange as EventListener);
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
    };
  }, [userSettings.darkMode]);

  useEffect(() => {
    const handleChatDeleted = (event: CustomEvent) => {
      const { chatId } = event.detail;
      handleDeleteChat(chatId);
    };
    
    window.addEventListener('chatDeleted', handleChatDeleted as EventListener);
    
    return () => {
      window.removeEventListener('chatDeleted', handleChatDeleted as EventListener);
    };
  }, [handleDeleteChat]);

  const handleEditMessage = (messageId: number, newText: string) => {
    if (messageId === -1) {
      setInputValue(newText);
      return;
    }

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
  };

  const handleReorderTabs = (newTabOrder: typeof tabs) => {
    setTabs(newTabOrder);
    localStorage.setItem('chatTabs', JSON.stringify(newTabOrder));
  };

  const goToSettings = () => {
    navigate('/settings');
  };

  const handleUpdateUserSettings = (newSettings: UserSettingsType) => {
    setUserSettings(newSettings);
    updateUserSettings(newSettings);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const handleOutsideClick = () => {
    if (showHistory) {
      setShowHistory(false);
    }
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
      {showHistory && (
        <>
          <div 
            className="fixed inset-0 z-9" 
            onClick={handleOutsideClick}
          />
          <ChatHistoryMenu 
            history={chatHistory} 
            onSelectChat={(chatId) => {
              setShowHistory(false);
              setActiveTabId(chatId);
            }} 
            onDeleteChat={handleDeleteChat} 
          />
        </>
      )}

      <div className="flex-1 flex flex-col bg-gray-100 dark:bg-zinc-950">
        <ChatHeader
          toggleHistory={toggleHistory}
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          onTabClose={handleTabClose}
          onNewTab={handleNewTab}
          onReorderTabs={handleReorderTabs}
          userSettings={userSettings}
          goToSettings={goToSettings}
        />

        <div className="flex-1 flex overflow-hidden relative">
          {activeTab.activePDF && (
            <div className="w-full md:w-1/2 border-r border-gray-200 dark:border-zinc-800/50 overflow-hidden">
              <PDFViewer 
                key={`pdf-${forceUpdate}`}
                pdfUrl={activeTab.activePDF} 
                darkMode={userSettings.darkMode} 
              />
            </div>
          )}

          <div className={`flex-1 flex flex-col ${activeTab.activePDF ? 'hidden md:flex md:w-1/2' : 'w-full'}`}>
            <ChatMessages
              key={`messages-${forceUpdate}`}
              activeTab={activeTab}
              darkMode={userSettings.darkMode}
              onEditMessage={handleEditMessage}
            />
            <ChatInput
              key={`input-${forceUpdate}`}
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
