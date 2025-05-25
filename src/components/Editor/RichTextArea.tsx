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
    // Only handle the indentation level
    const currentIndent = parseInt(listItem.style.getPropertyValue('--indent-level') || '0', 10);
    const newIndent = currentIndent + 40;
    listItem.style.setProperty('--indent-level', `${newIndent}px`);
    
    // Remove any inline styles that might interfere with flexbox layout
    listItem.style.removeProperty('list-style-position');
    listItem.style.removeProperty('padding-left');
  };

  const handleOutdent = (listItem: HTMLElement, listElement: HTMLElement) => {
    // Only handle the indentation level
    const currentIndent = parseInt(listItem.style.getPropertyValue('--indent-level') || '0', 10);
    if (currentIndent > 0) {
      const newIndent = Math.max(0, currentIndent - 40);
      if (newIndent === 0) {
        listItem.style.removeProperty('--indent-level');
        // Remove any inline styles
        listItem.style.removeProperty('list-style-position');
        listItem.style.removeProperty('padding-left');
      } else {
        listItem.style.setProperty('--indent-level', `${newIndent}px`);
      }
    }
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
        console.log('Processing list indentation. List item:', listItem, 'List element:', listElement);
        
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
  
  // Add a MutationObserver to log style changes on LI elements for debugging
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const targetElement = mutation.target as HTMLElement;
          if (targetElement.tagName === 'LI') {
            console.log('DEBUG: LI style changed. Element:', targetElement);
            console.log('DEBUG: LI new inline style:', targetElement.getAttribute('style'));
            const computedStyle = window.getComputedStyle(targetElement);
            console.log('DEBUG: LI computed justify-content:', computedStyle.justifyContent);
            console.log('DEBUG: LI computed text-align:', computedStyle.textAlign);
          }
        }
      }
    });

    observer.observe(editor, {
      attributes: true,
      subtree: true,
      attributeFilter: ['style']
    });

    return () => {
      observer.disconnect();
      console.log('DEBUG: LI style observer disconnected.');
    };
  }, [editorRef]); // Rerun if editorRef instance changes, though its .current is what matters
  
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
  /* text-align property will be set inline by the editor for alignment */
}

/* Base styles for list items */
.rich-text-editor ol li,
.rich-text-editor ul li {
  position: relative; /* Kept for potential future use, not strictly for ::before now */
  list-style-type: none !important;
  list-style-position: outside !important;
  margin-bottom: 0.5em;
  padding-left: var(--indent-level, 0px); /* Indentation applied here */
  display: flex;
  align-items: baseline; /* Align marker and text along their baseline */
  transition: padding-left 0.2s ease;
  /* text-align will be inherited or set directly on li for its content alignment */
}

/* Common styles for ::before as a flex item (marker) */
.rich-text-editor ol li::before,
.rich-text-editor ul li::before {
  flex-shrink: 0; /* Prevent marker from shrinking */
  white-space: nowrap;
  display: inline-block; /* Behaves well for width and text-align */
  width: 2em; /* Fixed width for the marker area */
  margin-right: 0.5em; /* Space between marker area and text content */
  box-sizing: border-box;
  /* No absolute positioning, no left/top/transition:left */
}

/* Number styling for ordered lists */
.rich-text-editor ol li::before {
  content: counter(list-item) ". "; /* Includes space for padding */
  text-align: right; /* Aligns "9.", "10." correctly in the 2em box */
}

/* Bullet styling for unordered lists */
.rich-text-editor ul li::before {
  content: "•"; /* Default bullet */
  text-align: right; /* Changed from center to right, to match OL's ::before text-align for alignment consistency */
}

/* List style variations for ordered lists (content changes) */
.rich-text-editor ol.list-decimal li::before {
  content: counter(list-item) ". ";
}

.rich-text-editor ol.list-alpha li::before {
  content: counter(list-item, lower-alpha) ". ";
}

.rich-text-editor ol.list-roman li::before {
  content: counter(list-item, lower-roman) ". ";
}

/* List style variations for unordered lists (content changes) */
.rich-text-editor ul.list-disc li::before {
  content: "•";
}

.rich-text-editor ul.list-circle li::before {
  content: "○";
}

.rich-text-editor ul.list-square li::before {
  content: "▪";
}

/* Ensure proper spacing with indentation (already handled by li padding-left) */
/* .rich-text-editor li[style*="--indent-level"] { margin-left: 0; } */


/* Add smooth transitions (already on li for padding-left) */
/* .rich-text-editor li { transition: padding-left 0.2s ease; } */
/* .rich-text-editor li::before { transition: left 0.2s ease; } REMOVED */


/* 
  Alignment Handling for List Items (LI):
  LI elements are flex containers (display: flex).
  The text-align style is typically set on the LI by the editor for alignment commands.
  We use justify-content on the LI to align its flex items (the ::before marker and the text content)
  according to the LI's specified text-align value.
  The padding-left for indentation still applies, and content is aligned within the remaining space.
*/
.rich-text-editor li[style*="text-align: left"],
.rich-text-editor li[style*="text-align:left"],
.rich-text-editor li[style*="text-align: start"],
.rich-text-editor li[style*="text-align:start"] {
  justify-content: flex-start !important;
}
.rich-text-editor li[style*="text-align: center"],
.rich-text-editor li[style*="text-align:center"] {
  justify-content: center !important;
}
.rich-text-editor li[style*="text-align: right"],
.rich-text-editor li[style*="text-align:right"],
.rich-text-editor li[style*="text-align: end"],
.rich-text-editor li[style*="text-align:end"] {
  justify-content: flex-end !important;
}

/* Dark mode support for markers */
.dark .rich-text-editor ol li::before,
.dark .rich-text-editor ul li::before {
  color: inherit;
}

/* Ensure numbers/bullets stay visible (z-index not needed for flex items) */
/* .rich-text-editor ol li::before, */
/* .rich-text-editor ul li::before { z-index: 1; } */

/* Cleanup of old/redundant list styling rules */
/* Remove any previous rules that relied on absolute positioning for ::before */
/* Remove rules trying to manage padding/width in overly complex ways */

/* Keep counter resets */
.rich-text-editor ol {
  counter-reset: list-item;
}

.rich-text-editor ol li {
  counter-increment: list-item;
}
/* Ensure these are not overriding the flex display or padding for li */
/* Example of a rule to be careful about if it exists elsewhere:
.rich-text-editor ol > li {
  display: flex; /* This is fine, matches new approach */
  /* margin-bottom: 0.5em; */ /* Also fine */
  /* width: 100%; */ /* This could conflict if we want LIs to shrink for centering. But with flex on LI, its items align internally. */
/*}
*/

/* Progressive indentation for nested lists - this needs to be re-evaluated with flex model.
   Currently, --indent-level handles all indentation via li's padding-left.
   If nested lists (ul/ol inside an li) need *additional* margin, that's separate.
   For now, relying on --indent-level applied to each li.
*/
.rich-text-editor li > ul,
.rich-text-editor li > ol {
  margin-top: 0.5em; /* Space before a nested list starts */
  /* margin-left: 1.5em; /* This would be *additional* to parent li's own --indent-level.
                           If --indent-level is correctly applied to nested li's, this might not be needed
                           or could be smaller. Let's keep it for now. */
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