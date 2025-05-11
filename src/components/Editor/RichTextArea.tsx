import { useEffect } from 'react';
import 'mathlive';
import useInlineMath from '../../hooks/useInlineMath';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        value?: string;
        'virtual-keyboard-mode'?: string;
      }, HTMLElement>;
    }
  }
}

interface RichTextAreaProps {
  content: string;
  onChange: (newContent: string) => void;
  editorRef: React.RefObject<HTMLDivElement>;
}

const RichTextArea = ({ content, onChange, editorRef }: RichTextAreaProps) => {
  const { handleKeyDown: handleInlineMathKeyDown, handleMathFieldDelete } = useInlineMath();
  
  // Handle keyboard events in the editor
  const handleEditorKeyDown = (e: React.KeyboardEvent) => {
    // First call the inline math handler
    handleInlineMathKeyDown(e);
    
    // Handle Tab key for list indentation
    if (e.key === 'Tab') {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
      
      // Find if we're in a list item
      let node = selection.anchorNode;
      let listItem: HTMLElement | null = null;
      
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'LI') {
          listItem = node as HTMLElement;
          break;
        }
        node = node.parentNode;
      }
      
      // If we're in a list item, handle indentation
      if (listItem) {
        e.preventDefault(); // Prevent default tab behavior
        
        // Find the parent list element
        const listElement = listItem.closest('ul, ol');
        if (!listElement) return;
        
        // Get the current indentation level
        let currentLevel = 0;
        const indentMatch = Array.from(listItem.classList)
          .find(cls => cls.startsWith('indent-'));
        
        if (indentMatch) {
          currentLevel = parseInt(indentMatch.split('-')[1], 10) || 0;
        }
        
        // Remove any existing indent classes
        listItem.classList.forEach(cls => {
          if (cls.startsWith('indent-')) {
            listItem?.classList.remove(cls);
          }
        });
        
        // Shift+Tab: decrease level, Tab: increase level
        if (e.shiftKey) {
          // Prevent going below 0
          currentLevel = Math.max(0, currentLevel - 1);
        } else {
          // Increase level with an upper limit of 20 to prevent issues
          currentLevel = Math.min(20, currentLevel + 1);
        }
        
        // Apply the new indentation class (only if level > 0)
        if (currentLevel > 0) {
          listItem.classList.add(`indent-${currentLevel}`);
          
          // Apply direct inline style as a backup to ensure correct indentation
          listItem.style.paddingLeft = `${1.5 + (currentLevel * 1.5)}em`;
        } else {
          // Reset to default padding if no indentation
          listItem.style.paddingLeft = '1.5em';
        }
        
        // Update content
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
        
        return;
      }
    }
    
    // Handle deletion
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
      
      const range = selection.getRangeAt(0);
      const mathField = range.startContainer.parentElement?.closest('math-field');
      
      if (mathField) {
        
        // If we're at the edge of a math field
        if (range.startOffset === 0 || range.startOffset === (range.startContainer.textContent || '').length) {
          // Remove the entire math field
          mathField.remove();
          e.preventDefault();
          
          // Create a text node with a space to ensure proper cursor placement
          const spaceNode = document.createTextNode('\u200B'); // Zero-width space
          if (mathField.parentNode) {
            mathField.parentNode.insertBefore(spaceNode, mathField.nextSibling);
            
            // Place cursor after the space
            const newRange = document.createRange();
            newRange.setStartAfter(spaceNode);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
          
          // Update content
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        }
      }
    }
  };
  
  // Initialize the editor with content
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
    }
  }, []);
  
  // Set up event listeners for content changes
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    
    const handleInput = () => {
      
      // Get the current content and pass it back
      onChange(editor.innerHTML);
      
      // Initialize MathLive fields in any newly added inline math
      initializeMathLiveFields();
    };

    const handleDOMKeyDown = (e: KeyboardEvent) => {
      // Debug deletion attempts
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
        }
      }
    };
    
    editor.addEventListener('input', handleInput);
    editor.addEventListener('keydown', handleDOMKeyDown);
    
    // Initialize MathLive fields on initial render
    initializeMathLiveFields();
    
    return () => {
      editor.removeEventListener('input', handleInput);
      editor.removeEventListener('keydown', handleDOMKeyDown);
    };
  }, [onChange]);
  
  // Function to initialize MathLive fields within math delimiters
  const initializeMathLiveFields = () => {
    if (!editorRef.current) return;
    
    const mathRegex = /\\(\(.*?\\\))/g;
    
    // Find all text nodes that contain a math delimiter
    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    const textNodesToReplace: Array<{ node: Text; matches: RegExpMatchArray[] }> = [];
    
    let currentNode: Text | null;
    while ((currentNode = walker.nextNode() as Text)) {
      const matches = Array.from(currentNode.nodeValue?.matchAll(mathRegex) || []);
      if (matches.length > 0) {
        textNodesToReplace.push({ node: currentNode, matches });
      }
    }
    
    // Replace each text node with a mix of text and math-field
    for (const { node, matches } of textNodesToReplace) {
      let html = node.nodeValue || '';
      matches.forEach(match => {
        const [fullMatch, mathContent] = match;
        const mathLatex = mathContent.slice(1, -1); // Remove the outer \( \)
        html = html.replace(
          fullMatch,
          `<math-field class="math-field" data-latex="${mathLatex}"></math-field>`
        );
      });
      
      // Create a temporary div to hold our new nodes
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Insert all the new nodes before the text node
      while (tempDiv.firstChild) {
        node.parentNode?.insertBefore(tempDiv.firstChild, node);
      }
      
      // Remove the original text node
      node.parentNode?.removeChild(node);
    }
    
    // Set up event listeners for math-field elements
    document.querySelectorAll('.math-field:not([data-initialized])').forEach(mathField => {
      const latex = mathField.getAttribute('data-latex') || '';
      
      // Set the value of the math-field element
      (mathField as HTMLElement).setAttribute('value', latex);
      (mathField as HTMLElement).setAttribute('virtual-keyboard-mode', 'manual');
      (mathField as HTMLElement).setAttribute('keypress-sound', 'none');
      (mathField as HTMLElement).setAttribute('plonk-sound', 'none');
      (mathField as any).enterKeypressAction = 'none'; // Disable default Enter behavior
      
      // Prevent default Enter behavior in math field
      mathField.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.stopPropagation();
          e.preventDefault();
          // Let our custom handler deal with it
          handleMathFieldDelete(e);
          return false;
        }
      }, true);  // Use capture phase to ensure we handle it first
      
      // Add focus handling for math fields
      mathField.addEventListener('focus', () => {
        // When a math field is focused, we should prevent the editor
        // from trying to steal focus back
      });
      
      // Add blur handling to restore editor state when done with math field
      mathField.addEventListener('blur', (e: FocusEvent) => {
        // Only refocus editor if we're not focusing another math field or interactive element
        const relatedTarget = e.relatedTarget as HTMLElement;
        const isMovingToMathField = relatedTarget && (
          relatedTarget.tagName === 'MATH-FIELD' || 
          relatedTarget.closest('.math-field')
        );
        
        // Don't refocus if we're moving to another interactive element
        const isMovingToInteractive = relatedTarget && (
          relatedTarget.tagName === 'BUTTON' ||
          relatedTarget.tagName === 'INPUT' ||
          relatedTarget.closest('button') ||
          relatedTarget.closest('input') ||
          relatedTarget.closest('[role="dialog"]') ||
          relatedTarget.closest('[role="menu"]') ||
          relatedTarget.closest('.popover-content')
        );
        
        if (!isMovingToMathField && !isMovingToInteractive) {
          // Wait a bit to ensure we're not interrupting another focus action
          setTimeout(() => {
            // Only focus editor if it doesn't break user flow
            if (document.activeElement === document.body) {
              editorRef.current?.focus();
            }
          }, 100);
        }
      });
      
      // Add change event listener
      mathField.addEventListener('input', () => {
        // Get updated LaTeX value
        const updatedLatex = (mathField as any).value;
        
        // Store the updated LaTeX
        mathField.setAttribute('data-latex', updatedLatex);
        
        // Update the overall content
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      });
      
      // Mark as initialized
      mathField.setAttribute('data-initialized', 'true');
    });
  };
  
  return (
    <div
      ref={editorRef}
      contentEditable
      className="p-4 min-h-[300px] focus:outline-none overflow-y-auto rich-text-editor"
      style={{ fontSize: '16px', lineHeight: '1.5' }}
      onKeyDown={handleEditorKeyDown}
    />
  );
};

