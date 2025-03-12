
import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { Pencil, Check, X } from 'lucide-react';

interface ChatBubbleProps {
  message: ChatMessage;
  darkMode: boolean;
  onEditMessage?: (messageId: number, newText: string) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, darkMode, onEditMessage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);

  const handleEditSubmit = () => {
    if (onEditMessage && editText.trim() !== '') {
      onEditMessage(message.id, editText);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setEditText(message.text);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(message.text);
    setIsEditing(false);
  };

  if (message.isUser) {
    return (
      <div className="flex justify-end space-x-2">
        <div
          className="max-w-[80%] bg-white dark:bg-gray-900 rounded-2xl p-3 sm:p-4 shadow-lg transform hover:scale-[1.01] transition-all duration-200"
          style={{
            boxShadow: darkMode
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2), 0 -2px 6px -2px rgba(255, 255, 255, 0.03) inset'
              : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1), 0 -2px 6px -2px rgba(255, 255, 255, 0.5) inset',
          }}
        >
          {isEditing ? (
            <div className="flex flex-col space-y-2">
              <textarea
                className="text-sm text-gray-900 dark:text-gray-100 bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={Math.min(5, editText.split('\n').length + 1)}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCancel}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Check className="w-4 h-4 text-green-500" />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-line break-words overflow-wrap-anywhere hyphens-auto">
                {message.text}
              </p>
              {onEditMessage && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute top-0 right-0 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-opacity"
                >
                  <Pencil className="w-3 h-3 text-gray-500" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-800 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-md">
        <img
          src='/white_on_black.svg'
          alt="Chatbot Logo"
          className="w-full h-full object-cover"
        />
      </div>
      <div
        className="max-w-[80%] bg-white dark:bg-gray-900 rounded-2xl p-3 sm:p-4 shadow-lg transform hover:scale-[1.01] transition-all duration-200"
        style={{
          boxShadow: darkMode
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2), 0 -2px 6px -2px rgba(255, 255, 255, 0.03) inset'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1), 0 -2px 6px -2px rgba(255, 255, 255, 0.5) inset',
        }}
      >
        <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-line break-words overflow-wrap-anywhere hyphens-auto">
          {message.text}
        </p>
      </div>
    </div>
  );
};

export default ChatBubble;
