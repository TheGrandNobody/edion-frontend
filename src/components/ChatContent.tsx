
import React, { useRef } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import PDFViewer from './PDFViewer';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

const ChatContent: React.FC = () => {
  const { getActiveTab, userSettings } = useChatContext();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const activeTab = getActiveTab();

  if (!activeTab) {
    return null;
  }

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {activeTab.activePDF && (
        <div className="w-full md:w-1/2 border-r border-gray-200 dark:border-gray-800 overflow-hidden">
          <PDFViewer pdfUrl={activeTab.activePDF} darkMode={userSettings.darkMode} />
        </div>
      )}

      <div className={`flex-1 flex flex-col ${activeTab.activePDF ? 'hidden md:flex md:w-1/2' : 'w-full'}`}>
        <ChatMessages containerRef={chatContainerRef} />
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatContent;
