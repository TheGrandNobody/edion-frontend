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

  // Indent/Outdent Logic
  const applyListIndent = (direction: 'indent' | 'outdent') => {
    if (!editorRef.current) {
      return;
    }
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      return;
    }

    let node = selection.anchorNode;
    let listItem: HTMLElement | null = null;

    // Find the <li> element
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'LI') {
        listItem = node as HTMLElement;
        break;
      }
      node = node.parentNode;
    }

    if (listItem) {
      const listElement = listItem.closest('ul, ol');
      if (!listElement) {
        return; // Not in a list
      }

      const isOrderedList = listElement.tagName === 'OL';
      const basePadding = isOrderedList ? 2.2 : 1.5; // Base padding in em
      const indentStep = 1.5; // Indentation step in em

      let currentLevel = 0;
      const indentMatch = Array.from(listItem.classList)
        .find(cls => cls.startsWith('indent-'));
      
      if (indentMatch) {
        currentLevel = parseInt(indentMatch.split('-')[1], 10) || 0;
      } else {
        // Attempt to infer level from existing padding if no class present
        const existingPaddingString = listItem.style.paddingLeft || "";
        const existingPaddingValue = parseFloat(existingPaddingString.replace(/em/gi, "")); // Use regex for case-insensitive replace

        if (!isNaN(existingPaddingValue) && existingPaddingValue > 0) {
            currentLevel = Math.max(0, Math.round((existingPaddingValue - basePadding) / indentStep));
        }
      }

      // Remove existing indent classes before recalculating
      listItem.classList.forEach(cls => {
        if (cls.startsWith('indent-')) {
          listItem?.classList.remove(cls);
        }
      });

      const previousLevel = currentLevel;
      if (direction === 'indent') {
        currentLevel = Math.min(20, currentLevel + 1); // Max indent level 20
      } else { // outdent
        currentLevel = Math.max(0, currentLevel - 1); // Min indent level 0
      }

      const newPaddingLeftValue = basePadding + (currentLevel * indentStep);
      const newPaddingLeftString = `${newPaddingLeftValue}em`;
      
      listItem.style.paddingLeft = newPaddingLeftString;

      // Also adjust the marker offset for ordered lists if indenting
      if (isOrderedList) {
        const baseMarkerOffset = 0.5; // The default left value for the marker in em
        const newMarkerOffsetValue = baseMarkerOffset + (currentLevel * indentStep);
        const newMarkerOffsetString = `${newMarkerOffsetValue}em`;
        listItem.style.setProperty('--marker-offset', newMarkerOffsetString);
      } else {
        // Ensure the variable is cleared for ULs if it was somehow set
        listItem.style.removeProperty('--marker-offset'); 
      }

      handleContentChange(editorRef.current.innerHTML);
    }
  };

  const handleIndent = () => {
    applyListIndent('indent');
  };

  const handleOutdent = () => {
    applyListIndent('outdent');
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
    for (let i = 0; i < rows - 1; i++) { // Assuming one row is header
      tableHTML += '<tr>';
      for (let j = 0; j < cols; j++) {
        tableHTML += '<td contenteditable="true">Cell</td>'; // Simpler cell content
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</tbody></table><p><br></p>'; // Add a new paragraph after the table for easier editing
    
    // Insert table at current position
    document.execCommand('insertHTML', false, tableHTML);
    
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
          onIndent={handleIndent}
          onOutdent={handleOutdent}
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