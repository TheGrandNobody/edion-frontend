
import React from 'react';
import { Send, Mic, Paperclip } from 'lucide-react';
import { useChatContext } from '../contexts/ChatContext';
import { cn } from "@/lib/utils";

const ChatInput: React.FC = () => {
  const { inputValue, setInputValue, handleSubmit } = useChatContext();

  return (
    <div className="absolute bottom-6 left-0 right-0 px-3 sm:px-6">
      <div className="w-full mx-auto" style={{ maxWidth: 'min(100%, 800px)', width: '100%', padding: '0 4px', boxSizing: 'border-box' }}>
        <div className="bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800/50 backdrop-blur-md rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything"
              className="w-full px-4 py-3 sm:py-3.5 pr-24 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-blue-500 text-sm text-gray-700 dark:text-gray-200 dark:placeholder-gray-400 resize-none overflow-hidden"
              rows={Math.min(5, inputValue.split('\n').length + 1)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 sm:space-x-2">
              <button
                type="button"
                className="p-1.5 sm:p-2 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 rounded-lg text-gray-500 dark:text-gray-400 backdrop-blur-sm"
              >
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                className="p-1.5 sm:p-2 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 rounded-lg text-gray-500 dark:text-gray-400 backdrop-blur-sm"
              >
                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="submit"
                className={cn(
                  "p-1.5 sm:p-2 rounded-lg text-white",
                  "bg-indigo-500 hover:bg-indigo-600 dark:bg-blue-500 dark:hover:bg-blue-600"
                )}
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
