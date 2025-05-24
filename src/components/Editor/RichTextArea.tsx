import { useEffect } from 'react';
import 'mathlive';
import useInlineMath from '../../hooks/useInlineMath';

interface ListStyle {
  className: string;
  marker: string;
}

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

// Add type declaration at the top of the file to support our custom property
declare global {
  interface HTMLElement {
    _spaceFixScheduled?: ReturnType<typeof setTimeout>;
  }
}

const RichTextArea = ({ content, onChange, editorRef }: RichTextAreaProps) => {
  const { handleKeyDown: handleInlineMathKeyDown, handleMathFieldDelete } = useInlineMath();
  
  // Define ordered list styles in sequence: decimal (1, 2, 3), alpha (a, b, c), roman (i, ii, iii)
  const orderedListStyles: ListStyle[] = [
    { className: 'list-decimal', marker: 'decimal' },
    { className: 'list-alpha', marker: 'lower-alpha' },
    { className: 'list-roman', marker: 'lower-roman' }
  ];
  
  // Define unordered list styles in sequence: disc, circle, square
  const unorderedListStyles: ListStyle[] = [
    { className: 'list-disc', marker: 'disc' },
    { className: 'list-circle', marker: 'circle' },
    { className: 'list-square', marker: 'square' }
  ];
  
  const handleIndent = (listItem: HTMLElement, listElement: HTMLElement) => {
    // First handle the indentation level
    const currentIndent = parseInt(listItem.style.getPropertyValue('--indent-level') || '0', 10);
    const newIndent = currentIndent + 40;
    listItem.style.setProperty('--indent-level', `${newIndent}px`);
    
    // Then handle style cycling
    const isOrdered = listElement.tagName === 'OL';
    const styles = isOrdered ? orderedListStyles : unorderedListStyles;
    const currentStyle = styles.findIndex(style => listElement.classList.contains(style.className));
    const nextStyle = styles[(currentStyle + 1) % styles.length];
    
    listElement.classList.remove(...styles.map(s => s.className));
    listElement.classList.add(nextStyle.className);
    
    // For ordered lists, ensure proper spacing
    if (isOrdered && !listItem.classList.contains('list-spacing-fixed')) {
      listItem.classList.add('list-spacing-fixed');
    }
  };

  const handleOutdent = (listItem: HTMLElement, listElement: HTMLElement) => {
    // First handle the indentation level
    const currentIndent = parseInt(listItem.style.getPropertyValue('--indent-level') || '0', 10);
    if (currentIndent > 0) {
      const newIndent = Math.max(0, currentIndent - 40);
      if (newIndent === 0) {
        listItem.style.removeProperty('--indent-level');
        listItem.style.removeProperty('padding-left');
      } else {
        listItem.style.setProperty('--indent-level', `${newIndent}px`);
      }
    }
    
    // Then handle style cycling
    const isOrdered = listElement.tagName === 'OL';
    const styles = isOrdered ? orderedListStyles : unorderedListStyles;
    const currentStyle = styles.findIndex(style => listElement.classList.contains(style.className));
    const prevStyle = styles[(currentStyle - 1 + styles.length) % styles.length];
    
    listElement.classList.remove(...styles.map(s => s.className));
    listElement.classList.add(prevStyle.className);
  };
  
  // Handle keyboard events in the editor
  const handleEditorKeyDown = (e: React.KeyboardEvent) => {
    // First call the inline math handler
    handleInlineMathKeyDown(e);
    
    // Handle tab key
    if (e.key === 'Tab') {
      console.log('Tab pressed');
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) {
        console.log('No selection found');
        return;
      }

      // Prevent default tab behavior
      e.preventDefault();

      // Check if we're in a list item
      const range = selection.getRangeAt(0);
      let node = range.startContainer;
      console.log('Initial node:', node);
      let listItem: HTMLElement | null = null;
      let listElement: HTMLElement | null = null;

      // Find the list item and list we're in, if any
      while (node && node !== editorRef.current) {
        console.log('Checking node:', node.nodeType, node instanceof HTMLElement ? node.tagName : 'not element');
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          if (element.tagName === 'LI') {
            console.log('Found list item');
            listItem = element;
          } else if (element.tagName === 'UL' || element.tagName === 'OL') {
            console.log('Found list element:', element.tagName);
            listElement = element;
            break;
          }
        }
        node = node.parentNode;
      }

      // Also check if the node's parent is a list item (for text nodes)
      if (!listItem && node?.parentElement?.tagName === 'LI') {
        console.log('Found list item through parent');
        listItem = node.parentElement;
        // Find the parent list
        listElement = listItem.parentElement as HTMLElement;
      }

      // If we're in a list, handle indentation
      if (listItem && listElement) {
        console.log('Processing list indentation');
        
        if (e.shiftKey) {
          console.log('Processing outdent');
          handleOutdent(listItem, listElement);
        } else {
          console.log('Processing indent');
          handleIndent(listItem, listElement);
        }
        
        // Update content
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      } else {
        console.log('Not in a list, inserting spaces');
        // Not in a list, insert spaces
        const tabTextNode = document.createTextNode('\u00A0\u00A0\u00A0\u00A0');
        range.deleteContents();
        range.insertNode(tabTextNode);
        range.setStartAfter(tabTextNode);
        range.setEndAfter(tabTextNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Update content
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      }
      return;
    }
    
    // Add special handling for space key in empty list items
    if (e.key === ' ') {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
      
      const range = selection.getRangeAt(0);
      
      // Check if we're in a list item
      let node = range.startContainer;
      let listItem = null;
      
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'LI') {
          listItem = node as HTMLElement;
          break;
        }
        node = node.parentNode;
      }
      
      if (listItem) {
        // Check for spacer and determine if this is a truly empty list item
        const spacer = listItem.querySelector('.list-item-spacer');
        
        // Check if the list item already has a space or regular content
        const hasSpace = listItem.innerHTML.includes('&nbsp;');
        const hasVisibleContent = !!listItem.textContent?.replace(/[\u200B\s]/g, '').trim();
        
        // Only consider a list item "effectively empty" if it has a spacer, is empty, or has just a BR
        const isEffectivelyEmpty = 
          (spacer !== null && !hasVisibleContent) || 
          listItem.innerHTML === '<br>' || 
          listItem.innerHTML === '' ||
          (listItem.hasAttribute('data-empty-item') && !hasSpace && !hasVisibleContent);
        
        // If we've already applied a space fix, don't interfere with normal typing
        const alreadyFixed = listItem.classList.contains('space-directly-fixed') && hasSpace;
        
        // Only apply our fix to truly empty list items
        if (isEffectivelyEmpty && !alreadyFixed) {
          return;
        }
      }
    }
    
    // Handle Backspace key for list item deletion
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

    editor.addEventListener('input', handleInput);
    
    // Initialize MathLive fields on initial render
    initializeMathLiveFields();
    
    return () => {
      editor.removeEventListener('input', handleInput);
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

// Add styles for tables and lists
const styles = `
/* Reset list styles for consistency */
.rich-text-editor ul,
.rich-text-editor ol {
  padding-left: 0;
  margin-left: 0;
  list-style-position: outside;
}

/* Base styles for list items */
.rich-text-editor ol li,
.rich-text-editor ul li {
  position: relative;
  padding-left: calc(2.2em + var(--indent-level, 0px));
  list-style-type: none !important;
  margin-bottom: 0.5em;
  transition: padding-left 0.2s ease;
}

/* Number styling for ordered lists */
.rich-text-editor ol {
  counter-reset: list-item;
}

.rich-text-editor ol li {
  counter-increment: list-item;
}

.rich-text-editor ol li::before {
  content: counter(list-item) ".";
  position: absolute;
  left: calc(0.5em + var(--indent-level, 0px));
  width: 1.5em;
  text-align: right;
  box-sizing: border-box;
  transition: left 0.2s ease;
}

/* Bullet styling for unordered lists */
.rich-text-editor ul li::before {
  content: "•";
  position: absolute;
  left: calc(0.5em + var(--indent-level, 0px));
  width: 1.5em;
  text-align: center;
  box-sizing: border-box;
  transition: left 0.2s ease;
}

/* List style variations */
.rich-text-editor ol.list-decimal li::before {
  content: counter(list-item) ".";
}

.rich-text-editor ol.list-alpha li::before {
  content: counter(list-item, lower-alpha) ".";
}

.rich-text-editor ol.list-roman li::before {
  content: counter(list-item, lower-roman) ".";
}

.rich-text-editor ul.list-disc li::before {
  content: "•";
}

.rich-text-editor ul.list-circle li::before {
  content: "○";
}

.rich-text-editor ul.list-square li::before {
  content: "▪";
}

/* Spacing for ordered lists */
.rich-text-editor ol li.list-spacing-fixed::before {
  margin-right: 0.5em;
}

/* Ensure proper spacing with indentation */
.rich-text-editor li[style*="--indent-level"] {
  margin-left: 0;
}

/* Add smooth transitions */
.rich-text-editor li {
  transition: padding-left 0.2s ease, margin-left 0.2s ease;
}

.rich-text-editor li::before {
  transition: left 0.2s ease;
}

/* Rest of your existing styles... */
.rich-text-editor ul {
  list-style-type: disc;
  margin-left: 1.5em;
  padding-left: 1em;
}

.rich-text-editor ol {
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

/* Progressive indentation for nested lists - each level indents more */
.rich-text-editor li > ul,
.rich-text-editor li > ol {
  margin-top: 0.5em;
  margin-left: 1.5em; /* Base indentation for nested lists */
}

/* Additional indentation for nested lists based on type */
.rich-text-editor li > ol.list-alpha {
  margin-left: 2em;
}

.rich-text-editor li > ol.list-roman {
  margin-left: 2.5em;
}

.rich-text-editor li > ul.list-circle {
  margin-left: 2em;
}

.rich-text-editor li > ul.list-square {
  margin-left: 2.5em;
}

/* Deeper nesting styles - increase indentation for each level */
.rich-text-editor li li > ol.list-decimal {
  margin-left: 1.8em;
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

/* All list items use consistent spacing - for unordered lists */
.rich-text-editor ul li {
  position: relative;
  list-style-position: inside;
  padding-left: 1.5em; /* Base padding for all list items */
  transition: padding-left 0.2s ease; /* Add smooth transition */
}

/* Add space after ordered list numbers */
.rich-text-editor ol li::marker {
  content: counter(list-item) ". "; /* Add space after the period */
}

/* For browsers that don't support ::marker properly, use pseudo-elements */
.rich-text-editor ol {
  counter-reset: list-item;
}

/* Base styles for ordered list items */
.rich-text-editor ol li {
  display: flex;
  position: relative;
  padding-left: 2.2em; /* Adjusted padding to provide space for the numbers */
  list-style-type: none !important; /* Hide the default numbers */
  counter-increment: list-item;
  transition: padding-left 0.2s ease, --marker-offset 0.2s ease; /* Add smooth transition */
}

/* Number styling for ordered lists */
.rich-text-editor ol li:before {
  content: counter(list-item) ".";
  position: absolute;
  left: var(--marker-offset, 0.5em); /* Use CSS Variable */
  width: 1.5em;
  text-align: right;
  box-sizing: border-box;
  transition: left 0.2s ease; /* Add smooth transition for the marker position */
}

/* Add more space after the list marker */
.rich-text-editor ol li.list-spacing-fixed:before {
  margin-right: 0.5em;
}

/* Alignment handling for ordered lists */
.rich-text-editor ol[style*="text-align: center"] li {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

.rich-text-editor ol[style*="text-align: center"] li:before {
  position: relative;
  left: 0;
  margin-right: 0.5em;
}

.rich-text-editor ol[style*="text-align: right"] li {
  justify-content: flex-end;
  padding-left: 0;
  padding-right: 2.2em;
}

.rich-text-editor ol[style*="text-align: right"] li:before {
  position: relative;
  left: 0;
  margin-right: 0.5em;
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

/* Indentation for regular text blocks */
.rich-text-editor p,
.rich-text-editor div,
.rich-text-editor h1,
.rich-text-editor h2,
.rich-text-editor h3,
.rich-text-editor h4,
.rich-text-editor h5,
.rich-text-editor h6 {
  transition: padding-left 0.2s ease;
}

/* Visual indicator for indented blocks */
.rich-text-editor p[style*="padding-left"],
.rich-text-editor div[style*="padding-left"],
.rich-text-editor h1[style*="padding-left"],
.rich-text-editor h2[style*="padding-left"],
.rich-text-editor h3[style*="padding-left"],
.rich-text-editor h4[style*="padding-left"],
.rich-text-editor h5[style*="padding-left"],
.rich-text-editor h6[style*="padding-left"] {
  /* Removing border and margin */
}

/* Dark mode support for indented blocks */
.dark .rich-text-editor p[style*="padding-left"],
.dark .rich-text-editor div[style*="padding-left"],
.dark .rich-text-editor h1[style*="padding-left"],
.dark .rich-text-editor h2[style*="padding-left"],
.dark .rich-text-editor h3[style*="padding-left"],
.dark .rich-text-editor h4[style*="padding-left"],
.rich-text-editor h5[style*="padding-left"],
.dark .rich-text-editor h6[style*="padding-left"] {
  /* Removing dark mode border */
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

/* Spacer for list items */
.rich-text-editor li .list-item-spacer {
  display: inline-block;
  min-width: 0.1em; /* Reduced from 0.4em to minimize visible space */
  white-space: pre;
}
`;

// Apply the styles
const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);

export default RichTextArea; 