
import React from 'react';
import { Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TabBar from './TabBar';
import { ChatTab } from '../types';

interface ChatHeaderProps {
  tabs: ChatTab[];
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  handleTabClose: (id: string) => void;
  handleNewTab: () => void;
  setShowHistory: (show: boolean) => void;
  showHistory: boolean;
  setShowSettings: (show: boolean) => void;
  userProfilePicture: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  tabs,
  activeTabId,
  setActiveTabId,
  handleTabClose,
  handleNewTab,
  setShowHistory,
  showHistory,
  setShowSettings,
  userProfilePicture,
}) => {
  return (
    <div className="navbar-container sticky top-0 z-10 flex items-center justify-between px-2 sm:px-4 py-3 bg-transparent">
      {/* Menu Button - Now floating directly on the background */}
      <button
        className="p-1.5 sm:p-2 hover:bg-white/40 dark:hover:bg-gray-800/40 rounded-lg bg-white/60 dark:bg-gray-900/60 backdrop-blur-md shadow-lg mr-3 transform hover:scale-105 transition-all duration-200"
        onClick={() => setShowHistory(!showHistory)}
      >
        <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-200" />
      </button>
      
      {/* Tab Bar - Now floating directly on the background */}
      <div className="flex-1 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-lg shadow-lg p-1.5 mx-2">
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          onTabClose={handleTabClose}
          onNewTab={handleNewTab}
        />
      </div>
      
      {/* Profile Button */}
      <button
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0 shadow-lg ml-3 transform hover:scale-105 transition-all duration-200"
        onClick={() => setShowSettings(true)}
      >
        <Avatar>
          <AvatarImage src={userProfilePicture} alt="Profile" />
          <AvatarFallback>JS</AvatarFallback>
        </Avatar>
      </button>
    </div>
  );
};

export default ChatHeader;
