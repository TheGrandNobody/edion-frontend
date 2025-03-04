
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Paperclip, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { ChatHistoryItem } from '../types';

const Search = () => {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      // Create a new chat history item
      const newChatId = uuidv4();
      const now = new Date();
      const formattedDate = `${now.getDate()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
      
      const newChat: ChatHistoryItem = {
        id: newChatId,
        title: searchInput,
        date: formattedDate,
        lastMessage: 'New conversation started.',
      };
      
      // Get existing chat history or initialize empty array
      const existingHistory = localStorage.getItem('chatHistory');
      let chatHistory: ChatHistoryItem[] = existingHistory ? JSON.parse(existingHistory) : [];
      
      // Add new chat to history
      chatHistory = [newChat, ...chatHistory];
      
      // Save updated history
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
      
      // Navigate to chat page with the new chat ID
      navigate('/chat', { state: { selectedChatId: newChatId, initialQuery: searchInput } });
    }
  };

  return (
    <motion.div 
      className="w-full max-w-xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
    >
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          placeholder="What can I help you with, Julia?"
          className="w-full px-4 py-2.5 sm:py-3 pr-24 bg-gray-50/80 dark:bg-gray-800/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700 dark:text-gray-200 dark:placeholder-gray-400 shadow-sm backdrop-blur-sm"
          aria-label="Search box"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 sm:space-x-2">
          <button 
            type="button" 
            className="p-1.5 sm:p-2 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 rounded-lg text-gray-500 dark:text-gray-400 backdrop-blur-sm"
            aria-label="Voice input"
          >
            <Mic className="h-4 w-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            type="button" 
            className="p-1.5 sm:p-2 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 rounded-lg text-gray-500 dark:text-gray-400 backdrop-blur-sm"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            type="submit" 
            className="p-1.5 sm:p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
            aria-label="Submit search"
          >
            <ArrowRight className="h-4 w-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default Search;
