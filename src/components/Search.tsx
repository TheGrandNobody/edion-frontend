import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { ChatHistoryItem, ChatTab } from '../types';
import { cn } from '@/lib/utils';
import FileUploadMenu from './FileUploadMenu';

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
        lastMessage: searchInput,
      };
      
      // Get existing chat history or initialize empty array
      const existingHistory = localStorage.getItem('chatHistory');
      let chatHistory: ChatHistoryItem[] = existingHistory ? JSON.parse(existingHistory) : [];
      
      // Add new chat to history (at the beginning)
      chatHistory = [newChat, ...chatHistory];
      
      // Save updated history
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
      
      // Create initial tab data
      const newTab: ChatTab = {
        id: newChatId,
        title: searchInput,
        date: formattedDate,
        messages: [
          {
            id: 1,
            text: searchInput,
            isUser: true,
          },
          {
            id: 2,
            text: "Hello! I'm here to help. What can I assist you with today?",
            isUser: false,
          }
        ],
        activePDF: null
      };
      
      // Store the new tab in localStorage so Chat component can find it
      const existingTabs = localStorage.getItem('chatTabs');
      let chatTabs: ChatTab[] = existingTabs ? JSON.parse(existingTabs) : [];
      
      // Add new tab to the end of the array instead of the beginning
      chatTabs = [...chatTabs, newTab];
      localStorage.setItem('chatTabs', JSON.stringify(chatTabs));
      
      // Navigate to chat page with the new chat ID
      navigate('/chat', { 
        state: { 
          selectedChatId: newChatId, 
          initialQuery: searchInput 
        } 
      });
    }
  };

  const handleFileSelect = (file: File) => {
    // Create a new chat for the file
    const newChatId = uuidv4();
    const now = new Date();
    const formattedDate = `${now.getDate()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    
    const newChat: ChatHistoryItem = {
      id: newChatId,
      title: `File: ${file.name}`,
      date: formattedDate,
      lastMessage: `Uploaded ${file.name}`,
    };
    
    // Get existing chat history or initialize empty array
    const existingHistory = localStorage.getItem('chatHistory');
    let chatHistory: ChatHistoryItem[] = existingHistory ? JSON.parse(existingHistory) : [];
    
    // Add new chat to history (at the beginning)
    chatHistory = [newChat, ...chatHistory];
    
    // Save updated history
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    
    // Create initial tab data
    const newTab: ChatTab = {
      id: newChatId,
      title: `File: ${file.name}`,
      date: formattedDate,
      messages: [
        {
          id: 1,
          text: `I've uploaded ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
          isUser: true,
        },
        {
          id: 2,
          text: "I'll analyze this file for you. What would you like to know about it?",
          isUser: false,
        }
      ],
      activePDF: null
    };
    
    // Store the new tab in localStorage so Chat component can find it
    const existingTabs = localStorage.getItem('chatTabs');
    let chatTabs: ChatTab[] = existingTabs ? JSON.parse(existingTabs) : [];
    
    // Add new tab to the end of the array instead of the beginning
    chatTabs = [...chatTabs, newTab];
    localStorage.setItem('chatTabs', JSON.stringify(chatTabs));
    
    // Navigate to chat page with the new chat ID
    navigate('/chat', { 
      state: { 
        selectedChatId: newChatId, 
        initialQuery: `Analyzing file: ${file.name}`
      } 
    });
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
          className={cn(
            "w-full px-4 py-2.5 sm:py-3 pr-24 rounded-lg text-sm",
            "bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm",
            "text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-400",
            "border border-transparent",
            "transition-all duration-200 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-blue-500",
            "focus:bg-white/90 dark:focus:bg-gray-800/90 focus:border-indigo-500/20 dark:focus:border-blue-500/20"
          )}
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
          
          <FileUploadMenu onFileSelect={handleFileSelect} />
          
          <button 
            type="submit" 
            className={cn(
              "p-1.5 sm:p-2 rounded-lg text-white",
              "bg-indigo-500 hover:bg-indigo-600 dark:bg-blue-500 dark:hover:bg-blue-600"
            )}
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
