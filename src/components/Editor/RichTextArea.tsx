import { useEffect, useState } from 'react';
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

// List style definitions for both ordered and unordered lists
interface ListStyle {
  className: string;
  marker: string;
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
  
  // Handle keyboard events in the editor
  const handleEditorKeyDown = (e: React.KeyboardEvent) => {
    // First call the inline math handler
    handleInlineMathKeyDown(e);
    
    // Handle tab key for list indentation and style changes
    if (e.key === 'Tab') {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
      
      // Find if we're in a list item
      const range = selection.getRangeAt(0);
      let listItem = null;
      let listElement = null;
      let node = range.startContainer;
      
      // Walk up the DOM tree to find if we're in a list item
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          if (element.tagName === 'LI') {
            listItem = element;
          }
          if (element.tagName === 'UL' || element.tagName === 'OL') {
            listElement = element;
            break;
          }
        }
        node = node.parentNode;
      }
      
      // If we're in a list item
      if (listItem && listElement) {
        e.preventDefault(); // Prevent default tab behavior
        
        if (e.shiftKey) {
          // Shift+Tab: Outdent or change list style in reverse
          handleOutdent(listItem, listElement);
        } else {
          // Tab: Indent or change list style
          handleIndent(listItem, listElement);
        }
        
        // Update content
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      }
      
      return;
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
  
  // Handle indentation (Tab key) of list items
  const handleIndent = (listItem: HTMLElement, listElement: HTMLElement) => {
    const isOrderedList = listElement.tagName === 'OL';
    const listStyles = isOrderedList ? orderedListStyles : unorderedListStyles;
    
    // Check current indentation level
    const indentLevel = getIndentLevel(listItem);
    
    // Get parent list and its style
    const parentList = listElement as HTMLElement;
    const currentListStyle = getListStyle(parentList, isOrderedList);
    
    // Calculate next style index
    const currentStyleIndex = listStyles.findIndex(style => style.className === currentListStyle);
    const nextStyleIndex = (currentStyleIndex + 1) % listStyles.length;
    
    // Determine if this is the first item in the list
    const isFirstItem = !listItem.previousElementSibling;
    
    if (isFirstItem && indentLevel === 0) {
      // If this is the first item with no indentation, just change the list style
      applyListStyle(parentList, listStyles[nextStyleIndex].className, listStyles[nextStyleIndex].marker);
    } else {
      // Create or find a nested list
      
      // Check if there's already a nested list inside this item
      let nestedList = Array.from(listItem.children).find(child => 
        child.tagName === 'UL' || child.tagName === 'OL'
      ) as HTMLElement | undefined;
      
      if (!nestedList) {
        // Create a new nested list with appropriate style
        nestedList = document.createElement(isOrderedList ? 'OL' : 'UL');
        
        // Choose the style based on nesting level
        // For better visual hierarchy, use a different style than the parent list
        const nestedLevel = indentLevel + 1;
        const nestedStyleIndex = nestedLevel % listStyles.length;
        
        // Apply appropriate style based on nesting level
        nestedList.className = listStyles[nestedStyleIndex].className;
        nestedList.setAttribute('style', `list-style-type: ${listStyles[nestedStyleIndex].marker};`);
        
        // Append nested list to the list item
        listItem.appendChild(nestedList);
      }
      
      // Move subsequent siblings into nested list until we hit another list or the end
      let nextSibling = listItem.nextElementSibling;
      while (nextSibling && nextSibling.tagName === 'LI') {
        const current = nextSibling;
        nextSibling = nextSibling.nextElementSibling;
        nestedList.appendChild(current);
      }
    }
  };
  
  // Handle outdenting (Shift+Tab) of list items
  const handleOutdent = (listItem: HTMLElement, listElement: HTMLElement) => {
    const isOrderedList = listElement.tagName === 'OL';
    const listStyles = isOrderedList ? orderedListStyles : unorderedListStyles;
    
    // Get parent list
    const parentList = listElement;
    
    // Check if this is a nested list within another list item
    const parentListItem = parentList.parentElement?.closest('li');
    const isNested = !!parentListItem;
    
    if (isNested) {
      // This is a nested list, move this item out to parent level
      const grandparentList = parentList.parentElement?.closest(isOrderedList ? 'ol' : 'ul') as HTMLElement;
      
      // If there's no next sibling in the current list, move up to the parent list
      if (!listItem.nextElementSibling) {
        // Insert the list item after the parent list item
        if (parentListItem.nextElementSibling) {
          grandparentList.insertBefore(listItem, parentListItem.nextElementSibling);
        } else {
          grandparentList.appendChild(listItem);
        }
        
        // If this was the only item in the nested list, remove the empty nested list
        if (parentList.children.length === 0) {
          parentList.remove();
        }
      } else {
        // Create a new list for this item and subsequent siblings
        const newList = document.createElement(isOrderedList ? 'OL' : 'UL');
        
        // Get the style of the grandparent list
        // We need to determine what style would be appropriate for this level
        const parentLevel = getIndentLevel(parentListItem);
        const grandparentStyle = getListStyle(grandparentList, isOrderedList);
        
        // Calculate the style for this level, based on the parent's indentation level
        // This ensures the new list fits visually in the hierarchy
        const styleIndex = (parentLevel + 1) % listStyles.length;
        const styleClass = listStyles[styleIndex].className;
        const styleMarker = listStyles[styleIndex].marker;
        
        // Apply the appropriate style
        newList.className = styleClass;
        newList.setAttribute('style', `list-style-type: ${styleMarker};`);
        
        // Add this item to the new list
        newList.appendChild(listItem);
        
        // Insert the new list after the parent list item
        if (parentListItem.nextElementSibling) {
          grandparentList.insertBefore(newList, parentListItem.nextElementSibling);
        } else {
          grandparentList.appendChild(newList);
        }
      }
    } else {
      // This is not nested, just rotate through styles in reverse
      const currentStyle = getListStyle(parentList, isOrderedList);
      const currentIndex = listStyles.findIndex(style => style.className === currentStyle);
      const prevIndex = (currentIndex - 1 + listStyles.length) % listStyles.length;
      
      applyListStyle(parentList, listStyles[prevIndex].className, listStyles[prevIndex].marker);
    }
  };
  
