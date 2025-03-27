import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from "@/lib/utils";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface MultipleChoiceBlockEditorProps {
  choices: Choice[];
  onChange: (choices: Choice[]) => void;
  darkMode: boolean;
}

const SortableChoice = ({ choice, onUpdate, onDelete, darkMode }: {
  choice: Choice;
  onUpdate: (id: string, updates: Partial<Choice>) => void;
  onDelete: (id: string) => void;
  darkMode: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: choice.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center space-x-3 p-3 rounded-lg",
        "bg-white dark:bg-gray-900",
        "border border-gray-200 dark:border-gray-800"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      
      <input
        type="checkbox"
        checked={choice.isCorrect}
        onChange={(e) => onUpdate(choice.id, { isCorrect: e.target.checked })}
        className={cn(
          "h-4 w-4 rounded",
          "border-gray-300 dark:border-gray-600",
          "text-blue-600 dark:text-blue-400",
          "focus:ring-blue-500 dark:focus:ring-blue-400"
        )}
      />
      
      <input
        type="text"
        value={choice.text}
        onChange={(e) => onUpdate(choice.id, { text: e.target.value })}
        placeholder="Enter choice text..."
        className={cn(
          "flex-1 px-2 py-1 rounded",
          "bg-transparent",
          "border border-gray-200 dark:border-gray-800",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
          "text-gray-900 dark:text-gray-100"
        )}
      />
      
      <button
        onClick={() => onDelete(choice.id)}
        className={cn(
          "p-1 rounded-lg",
          "text-gray-400 hover:text-red-500",
          "hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

const MultipleChoiceBlockEditor: React.FC<MultipleChoiceBlockEditorProps> = ({
  choices,
  onChange,
  darkMode
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = choices.findIndex((choice) => choice.id === active.id);
      const newIndex = choices.findIndex((choice) => choice.id === over.id);
      
      const newChoices = [...choices];
      const [removed] = newChoices.splice(oldIndex, 1);
      newChoices.splice(newIndex, 0, removed);
      
      onChange(newChoices);
    }
  };

  const handleUpdate = (id: string, updates: Partial<Choice>) => {
    const newChoices = choices.map(choice =>
      choice.id === id ? { ...choice, ...updates } : choice
    );
    onChange(newChoices);
  };

  const handleDelete = (id: string) => {
    onChange(choices.filter(choice => choice.id !== id));
  };

  const handleAdd = () => {
    const newChoice: Choice = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      isCorrect: false
    };
    onChange([...choices, newChoice]);
  };

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={choices.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {choices.map(choice => (
            <SortableChoice
              key={choice.id}
              choice={choice}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              darkMode={darkMode}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        onClick={handleAdd}
        className={cn(
          "flex items-center space-x-2 px-4 py-2 rounded-lg w-full",
          "bg-gray-50 dark:bg-gray-800",
          "hover:bg-gray-100 dark:hover:bg-gray-700",
          "border border-gray-200 dark:border-gray-800",
          "text-gray-600 dark:text-gray-300"
        )}
      >
        <Plus className="w-4 h-4" />
        <span>Add Choice</span>
      </button>
    </div>
  );
};

export default MultipleChoiceBlockEditor; 