
import React, { forwardRef } from 'react';
import { Download, Pencil, RefreshCw } from 'lucide-react';
import { useChatContext } from '../contexts/ChatContext';
import ChatBubble from './ChatBubble';

interface ChatMessagesProps {
  containerRef?: React.Ref<HTMLDivElement>;
}

const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  (props, ref) => {
    const { getActiveTab, handleEditMessage, generatePDF, activeTabId, setInputValue } = useChatContext();
    const activeTab = getActiveTab();

    if (!activeTab) {
      return null;
    }

    return (
      <div 
        ref={ref}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-28"
      >
        <div className="w-full mx-auto" style={{ maxWidth: 'min(100%, 800px)', width: '100%', padding: '0 4px', boxSizing: 'border-box' }}>
          {activeTab.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Welcome to EduChat</h2>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
                I'm your AI assistant ready to help with teaching tasks, creating reports, and answering questions.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                <button
                  onClick={() => setInputValue("Generate a student progress report")}
                  className="p-3 text-left rounded-lg bg-white/80 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
                >
                  <span className="text-gray-800 dark:text-gray-200">Generate a student progress report</span>
                </button>
                <button
                  onClick={() => setInputValue("Help me create a lesson plan for 5th grade science")}
                  className="p-3 text-left rounded-lg bg-white/80 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
                >
                  <span className="text-gray-800 dark:text-gray-200">Create a lesson plan for 5th grade science</span>
                </button>
              </div>
            </div>
          ) : (
            activeTab.messages.map((message, index) => (
              <div 
                key={message.id} 
                className="mb-6"
              >
                <ChatBubble 
                  message={message} 
                  darkMode={useChatContext().userSettings.darkMode} 
                  onEditMessage={message.isUser ? handleEditMessage : undefined}
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
                    <button 
                      onClick={() => generatePDF(activeTabId)}
                      className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 dark:bg-gray-900 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm backdrop-blur-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Regenerate report</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
);

ChatMessages.displayName = 'ChatMessages';

export default ChatMessages;