  // Get the indentation level of a list item
  const getIndentLevel = (listItem: HTMLElement): number => {
    let level = 0;
    let parentList = listItem.closest('ul, ol');
    
    while (parentList) {
      // Check if parent list is nested within another list item
      const parentListItem = parentList.parentElement?.closest('li');
      if (!parentListItem) break;
      
      level++;
      parentList = parentListItem.closest('ul, ol');
    }
    
    return level;
  };
  
  // Get the current list style of a list element
  const getListStyle = (listElement: HTMLElement, isOrderedList: boolean): string => {
    const listStyles = isOrderedList ? orderedListStyles : unorderedListStyles;
    
    // Check for list style classes
    for (const style of listStyles) {
      if (listElement.classList.contains(style.className)) {
        return style.className;
      }
    }
    
    // If no style class is found, return default
    return listStyles[0].className;
  };
  
  // Apply a specific list style to a list element
  const applyListStyle = (listElement: HTMLElement, className: string, marker: string) => {
    // Clear existing style classes
    const allClasses = [...orderedListStyles, ...unorderedListStyles].map(style => style.className);
    listElement.classList.remove(...allClasses);
    
    // Add new style class
    listElement.classList.add(className);
    
    // Set direct style attribute for better compatibility
    listElement.setAttribute('style', `list-style-type: ${marker};`);
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

// Add styles for tables and lists
const styles = `
.rich-text-editor ul {
  margin-left: 1.5em;
  padding-left: 1em;
}

.rich-text-editor ol {
  list-style-type: none;
  margin-left: 0;
  padding-left: 0;
  counter-reset: item;
}

/* Default list styles */
.rich-text-editor ul.list-disc {
  list-style-type: disc;
  margin-left: 1.5em;
}

.rich-text-editor ul.list-circle {
  list-style-type: circle;
  margin-left: 2em; /* More indentation */
}

.rich-text-editor ul.list-square {
  list-style-type: square;
  margin-left: 2.5em; /* Even more indentation */
}

/* Ordered list styles with progressive indentation */
.rich-text-editor ol.list-decimal > li::before {
  content: counter(item) ".";
  width: 2em; /* Base width */
}

.rich-text-editor ol.list-alpha > li::before {
  content: counter(item, lower-alpha) ".";
  width: 2.5em; /* Wider for alphabets */
  margin-left: 0.5em; /* Extra indentation */
}

.rich-text-editor ol.list-roman > li::before {
  content: counter(item, lower-roman) ".";
  width: 3em; /* Wider for roman numerals */
  margin-left: 1em; /* Even more indentation */
}

.rich-text-editor ol > li {
  counter-increment: item;
  margin-bottom: 0.5em;
  display: flex;
  align-items: flex-start;
  width: 100%; /* Ensure li takes full width to allow alignment */
}

.rich-text-editor ol > li::before {
  display: inline-block;
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

.rich-text-editor li li > ol.list-alpha {
  margin-left: 2.3em;
}

.rich-text-editor li li > ol.list-roman {
  margin-left: 2.8em;
}

.rich-text-editor li li > ul.list-disc {
  margin-left: 1.8em;
}

.rich-text-editor li li > ul.list-circle {
  margin-left: 2.3em;
}

.rich-text-editor li li > ul.list-square {
  margin-left: 2.8em;
}

/* Even deeper nesting */
.rich-text-editor li li li > ol,
.rich-text-editor li li li > ul {
  margin-left: 3em;
}

/* Ensure visual distinction between different types of ordered lists */
/* Use different color tints for the different list types to enhance visual distinction */
.rich-text-editor ol.list-decimal > li::before {
  color: #000000; /* Default black for numbers */
}

.rich-text-editor ol.list-alpha > li::before {
  color: #444444; /* Darker gray for alphabets */
}

.rich-text-editor ol.list-roman > li::before {
  color: #666666; /* Medium gray for roman numerals */
}

/* Different bullet colors for unordered lists */
.rich-text-editor ul.list-disc > li {
  color: #000000; /* Default black for disc */
}

.rich-text-editor ul.list-circle > li {
  color: #444444; /* Darker gray for circle */
}

.rich-text-editor ul.list-square > li {
  color: #666666; /* Medium gray for square */
}

/* Restore text color for list item content */
.rich-text-editor ul.list-circle > li *,
.rich-text-editor ul.list-square > li * {
  color: inherit;
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