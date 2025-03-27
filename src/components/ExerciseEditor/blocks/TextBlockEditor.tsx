import React, { useCallback, useMemo } from 'react';
import { createEditor, Transforms, Editor, Range, Element as SlateElement, Text } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import { Bold, Italic, Underline, Calculator } from 'lucide-react';
import { cn } from "@/lib/utils";
import { CustomElement, CustomText } from '../types';
import { convertToLatex } from '../utils/inlineLatexConverter';
import PlusButton from './PlusButton';
import MathModeToolbar from './MathModeToolbar';

interface TextBlockEditorProps {
  content: CustomElement[];
  onChange: (content: CustomElement[]) => void;
  onAddBlock: (type: string) => void;
  darkMode: boolean;
}

const TextBlockEditor: React.FC<TextBlockEditorProps> = ({
  content,
  onChange,
  onAddBlock,
  darkMode
}) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [mathMode, setMathMode] = React.useState(false);

  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case 'paragraph':
        return <p {...props.attributes}>{props.children}</p>;
      case 'math':
        return (
          <span {...props.attributes} className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">
            {props.children}
          </span>
        );
      default:
        return <p {...props.attributes}>{props.children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props: any) => {
    let className = '';
    if (props.leaf.bold) className += 'font-bold ';
    if (props.leaf.italic) className += 'italic ';
    if (props.leaf.underline) className += 'underline ';

    return (
      <span {...props.attributes} className={className}>
        {props.children}
      </span>
    );
  }, []);

  const toggleFormat = (format: keyof Omit<CustomText, 'text'>) => {
    const isActive = isFormatActive(format);
    Transforms.setNodes(
      editor,
      { [format]: isActive ? null : true },
      { match: (n) => Text.isText(n), split: true }
    );
  };

  const isFormatActive = (format: keyof Omit<CustomText, 'text'>) => {
    const [match] = Editor.nodes(editor, {
      match: (n) => n[format] === true,
      mode: 'all',
    });
    return !!match;
  };

  const toggleMathMode = () => {
    setMathMode(!mathMode);
    if (!mathMode) {
      const { selection } = editor;
      if (selection && Range.isCollapsed(selection)) {
        Transforms.insertNodes(editor, {
          type: 'math',
          children: [{ text: '' }],
        });
      } else {
        Transforms.wrapNodes(
          editor,
          { type: 'math', children: [] },
          { split: true }
        );
      }
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2 mb-2">
        <button
          onClick={() => toggleFormat('bold')}
          className={cn(
            "p-1 rounded",
            isFormatActive('bold') ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"
          )}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => toggleFormat('italic')}
          className={cn(
            "p-1 rounded",
            isFormatActive('italic') ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"
          )}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => toggleFormat('underline')}
          className={cn(
            "p-1 rounded",
            isFormatActive('underline') ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"
          )}
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          onClick={toggleMathMode}
          className={cn(
            "p-1 rounded",
            mathMode ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"
          )}
        >
          <Calculator className="w-4 h-4" />
        </button>
      </div>

      {mathMode && (
        <MathModeToolbar editor={editor} darkMode={darkMode} />
      )}

      <Slate
        editor={editor}
        initialValue={content}
        onChange={value => {
          onChange(value as CustomElement[]);
        }}
      >
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          className={cn(
            "min-h-[100px] p-3 rounded-lg",
            "border border-gray-200 dark:border-gray-800",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            "bg-white dark:bg-gray-900"
          )}
        />
      </Slate>

      <div className="absolute -left-8 top-1/2 transform -translate-y-1/2">
        <PlusButton onAddBlock={onAddBlock} darkMode={darkMode} />
      </div>
    </div>
  );
};

export default TextBlockEditor; 