
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Search = () => {
  return (
    <motion.div 
      className="w-full max-w-xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
    >
      <div className="search-input flex items-center">
        <input
          type="text"
          placeholder="What can I help you with, Julia?"
          className="placeholder-gray-400"
          aria-label="Search box"
        />
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </motion.div>
  );
};

export default Search;
