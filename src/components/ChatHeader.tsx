import React, { useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatTab, UserSettings } from '../types';
import TabBar from './TabBar';
import UserMenu from './UserMenu';

interface ChatHeaderProps {
  toggleHistory: () => void;
  tabs: ChatTab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
  onReorderTabs: (newOrder: ChatTab[]) => void;
  userSettings: UserSettings;
  goToSettings: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  toggleHistory,
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
  onNewTab,
  onReorderTabs,
  userSettings,
  goToSettings,
}) => {
  const [localUserSettings, setLocalUserSettings] = useState<UserSettings>(userSettings);

  // Update local state when props change
  React.useEffect(() => {
    setLocalUserSettings(userSettings);
  }, [userSettings]);

  return (
    <div className="navbar-container sticky top-0 z-10 flex items-center justify-between px-2 sm:px-4 py-3 bg-transparent">
      <button
        className="p-2 hover:bg-white/40 dark:hover:bg-gray-900 rounded-lg text-gray-700 dark:text-gray-200 flex items-center justify-center"
        onClick={toggleHistory}
      >
        <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      
      <div className="flex-1 bg-white/60 dark:bg-black/60 backdrop-blur-md rounded-lg shadow-lg p-1.5 mx-2 border border-gray-200/10 dark:border-gray-800/40">
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={onTabChange}
          onTabClose={onTabClose}
          onNewTab={onNewTab}
          onReorderTabs={onReorderTabs}
        />
      </div>
      
      <div className="ml-3">
        <UserMenu 
          userSettings={localUserSettings} 
          setUserSettings={(newSettings: UserSettings) => {
            setLocalUserSettings(newSettings);
            // Propagate changes up to the parent component
            if (newSettings.darkMode !== userSettings.darkMode) {
              // This will trigger the theme change in the parent
              window.dispatchEvent(new CustomEvent('themeChanged', { 
                detail: { darkMode: newSettings.darkMode, timestamp: Date.now() }
              }));
            }
          }} 
        />
      </div>
    </div>
  );
};

export default ChatHeader; 