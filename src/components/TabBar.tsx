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
    const dropdownWidth = 32; // Width of the dropdown button
    
    let availableWidth = containerWidth - plusButtonWidth - 8;
    
    // Reduce by one more tab width (120px) compared to before
    // This ensures we show the dropdown earlier and there's always space for it
    const maxVisibleTabs = Math.max(1, Math.floor((availableWidth - dropdownWidth) / 120));
    
    if (maxVisibleTabs < tabs.length) {
      // Change the slice to take tabs from the beginning instead of the end
      setVisibleTabs(tabs.slice(0, maxVisibleTabs));
      setHiddenTabs(tabs.slice(maxVisibleTabs));
    } else {
      setVisibleTabs(tabs);
      setHiddenTabs([]);
    }
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

  return (
    <div 
      ref={containerRef}
      className="flex items-center w-full relative overflow-hidden"
    >
      <div
        ref={tabsRef}
        className={`flex items-center overflow-hidden flex-grow ${hiddenTabs.length > 0 ? 'px-8' : 'px-0'}`}
      >
        {visibleTabs.map((tab) => (
          <div
            key={tab.id}
            className={`group flex items-center justify-between w-full max-w-[120px] px-2 py-0.5 mx-1 rounded-lg cursor-pointer transition-colors ${
              activeTabId === tab.id
                ? 'bg-white/80 dark:bg-black shadow-sm dark:border dark:border-gray-800'
                : 'hover:bg-white/40 dark:hover:bg-gray-900/80'
            } ${draggedTabId === tab.id ? 'opacity-50' : ''} 
              ${draggedOverTabId === tab.id ? 'bg-blue-100/30 dark:bg-blue-900/30' : ''}`}
            onClick={() => onTabChange(tab.id)}
            draggable
            onDragStart={(e) => handleDragStart(e, tab.id)}
            onDragOver={(e) => handleDragOver(e, tab.id)}
            onDrop={(e) => handleDrop(e, tab.id)}
            onDragEnd={handleDragEnd}
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
      
      <div className="flex-none flex items-center">
        {hiddenTabs.length > 0 && (
          <div className="flex items-center z-10 mr-1">
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button 
                  className="p-1 hover:bg-white/40 dark:hover:bg-gray-800/80 rounded-lg flex-shrink-0 dark:text-white bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-1 border border-gray-200 dark:border-gray-800">
                {hiddenTabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`flex items-center justify-between space-x-2 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100/70 dark:hover:bg-gray-800/70 ${
                      draggedHiddenTabId === tab.id ? 'opacity-50' : ''
                    } ${draggedOverTabId === tab.id ? 'bg-blue-100/30 dark:bg-blue-900/30' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, tab.id, true)}
                    onDragOver={(e) => handleDragOver(e, tab.id)}
                    onDrop={(e) => handleDrop(e, tab.id)}
                    onDragEnd={handleDragEnd}
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
          </div>
        )}
        
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
