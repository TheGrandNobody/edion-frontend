import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Block } from './types';

interface ExerciseBlockProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  darkMode: boolean;
  children: React.ReactNode;
}

const ExerciseBlock: React.FC<ExerciseBlockProps> = ({
  block,
  isSelected,
  onSelect,
  onDelete,
  darkMode,
  children
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg",
        "bg-white dark:bg-gray-900",
        "border border-gray-200 dark:border-gray-800",
        isSelected && "ring-2 ring-blue-500"
      )}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute -left-8 top-1/2 transform -translate-y-1/2",
          "p-1 rounded cursor-grab active:cursor-grabbing",
          "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
          "opacity-0 group-hover:opacity-100 transition-opacity"
        )}
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={cn(
          "absolute -right-8 top-1/2 transform -translate-y-1/2",
          "p-1 rounded",
          "text-gray-400 hover:text-red-500",
          "opacity-0 group-hover:opacity-100 transition-opacity"
        )}
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default ExerciseBlock; 