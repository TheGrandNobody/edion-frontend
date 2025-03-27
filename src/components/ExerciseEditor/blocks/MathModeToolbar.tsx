import React from 'react';
import { Editor, Range, Transforms } from 'slate';
import { cn } from "@/lib/utils";

interface MathModeToolbarProps {
  editor: Editor;
  darkMode: boolean;
}

const MathModeToolbar: React.FC<MathModeToolbarProps> = ({ editor, darkMode }) => {
  const insertMathSymbol = (symbol: string) => {
    if (editor.selection) {
      Transforms.insertText(editor, symbol);
    }
  };

  const insertFraction = () => {
    if (editor.selection) {
      const { anchor, focus } = editor.selection;
      if (Range.isCollapsed(editor.selection)) {
        Transforms.insertText(editor, '\\frac{}{}');
        // Move cursor to first bracket
        Transforms.move(editor, { distance: 2, reverse: true });
      } else {
        const selectedText = Editor.string(editor, editor.selection);
        Transforms.insertText(editor, `\\frac{${selectedText}}{}`);
        // Move cursor to second bracket
        Transforms.move(editor, { distance: 1 });
      }
    }
  };

  const insertSuperscript = () => {
    if (editor.selection) {
      const { anchor, focus } = editor.selection;
      if (Range.isCollapsed(editor.selection)) {
        Transforms.insertText(editor, '^{}');
        // Move cursor inside brackets
        Transforms.move(editor, { distance: 1, reverse: true });
      } else {
        const selectedText = Editor.string(editor, editor.selection);
        Transforms.insertText(editor, `^{${selectedText}}`);
      }
    }
  };

  const insertSubscript = () => {
    if (editor.selection) {
      const { anchor, focus } = editor.selection;
      if (Range.isCollapsed(editor.selection)) {
        Transforms.insertText(editor, '_{}');
        // Move cursor inside brackets
        Transforms.move(editor, { distance: 1, reverse: true });
      } else {
        const selectedText = Editor.string(editor, editor.selection);
        Transforms.insertText(editor, `_{${selectedText}}`);
      }
    }
  };

  return (
    <div className={cn(
      "flex items-center space-x-1 p-1 rounded-lg",
      "bg-gray-50/50 dark:bg-gray-800/50",
      "border border-gray-200/80 dark:border-gray-800/50"
    )}>
      {/* Basic operators */}
      <button
        onClick={() => insertMathSymbol('+')}
        className="p-1.5 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 rounded text-gray-600 dark:text-gray-300"
      >
        +
      </button>
      <button
        onClick={() => insertMathSymbol('-')}
        className="p-1.5 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 rounded text-gray-600 dark:text-gray-300"
      >
        −
      </button>
      <button
        onClick={() => insertMathSymbol('\\cdot')}
        className="p-1.5 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 rounded text-gray-600 dark:text-gray-300"
      >
        ·
      </button>
      <button
        onClick={() => insertMathSymbol('\\times')}
        className="p-1.5 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 rounded text-gray-600 dark:text-gray-300"
      >
        ×
      </button>
      <button
        onClick={() => insertMathSymbol('\\div')}
        className="p-1.5 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 rounded text-gray-600 dark:text-gray-300"
      >
        ÷
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200/80 dark:bg-gray-800/50" />

      {/* Special functions */}
      <button
        onClick={insertFraction}
        className="p-1.5 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 rounded text-gray-600 dark:text-gray-300"
        title="Fraction (press /)"
      >
        <span className="font-serif">a/b</span>
      </button>
      <button
        onClick={insertSuperscript}
        className="p-1.5 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 rounded text-gray-600 dark:text-gray-300"
        title="Superscript (press ^)"
      >
        x²
      </button>
      <button
        onClick={insertSubscript}
        className="p-1.5 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 rounded text-gray-600 dark:text-gray-300"
        title="Subscript (press _)"
      >
        xₙ
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200/80 dark:bg-gray-800/50" />

      {/* Greek letters */}
      <button
        onClick={() => insertMathSymbol('\\alpha')}
        className="p-1.5 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 rounded text-gray-600 dark:text-gray-300"
      >
        α
      </button>
      <button
        onClick={() => insertMathSymbol('\\beta')}
        className="p-1.5 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 rounded text-gray-600 dark:text-gray-300"
      >
        β
      </button>
      <button
        onClick={() => insertMathSymbol('\\pi')}
        className="p-1.5 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 rounded text-gray-600 dark:text-gray-300"
      >
        π
      </button>
      <button
        onClick={() => insertMathSymbol('\\sum')}
        className="p-1.5 hover:bg-gray-100/70 dark:hover:bg-gray-700/70 rounded text-gray-600 dark:text-gray-300"
      >
        Σ
      </button>
    </div>
  );
};

export default MathModeToolbar; 