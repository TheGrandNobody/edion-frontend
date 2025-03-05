
import React, { useEffect, useRef, useState } from 'react';
import { Plus, X, ChevronLeft } from 'lucide-react';
import { ChatTab } from '../types';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [visibleTabs, setVisibleTabs] = useState<ChatTab[]>([]);
  const [hiddenTabs, setHiddenTabs] = useState<ChatTab[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const plusButtonRef = useRef<HTMLButtonElement>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Force recalculation when tabs change
    setForceUpdate(prev => prev + 1);
  }, [tabs]);

  // Run the calculation on component mount
  useEffect(() => {
    if (tabs.length > 0 && !isInitialized) {
      calculateVisibleTabs();
      setIsInitialized(true);
    }
  }, [tabs, isInitialized]);

  const calculateVisibleTabs = () => {
    if (!containerRef.current || !plusButtonRef.current || tabs.length === 0) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const plusButtonWidth = plusButtonRef.current.offsetWidth;
    const dropdownWidth = 32; // Width of chevron button
    
    // Reserve space for plus button and a bit of padding
    let availableWidth = containerWidth - plusButtonWidth - 8; 
    
    // Always subtract the dropdown width to ensure a consistent layout
    // This prevents layout shifts when the chevron appears/disappears
    availableWidth -= dropdownWidth;
    
    // Calculate how many tabs we can fit
    // We want all tabs to be the same width
    const maxVisibleTabs = Math.max(1, Math.floor(availableWidth / 120)); // Each tab is 120px wide
    
    if (maxVisibleTabs < tabs.length) {
      // Show the most recent tabs
      setVisibleTabs(tabs.slice(tabs.length - maxVisibleTabs));
      setHiddenTabs(tabs.slice(0, tabs.length - maxVisibleTabs));
    } else {
      // All tabs fit
      setVisibleTabs(tabs);
      setHiddenTabs([]);
    }
  };

  // Use useEffect to run the calculation when needed
  useEffect(() => {
    calculateVisibleTabs();
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateVisibleTabs);
    
    return () => {
      window.removeEventListener('resize', calculateVisibleTabs);
    };
  }, [tabs, forceUpdate]);

  return (
    <div 
      ref={containerRef}
      className="flex items-center w-full relative overflow-hidden"
    >
      {/* Chevron dropdown positioned absolutely */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center">
        {hiddenTabs.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="p-1 hover:bg-white/40 dark:hover:bg-gray-800/80 rounded-lg flex-shrink-0 dark:text-white bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-1 border border-gray-200 dark:border-gray-800">
              {hiddenTabs.map((tab) => (
                <div
                  key={tab.id}
                  className="flex items-center justify-between space-x-2 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100/70 dark:hover:bg-gray-800/70"
                  onClick={() => onTabChange(tab.id)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">{tab.date}</span>
                    <span className="text-sm text-gray-900 dark:text-gray-200 truncate max-w-[150px]">{tab.title}</span>
                  </div>
                  <button
                    className="p-1 rounded-full hover:bg-gray-200/70 dark:hover:bg-gray-700/70"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTabClose(tab.id);
                    }}
                  >
                    <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {/* Add padding to the left to make space for the chevron */}
      <div
        ref={tabsRef}
        className="flex items-center overflow-hidden flex-grow px-8"
      >
        {visibleTabs.map((tab) => (
          <div
            key={tab.id}
            className={`group flex items-center justify-between w-full max-w-[120px] px-2 py-0.5 mx-1 rounded-lg cursor-pointer transition-colors ${
              activeTabId === tab.id
                ? 'bg-white/80 dark:bg-black shadow-sm dark:border dark:border-gray-800'
                : 'hover:bg-white/40 dark:hover:bg-gray-900/80'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <div className="flex-grow overflow-hidden">
              <div className="flex flex-col">
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{tab.date}</span>
                <span className="text-xs text-gray-900 dark:text-gray-200 truncate">{tab.title}</span>
              </div>
            </div>
            <button
              className="p-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-100/70 dark:hover:bg-gray-900"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
            >
              <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex-none">
        <button
          ref={plusButtonRef}
          className="p-1 hover:bg-white/40 dark:hover:bg-gray-900/80 rounded-lg flex-shrink-0"
          onClick={onNewTab}
        >
          <Plus className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );
};

export default TabBar;
