import React from 'react';
import { Calculator, Image, ListChecks } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Block } from './types';

interface EditorToolbarProps {
  onAddBlock: (type: Block['type']) => void;
  darkMode: boolean;
  className?: string;
}

const tools = [
  {
    type: 'text' as const,
    icon: Calculator,
    label: 'Text block',
    description: 'Add a text block with rich formatting'
  },
  {
    type: 'math' as const,
    icon: Calculator,
    label: 'Equation block',
    description: 'Add a block equation'
  },
  {
    type: 'multiple-choice' as const,
    icon: ListChecks,
    label: 'Multiple choice',
    description: 'Add a multiple choice question'
  },
  {
    type: 'diagram' as const,
    icon: Image,
    label: 'Diagram',
    description: 'Add a diagram or figure'
  }
];

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onAddBlock,
  darkMode,
  className
}) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {tools.map(tool => (
        <button
          key={tool.type}
          onClick={() => onAddBlock(tool.type)}
          className={cn(
            "flex items-center space-x-2 px-3 py-1.5 rounded-lg",
            "bg-white dark:bg-gray-900",
            "border border-gray-200 dark:border-gray-800",
            "hover:bg-gray-50 dark:hover:bg-gray-800",
            "text-gray-600 dark:text-gray-300"
          )}
          title={tool.description}
        >
          <tool.icon className="w-4 h-4" />
          <span className="text-sm">{tool.label}</span>
        </button>
      ))}
    </div>
  );
};

export default EditorToolbar; 