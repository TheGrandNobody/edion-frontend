import React, { useEffect, useRef, memo } from 'react';
import { Download, Pencil, RefreshCw } from 'lucide-react';
import { ChatTab } from '../types';
import ChatBubble from './ChatBubble';

interface ChatMessagesProps {
  activeTab: ChatTab;
  darkMode: boolean;
  onEditMessage: (messageId: number, newText: string) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = memo(({ activeTab, darkMode, onEditMessage }) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeTab.messages]);

  return (
    <div 
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-28"
    >
      <div className="w-full mx-auto" style={{ maxWidth: 'min(100%, 800px)', width: '100%', padding: '0 4px', boxSizing: 'border-box' }}>
        {activeTab.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10">
            <div className="mb-6">
              <div className="flex items-center justify-center theme-change-immediate">
                <div className="logo-container theme-change-immediate">
                  <div className="flex items-center theme-change-immediate">
                    <img 
                      src={darkMode ? "/white_on_trans.svg" : "/black_on_trans.svg"}
                      alt="edion logo" 
                      className="h-16 w-auto mr-2 theme-change-immediate" 
                    />
                    <span className="text-4xl font-light tracking-wider theme-change-immediate bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">edion</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full max-w-lg mx-auto mb-6">
              <div className="w-full px-4 py-2.5 pr-4 bg-gray-50/80 dark:bg-gray-800/80 rounded-lg text-sm text-gray-700 dark:text-gray-200 shadow-sm backdrop-blur-sm flex items-center justify-between">
                <span className="text-gray-400 dark:text-gray-500">What can I help you with today?</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              <button
                onClick={() => onEditMessage(-1, "Generate a student progress report")}
                className="p-3 text-left rounded-lg bg-white/80 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
              >
                <span className="text-gray-800 dark:text-gray-200">Generate a student progress report</span>
              </button>
              <button
                onClick={() => onEditMessage(-1, "Help me create a lesson plan for 5th grade science")}
                className="p-3 text-left rounded-lg bg-white/80 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
              >
                <span className="text-gray-800 dark:text-gray-200">Create a lesson plan for 5th grade science</span>
              </button>
            </div>
          </div>
        ) : (
          activeTab.messages.map((message) => (
            <div 
              key={`${message.id}-${darkMode}`}
              className="mb-6"
            >
              <ChatBubble 
                message={message} 
                darkMode={darkMode} 
                onEditMessage={message.isUser ? onEditMessage : undefined}
              />
              {message.pdfUrl && !message.isUser && (
                <div className="ml-10 mt-2 flex flex-wrap gap-2">
                  <button className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 dark:bg-gray-900 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm backdrop-blur-sm">
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Download</span>
                  </button>
                  <button className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 dark:bg-gray-900 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm backdrop-blur-sm">
                    <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Edit</span>
                  </button>
                  <button className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 dark:bg-gray-900 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm backdrop-blur-sm">
                    <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Regenerate report</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.darkMode === nextProps.darkMode &&
         prevProps.activeTab.id === nextProps.activeTab.id &&
         prevProps.activeTab.messages === nextProps.activeTab.messages;
});

export default ChatMessages; 