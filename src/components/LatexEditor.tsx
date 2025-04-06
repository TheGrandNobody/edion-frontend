import React, { useMemo, useCallback, useState } from 'react';
import { createEditor, Descendant, Element as SlateElement, BaseEditor, Transforms, Text, Editor, Range, Node } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory, HistoryEditor } from 'slate-history';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from "@/lib/utils";

// Define custom element types
type CustomElement = {
  type: 'paragraph' | 'heading1' | 'heading2';
  children: CustomText[];
};

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  math?: boolean;
  inlineMath?: boolean; // For inline math content between $...$
};

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

interface LatexEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  darkMode?: boolean;
}

// Custom Slate editor with math handling
const withMath = (editor: Editor) => {
  const { isInline, insertText, deleteBackward } = editor;

  // Override insertText to handle $ as a toggle for math mode
  editor.insertText = (text) => {
    const { selection } = editor;
    
    if (text === '$' && selection && Range.isCollapsed(selection)) {
      // Check if we're already in a math node
      const [node] = Editor.node(editor, selection);
      
      if (Text.isText(node) && node.inlineMath) {
        // We're inside math mode, close it and convert to rendered math
        const path = Editor.path(editor, selection);
        const start = Editor.start(editor, path);
        const mathText = node.text.substring(0, selection.anchor.offset);
        
        // Delete the math node
        Transforms.delete(editor, {
          at: {
            anchor: start,
            focus: selection.anchor
          }
        });
        
        // Insert rendered math node
        if (mathText.trim()) {
          Transforms.insertNodes(editor, {
            text: mathText,
            math: true
          });
        }
      } else {
        // Start math mode
        Transforms.insertNodes(editor, {
          text: "",
          inlineMath: true
        });
      }
    } else if (selection) {
      // Check if we're in math editing mode to see if we should update it
      const [node] = Editor.node(editor, selection);
      
      if (Text.isText(node) && node.inlineMath) {
        // Just insert text normally when in math editing mode
        insertText(text);
      } else {
        // Normal text insertion
        insertText(text);
      }
    }
  };
  
  // Handle backspace in math mode
  editor.deleteBackward = (unit) => {
    const { selection } = editor;
    
    if (selection && Range.isCollapsed(selection)) {
      const [node] = Editor.node(editor, selection);
      
      // If we're at the start of a math node and press backspace, exit math mode
      if (
        Text.isText(node) && 
        node.inlineMath && 
        selection.anchor.offset === 0
      ) {
        // Exit math mode by unwrapping
        Transforms.unwrapNodes(editor, {
          match: n => Text.isText(n) && n.inlineMath === true,
          split: true,
        });
        return;
      }
    }
    
    // Default behavior
    deleteBackward(unit);
  };

  // Make sure inline math is treated as inline
  editor.isInline = element => {
    return isInline(element);
  };

  return editor;
};

