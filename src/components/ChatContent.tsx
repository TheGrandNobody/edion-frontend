
import React, { useRef } from 'react';
import { Download, Pencil, RefreshCw } from 'lucide-react';
import ChatBubble from './ChatBubble';
import PDFViewer from './PDFViewer';
import { ChatTab } from '../types';

interface ChatContentProps {
  activeTab: ChatTab;
  userSettings: {
    darkMode: boolean;
  };
}

const ChatContent: React.FC<ChatContentProps> = ({ activeTab, userSettings }) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* PDF Viewer */}
      {activeTab.activePDF && (
        <div className="w-full md:w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-hidden">
          <PDFViewer pdfUrl={activeTab.activePDF} darkMode={userSettings.darkMode} />
        </div>
      )}

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${activeTab.activePDF ? 'hidden md:flex md:w-1/2' : 'w-full'}`}>
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6"
        >
          <div className="w-full mx-auto" style={{ maxWidth: 'min(100%, 800px)', width: '100%', padding: '0 4px', boxSizing: 'border-box' }}>
            {activeTab.messages.map((message) => (
              <div 
                key={message.id} 
                className="mb-6"
              >
                <ChatBubble message={message} darkMode={userSettings.darkMode} />
                {message.pdfUrl && !message.isUser && (
                  <div className="ml-10 mt-2 flex flex-wrap gap-2">
                    <button className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 dark:bg-gray-700/70 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm backdrop-blur-sm">
                      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                      <span>Download</span>
                    </button>
                    <button className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 dark:bg-gray-700/70 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm backdrop-blur-sm">
                      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                      <span>Edit</span>
                    </button>
                    <button className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 dark:bg-gray-700/70 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm backdrop-blur-sm">
                      <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
                      <span>Regenerate report</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContent;
