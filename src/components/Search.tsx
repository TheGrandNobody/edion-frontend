
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Paperclip, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      // Navigate to chat page with the query as state
      navigate('/chat', { state: { initialQuery: searchInput } });
    }
  };

  return (
    <motion.div 
      className="w-full max-w-xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
    >
      <form onSubmit={handleSubmit} className="search-input flex items-center">
        <div className="flex items-center gap-2 text-muted-foreground mr-2">
          <button 
            type="button" 
            className="focus:outline-none hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            aria-label="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <button 
            type="button" 
            className="focus:outline-none hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            aria-label="Voice input"
          >
            <Mic className="h-5 w-5" />
          </button>
        </div>
        <input
          type="text"
          placeholder="What can I help you with, Julia?"
          className="flex-1 placeholder-gray-400 w-full bg-transparent border-none focus:outline-none"
          aria-label="Search box"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button 
          type="submit" 
          className="focus:outline-none"
          aria-label="Submit search"
        >
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </form>
    </motion.div>
  );
};

export default Search;