const LatexEditor: React.FC<LatexEditorProps> = ({
  initialValue = '',
  onChange,
  className,
  darkMode = false,
}) => {
  const editor = useMemo(() => withMath(withHistory(withReact(createEditor()))), []);

  // Initialize with a simple paragraph
  const initialSlateValue = useMemo(() => {
    return [{
      type: 'paragraph' as const,
      children: [{ text: initialValue || '' }]
    }] as Descendant[];
  }, [initialValue]);

  // Handle changes in the editor
  const handleChange = useCallback(
    (value: Descendant[]) => {
      const text = value
        .map(node => SlateElement.isElement(node) 
          ? node.children.map(n => Text.isText(n) ? n.text : '').join('')
          : '')
        .join('\n');
      onChange?.(text);
    },
    [onChange]
  );

  // Handle keydown events for editor
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { selection } = editor;
    
    if (!selection) return;
    
    // Get the current node
    const [node] = Editor.node(editor, selection);
    
    if (Text.isText(node)) {
      // Handle some specific keys in math editing mode
      if (node.inlineMath) {
        if (event.key === 'Escape') {
          event.preventDefault();
          
          // Exit math mode without saving
          Transforms.delete(editor, {
            at: Editor.range(editor, Editor.path(editor, selection))
          });
        } else if (event.key === 'Enter') {
          event.preventDefault();
          
          // Finish editing math and convert to rendered version
          const path = Editor.path(editor, selection);
          const range = Editor.range(editor, path);
          const mathText = node.text;
          
          // Only save if there's content
          if (mathText.trim()) {
            // Delete the math editing node
            Transforms.delete(editor, { at: range });
            
            // Insert the rendered math
            Transforms.insertNodes(editor, {
              text: mathText,
              math: true
            });
          } else {
            // Just delete empty math
            Transforms.delete(editor, { at: range });
          }
        }
      }
    }
  }, [editor]);
  
  // Helper function to toggle between rendered and editing mode
  const toggleMathEditing = useCallback((path: number[]) => {
    const node = Node.get(editor, path);
    
    if (Text.isText(node) && node.math) {
      // Get the math text
      const mathText = node.text;
      
      // Delete the math node
      Transforms.delete(editor, { at: path });
      
      // Replace with an editable math node
      Transforms.insertNodes(
        editor,
        { text: mathText, inlineMath: true },
        { at: path }
      );
      
      // Set selection to end of inserted math
      Transforms.select(editor, Editor.end(editor, path));
    }
  }, [editor]);

  // Custom rendering for elements
  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case 'heading1':
        return <h1 {...props.attributes} className="text-2xl font-bold my-4">{props.children}</h1>;
      case 'heading2':
        return <h2 {...props.attributes} className="text-xl font-semibold my-3">{props.children}</h2>;
      default:
        return <p {...props.attributes} className="my-2 leading-relaxed">{props.children}</p>;
    }
  }, []);

  // Custom rendering for text with marks
  const renderLeaf = useCallback((props: any) => {
    const { leaf, attributes, children } = props;

    // For rendered math (display mode)
    if (leaf.math) {
      try {
        return (
          <span
            {...attributes}
            className="inline math-rendered px-0.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleMathEditing(props.path);
            }}
          >
            <span
              contentEditable={false}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(leaf.text, {
                  throwOnError: false,
                  displayMode: false,
                  output: 'html',
                  strict: false
                }),
              }}
            />
            {children}
          </span>
        );
      } catch (e) {
        // If KaTeX fails to render, show the raw text
        return <span {...attributes}>{children}</span>;
      }
    }
    
    // For inline math editing mode (the $ ... $ mode)
    if (leaf.inlineMath) {
      return (
        <span
          {...attributes}
          className="inline math-editing px-1 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 border rounded-sm text-blue-800 dark:text-blue-200"
        >
          <span className="text-gray-400 select-none mr-0.5">$</span>
          {children}
          <span className="text-gray-400 select-none ml-0.5">$</span>
        </span>
      );
    }

    // Default text rendering
    let className = "";
    if (leaf.bold) {
      className += "font-bold ";
    }
    if (leaf.italic) {
      className += "italic ";
    }

    return className ? (
      <span {...attributes} className={className.trim()}>
        {children}
      </span>
    ) : (
      <span {...attributes}>{children}</span>
    );
  }, [toggleMathEditing]);

  return (
    <div 
      className={cn(
        "w-full h-full p-4 rounded-lg relative",
        "bg-white dark:bg-gray-900",
        "border border-gray-200 dark:border-gray-800",
        "focus-within:ring-2 focus-within:ring-blue-500/30 dark:focus-within:ring-blue-500/20",
        className
      )}
    >
      <Slate editor={editor} initialValue={initialSlateValue} onChange={handleChange}>
        <Editable
          className="min-h-[200px] text-gray-900 dark:text-gray-100 focus:outline-none prose dark:prose-invert max-w-none whitespace-pre-wrap break-words"
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={handleKeyDown}
          placeholder="Start typing... Use $ to create LaTeX equations"
        />
      </Slate>
    </div>
  );
};

export default LatexEditor; 