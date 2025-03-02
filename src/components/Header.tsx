
import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  return (
    <motion.header 
      className="w-full flex justify-between items-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors duration-200">
        <LayoutGrid className="w-5 h-5" />
      </button>
      
      <Avatar className="h-10 w-10 transition-transform duration-200 hover:scale-105">
        <AvatarImage src="https://github.com/shadcn.png" alt="User" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    </motion.header>
  );
};

export default Header;
