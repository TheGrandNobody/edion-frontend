import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from "@/lib/utils";
import { Block, Exercise, TextBlock, MathBlock, MultipleChoiceBlock, DiagramBlock } from './types';
import TextBlockEditor from './blocks/TextBlockEditor';
import MathBlockEditor from './blocks/MathBlockEditor';
import MultipleChoiceBlockEditor from './blocks/MultipleChoiceBlockEditor';
import DiagramBlockEditor from './blocks/DiagramBlockEditor';
import ExerciseBlock from './ExerciseBlock';
import EditorToolbar from './EditorToolbar';

interface ExerciseEditorProps {
  exercise: Exercise;
  onChange: (exercise: Exercise) => void;
  darkMode?: boolean;
}

const ExerciseEditor: React.FC<ExerciseEditorProps> = ({
  exercise,
  onChange,
  darkMode = false
}) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = exercise.blocks.findIndex((block) => block.id === active.id);
      const newIndex = exercise.blocks.findIndex((block) => block.id === over.id);
      
      const newBlocks = [...exercise.blocks];
      const [removed] = newBlocks.splice(oldIndex, 1);
      newBlocks.splice(newIndex, 0, removed);
      
      onChange({
        ...exercise,
        blocks: newBlocks
      });
    }
  };

  const handleAddBlock = (type: Block['type'], index?: number) => {
    let newBlock: Block;

    switch (type) {
      case 'text':
        newBlock = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'text',
          content: [{ type: 'paragraph', children: [{ text: '' }] }]
        } as TextBlock;
        break;
      case 'math':
        newBlock = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'math',
          content: '',
          displayMode: true
        } as MathBlock;
        break;
      case 'multiple-choice':
        newBlock = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'multiple-choice',
          choices: []
        } as MultipleChoiceBlock;
        break;
      case 'diagram':
        newBlock = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'diagram',
          imageUrl: null,
          caption: ''
        } as DiagramBlock;
        break;
      default:
        throw new Error(`Unsupported block type: ${type}`);
    }

    const newBlocks = [...exercise.blocks];
    if (typeof index === 'number') {
      newBlocks.splice(index + 1, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }

    onChange({
      ...exercise,
      blocks: newBlocks
    });
  };

  const handleUpdateBlock = (id: string, updates: Partial<Block>) => {
    onChange({
      ...exercise,
      blocks: exercise.blocks.map(block =>
        block.id === id
          ? {
              ...block,
              ...(updates as typeof block)
            }
          : block
      )
    });
  };

  const handleDeleteBlock = (id: string) => {
    onChange({
      ...exercise,
      blocks: exercise.blocks.filter(block => block.id !== id)
    });
  };

  const renderBlockEditor = (block: Block) => {
    const commonProps = {
      darkMode,
      key: block.id
    };

    switch (block.type) {
      case 'text':
        return (
          <TextBlockEditor
            {...commonProps}
            content={block.content}
            onChange={content => handleUpdateBlock(block.id, { content })}
            onAddBlock={(type: Block['type']) => handleAddBlock(type, exercise.blocks.indexOf(block))}
          />
        );
      case 'math':
        return (
          <MathBlockEditor
            {...commonProps}
            content={block.content}
            displayMode={block.displayMode}
            onChange={updates => handleUpdateBlock(block.id, updates)}
          />
        );
      case 'multiple-choice':
        return (
          <MultipleChoiceBlockEditor
            {...commonProps}
            choices={block.choices}
            onChange={choices => handleUpdateBlock(block.id, { choices })}
          />
        );
      case 'diagram':
        return (
          <DiagramBlockEditor
            {...commonProps}
            imageUrl={block.imageUrl}
            caption={block.caption}
            onChange={updates => handleUpdateBlock(block.id, updates)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Input */}
      <input
        type="text"
        value={exercise.title}
        onChange={(e) => onChange({ ...exercise, title: e.target.value })}
        className={cn(
          "w-full px-4 py-2 text-xl font-medium rounded-lg",
          "bg-white dark:bg-gray-900",
          "border border-gray-200 dark:border-gray-800",
          "text-gray-900 dark:text-gray-100",
          "focus:outline-none focus:ring-2 focus:ring-blue-500"
        )}
        placeholder="Enter exercise title..."
      />

      {/* Toolbar */}
      <EditorToolbar onAddBlock={handleAddBlock} darkMode={darkMode} />

      {/* Blocks */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={exercise.blocks.map(b => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {exercise.blocks.map(block => (
              <ExerciseBlock
                key={block.id}
                block={block}
                isSelected={block.id === selectedBlockId}
                onSelect={() => setSelectedBlockId(block.id)}
                onDelete={() => handleDeleteBlock(block.id)}
                darkMode={darkMode}
              >
                {renderBlockEditor(block)}
              </ExerciseBlock>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Block Button */}
      <div className="opacity-50 hover:opacity-100 transition-opacity">
        <EditorToolbar onAddBlock={handleAddBlock} darkMode={darkMode} />
      </div>
    </div>
  );
};

export default ExerciseEditor; 