import React, { useState, useMemo, useCallback } from 'react';
import { createEditor, Descendant, Transforms } from 'slate';
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import SlateToolbar from './SlateToolbar';
import LatexView from '../Editor/LatexView';
import LaTeXInput from './LaTeXInput';
import { LaTeXConverter } from './LaTeXConverter';
import { Button } from '../ui/button';
import { FileText, Download } from 'lucide-react';
import { CustomElement, CustomText } from './types';

// Extract the render functions from SlateEditor
const useSlateRenderers = (editor: any) => {
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
        const indentPadding = indentLevel * 40;
        
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
                display: element.display ? 'block' : 'inline-block',
                position: 'relative'
              }}
            >
              <span style={{ opacity: 0.6, fontSize: '0.8em', position: 'absolute', top: '2px', left: '4px' }}>
                {element.display ? '\\[' : '\\('}
              </span>
              <div 
                style={{ 
                  margin: element.display ? '20px 8px 8px 8px' : '0 16px',
                  minHeight: '1em',
                  outline: 'none'
                }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newFormula = e.currentTarget.textContent || '';
                  if (newFormula !== element.formula) {
                    // Update the formula in the Slate document
                    const path = ReactEditor.findPath(editor, element);
                    Transforms.setNodes(editor, { formula: newFormula }, { at: path });
                  }
                }}
              >
                {element.formula}
              </div>
              <span style={{ opacity: 0.6, fontSize: '0.8em', position: 'absolute', bottom: '2px', right: '4px' }}>
                {element.display ? '\\]' : '\\)'}
              </span>
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
  }, [editor]);

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

  return { renderElement, renderLeaf };
};

// SlateEditor component that includes toolbar inside Slate context
interface SlateEditorWithToolbarProps {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
  showRawLatex: boolean;
  toggleRawLatex: () => void;
  onInsertMath: () => void;
  onInsertTable: (rows: number, cols: number) => void;
}

const SlateEditorWithToolbar: React.FC<SlateEditorWithToolbarProps> = ({
  value,
  onChange,
  showRawLatex,
  toggleRawLatex,
  onInsertMath,
  onInsertTable
}) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const { renderElement, renderLeaf } = useSlateRenderers(editor);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      editor.insertText('\n');
      return;
    }
    
    if (event.key === 'Tab') {
      event.preventDefault();
      return;
    }
  }, [editor]);

  return (
    <Slate 
      editor={editor} 
      initialValue={value} 
      onValueChange={onChange}
    >
      <SlateToolbar
        showRawLatex={showRawLatex}
        toggleRawLatex={toggleRawLatex}
        onInsertMath={onInsertMath}
        onInsertTable={onInsertTable}
      />
      
      <div className="flex-grow bg-white dark:bg-zinc-800 rounded-md border shadow-sm">
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
      </div>
    </Slate>
  );
};

const SlateEditorPage: React.FC = () => {
  const [showRawLatex, setShowRawLatex] = useState(false);
  const [showLatexInput, setShowLatexInput] = useState(false);
  const [slateValue, setSlateValue] = useState<Descendant[]>([
    {
      type: 'paragraph',
      children: [{ text: 'Start typing here. Use the toolbar to format text or add math expressions.' }]
    }
  ]);

  // Initialize LaTeX converter
  const latexConverter = useMemo(() => new LaTeXConverter(), []);

  // Convert Slate document to LaTeX
  const latexDocument = useMemo(() => {
    return latexConverter.serializeToLatex(slateValue);
  }, [slateValue, latexConverter]);

  // Handle Slate value changes
  const handleSlateChange = useCallback((value: Descendant[]) => {
    setSlateValue(value);
  }, []);

  // Toggle raw LaTeX view
  const toggleRawLatex = useCallback(() => {
    setShowRawLatex(!showRawLatex);
  }, [showRawLatex]);

  // Insert math (placeholder - will be handled by toolbar)
  const handleInsertMath = useCallback(() => {
    // This is handled in the toolbar
  }, []);

  // Insert table (placeholder - will be handled by toolbar)
  const handleInsertTable = useCallback((rows: number, cols: number) => {
    // This is handled in the toolbar
  }, []);

  // Parse LaTeX to Slate
  const parseLatexToSlate = useCallback((latex: string) => {
    try {
      const parsed = latexConverter.parseFromLatex(latex);
      setSlateValue(parsed);
    } catch (error) {
      console.error('Error parsing LaTeX:', error);
    }
  }, [latexConverter]);

  // Handle LaTeX import
  const handleLatexImport = useCallback(() => {
    setShowLatexInput(true);
  }, []);

  // Download LaTeX file
  const downloadLatex = useCallback(() => {
    const blob = new Blob([latexDocument], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.tex';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [latexDocument]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-3 px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">LaTeX Math Editor (Slate.js)</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bidirectional LaTeX ↔ WYSIWYG editor powered by Slate.js
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleLatexImport}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Import LaTeX
              </Button>
              <Button
                variant="outline"
                onClick={downloadLatex}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download .tex
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col container mx-auto p-4 gap-4">
        {!showRawLatex ? (
          <SlateEditorWithToolbar
            value={slateValue}
            onChange={handleSlateChange}
            showRawLatex={showRawLatex}
            toggleRawLatex={toggleRawLatex}
            onInsertMath={handleInsertMath}
            onInsertTable={handleInsertTable}
          />
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={toggleRawLatex}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                ← Back to Editor
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                LaTeX Output (read-only)
              </span>
            </div>
            
            <LatexView latexDocument={latexDocument} />
          </>
        )}
        
        {/* Debug info */}
        <details className="mt-4 p-4 bg-gray-50 dark:bg-zinc-900 rounded border">
          <summary className="cursor-pointer font-medium text-sm">
            Debug: Slate Document Structure
          </summary>
          <pre className="mt-2 text-xs overflow-auto max-h-40 bg-white dark:bg-zinc-800 p-2 rounded border">
            {JSON.stringify(slateValue, null, 2)}
          </pre>
        </details>
        
        {/* LaTeX Input Modal */}
        {showLatexInput && (
          <LaTeXInput
            onConvert={parseLatexToSlate}
            onClose={() => setShowLatexInput(false)}
          />
        )}
      </main>
    </div>
  );
};

export default SlateEditorPage; 