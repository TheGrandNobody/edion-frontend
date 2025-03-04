
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
  const [visibleTabs, setVisibleTabs] = useState<ChatTab[]>(tabs);
  const [hiddenTabs, setHiddenTabs] = useState<ChatTab[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const plusButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    // Force recalculation when tabs change
    setForceUpdate(prev => prev + 1);
  }, [tabs]);

  useEffect(() => {
    const calculateVisibleTabs = () => {
      if (!containerRef.current || !tabsRef.current || !plusButtonRef.current || tabs.length === 0) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      const plusButtonWidth = plusButtonRef.current.offsetWidth;
      const dropdownWidth = 32; // Width of dropdown button
      
      // Start with max available width
      let availableWidth = containerWidth - plusButtonWidth - 16; // 16px for some buffer
      
      // Create temporary divs to measure tab widths
      const tabWidths: number[] = [];
      const tabElements: HTMLDivElement[] = [];
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.visibility = 'hidden';
      tempContainer.style.display = 'flex';
      document.body.appendChild(tempContainer);
      
      // Create and measure each tab
      tabs.forEach((tab) => {
        const tempTab = document.createElement('div');
        tempTab.className = `group flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg`;
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate max-w-[40px] sm:max-w-none';
        dateSpan.textContent = tab.date;
        
        const titleSpan = document.createElement('span');
        titleSpan.className = 'text-xs sm:text-sm text-gray-900 dark:text-gray-200 truncate max-w-[80px] sm:max-w-[120px] md:max-w-[160px]';
        titleSpan.textContent = tab.title;
        
        const closeButton = document.createElement('button');
        closeButton.className = 'p-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-100/70 dark:hover:bg-gray-900';
        
        tempTab.appendChild(dateSpan);
        tempTab.appendChild(titleSpan);
        tempTab.appendChild(closeButton);
        tempContainer.appendChild(tempTab);
        
        tabElements.push(tempTab);
        tabWidths.push(tempTab.offsetWidth + 8); // 8px for margin
      });
      
      // Clean up temporary elements
      document.body.removeChild(tempContainer);
      
      // Calculate which tabs can be visible
      let accumulatedWidth = 0;
      let breakpoint = tabs.length;
      
      for (let i = 0; i < tabs.length; i++) {
        if (accumulatedWidth + tabWidths[i] > availableWidth - (i < tabs.length - 1 ? dropdownWidth : 0)) {
          breakpoint = i;
          break;
        }
        accumulatedWidth += tabWidths[i];
      }
      
      if (breakpoint < tabs.length) {
        // We need the dropdown, so reduce available width
        availableWidth -= dropdownWidth;
        
        // Recalculate breakpoint with dropdown taking space
        accumulatedWidth = 0;
        breakpoint = tabs.length;
        
        for (let i = 0; i < tabs.length; i++) {
          if (accumulatedWidth + tabWidths[i] > availableWidth) {
            breakpoint = i;
            break;
          }
          accumulatedWidth += tabWidths[i];
        }
        
        setVisibleTabs(tabs.slice(0, breakpoint));
        setHiddenTabs(tabs.slice(breakpoint));
      } else {
        // All tabs fit
        setVisibleTabs(tabs);
        setHiddenTabs([]);
      }
    };
    
    // Initial calculation
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
      className="flex items-center space-x-1 sm:space-x-2 w-full"
    >
      <div
        ref={tabsRef}
        className="flex items-center space-x-1 sm:space-x-2 overflow-hidden"
      >
        {visibleTabs.map((tab) => (
          <div
            key={tab.id}
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
      </div>
      
      {hiddenTabs.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              ref={dropdownRef}
              className="p-1 hover:bg-white/40 dark:hover:bg-gray-800/80 rounded-lg flex-shrink-0 dark:text-white"
            >
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
        ref={plusButtonRef}
        className="p-1 hover:bg-white/40 dark:hover:bg-gray-900/80 rounded-lg flex-shrink-0"
        onClick={onNewTab}
      >
        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
      </button>
    </div>
  );
};

export default TabBar;