// Add styles for tables
const styles = `
/* Reset list styles for consistency */
.rich-text-editor ul,
.rich-text-editor ol {
  padding-left: 0;
  margin-left: 0;
}

.rich-text-editor ol {
  list-style-type: decimal;
}

.rich-text-editor ul {
  list-style-type: disc;
}

/* Marker styling for lists */
.rich-text-editor li.marker-bold {
  font-weight: bold;
}

.rich-text-editor li.marker-italic {
  font-style: italic;
}

.rich-text-editor li.marker-underline {
  text-decoration: underline;
}

/* All list items (including non-indented) use consistent spacing */
.rich-text-editor ul li,
.rich-text-editor ol li {
  position: relative;
  list-style-position: inside;
  padding-left: 1.5em; /* Base padding for all list items */
}

/* Note: Indentation is primarily handled by inline styles for reliability */
/* These are just fallbacks */
.rich-text-editor li.indent-1 { padding-left: 3em; }
.rich-text-editor li.indent-2 { padding-left: 4.5em; }
.rich-text-editor li.indent-3 { padding-left: 6em; }
.rich-text-editor li.indent-4 { padding-left: 7.5em; }
.rich-text-editor li.indent-5 { padding-left: 9em; }

/* Standard spacing */
.rich-text-editor li {
  margin-bottom: 0.5em;
}

/* Alignment handling */
.rich-text-editor ul[style*="text-align: center"],
.rich-text-editor ol[style*="text-align: center"] {
  text-align: center;
}

.rich-text-editor ul[style*="text-align: right"],
.rich-text-editor ol[style*="text-align: right"] {
  text-align: right;
}

/* For centered and right-aligned lists, keep bullets/numbers with text */
.rich-text-editor ul[style*="text-align: center"] li,
.rich-text-editor ul[style*="text-align: right"] li,
.rich-text-editor [style*="text-align: center"] ul li,
.rich-text-editor [style*="text-align: right"] ul li {
  list-style-position: inside;
}

/* Tables */
.rich-text-editor .editor-table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
  border: 1px solid #e2e8f0;
}

.rich-text-editor .editor-table th,
.rich-text-editor .editor-table td {
  border: 1px solid #e2e8f0;
  padding: 0.5em;
  min-width: 2em;
}

.rich-text-editor .editor-table th {
  background-color: #f8fafc;
  font-weight: 600;
}

.rich-text-editor .editor-table tr:nth-child(even) {
  background-color: #f8fafc;
}

/* Dark mode support */
.dark .rich-text-editor .editor-table {
  border-color: #334155;
}

.dark .rich-text-editor .editor-table th,
.dark .rich-text-editor .editor-table td {
  border-color: #334155;
}

.dark .rich-text-editor .editor-table th {
  background-color: #1e293b;
}

.dark .rich-text-editor .editor-table tr:nth-child(even) {
  background-color: #1e293b;
}

/* Math fields */
.rich-text-editor math-field {
  transition: all 0.2s ease-in-out;
}

.rich-text-editor math-field:empty {
  min-width: 2em;
  display: inline-block;
}

/* Text and background styling */
.rich-text-editor [style*="color:"] {
  transition: color 0.2s ease;
}

.rich-text-editor [style*="background-color:"] {
  padding: 0 2px;
  border-radius: 2px;
  transition: background-color 0.2s ease;
}

/* Selection styles */
.rich-text-editor::selection,
.rich-text-editor *::selection {
  background-color: rgba(59, 130, 246, 0.3);
}

.dark .rich-text-editor::selection,
.dark .rich-text-editor *::selection {
  background-color: rgba(59, 130, 246, 0.5);
}

/* Dark mode text color */
.dark .rich-text-editor {
  color-scheme: dark;
}
`;

// Apply the styles
const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);

export default RichTextArea; 