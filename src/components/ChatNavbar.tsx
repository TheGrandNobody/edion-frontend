
import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TabBar from './TabBar';
import { useChatContext } from '../contexts/ChatContext';
import { useNavigate } from 'react-router-dom';

const ChatNavbar: React.FC = () => {
  const { 
    showHistory, 
    setShowHistory, 
    tabs, 
    activeTabId, 
    setActiveTabId, 
    handleTabClose, 
    handleNewTab, 
    handleReorderTabs,
    userSettings
  } = useChatContext();
  
  const navigate = useNavigate();

  return (
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
          onReorderTabs={handleReorderTabs}
        />
      </div>
      
      <button
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0 shadow-lg ml-3"
        onClick={() => navigate('/settings')}
      >
        <Avatar>
          <AvatarImage src={userSettings.profilePicture} alt={userSettings.fullName} />
          <AvatarFallback>{userSettings.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
      </button>
    </div>
  );
};

export default ChatNavbar;
