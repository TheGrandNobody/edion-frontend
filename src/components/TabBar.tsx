
import React, { useEffect, useRef, useState } from 'react';
import { Plus, X, ChevronRight } from 'lucide-react';
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
  const tabsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Reset refs array when tabs change
    tabsRef.current = tabsRef.current.slice(0, tabs.length);
    
    // Calculate which tabs should be visible and which should be hidden
    const calculateVisibleTabs = () => {
      if (!containerRef.current || tabs.length === 0) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      const newPlusButtonWidth = 32; // Approximate width of the plus button
      const chevronWidth = 32; // Approximate width of chevron button
      
      let availableWidth = containerWidth - newPlusButtonWidth - 8; // Subtract some padding
      const newVisibleTabs: ChatTab[] = [];
      const newHiddenTabs: ChatTab[] = [];
      
      let needsChevron = false;
      
      // First pass to see if we need the chevron
      let totalWidth = 0;
      for (let i = 0; i < tabs.length; i++) {
        const tabElement = tabsRef.current[i];
        const tabWidth = tabElement?.offsetWidth || 0;
        totalWidth += tabWidth;
      }
      
      if (totalWidth > availableWidth) {
        needsChevron = true;
        availableWidth -= chevronWidth; // Reserve space for chevron
      }
      
      // Second pass to actually calculate visible tabs
      let accumulatedWidth = 0;
      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        const tabElement = tabsRef.current[i];
        const tabWidth = tabElement?.offsetWidth || 0;
        
        if (accumulatedWidth + tabWidth <= availableWidth) {
          newVisibleTabs.push(tab);
          accumulatedWidth += tabWidth;
        } else {
          newHiddenTabs.push(tab);
        }
      }
      
      setVisibleTabs(newVisibleTabs);
      setHiddenTabs(newHiddenTabs);
    };
    
    // Initial calculation
    setTimeout(calculateVisibleTabs, 100);
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateVisibleTabs);
    
    return () => {
      window.removeEventListener('resize', calculateVisibleTabs);
    };
  }, [tabs]);

  return (
    <div 
      ref={containerRef}
      className="flex items-center space-x-1 sm:space-x-2 overflow-x-hidden"
    >
      {visibleTabs.map((tab, index) => (
        <div
          key={tab.id}
          ref={(el) => (tabsRef.current[index] = el)}
          className={`group flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg cursor-pointer transition-colors ${
            activeTabId === tab.id
              ? 'bg-white/80 dark:bg-black shadow-sm dark:border dark:border-gray-800'
              : 'hover:bg-white/40 dark:hover:bg-gray-900/80'
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate max-w-[40px] sm:max-w-none">{tab.date}</span>
          <span className="text-xs sm:text-sm text-gray-900 dark:text-gray-200 truncate max-w-[80px] sm:max-w-[120px] md:max-w-[160px]">{tab.title}</span>
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
      
      {hiddenTabs.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-white/40 dark:hover:bg-gray-800/80 rounded-lg flex-shrink-0 dark:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-1 border border-gray-200 dark:border-gray-800">
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
      
      <button
        className="p-1 hover:bg-white/40 dark:hover:bg-gray-900/80 rounded-lg flex-shrink-0"
        onClick={onNewTab}
      >
        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
      </button>
    </div>
  );
};

export default TabBar;
