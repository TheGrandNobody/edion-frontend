import React, { useEffect, useRef, useState } from 'react';
import { Send, Mic, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import FileUploadMenu from './FileUploadMenu';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ChatInput: React.FC<ChatInputProps> = React.memo(({ inputValue, setInputValue, onSubmit }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);

  const INITIAL_HEIGHT = 120;
  const EXPANDED_HEIGHT = Math.round(window.innerHeight * 0.6);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (textareaRef.current && formRef.current) {
      const newHeight = !isExpanded ? EXPANDED_HEIGHT : INITIAL_HEIGHT;
      textareaRef.current.style.height = `${newHeight}px`;
      formRef.current.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const checkOverflow = () => {
      textarea.style.height = `${INITIAL_HEIGHT}px`;
      const shouldShowExpand = textarea.scrollHeight > INITIAL_HEIGHT;
      setShowExpandButton(shouldShowExpand);
      
      const newHeight = isExpanded ? EXPANDED_HEIGHT : INITIAL_HEIGHT;
      textarea.style.height = `${newHeight}px`;
      
      if (formRef.current) {
        formRef.current.style.height = `${newHeight}px`;
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [inputValue, isExpanded]);

  return (
    <div className="absolute bottom-6 left-0 right-0 px-3 sm:px-6">
      {showExpandButton && (
        <button
          onClick={toggleExpand}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10 p-1 rounded-full bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800/50 shadow-sm hover:bg-white dark:hover:bg-gray-800 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      )}
      <div className="w-full mx-auto" style={{ maxWidth: 'min(100%, 800px)', width: '100%', padding: '0 4px', boxSizing: 'border-box' }}>
        <div className="bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800/50 backdrop-blur-md rounded-xl shadow-lg py-2">
          <form ref={formRef} onSubmit={onSubmit} className="relative overflow-hidden">
            <div className="flex">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask anything"
                  className={cn(
                    "w-full bg-transparent rounded-xl",
                    "focus:outline-none text-sm",
                    "text-gray-700 dark:text-gray-200",
                    "placeholder:text-gray-400 dark:placeholder-gray-400",
                    "resize-none",
                    "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600",
                    "scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500",
                    "transition-all duration-200 ease-in-out",
                    "pr-[68px]"
                  )}
                  style={{
                    lineHeight: '20px',
                    padding: '12px 12px 12px 16px',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    overflowY: 'auto',
                    height: `${isExpanded ? EXPANDED_HEIGHT : INITIAL_HEIGHT}px`,
                    width: 'calc(100% - 64px)'
                  }}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      onSubmit(e);
                    }
                  }}
                />
              </div>
              <div className="flex flex-col bg-gradient-to-l from-white/90 dark:from-zinc-950/95 via-white/90 dark:via-zinc-950/95 to-transparent p-3 mb-2.5" style={{ 
                minWidth: '52px', 
                justifyContent: 'space-evenly',
                height: `${INITIAL_HEIGHT}px`,
                position: 'absolute',
                right: 0,
                bottom: 0
              }}>
                <button
                  type="button"
                  className="p-1.5 sm:p-2 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 rounded-lg text-gray-500 dark:text-gray-400 backdrop-blur-sm flex items-center justify-center"
                >
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                
                <FileUploadMenu />
                
                <button
                  type="submit"
                  className={cn(
                    "p-2 rounded-full aspect-square text-white flex items-center justify-center",
                    "bg-indigo-500 hover:bg-indigo-600 dark:bg-blue-500 dark:hover:bg-blue-600"
                  )}
                  disabled={!inputValue.trim()}
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput; 