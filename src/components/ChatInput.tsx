
import React, { useRef } from 'react';
import { Send, Mic, Paperclip } from 'lucide-react';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  setInputValue,
  handleSubmit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileName = file.name;
      setInputValue(`I'm attaching ${fileName} for reference.`);
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-white/70 dark:bg-gray-900/70 border-t border-gray-200 dark:border-gray-700 backdrop-blur-md">
      <div className="w-full mx-auto" style={{ maxWidth: 'min(100%, 800px)', width: '100%', padding: '0 4px', boxSizing: 'border-box' }}>
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything"
            className="w-full px-4 py-2.5 sm:py-3 pr-32 bg-gray-50/80 dark:bg-gray-800/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700 dark:text-gray-200 dark:placeholder-gray-400 shadow-sm backdrop-blur-sm"
          />
          <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 sm:space-x-2">
            <button
              type="button"
              className="p-1.5 sm:p-2 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 rounded-lg text-gray-500 dark:text-gray-400 backdrop-blur-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
              />
            </button>
            <button
              type="button"
              className="p-1.5 sm:p-2 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 rounded-lg text-gray-500 dark:text-gray-400 backdrop-blur-sm"
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            </button>
            <button
              type="submit"
              className="p-1.5 sm:p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
