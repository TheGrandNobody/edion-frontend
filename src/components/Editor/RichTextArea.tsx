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
.rich-text-editor ul {
  list-style-type: disc;
  margin-left: 1.5em;
  padding-left: 1em;
}

.rich-text-editor ol {
  list-style-type: none;
  margin-left: 0;
  padding-left: 0;
  counter-reset: item;
}

.rich-text-editor ol > li {
  counter-increment: item;
  margin-bottom: 0.5em;
  display: flex;
  align-items: flex-start;
  width: 100%; /* Ensure li takes full width to allow alignment */
}

.rich-text-editor ol > li::before {
  content: counter(item) ".";
  display: inline-block;
  width: 2em;
  margin-right: 0.5em;
  text-align: right;
  font-weight: inherit;
  font-style: inherit;
  text-decoration: inherit;
}

/* Marker styling for ordered lists using ::before pseudo-element */
.rich-text-editor ol > li.marker-bold::before {
  font-weight: bold;
}

.rich-text-editor ol > li.marker-italic::before {
  font-style: italic;
}

.rich-text-editor ol > li.marker-underline::before {
  text-decoration: underline;
}

/* Marker styling for unordered lists using ::marker pseudo-element */
.rich-text-editor ul > li.marker-bold::marker {
  font-weight: bold;
}

.rich-text-editor ul > li.marker-italic::marker {
  font-style: italic;
}

.rich-text-editor ul > li.marker-underline::marker {
  text-decoration: underline;
}

/* Additional styling for bullet lists to ensure marker styling works consistently */
.rich-text-editor ul > li {
  padding-left: 0.5em;
}

/* Tip: To format list markers, place cursor at beginning of list item and use the formatting buttons */

.rich-text-editor li {
  margin-bottom: 0.5em;
}

/* Support for aligned lists */
.rich-text-editor ul[style*="text-align: center"],
.rich-text-editor ol[style*="text-align: center"] {
  text-align: center;
  padding-left: 0;
  margin-left: 0;
}

.rich-text-editor ul[style*="text-align: right"],
.rich-text-editor ol[style*="text-align: right"] {
  text-align: right;
  padding-left: 0;
  margin-left: 0;
}

/* Handle list items with right alignment, regardless of where the alignment is applied */
.rich-text-editor ul[style*="text-align: center"] li,
.rich-text-editor ul[style*="text-align: right"] li,
.rich-text-editor [style*="text-align: center"] ul li,
.rich-text-editor [style*="text-align: right"] ul li {
  list-style-position: inside;
}

/* Ordered list alignment - ensure counter stays with text */
.rich-text-editor ol > li[style*="justify-content: center"],
.rich-text-editor ol > li[style*="justify-content: flex-end"] {
  width: 100%;
  padding-left: 0;
}

.rich-text-editor ol > li[style*="justify-content: center"]::before,
.rich-text-editor ol > li[style*="justify-content: flex-end"]::before {
  position: relative;
  flex: 0 0 auto;
}

/* Important: Clear floats and adjust positioning for ordered lists */
.rich-text-editor ol[style*="text-align: right"],
.rich-text-editor ol[style*="text-align: center"] {
  /* Override any inherited padding/margin */
  padding-left: 0 !important;
  margin-left: 0 !important;
}

/* Ensure correct alignment of list items regardless of how alignment is applied */
.rich-text-editor ol > li[style*="justify-content: center"] {
  justify-content: center !important;
}

.rich-text-editor ol > li[style*="justify-content: flex-end"] {
  justify-content: flex-end !important;
}

.rich-text-editor ol[style*="text-align: center"] > li,
.rich-text-editor [style*="text-align: center"] ol > li {
  justify-content: center !important;
}

.rich-text-editor ol[style*="text-align: right"] > li,
.rich-text-editor [style*="text-align: right"] ol > li {
  justify-content: flex-end !important;
}

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

.rich-text-editor math-field {
  transition: all 0.2s ease-in-out;
}

.rich-text-editor math-field:empty {
  min-width: 2em;
  display: inline-block;
}

/* Text and Background Color styling */
.rich-text-editor [style*="color:"] {
  transition: color 0.2s ease;
}

.rich-text-editor [style*="background-color:"] {
  padding: 0 2px;
  border-radius: 2px;
  transition: background-color 0.2s ease;
}

/* Selection styles for better editing experience */
.rich-text-editor::selection,
.rich-text-editor *::selection {
  background-color: rgba(59, 130, 246, 0.3);
}

.dark .rich-text-editor::selection,
.dark .rich-text-editor *::selection {
  background-color: rgba(59, 130, 246, 0.5);
}

/* Better text color visibility in dark mode */
.dark .rich-text-editor {
  color-scheme: dark;
}

/* Ensure alignment styles work reliably */
.rich-text-editor ol {
  list-style-type: none;
  margin-left: 0;
  padding-left: 0;
  counter-reset: item;
}

/* Direct alignment on LI elements for ordered lists */
.rich-text-editor ol > li {
  counter-increment: item;
  margin-bottom: 0.5em;
  display: flex;
  align-items: flex-start;
  width: 100%; /* Ensure li takes full width to allow alignment */
}

/* Fix for alignment changes not taking effect */
.rich-text-editor ol[style*="text-align"] {
  display: block;
  width: 100%;
}

/* Override specificity issues with !important for alignment styles */
.rich-text-editor ol[style*="text-align: left"] > li {
  justify-content: flex-start !important;
}

.rich-text-editor ol[style*="text-align: center"] > li {
  justify-content: center !important;
}

.rich-text-editor ol[style*="text-align: right"] > li {
  justify-content: flex-end !important;
}

/* Ensure these rules have higher specificity */
.rich-text-editor ol > li[style*="justify-content: flex-start"] {
  justify-content: flex-start !important;
}

.rich-text-editor ol > li[style*="justify-content: center"] {
  justify-content: center !important;
}

.rich-text-editor ol > li[style*="justify-content: flex-end"] {
  justify-content: flex-end !important;
}
`;

// Apply the styles
const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);

export default RichTextArea; 