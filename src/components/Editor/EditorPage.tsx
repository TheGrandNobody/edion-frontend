import { useState, useRef } from 'react';
import EditorToolbar from './EditorToolbar';
import RichTextArea from './RichTextArea';
import LatexView from './LatexView';
import { buildLatexDocument } from '../../lib/buildLatex';
import useInlineMath from '../../hooks/useInlineMath';

const EditorPage = () => {
  const [content, setContent] = useState<string>('<p>Start typing here. Use the toolbar to format text or add math expressions.</p>');
  const [showRawLatex, setShowRawLatex] = useState(false);
  const [latexDocument, setLatexDocument] = useState<string>(buildLatexDocument(content));
  const { insertMathDelimiters } = useInlineMath();
  const editorRef = useRef<HTMLDivElement>(null);

  // Update latex document whenever content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setLatexDocument(buildLatexDocument(newContent));
  };

  // Toggle raw LaTeX view
  const toggleRawLatex = () => {
    setShowRawLatex(!showRawLatex);
  };

  // Insert table at cursor position
  const insertTable = (rows: number, cols: number) => {
    if (!editorRef.current) return;
    
    // Ensure editor has focus
    editorRef.current.focus();
    
    // Get current selection
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    
    // Create table HTML
    let tableHTML = '<table class="editor-table" data-rows="' + rows + '" data-cols="' + cols + '">';
    
    // Add table header
    tableHTML += '<thead><tr>';
    for (let i = 0; i < cols; i++) {
      tableHTML += '<th contenteditable="true">Header ' + (i + 1) + '</th>';
    }
    tableHTML += '</tr></thead>';
    
    // Add table body
    tableHTML += '<tbody>';
    for (let i = 0; i < rows - 1; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < cols; j++) {
        tableHTML += '<td contenteditable="true">Cell ' + (i + 1) + ',' + (j + 1) + '</td>';
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</tbody></table>';
    
    // Insert table at current position
    const range = selection.getRangeAt(0);
    
    // Handle insertion in different parent contexts
    const container = range.startContainer;
    
    if (container.nodeType === Node.TEXT_NODE && container.parentNode) {
      // If we're in a text node, make sure we're in a proper container
      const parentElement = container.parentNode as HTMLElement;
      
      // If parent is a paragraph, insert before or after depending on cursor position
      if (parentElement.tagName === 'P') {
        // Check if we're at the end of the paragraph
        if (range.startOffset === (container.textContent || '').length) {
          // Insert after this paragraph
          const tableElement = document.createElement('div');
          tableElement.innerHTML = tableHTML;
          
          if (parentElement.nextSibling) {
            parentElement.parentNode?.insertBefore(tableElement.firstChild!, parentElement.nextSibling);
          } else {
            parentElement.parentNode?.appendChild(tableElement.firstChild!);
          }
        } else {
          // Split the paragraph and insert table in between
          document.execCommand('insertHTML', false, '</p>' + tableHTML + '<p>');
        }
      } else {
        // For other container types, just insert the HTML
        document.execCommand('insertHTML', false, tableHTML);
      }
    } else if (container.nodeType === Node.ELEMENT_NODE) {
      // If we're directly in an element node
      if ((container as HTMLElement).getAttribute('contenteditable') === 'true') {
        // We're in the root editable - create a wrapper and insert
        const tableElement = document.createElement('div');
        tableElement.innerHTML = tableHTML;
        (container as HTMLElement).appendChild(tableElement.firstChild!);
      } else {
        // For other elements, try inserting HTML directly
        document.execCommand('insertHTML', false, tableHTML);
      }
    }
    
    // Update content
    if (editorRef.current) {
      handleContentChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-3 px-4">
          <h1 className="text-xl font-semibold">LaTeX Math Editor</h1>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col container mx-auto p-4 gap-4">
        <EditorToolbar 
          showRawLatex={showRawLatex}
          toggleRawLatex={toggleRawLatex}
          onInsertMath={insertMathDelimiters}
          onInsertTable={insertTable}
          editorRef={editorRef}
        />
        
        {!showRawLatex ? (
          <div className="flex-grow bg-white dark:bg-zinc-800 rounded-md border shadow-sm">
            <RichTextArea 
              content={content}
              onChange={handleContentChange}
              editorRef={editorRef}
            />
          </div>
        ) : (
          <LatexView latexDocument={latexDocument} />
        )}
      </main>
    </div>
  );
};

export default EditorPage; 