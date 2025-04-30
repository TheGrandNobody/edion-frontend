import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook to handle inline math operations in the WYSIWYG editor
 */
export const useInlineMath = () => {
  // Add state to track empty math fields pending deletion
  const emptyMathFieldRef = useRef<HTMLElement | null>(null);

  /**
   * Find a math field element starting from a given node
   */
  const findMathField = (node: Node | null): HTMLElement | null => {
    if (!node) return null;

    // Check if we're inside a math field
    let current = node;
    while (current) {
      if (current instanceof HTMLElement && current.tagName === 'MATH-FIELD') {
        return current;
      }
      current = current.parentNode;
    }

    // Check if we're adjacent to or contain a math field
    const element = node instanceof HTMLElement ? node : node.parentElement;
    if (element) {
      // Check siblings
      const prevSibling = element.previousSibling;
      const nextSibling = element.nextSibling;

      if (prevSibling instanceof HTMLElement && prevSibling.tagName === 'MATH-FIELD') {
        return prevSibling;
      } else if (nextSibling instanceof HTMLElement && nextSibling.tagName === 'MATH-FIELD') {
        return nextSibling;
      }

      // Check children
      const mathFields = element.getElementsByTagName('MATH-FIELD');
      if (mathFields.length > 0) {
        return mathFields[mathFields.length - 1] as HTMLElement;
      }
    }

    // Check if we're in text node after math field
    if (node.nodeType === Node.TEXT_NODE && node.nodeValue === '\u200B') {
      const prevSibling = node.previousSibling;
      if (prevSibling instanceof HTMLElement && prevSibling.tagName === 'MATH-FIELD') {
        return prevSibling;
      }
    }

    return null;
  };

  /**
   * Add a zero-width space after an element
   */
  const addZeroWidthSpace = (element: Node) => {
    const textNode = document.createTextNode('\u200B');
    element.parentNode?.insertBefore(textNode, element.nextSibling);
  };

  /**
   * Focus the editor and position cursor
   */
  const focusEditor = () => {
    const editor = document.querySelector('[contenteditable="true"]') as HTMLElement;
    if (editor) {
      editor.focus();
    }
  };

  /**
   * Remove a math field and its adjacent zero-width spaces
   */
  const removeMathField = (mathField: HTMLElement) => {
    const nextSibling = mathField.nextSibling;
    const prevSibling = mathField.previousSibling;
    
    if (nextSibling?.nodeType === Node.TEXT_NODE && nextSibling.nodeValue === '\u200B') {
      nextSibling.remove();
    }
    if (prevSibling?.nodeType === Node.TEXT_NODE && prevSibling.nodeValue === '\u200B') {
      prevSibling.remove();
    }
    
    mathField.remove();
    focusEditor();
  };

  /**
   * Position cursor after a node and insert text
   */
  const positionCursorAndInsert = (node: Node, text: string) => {
    const range = document.createRange();
    const selection = window.getSelection();
    if (!selection) return;

    range.setStartAfter(node);
    range.setEndAfter(node);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('insertText', false, text);
  };

  /**
   * Initialize a newly created math field and set up cursor position
   */
  const initializeMathField = (parentElement: Element | null) => {
    setTimeout(() => {
      // Find the math field in the current context
      let mathFields: NodeListOf<Element> | undefined;
      
      // First try the direct parent element if provided
      if (parentElement) {
        mathFields = parentElement.querySelectorAll('math-field');
      }
      
      // If we didn't find math fields or no parent provided, try finding them in the editor
      if (!mathFields || mathFields.length === 0) {
        const editor = document.querySelector('[contenteditable="true"]');
        if (editor) {
          mathFields = editor.querySelectorAll('math-field');
        }
      }
      
      // Check if we found any math fields
      if (mathFields && mathFields.length > 0) {
        const newMathField = mathFields[mathFields.length - 1];
        if (newMathField) {
          // Ensure the math field is visible in viewport
          if ('scrollIntoView' in newMathField) {
            (newMathField as HTMLElement).scrollIntoView({ block: 'nearest' });
          }
          
          // Focus the math field
          (newMathField as HTMLElement).focus();
          addZeroWidthSpace(newMathField);
        }
      }
    }, 0);
  };

  /**
   * Check if the current selection is inside or near a math field
   */
  const isInsideMathField = (): boolean => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return false;
    return !!findMathField(selection.anchorNode);
  };

  /**
   * Insert math delimiters at the current cursor position
   */
  const insertMathDelimiters = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const container = range.startContainer;
    
    // Handle the case of empty lines - ensure we're in a proper container
    if (container.nodeType === Node.ELEMENT_NODE && 
        (container as HTMLElement).getAttribute('contenteditable') === 'true' &&
        range.startOffset === 0 && 
        (container as HTMLElement).childNodes.length === 0) {
      // We're on an empty contenteditable element
      // First create a paragraph to contain our math
      const paragraph = document.createElement('p');
      (container as HTMLElement).appendChild(paragraph);
      
      // Set selection to the new paragraph
      range.setStart(paragraph, 0);
      range.setEnd(paragraph, 0);
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (container.nodeType === Node.ELEMENT_NODE && 
              (container as HTMLElement).tagName === 'P' && 
              (container as HTMLElement).childNodes.length === 0) {
      // We're in an empty paragraph, that's fine - selection is already correct
    }

    if (isInsideMathField()) {
      const mathField = findMathField(selection.anchorNode);
      if (!mathField) return;
            
      // Create a text node with a space after the math field
      const spaceNode = document.createTextNode(' ');
      mathField.parentNode?.insertBefore(spaceNode, mathField.nextSibling);
      
      // Insert new math delimiters after the space
      positionCursorAndInsert(spaceNode, '\\(\\)');
      initializeMathField(mathField.parentElement);
    } else {
      // Capture the current element before insertion
      const currentElement = selection.anchorNode instanceof HTMLElement ? 
        selection.anchorNode : selection.anchorNode?.parentElement;
        
      document.execCommand('insertText', false, '\\(\\)');
      
      // Try to initialize with the captured element first
      initializeMathField(currentElement || null);
    }
  }, []);

  /**
   * Handle deletion of empty math fields
   */
  const handleMathFieldDelete = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    // Only handle events if we're actually in a math field
    if (target.tagName === 'MATH-FIELD') {
      // Handle Enter key to create a new line after the math block
      if (event.key === 'Enter') {
        console.log('Enter pressed in math field');
        console.log('Target element:', target);
        console.log('Parent element:', target.parentElement);
        
        event.preventDefault();
        
        // Find the parent paragraph or appropriate container
        let container = target.parentElement;
        console.log('Container before new paragraph:', container);
        
        // Create a new paragraph after the math field's container
        const newParagraph = document.createElement('p');
        newParagraph.innerHTML = '&#8203;'; // Zero-width space to ensure paragraph has content
        console.log('Created new paragraph:', newParagraph);
        
        // Insert the new paragraph after the container
        if (container) {
          console.log('Container exists, attempting to insert new paragraph');
          if (container.nextSibling) {
            console.log('Inserting before next sibling:', container.nextSibling);
            container.parentNode?.insertBefore(newParagraph, container.nextSibling);
          } else {
            console.log('No next sibling, appending to parent');
            container.parentNode?.appendChild(newParagraph);
          }
          
          // Set cursor to the new paragraph
          const range = document.createRange();
          const selection = window.getSelection();
          
          // Position at the start of the text content
          if (newParagraph.firstChild) {
            console.log('Setting range to first child of new paragraph');
            range.setStart(newParagraph.firstChild, 0);
          } else {
            console.log('Setting range to new paragraph itself');
            range.setStart(newParagraph, 0);
          }
          range.collapse(true);
          
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Ensure the new position is visible
            const clientRect = range.getBoundingClientRect();
            if (clientRect) {
              window.scrollTo({
                top: window.scrollY + clientRect.top - window.innerHeight / 2,
                behavior: 'smooth'
              });
            }
          }
          
          // Focus the editor
          const editor = document.querySelector('[contenteditable="true"]') as HTMLElement;
          if (editor) {
            console.log('Focusing editor');
            editor.focus();
          }
        } else {
          console.log('No container found for math field');
        }
        return;
      }
      
      // Handle backspace and delete for empty math fields
      if (event.key === 'Backspace' || event.key === 'Delete') {
        const mathField = target as any;
        console.log('Math field value:', mathField.value);
        console.log('Math field data-latex:', mathField.getAttribute('data-latex'));
        
        // Only proceed if the field is empty
        if (!mathField.value) {
          event.preventDefault();
          
          // If this is the first delete on an empty field
          if (emptyMathFieldRef.current !== mathField) {
            console.log('Math field is empty, press backspace/delete again to remove');
            emptyMathFieldRef.current = mathField;
            
            // Add a visual indicator that the field is pending deletion
            mathField.style.border = '1px solid red';
            mathField.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
            
            // Clear the pending state if the user starts typing
            const clearPendingState = () => {
              if (emptyMathFieldRef.current === mathField) {
                mathField.style.border = '';
                mathField.style.backgroundColor = '';
                emptyMathFieldRef.current = null;
              }
              mathField.removeEventListener('input', clearPendingState);
            };
            
            mathField.addEventListener('input', clearPendingState);
          } else {
            // This is the second delete, remove the field
            console.log('Removing empty math field after second delete');
            removeMathField(mathField);
            emptyMathFieldRef.current = null;
          }
        } else {
          // Field is not empty, clear any pending deletion state
          if (emptyMathFieldRef.current === mathField) {
            mathField.style.border = '';
            mathField.style.backgroundColor = '';
            emptyMathFieldRef.current = null;
          }
        }
      }
    }
  }, []);

  /**
   * Handle keyboard shortcuts and navigation
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
      event.preventDefault();
      insertMathDelimiters();
      return;
    }

    // Only handle backspace for text nodes outside math fields
    if (event.key === 'Backspace') {
      const target = event.target as HTMLElement;
      // Skip if we're inside a math field - that's handled by handleMathFieldDelete
      if (target.tagName === 'MATH-FIELD') {
        return;
      }

      const selection = window.getSelection();
      if (selection?.rangeCount) {
        const range = selection.getRangeAt(0);
        const container = range.startContainer;
        
        // If we're at the start of a text node or element
        if (range.startOffset === 0) {
          // Find the previous math field by walking the DOM backwards
          let currentNode: Node | null = container;
          let previousNode: Node | null = null;

          // First try to get the previous sibling or its last descendant
          if (currentNode.previousSibling) {
            previousNode = currentNode.previousSibling;
            // If the previous sibling has children, get its last descendant
            while (previousNode && previousNode.lastChild) {
              previousNode = previousNode.lastChild;
            }
          } else {
            // If no previous sibling, walk up the parent chain until we find one
            while (currentNode.parentNode) {
              if (currentNode.parentNode.previousSibling) {
                previousNode = currentNode.parentNode.previousSibling;
                // Get the last descendant of this previous sibling
                while (previousNode && previousNode.lastChild) {
                  previousNode = previousNode.lastChild;
                }
                break;
              }
              currentNode = currentNode.parentNode;
            }
          }

          // Check if we found a math field
          if (previousNode instanceof HTMLElement && previousNode.tagName === 'MATH-FIELD') {
            event.preventDefault();
            removeMathField(previousNode);
            return;
          }

          // Also check parent of previous node in case math field is wrapped
          let prevParent = previousNode?.parentNode;
          while (prevParent && !(prevParent instanceof HTMLElement && prevParent.tagName === 'MATH-FIELD')) {
            prevParent = prevParent.parentNode;
          }
          
          if (prevParent instanceof HTMLElement && prevParent.tagName === 'MATH-FIELD') {
            event.preventDefault();
            removeMathField(prevParent);
            return;
          }
        }
      }
    }
  }, [insertMathDelimiters]);

  // Add event listener for handling math field deletion
  useEffect(() => {
    document.addEventListener('keydown', handleMathFieldDelete);
    return () => document.removeEventListener('keydown', handleMathFieldDelete);
  }, [handleMathFieldDelete]);
  
  return {
    insertMathDelimiters,
    handleKeyDown,
    handleMathFieldDelete
  };
};

export default useInlineMath; 