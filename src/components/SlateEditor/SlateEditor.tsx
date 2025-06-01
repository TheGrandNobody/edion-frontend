import React, { useCallback, useMemo } from 'react';
import { createEditor, Descendant, Element as SlateElement } from 'slate';
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps } from 'slate-react';
import { withHistory } from 'slate-history';
import { CustomElement, CustomText } from './types';

interface SlateEditorProps {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
  className?: string;
}

const SlateEditor: React.FC<SlateEditorProps> = ({ value, onChange, className }) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const renderElement = useCallback((props: RenderElementProps) => {
    const element = props.element as CustomElement;
    
    switch (element.type) {
      case 'paragraph':
        return (
          <p 
            {...props.attributes}
            className={`mb-4 ${element.align ? `text-${element.align}` : ''}`}
            style={{
              textAlign: element.align || 'left',
              minHeight: '1.5rem'
            }}
          >
            {props.children}
          </p>
        );

      case 'heading':
        const headingSizes = {
          1: 'text-3xl font-bold mb-4',
          2: 'text-2xl font-bold mb-3', 
          3: 'text-xl font-bold mb-3',
          4: 'text-lg font-bold mb-2',
          5: 'text-base font-bold mb-2',
          6: 'text-sm font-bold mb-2'
        };
        
        const headingProps = {
          ...props.attributes,
          className: `${headingSizes[element.level]} ${element.align ? `text-${element.align}` : ''}`,
          style: { textAlign: element.align || 'left' }
        };
        
        switch (element.level) {
          case 1: return <h1 {...headingProps}>{props.children}</h1>;
          case 2: return <h2 {...headingProps}>{props.children}</h2>;
          case 3: return <h3 {...headingProps}>{props.children}</h3>;
          case 4: return <h4 {...headingProps}>{props.children}</h4>;
          case 5: return <h5 {...headingProps}>{props.children}</h5>;
          case 6: return <h6 {...headingProps}>{props.children}</h6>;
          default: return <h1 {...headingProps}>{props.children}</h1>;
        }

      case 'bulleted-list':
        return (
          <ul 
            {...props.attributes}
            className={`list-disc pl-6 mb-4 ${element.align ? `text-${element.align}` : ''}`}
            style={{ 
              textAlign: element.align || 'left',
              listStyleType: 'disc',
              paddingLeft: '1.5rem'
            }}
          >
            {props.children}
          </ul>
        );

      case 'numbered-list':
        return (
          <ol 
            {...props.attributes}
            className={`list-decimal pl-6 mb-4 ${element.align ? `text-${element.align}` : ''}`}
            style={{ 
              textAlign: element.align || 'left',
              listStyleType: 'decimal',
              paddingLeft: '2.2rem'
            }}
          >
            {props.children}
          </ol>
        );

      case 'list-item':
        const indentLevel = element.indentLevel || 0;
        const indentPadding = indentLevel * 40; // 40px per level
        
        return (
          <li 
            {...props.attributes}
            style={{
              paddingLeft: indentPadding > 0 ? `${indentPadding}px` : undefined,
              marginBottom: '0.25rem'
            }}
          >
            {props.children}
          </li>
        );

      case 'math':
        return (
          <div 
            {...props.attributes}
            className={`math-container ${element.display ? 'block my-4' : 'inline'}`}
            contentEditable={false}
          >
            <div 
              className={`math-display ${element.display ? 'text-center' : ''}`}
              style={{
                fontFamily: 'serif',
                fontSize: element.display ? '1.2rem' : '1rem',
                padding: element.display ? '1rem' : '0.2rem',
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '4px',
                display: element.display ? 'block' : 'inline-block'
              }}
            >
              {element.display ? `\\[${element.formula}\\]` : `\\(${element.formula}\\)`}
            </div>
            {props.children}
          </div>
        );

      case 'table':
        return (
          <div {...props.attributes} className="my-4">
            <table className="editor-table border-collapse border border-gray-300 w-full">
              <tbody>
                {props.children}
              </tbody>
            </table>
          </div>
        );

      case 'table-row':
        return (
          <tr {...props.attributes}>
            {props.children}
          </tr>
        );

      case 'table-cell':
        const CellTag = element.header ? 'th' : 'td';
        return (
          <CellTag 
            {...props.attributes}
            className="border border-gray-300 p-2"
            style={{ 
              backgroundColor: element.header ? '#f8f9fa' : 'white',
              fontWeight: element.header ? 'bold' : 'normal'
            }}
          >
            {props.children}
          </CellTag>
        );

      default:
        return (
          <div {...props.attributes}>
            {props.children}
          </div>
        );
    }
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    const leaf = props.leaf as CustomText;
    let children = props.children;

    if (leaf.bold) {
      children = <strong>{children}</strong>;
    }

    if (leaf.italic) {
      children = <em>{children}</em>;
    }

    if (leaf.underline) {
      children = <u>{children}</u>;
    }

    const style: React.CSSProperties = {};
    
    if (leaf.color) {
      style.color = leaf.color;
    }
    
    if (leaf.backgroundColor) {
      style.backgroundColor = leaf.backgroundColor;
    }

    return (
      <span {...props.attributes} style={style}>
        {children}
      </span>
    );
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Handle keyboard shortcuts and special keys
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      editor.insertText('\n');
      return;
    }
    
    // Tab for indentation
    if (event.key === 'Tab') {
      event.preventDefault();
      // Handle indentation logic here if needed
      return;
    }
  }, [editor]);

  return (
    <div className={`slate-editor ${className || ''}`}>
      <Slate 
        editor={editor} 
        initialValue={value} 
        onValueChange={onChange}
      >
        <Editable
          className="min-h-96 p-4 focus:outline-none"
          placeholder="Start typing here. Use the toolbar to format text or add math expressions."
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={handleKeyDown}
          style={{
            lineHeight: '1.6',
            fontSize: '16px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        />
      </Slate>
    </div>
  );
};

export default SlateEditor; 