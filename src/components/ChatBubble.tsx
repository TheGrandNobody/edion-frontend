
import React from 'react';
import { ChatMessage } from '../types';
import { useTheme } from '../hooks/useTheme';

interface ChatBubbleProps {
  message: ChatMessage;
  darkMode: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, darkMode }) => {
  const { isDarkMode } = useTheme();
  
  if (message.isUser) {
    return (
      <div className="flex justify-end space-x-2">
        <div
          className="max-w-[80%] bg-white dark:bg-gray-700 rounded-2xl p-3 sm:p-4 shadow-lg transform hover:scale-[1.01] transition-all duration-200"
          style={{
            boxShadow: darkMode
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2), 0 -2px 6px -2px rgba(255, 255, 255, 0.1) inset'
              : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1), 0 -2px 6px -2px rgba(255, 255, 255, 0.5) inset',
          }}
        >
          <p className="text-sm text-gray-900 dark:text-gray-100">
            {message.text}
          </p>
        </div>
        {/* User profile picture removed */}
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center shadow-md">
        <img
          src={isDarkMode ? '/logo-white-circle.png' : '/logo-black-circle.png'}
          alt="Chatbot Logo"
          className="w-full h-full object-cover"
        />
      </div>
      <div
        className="max-w-[80%] bg-white dark:bg-gray-700 rounded-2xl p-3 sm:p-4 shadow-lg transform hover:scale-[1.01] transition-all duration-200"
        style={{
          boxShadow: darkMode
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2), 0 -2px 6px -2px rgba(255, 255, 255, 0.1) inset'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1), 0 -2px 6px -2px rgba(255, 255, 255, 0.5) inset',
        }}
      >
        <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-line">
          {message.text}
        </p>
      </div>
    </div>
  );
};

export default ChatBubble;
