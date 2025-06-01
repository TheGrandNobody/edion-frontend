import React from 'react';
import { useSlate } from 'slate-react';
import { Editor, Transforms, Element as SlateElement } from 'slate';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, IndentIncrease, IndentDecrease, Table, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { CustomElement, CustomText, TextAlign } from './types';

interface SlateToolbarProps {
  showRawLatex: boolean;
  toggleRawLatex: () => void;
  onInsertMath: () => void;
  onInsertTable: (rows: number, cols: number) => void;
}

const SlateToolbar: React.FC<SlateToolbarProps> = ({
  showRawLatex,
  toggleRawLatex,
  onInsertMath,
  onInsertTable
}) => {
  const editor = useSlate();

  // Check if a mark is active
  const isMarkActive = (format: keyof CustomText) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  };

  // Check if a block is active
  const isBlockActive = (format: string, blockType = 'type') => {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: n =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          (n as any)[blockType] === format,
      })
    );

    return !!match;
  };

  // Check if alignment is active
  const isAlignActive = (align: TextAlign) => {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: n =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          (n as any).align === align,
      })
    );

    return !!match;
  };

  // Toggle mark
  const toggleMark = (format: keyof CustomText) => {
    const isActive = isMarkActive(format);
    
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  // Set alignment
  const setAlignment = (align: TextAlign) => {
    Transforms.setNodes(
      editor,
      { align } as Partial<CustomElement>,
      { match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
    );
  };

  // Remove alignment
  const removeAlignment = () => {
    Transforms.unsetNodes(
      editor,
      'align',
      { match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
    );
  };

  // Handle alignment button click
  const handleAlignClick = (align: TextAlign) => {
    if (isAlignActive(align)) {
      removeAlignment();
    } else {
      setAlignment(align);
    }
  };

  // Insert list
  const insertList = (listType: 'bulleted-list' | 'numbered-list') => {
    const isActive = isBlockActive(listType);
    
    if (isActive) {
      // Convert back to paragraph
      Transforms.setNodes(
        editor,
        { type: 'paragraph' } as Partial<CustomElement>,
        { match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
      );
    } else {
      // Wrap in list
      const listItem = { type: 'list-item' as const, children: [] };
      const list = { type: listType, children: [listItem] };
      
      Transforms.wrapNodes(editor, list as CustomElement);
      Transforms.setNodes(
        editor,
        { type: 'list-item' } as Partial<CustomElement>
      );
    }
  };

  // Handle indentation
  const handleIndent = (direction: 'indent' | 'outdent') => {
    const { selection } = editor;
    if (!selection) return;

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: selection,
        match: n => SlateElement.isElement(n) && (n as CustomElement).type === 'list-item',
      })
    );

    if (match) {
      const [node] = match;
      const listItem = node as CustomElement;
      const currentLevel = (listItem as any).indentLevel || 0;
      
      let newLevel = currentLevel;
      if (direction === 'indent') {
        newLevel = Math.min(20, currentLevel + 1);
      } else {
        newLevel = Math.max(0, currentLevel - 1);
      }

      Transforms.setNodes(
        editor,
        { indentLevel: newLevel } as Partial<CustomElement>,
        { at: match[1] }
      );
    }
  };

  // Insert math
  const insertMath = (display: boolean) => {
    const mathElement: CustomElement = {
      type: 'math' as const,
      formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
      display,
      children: [{ text: '' }]
    };

    Transforms.insertNodes(editor, mathElement);
  };

  // Insert table
  const insertTable = () => {
    const rows = 3;
    const cols = 3;
    
    const tableRows = [];
    
    // Header row
    const headerCells = Array(cols).fill(null).map((_, j) => ({
      type: 'table-cell' as const,
      header: true,
      children: [{ text: `Header ${j + 1}` }]
    }));
    tableRows.push({ type: 'table-row' as const, children: headerCells });
    
    // Data rows
    for (let i = 0; i < rows - 1; i++) {
      const cells = Array(cols).fill(null).map(() => ({
        type: 'table-cell' as const,
        header: false,
        children: [{ text: 'Cell' }]
      }));
      tableRows.push({ type: 'table-row' as const, children: cells });
    }

    const table: CustomElement = {
      type: 'table' as const,
      rows,
      cols,
      children: tableRows
    };

    Transforms.insertNodes(editor, table);
    
    // Insert paragraph after table
    Transforms.insertNodes(editor, {
      type: 'paragraph' as const,
      children: [{ text: '' }]
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 p-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-zinc-600 pr-2">
          <Button
            variant={isMarkActive('bold') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => toggleMark('bold')}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            variant={isMarkActive('italic') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => toggleMark('italic')}
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button
            variant={isMarkActive('underline') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => toggleMark('underline')}
            className="h-8 w-8 p-0"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-zinc-600 pr-2">
          <Button
            variant={isAlignActive('left') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleAlignClick('left')}
            className="h-8 w-8 p-0"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant={isAlignActive('center') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleAlignClick('center')}
            className="h-8 w-8 p-0"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          
          <Button
            variant={isAlignActive('right') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleAlignClick('right')}
            className="h-8 w-8 p-0"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-zinc-600 pr-2">
          <Button
            variant={isBlockActive('bulleted-list') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => insertList('bulleted-list')}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button
            variant={isBlockActive('numbered-list') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => insertList('numbered-list')}
            className="h-8 w-8 p-0"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        {/* Indentation */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-zinc-600 pr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleIndent('outdent')}
            className="h-8 w-8 p-0"
          >
            <IndentDecrease className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleIndent('indent')}
            className="h-8 w-8 p-0"
          >
            <IndentIncrease className="h-4 w-4" />
          </Button>
        </div>

        {/* Math & Table */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-zinc-600 pr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMath(false)}
            className="h-8 px-2 text-xs"
          >
            ∫ Math
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMath(true)}
            className="h-8 px-2 text-xs"
          >
            ∫ Block
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={insertTable}
            className="h-8 w-8 p-0"
          >
            <Table className="h-4 w-4" />
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1">
          <Button
            variant={showRawLatex ? 'default' : 'ghost'}
            size="sm"
            onClick={toggleRawLatex}
            className="h-8 px-3 text-xs"
          >
            {showRawLatex ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {showRawLatex ? 'WYSIWYG' : 'LaTeX'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SlateToolbar; 