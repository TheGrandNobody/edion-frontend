import React from 'react';
import { Plus, X } from 'lucide-react';
import { ChatTab } from '~/types';

interface TabBarProps {
  tabs: ChatTab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
  onNewTab,
}) => {
  return (
    <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`group flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg cursor-pointer transition-colors ${
            activeTabId === tab.id
              ? 'bg-white/80 dark:bg-gray-800/80 shadow-sm'
              : 'hover:bg-white/40 dark:hover:bg-gray-800/40'
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate max-w-[40px] sm:max-w-none">{tab.date}</span>
          <span className="text-xs sm:text-sm text-gray-900 dark:text-gray-200 truncate max-w-[80px] sm:max-w-[120px] md:max-w-[160px]">{tab.title}</span>
          <button
            className="p-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-100/70 dark:hover:bg-gray-700/70"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
          >
            <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      ))}
      <button
        className="p-1 hover:bg-white/40 dark:hover:bg-gray-800/40 rounded-lg flex-shrink-0"
        onClick={onNewTab}
      >
        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
      </button>
    </div>
  );
};

export default TabBar;