import React from 'react';
import { Calculator, Image, ListChecks } from 'lucide-react';
import { cn } from "@/lib/utils";

interface BlockTypePopoverProps {
  onSelect: (type: string) => void;
  darkMode: boolean;
}

const BlockTypePopover: React.FC<BlockTypePopoverProps> = ({ onSelect, darkMode }) => {
  const blockTypes = [
    {
      type: 'math',
      icon: Calculator,
      label: 'Equation block',
      description: 'Add a block equation'
    },
    {
      type: 'diagram',
      icon: Image,
      label: 'Diagram',
      description: 'Add a diagram or figure'
    },
    {
      type: 'multiple-choice',
      icon: ListChecks,
      label: 'Multiple choice',
      description: 'Add a multiple choice question'
    }
  ];

  return (
    <div className={cn(
      "absolute left-0 mt-1 w-64 rounded-lg shadow-lg",
      "bg-white dark:bg-gray-900",
      "border border-gray-200/80 dark:border-gray-800/50",
      "divide-y divide-gray-200/80 dark:divide-gray-800/50",
      "z-50"
    )}>
      {blockTypes.map(blockType => (
        <button
          key={blockType.type}
          onClick={() => onSelect(blockType.type)}
          className={cn(
            "w-full flex items-start p-3 space-x-3",
            "hover:bg-gray-50/50 dark:hover:bg-gray-800/50",
            "text-left transition-colors"
          )}
        >
          <blockType.icon className="w-5 h-5 mt-0.5 text-gray-600 dark:text-gray-300" />
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {blockType.label}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {blockType.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default BlockTypePopover; 