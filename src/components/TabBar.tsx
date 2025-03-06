
import React, { useEffect, useRef, useState } from 'react';
import { Plus, X, ChevronRight } from 'lucide-react';
import { ChatTab } from '../types';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

interface TabBarProps {
  tabs: ChatTab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
  onReorderTabs?: (newOrder: ChatTab[]) => void;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
  onNewTab,
  onReorderTabs,
}) => {
  const [visibleTabs, setVisibleTabs] = useState<ChatTab[]>([]);
  const [hiddenTabs, setHiddenTabs] = useState<ChatTab[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const plusButtonRef = useRef<HTMLButtonElement>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [draggedOverTabId, setDraggedOverTabId] = useState<string | null>(null);
  const [draggedHiddenTabId, setDraggedHiddenTabId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [preventTabClick, setPreventTabClick] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [tabs]);

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
    const dropdownWidth = 32; 
    
    let availableWidth = containerWidth - plusButtonWidth - dropdownWidth - 16; 
    
    const maxVisibleTabs = Math.max(1, Math.floor(availableWidth / 120));
    
    setIsTransitioning(true);
    
    if (maxVisibleTabs < tabs.length) {
      setVisibleTabs(tabs.slice(0, maxVisibleTabs));
      setHiddenTabs(tabs.slice(maxVisibleTabs));
    } else {
      setVisibleTabs(tabs);
      setHiddenTabs([]);
    }
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    calculateVisibleTabs();
    
    window.addEventListener('resize', calculateVisibleTabs);
    
    return () => {
      window.removeEventListener('resize', calculateVisibleTabs);
    };
  }, [tabs, forceUpdate]);

  const handleDragStart = (e: React.DragEvent, tabId: string, isHidden: boolean = false) => {
    e.stopPropagation();
    
    e.dataTransfer.setData('text/plain', tabId);
    e.dataTransfer.effectAllowed = 'move';
    
    const ghostElement = document.createElement('div');
    ghostElement.style.width = '1px';
    ghostElement.style.height = '1px';
    document.body.appendChild(ghostElement);
    e.dataTransfer.setDragImage(ghostElement, 0, 0);
    
    if (isHidden) {
      setDraggedHiddenTabId(tabId);
    } else {
      setDraggedTabId(tabId);
    }
    
    setTimeout(() => document.body.removeChild(ghostElement), 0);
  };

  const handleDragOver = (e: React.DragEvent, tabId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDraggedOverTabId(tabId);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDraggedOverTabId(null);
    
    const draggedId = e.dataTransfer.getData('text/plain') || draggedTabId || draggedHiddenTabId;
    
    if (!draggedId || draggedId === targetTabId) {
      setDraggedTabId(null);
      setDraggedHiddenTabId(null);
      return;
    }
    
    const newTabs = [...tabs];
    
    const draggedIndex = newTabs.findIndex(tab => tab.id === draggedId);
    const targetIndex = newTabs.findIndex(tab => tab.id === targetTabId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedTabId(null);
      setDraggedHiddenTabId(null);
      return;
    }
    
    const [movedTab] = newTabs.splice(draggedIndex, 1);
    newTabs.splice(targetIndex, 0, movedTab);
    
    if (onReorderTabs) {
      onReorderTabs(newTabs);
    }
    
    setDraggedTabId(null);
    setDraggedHiddenTabId(null);
  };

  const handleDragEnd = () => {
    setDraggedTabId(null);
    setDraggedHiddenTabId(null);
    setDraggedOverTabId(null);
  };

  const handleTabClick = (tabId: string) => {
    if (preventTabClick || isTransitioning) return;
    onTabChange(tabId);
    // Close dropdown when a tab is selected from it
    setDropdownOpen(false);
  };

  const handleTabClose = (tabId: string, isHiddenTab: boolean = false) => {
    if (isHiddenTab && hiddenTabs.length === 1) {
      setDropdownOpen(false);
    }
    
    onTabClose(tabId);
  };

  const isActiveTabHidden = () => {
    return hiddenTabs.some(tab => tab.id === activeTabId);
  };

  return (
    <div 
      ref={containerRef}
      className="flex items-center w-full relative overflow-hidden"
    >
      <div
        ref={tabsRef}
        className={cn(
          "flex items-center overflow-hidden flex-grow",
          isTransitioning && "pointer-events-none"
        )}
      >
        {visibleTabs.map((tab, index) => (
          <div
            key={tab.id}
            className={cn(
              "group relative flex items-center justify-between w-full max-w-[120px] px-2 py-0.5 mx-1 rounded-lg cursor-pointer transition-colors",
              activeTabId === tab.id
                ? "text-gray-900 dark:text-gray-100 before:absolute before:left-0 before:bottom-0 before:h-[3px] before:w-full before:bg-blue-500 dark:before:bg-blue-400 before:rounded-full before:transform before:rotate-[-1deg]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
              draggedTabId === tab.id && "opacity-50",
              draggedOverTabId === tab.id && "bg-blue-100/30 dark:bg-blue-900/30",
              index < visibleTabs.length - 1 && "after:absolute after:right-[-4px] after:top-1/2 after:h-2/3 after:w-px after:bg-gray-200 after:dark:bg-gray-700 after:transform after:rotate-[-15deg] after:translate-y-[-50%]"
            )}
            onClick={() => handleTabClick(tab.id)}
            draggable
            onDragStart={(e) => handleDragStart(e, tab.id)}
            onDragOver={(e) => handleDragOver(e, tab.id)}
            onDrop={(e) => handleDrop(e, tab.id)}
            onDragEnd={handleDragEnd}
          >
            <div className="flex-grow overflow-hidden">
              <div className="flex flex-col">
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{tab.date}</span>
                <span className={cn(
                  "text-xs truncate", 
                  activeTabId === tab.id ? "font-semibold" : "font-medium"
                )}>
                  {tab.title}
                </span>
              </div>
            </div>
            <button
              className="p-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-100/70 dark:hover:bg-gray-900"
              onClick={(e) => {
                e.stopPropagation();
                handleTabClose(tab.id);
              }}
            >
              <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex-none flex items-center">
        <div className={`mr-1 ${!hiddenTabs.length && 'invisible'}`}>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button 
                className={cn(
                  "p-1 rounded-lg flex-shrink-0 transition-colors duration-200",
                  isActiveTabHidden() 
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/60" 
                    : "hover:bg-gray-100/70 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-300"
                )}
              >
                <ChevronRight className={cn(
                  "w-4 h-4",
                  isActiveTabHidden() && "animate-pulse"
                )} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              sideOffset={5}
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-1 border border-gray-200 dark:border-gray-800 w-[220px] max-h-[300px] overflow-y-auto"
            >
              {hiddenTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={cn(
                    "flex items-center justify-between space-x-2 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100/70 dark:hover:bg-gray-800/70",
                    activeTabId === tab.id && "bg-gray-100/50 dark:bg-gray-800/50 font-medium border-l-2 border-blue-500 dark:border-blue-400",
                    draggedHiddenTabId === tab.id && "opacity-50",
                    draggedOverTabId === tab.id && "bg-blue-100/30 dark:bg-blue-900/30"
                  )}
                  onClick={() => handleTabClick(tab.id)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, tab.id, true)}
                  onDragOver={(e) => handleDragOver(e, tab.id)}
                  onDrop={(e) => handleDrop(e, tab.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">{tab.date}</span>
                    <span className="text-sm truncate max-w-[150px]">{tab.title}</span>
                  </div>
                  <button
                    className="p-1 rounded-full hover:bg-gray-200/70 dark:hover:bg-gray-700/70"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTabClose(tab.id, true);
                    }}
                  >
                    <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <button
          ref={plusButtonRef}
          className="p-1 hover:bg-gray-100/70 dark:hover:bg-gray-800/80 rounded-lg flex-shrink-0 text-gray-700 dark:text-gray-300"
          onClick={() => {
            setPreventTabClick(true);
            onNewTab();
            setTimeout(() => setPreventTabClick(false), 300);
          }}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default TabBar;
