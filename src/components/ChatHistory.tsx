
import React from 'react';
import { Search, FileText, Dumbbell, GraduationCap, School, Trash2 } from 'lucide-react';
import { ChatHistoryItem } from '../types';
import { useToast } from "@/hooks/use-toast";

interface ChatHistoryMenuProps {
  history: ChatHistoryItem[];
  onSelectChat: (chatId: string) => void;
  onDeleteChat?: (chatId: string) => void;
}

const ChatHistoryMenu: React.FC<ChatHistoryMenuProps> = ({ history, onSelectChat, onDeleteChat }) => {
  const { toast } = useToast();

  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation(); // Prevent triggering the parent button's onClick
    
    if (onDeleteChat) {
      onDeleteChat(chatId);
      toast({
        title: "Chat deleted",
        description: "The chat has been removed from your history",
      });
    }
  };

  return (
    <div className="fixed inset-y-0 left-0 w-64 sm:w-80 bg-transparent backdrop-blur-xl z-10">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-white/30 dark:bg-gray-900/30" />

      {/* Content container */}
      <div className="relative h-full p-3 sm:p-4 flex flex-col overflow-hidden">
        {/* Search */}
        <div className="relative mb-4 sm:mb-6 mt-16">
          <input
            type="text"
            placeholder="Search anything"
            className="w-full px-3 sm:px-4 py-2 bg-white/30 dark:bg-gray-800/30 rounded-lg pl-9 sm:pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700 dark:text-gray-200 shadow-sm"
          />
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Scrollable content area with custom scrollbar styles */}
        <div className="overflow-y-auto flex-1 text-sm scrollbar-thin">
          {/* Categories */}
          <div className="space-y-3 sm:space-y-4">
            {/* Reports */}
            <div>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/30 dark:bg-gray-800/30 w-full text-gray-800 dark:text-gray-200">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-medium">Reports</span>
              </button>
              <div className="mt-1 sm:mt-2 space-y-1">
                <button className="w-full text-left px-3 py-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20 rounded transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                  Jossman Delft: March 2024
                </button>
                <button className="w-full text-left px-3 py-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20 rounded transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                  Rick Van Der Spiegel: March 2024
                </button>
              </div>
            </div>

            {/* Exercises */}
            <div>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/30 dark:bg-gray-800/30 w-full text-gray-800 dark:text-gray-200">
                <Dumbbell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-medium">Exercises</span>
              </button>
              <div className="mt-1 sm:mt-2 space-y-1">
                <button className="w-full text-left px-3 py-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20 rounded transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                  Math, Division, August
                </button>
                <button className="w-full text-left px-3 py-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20 rounded transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                  Science, Chemistry, Atom Structure, March
                </button>
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/30 dark:bg-gray-800/30 w-full text-gray-800 dark:text-gray-200">
                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-medium">Curriculum</span>
              </button>
              <div className="mt-1 sm:mt-2 space-y-1">
                <button className="w-full text-left px-3 py-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20 rounded transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                  World Affairs: Chapter 7
                </button>
                <button className="w-full text-left px-3 py-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20 rounded transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                  Social studies: Chapter 6
                </button>
              </div>
            </div>

            {/* Classroom */}
            <div>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/30 dark:bg-gray-800/30 w-full text-gray-800 dark:text-gray-200">
                <School className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-medium">Classroom</span>
              </button>
              <div className="mt-1 sm:mt-2 space-y-1">
                <button className="w-full text-left px-3 py-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20 rounded transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                  G Block
                </button>
                <button className="w-full text-left px-3 py-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-800/20 rounded transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                  A Block
                </button>
              </div>
            </div>
          </div>

          {/* Previous Chats */}
          <div className="mt-4 sm:mt-6 px-3">
            <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200 text-sm">
              Previous Chats
            </h3>
            <div className="space-y-2">
              {history.map((chat) => (
                <div
                  key={chat.id}
                  className="relative group"
                >
                  <button
                    className="w-full text-left py-2 px-2 rounded hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors"
                    onClick={() => onSelectChat(chat.id)}
                  >
                    <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
                      {chat.date}: {chat.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {chat.lastMessage}
                    </p>
                  </button>
                  
                  {/* Delete button - shown on hover or focus */}
                  {onDeleteChat && (
                    <button
                      className="absolute right-2 top-2 p-1.5 rounded-full bg-gray-100/70 dark:bg-gray-800/70 
                                text-gray-500 hover:text-red-500 dark:hover:text-red-400 
                                opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      onClick={(e) => handleDelete(e, chat.id)}
                      aria-label="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryMenu;
