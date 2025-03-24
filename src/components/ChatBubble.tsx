import React, { useState, memo, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { Pencil, Check, X, Copy, CheckCheck } from 'lucide-react';
import { cn } from "@/lib/utils";

// Add keyframes for fade-in animation
const styleTag = document.createElement('style');
styleTag.textContent = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.2s ease-out forwards;
  }
`;
document.head.appendChild(styleTag);

// Keep track of last copied message ID
let lastCopiedMessageId: number | null = null;

interface ChatBubbleProps {
  message: ChatMessage;
  darkMode: boolean;
  onEditMessage?: (messageId: number, newText: string) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, darkMode, onEditMessage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const iconRef = useRef<HTMLImageElement>(null);

  // Check if this message was the last copied one
  useEffect(() => {
    setIsCopied(lastCopiedMessageId === message.id);
  }, [message.id, lastCopiedMessageId]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editText, isEditing]);

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setForceUpdate(prev => prev + 1);
      
      if (iconRef.current) {
        const currentSrc = iconRef.current.src;
        iconRef.current.src = '';
        setTimeout(() => {
          if (iconRef.current) {
            iconRef.current.src = darkMode ? '/black_on_white.svg' : '/white_on_black.svg';
          }
        }, 10);
      }
    };
    
    window.addEventListener('themeChanged', handleThemeChange as EventListener);
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
    };
  }, [darkMode]);

  useEffect(() => {
    if (iconRef.current) {
      iconRef.current.src = darkMode ? '/black_on_white.svg' : '/white_on_black.svg';
    }
  }, [darkMode]);

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      lastCopiedMessageId = message.id;
      setIsCopied(true);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  if (message.isUser) {
    return (
      <div className="flex flex-col items-end space-y-1">
        <div
          className={cn(
            "max-w-[80%] bg-white dark:bg-gray-900 rounded-2xl p-3 sm:p-4 transform transition-transform duration-200 relative",
            !isEditing && "hover:scale-[1.01]"
          )}
          style={{
            boxShadow: `
              0 1px 2px -1px rgba(0, 0, 0, 0.08),
              0 2px 4px -1px rgba(0, 0, 0, 0.08),
              0 4px 8px -2px rgba(0, 0, 0, 0.08),
              0 -1px 2px 0 rgba(255, 255, 255, 0.05) inset
            `
          }}
        >
          {isEditing ? (
            <div className="flex flex-col space-y-2">
              <textarea
                ref={textareaRef}
                className={cn(
                  "text-sm text-gray-900 dark:text-gray-100 bg-gray-50/50 dark:bg-gray-800/50",
                  "border border-gray-200 dark:border-gray-700 rounded-lg p-2",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/20",
                  "resize-none min-h-[60px] w-full transition-all duration-200"
                )}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                style={{ height: 'auto' }}
              />
              <div className="flex justify-end items-center space-x-2 text-xs">
                <span className="text-gray-500 dark:text-gray-400 mr-2">
                  Press Esc to cancel, Enter to save
                </span>
                <button
                  onClick={handleCancel}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="p-1 rounded-full bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/40 text-blue-600 dark:text-blue-400 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleCopy}
              className="w-full text-left cursor-pointer group/message relative"
              title={isCopied ? "Copied!" : "Click to copy"}
            >
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-line break-words overflow-wrap-anywhere hyphens-auto">
                {message.text}
              </p>
            </button>
          )}
          {isCopied && (
            <div className="absolute text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1 animate-fade-in" style={{ top: '100%' }}>
              Copied
            </div>
          )}
        </div>
        {!isEditing && (
          <div className="flex space-x-1">
            <button
              onClick={handleCopy}
              className={cn(
                "p-1 rounded-full",
                "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
                "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
                "transition-colors duration-200",
                isCopied && "text-green-500 dark:text-green-400"
              )}
              title={isCopied ? "Copied!" : "Copy message"}
            >
              {isCopied ? (
                <CheckCheck className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
            {onEditMessage && (
              <button
                onClick={() => setIsEditing(true)}
                className={cn(
                  "p-1 rounded-full",
                  "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
                  "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
                  "transition-colors duration-200"
                )}
                title="Edit message"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-black dark:bg-white" />
        <img
          ref={iconRef}
          key={`chatbot-icon-${darkMode}-${forceUpdate}`}
          src={darkMode ? '/black_on_white.svg' : '/white_on_black.svg'}
          alt="Chatbot Logo"
          className="w-full h-full object-contain relative z-10"
          style={{
            filter: darkMode ? 
              'drop-shadow(0 1px 2px rgba(255, 255, 255, 0.1))' : 
              'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
          }}
        />
      </div>
      <div className="flex flex-col space-y-1">
        <div
          className="max-w-[80%] bg-white dark:bg-zinc-900 rounded-2xl p-3 sm:p-4 transform hover:scale-[1.01] relative"
          style={{
            boxShadow: darkMode ?
              `
                0 1px 2px -1px rgba(0, 0, 0, 0.15),
                0 2px 4px -1px rgba(0, 0, 0, 0.15),
                0 4px 8px -2px rgba(0, 0, 0, 0.15),
                0 -1px 2px 0 rgba(255, 255, 255, 0.05) inset
              ` :
              `
                0 1px 2px -1px rgba(0, 0, 0, 0.08),
                0 2px 4px -1px rgba(0, 0, 0, 0.08),
                0 4px 8px -2px rgba(0, 0, 0, 0.08),
                0 -1px 2px 0 rgba(255, 255, 255, 0.05) inset
              `
          }}
        >
          <button
            onClick={handleCopy}
            className="w-full text-left cursor-pointer group/message relative"
            title={isCopied ? "Copied!" : "Click to copy"}
          >
            <p className="text-sm text-gray-900 dark:text-zinc-100 whitespace-pre-line break-words overflow-wrap-anywhere hyphens-auto">
              {message.text}
            </p>
          </button>
          {isCopied && (
            <div className="absolute text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1 animate-fade-in" style={{ top: '100%' }}>
              Copied
            </div>
          )}
        </div>
        <div className="flex space-x-1 ml-1">
          <button
            onClick={handleCopy}
            className={cn(
              "p-1 rounded-full",
              "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
              "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
              "transition-colors duration-200",
              isCopied && "text-green-500 dark:text-green-400"
            )}
            title={isCopied ? "Copied!" : "Copy message"}
          >
            {isCopied ? (
              <CheckCheck className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(ChatBubble);