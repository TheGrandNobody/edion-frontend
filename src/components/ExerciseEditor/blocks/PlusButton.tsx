import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useClickAway } from '@/hooks/useClickAway';
import BlockTypePopover from './BlockTypePopover';

interface PlusButtonProps {
  onAddBlock: (type: string) => void;
  darkMode: boolean;
}

const PlusButton: React.FC<PlusButtonProps> = ({ onAddBlock, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickAway(containerRef, () => setIsOpen(false));

  const handleSelect = (type: string) => {
    onAddBlock(type);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-center",
          "w-6 h-6 rounded-full",
          "bg-gray-100 dark:bg-gray-800",
          "hover:bg-gray-200 dark:hover:bg-gray-700",
          "transition-colors"
        )}
      >
        <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>
      {isOpen && (
        <BlockTypePopover
          onSelect={handleSelect}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default PlusButton; 