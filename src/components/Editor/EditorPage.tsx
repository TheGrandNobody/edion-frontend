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

  const INDENT_STEP_PX = 40;
  const PX_PER_EM_LEVEL_APPROX = 24; // Approx 1.5em * 16px/em, used for converting old em indents

  // Helper to get current effective indentation in PX for a list item
  const getEffectivePxIndentFromListItem = (listItem: HTMLElement): number => {
    const indentLevelStyle = listItem.style.getPropertyValue('--indent-level');
    if (indentLevelStyle && indentLevelStyle.endsWith('px')) {
      const pxVal = parseInt(indentLevelStyle, 10);
      if (!isNaN(pxVal)) return pxVal;
    }

    const paddingLeftStyle = listItem.style.paddingLeft;
    if (paddingLeftStyle && paddingLeftStyle.endsWith('em')) {
      const emVal = parseFloat(paddingLeftStyle);
      if (!isNaN(emVal)) {
        const listElement = listItem.closest('ul, ol') as HTMLElement | null;
        let baseEmPadding = 1.5; // Default for UL
        if (listElement && listElement.tagName === 'OL') {
          baseEmPadding = 2.2; // For OL
        }
        const netEmIndent = Math.max(0, emVal - baseEmPadding);
        const numEmLevels = netEmIndent / 1.5; // Toolbar used 1.5em steps
        return Math.round(numEmLevels * PX_PER_EM_LEVEL_APPROX);
      }
    }
    // Check for indent-X class as a last resort (older system)
    const indentMatch = Array.from(listItem.classList).find(cls => cls.startsWith('indent-'));
    if (indentMatch) {
        const level = parseInt(indentMatch.split('-')[1], 10) || 0;
        return level * PX_PER_EM_LEVEL_APPROX; // Convert em levels to approx px
    }
    return 0;
  };

  // Update latex document whenever content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setLatexDocument(buildLatexDocument(newContent));
  };

  // Toggle raw LaTeX view
  const toggleRawLatex = () => {
    setShowRawLatex(!showRawLatex);
  };

  // Callback for when a new list is created to fix cursor
  const handleNewListCreated = () => {
    setTimeout(() => {
      if (!editorRef.current) return;

      const lists = editorRef.current.querySelectorAll('ol');
      if (lists.length === 0) {
        return;
      }
      
      const lastList = lists[lists.length - 1];
      const firstItem = lastList.querySelector('li:first-child');

      if (firstItem) {
        // Get the first text node in the list item
        const walker = document.createTreeWalker(
          firstItem,
          NodeFilter.SHOW_TEXT,
          null
        );
        
        let textNode = walker.nextNode();
        
        // If no text node exists, create one
        if (!textNode) {
          // Clear any existing content (like <br> tags)
          if (firstItem.innerHTML === '<br>') {
            firstItem.innerHTML = '';
          }
          
          // Create a non-breaking space for cursor visibility
          textNode = document.createTextNode('\u00A0'); // Non-breaking space
          firstItem.appendChild(textNode);
        }
        
        // Set cursor to beginning of text node
        if (textNode) {
          const selection = window.getSelection();
          if (selection) {
            editorRef.current.focus();
            
            const range = document.createRange();
            range.setStart(textNode, 0);
            range.collapse(true);
            
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Ensure the list item is visible
            firstItem.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          }
        }
      }
    }, 20); // Slightly longer delay to ensure DOM is fully updated
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
    let textBlock: HTMLElement | null = null;

    // Find the <li> element or a text block element
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.tagName === 'LI') {
          listItem = element;
          break;
        } else if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
          textBlock = element;
          break;
        }
      }
      node = node.parentNode;
    }

    if (listItem) {
      const listElement = listItem.closest('ul, ol');
      if (!listElement) {
        return; // Not in a list
      }

      let currentPxIndent = getEffectivePxIndentFromListItem(listItem);
      let newPxIndent;

      if (direction === 'indent') {
        newPxIndent = Math.min(currentPxIndent + INDENT_STEP_PX, 20 * INDENT_STEP_PX); // Max 20 levels
      } else { // outdent
        newPxIndent = Math.max(0, currentPxIndent - INDENT_STEP_PX);
      }
      
      listItem.style.setProperty('--indent-level', `${newPxIndent}px`);
      
      // Clean up other potentially conflicting indent styles
      listItem.style.removeProperty('padding-left');
      listItem.style.removeProperty('--marker-offset');
      listItem.classList.forEach(cls => {
        if (cls.startsWith('indent-')) {
          listItem?.classList.remove(cls);
        }
      });

      handleContentChange(editorRef.current.innerHTML);
    } 
    // Handle regular text blocks (paragraphs, divs, etc.)
    else if (textBlock) {
      const currentPaddingString = textBlock.style.paddingLeft || '0px';
      const currentPxValue = parseFloat(currentPaddingString) || 0;
      let newPxPadding;
      
      if (direction === 'indent') {
        newPxPadding = Math.min(currentPxValue + INDENT_STEP_PX, 20 * INDENT_STEP_PX);
      } else { // outdent
        newPxPadding = Math.max(0, currentPxValue - INDENT_STEP_PX);
      }

      textBlock.style.paddingLeft = newPxPadding === 0 ? '' : `${newPxPadding}px`;
      handleContentChange(editorRef.current.innerHTML);
    }
    // If no list item or text block found, try to create an indented paragraph at the cursor position
    else if (direction === 'indent') {
      // Only apply for indent, not outdent (as there's nothing to outdent)
      const range = selection.getRangeAt(0);
      
      // Check if we're in the editor but not in a block element
      if (range.commonAncestorContainer === editorRef.current || 
          (range.commonAncestorContainer.nodeType === Node.TEXT_NODE && 
           range.commonAncestorContainer.parentNode === editorRef.current)) {
        
        // Wrap the selection in a paragraph with indentation
        document.execCommand('formatBlock', false, 'p');
        
        // Get the newly created paragraph
        const newParagraph = selection.anchorNode.nodeType === Node.ELEMENT_NODE ? 
            selection.anchorNode as HTMLElement : 
            (selection.anchorNode.parentElement as HTMLElement);
        
        // Apply indentation
        if (newParagraph && newParagraph.tagName) {
          // For newly created paragraphs, also use --indent-level for consistency if possible,
          // but direct padding-left is simpler here as it's not a list item.
          newParagraph.style.paddingLeft = `${INDENT_STEP_PX}px`;
          handleContentChange(editorRef.current.innerHTML);
        }
      }
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
          onNewListCreated={handleNewListCreated}
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