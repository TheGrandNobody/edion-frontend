import React, { useEffect, useRef } from 'react';
import { Send, Mic } from 'lucide-react';
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

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    const form = formRef.current;
    if (!textarea || !form) return;

    // Reset height to calculate proper scrollHeight
    textarea.style.height = '44px';
    
    // Calculate new height
    const newHeight = Math.min(Math.max(44, textarea.scrollHeight), 200);
    
    // Apply new heights
    textarea.style.height = `${newHeight}px`;
    form.style.height = `${newHeight + 8}px`;
  };

  // Adjust height on input value change
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  // Adjust height on window resize
  useEffect(() => {
    const handleResize = () => adjustTextareaHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="absolute bottom-6 left-0 right-0 px-3 sm:px-6">
      <div className="w-full mx-auto" style={{ maxWidth: 'min(100%, 800px)', width: '100%', padding: '0 4px', boxSizing: 'border-box' }}>
        <div className="bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800/50 backdrop-blur-md rounded-xl shadow-lg py-2">
          <form ref={formRef} onSubmit={onSubmit} className="relative h-11">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything"
              className="absolute inset-0 w-full px-4 pr-40 sm:pr-44 bg-transparent rounded-xl focus:outline-none text-sm text-gray-700 dark:text-gray-200 dark:placeholder-gray-400 resize-none overflow-hidden"
              style={{
                lineHeight: '20px',
                padding: '12px 16px',
                height: '44px',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap'
              }}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1.5 sm:space-x-2 bg-gradient-to-l from-white/90 dark:from-gray-900/90 via-white/90 dark:via-gray-900/90 to-transparent pl-8 pr-1 py-1.5 rounded-r-lg">
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
                  "p-1.5 sm:p-2 rounded-lg text-white flex items-center justify-center",
                  "bg-indigo-500 hover:bg-indigo-600 dark:bg-blue-500 dark:hover:bg-blue-600"
                )}
                disabled={!inputValue.trim()}
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput; 