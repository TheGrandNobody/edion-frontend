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
    
    // Handle Backspace key for list item deletion
    if (e.key === 'Backspace') {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
      
      const range = selection.getRangeAt(0);
      
      // Our diagnostic logging
      console.log('EmptyList: Handling backspace key, selection info:', {
        collapsed: range.collapsed,
        startOffset: range.startOffset,
        startContainer: range.startContainer.nodeType === Node.TEXT_NODE ? 'TEXT_NODE' : 
          (range.startContainer as HTMLElement).tagName || range.startContainer.nodeName
      });
      
      // Check if cursor is at the beginning of a list item
      if (range.collapsed && range.startOffset === 0) {
        let node = range.startContainer;
        let listItem: HTMLElement | null = null;
        
        // If we're in a text node, check if it's the first child of a list item
        if (node.nodeType === Node.TEXT_NODE) {
          // Check if this is the first text node in the list item
          const parent = node.parentNode;
          if (parent && parent.firstChild === node) {
            // Now check if the parent or an ancestor is a list item
            let ancestor = parent;
            while (ancestor && ancestor !== editorRef.current) {
              if (ancestor.nodeType === Node.ELEMENT_NODE && (ancestor as HTMLElement).tagName === 'LI') {
                listItem = ancestor as HTMLElement;
                break;
              }
              ancestor = ancestor.parentNode;
            }
          }
        } 
        // If we're directly in a list item element
        else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          
          // Our diagnostic logging
          console.log('EmptyList: Element detected:', {
            tagName: element.tagName,
            classList: Array.from(element.classList),
            isSpacerElement: element.classList.contains('list-item-spacer'),
            parentTagName: element.parentElement?.tagName || 'none',
            isFirstChild: element.parentElement?.firstChild === element
          });
          
          // Check if we're in a list-item-spacer span
          if (element.classList.contains('list-item-spacer')) {
            // Find the parent list item
            listItem = element.closest('li');
            console.log('EmptyList: Found list item via spacer:', listItem);
            // Force range to be at the start of the list item
            range.setStartBefore(element);
          }
          // Check if we're directly in a list item
          else if (element.tagName === 'LI' && range.startOffset === 0) {
            listItem = element;
            console.log('EmptyList: Found list item directly:', listItem);
          }
          // Check if we're in a span or other element at the beginning of a list item
          else if (element.parentElement?.tagName === 'LI' && 
                   element.parentElement.firstChild === element && 
                   range.startOffset === 0) {
            listItem = element.parentElement;
            console.log('EmptyList: Found list item via parent element:', listItem);
          }
        }
        
        // If we've found a list item and we're at its beginning
        if (listItem) {
          console.log('Debug - Backspace at start of list item, handling deletion');
          
          // Special handling for our spacer spans
          const spacer = listItem.querySelector('.list-item-spacer');
          if (spacer && range.startContainer === spacer || range.startContainer.parentNode === spacer) {
            // If cursor is in or before the spacer, it should act like we're at the beginning of the list item
            listItem.insertBefore(document.createTextNode(''), spacer);
            range.setStartBefore(spacer);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          }
          
          // Check if this is the only item in the list
          const parentList = listItem.parentElement;
          if (parentList && parentList.children.length === 1) {
            // If this is the only item, remove the entire list
            console.log('Debug - Removing entire list');
            
            // Check if the list item is empty or only contains a BR
            const isEmpty = !listItem.textContent?.trim() || 
              listItem.hasAttribute('data-empty-item') ||
              listItem.innerHTML === '<br>' || 
              (listItem.childNodes.length === 1 && listItem.firstChild?.nodeName === 'BR') ||
              (listItem.childNodes.length === 1 && listItem.firstChild instanceof HTMLElement && 
                listItem.firstChild.classList.contains('list-item-spacer'));
            
            // Replace the list with a paragraph
            const p = document.createElement('p');
            
            // If the list item is empty, just create an empty paragraph
            if (isEmpty) {
              p.innerHTML = '<br>'; // Empty paragraph needs a <br> to be visible
            } else {
              p.innerHTML = listItem.innerHTML;
              
              // Clean up any spacers
              const spacers = p.querySelectorAll('.list-item-spacer');
              spacers.forEach(s => s.remove());
            }
            
            // Replace the list with the paragraph
            parentList.parentNode?.replaceChild(p, parentList);
            
            // Set the cursor to the beginning of the new paragraph
            const newRange = document.createRange();
            newRange.setStart(p, 0);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            // Prevent default backspace behavior
            e.preventDefault();
            
            // Update content
            if (editorRef.current) {
              onChange(editorRef.current.innerHTML);
            }
            
            return;
          }
          
          // If there are other items, let the browser handle it, but we need to
          // make sure our spacers don't get in the way
          
          // Check if there's a list-item-spacer as the first child or if the list item only contains a BR
          const firstSpan = listItem.querySelector('.list-item-spacer');
          const onlyContainsBr = listItem.childNodes.length === 1 && listItem.firstChild?.nodeName === 'BR';
          
          if ((firstSpan && (firstSpan === listItem.firstChild || 
              (listItem.firstChild?.nodeType === Node.TEXT_NODE && 
               listItem.firstChild.textContent === '' && 
               listItem.firstChild.nextSibling === firstSpan))) || onlyContainsBr) {
            
            // If the span is the only content or is preceded by an empty text node,
            // or if the list item only contains a BR, we need to handle this specially
            if (listItem.childNodes.length <= 2 || 
                (listItem.childNodes.length === 3 && 
                 listItem.firstChild?.nodeType === Node.TEXT_NODE && 
                 listItem.firstChild.textContent === '') ||
                listItem.hasAttribute('data-empty-item') ||
                onlyContainsBr) {
              
              console.log('Debug - Empty list item with spacer/BR, removing');
              
              // This is effectively an empty list item, so we should remove it
              const parentList = listItem.parentElement;
              parentList?.removeChild(listItem);
              
              // If the list is now empty, remove it too
              if (parentList && parentList.children.length === 0) {
                const p = document.createElement('p');
                p.innerHTML = '<br>'; // Empty paragraph needs a <br> to be visible
                parentList.parentNode?.replaceChild(p, parentList);
                
                // Position cursor in the paragraph
                const newRange = document.createRange();
                newRange.setStart(p, 0);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
              }
              
              // Prevent default backspace behavior
              e.preventDefault();
              
              // Update content
              if (editorRef.current) {
                onChange(editorRef.current.innerHTML);
              }
              
              return;
            }
          }
        }
      }
    }
    
    // Handle deletion for math fields
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
  
  // Fix ordered list spacing after creation
  const fixOrderedListSpacing = () => {
    if (!editorRef.current) return;
    
    // Watch for mutations in the editor to detect list creation
    const observer = new MutationObserver((mutations) => {
      let shouldProcessLists = false;
      let newListItems: HTMLLIElement[] = [];
      
      // Check if any mutations involve ordered lists or list items
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Direct OL element added
              if ((node as HTMLElement).tagName === 'OL') {
                shouldProcessLists = true;
                console.log('EmptyList: OL element added directly');
              }
              
              // OL element inside the added node
              const nestedOl = (node as HTMLElement).querySelector('ol');
              if (nestedOl) {
                shouldProcessLists = true;
                console.log('EmptyList: Nested OL element found');
              }
              
              // Check for newly added list items
              if ((node as HTMLElement).tagName === 'LI') {
                newListItems.push(node as HTMLLIElement);
                shouldProcessLists = true;
                console.log('EmptyList: LI element added directly');
              }
              
              // Check for list items inside the added node
              const nestedItems = (node as HTMLElement).querySelectorAll('li');
              if (nestedItems.length > 0) {
                nestedItems.forEach(item => {
                  newListItems.push(item as HTMLLIElement);
                });
                shouldProcessLists = true;
                console.log('EmptyList: Nested LI elements found:', nestedItems.length);
              }
            }
          });
        }
      });
      
      // Process lists if needed
      if (shouldProcessLists) {
        console.log('EmptyList: Processing lists due to mutation');
        
        // First process any directly identified new list items
        if (newListItems.length > 0) {
          console.log('EmptyList: Processing new list items:', newListItems.length);
          
          newListItems.forEach(item => {
            const isInOrderedList = item.closest('ol') !== null;
            
            if (isInOrderedList) {
              // Only process if it doesn't already have our special marker
              if (!item.classList.contains('list-spacing-fixed')) {
                console.log('EmptyList: Adding spacing fix to list item:', {
                  innerHTML: item.innerHTML,
                  textContent: item.textContent
                });
                
                // Add the special class
                item.classList.add('list-spacing-fixed');
                
                // If the list item is empty or only has a BR, add a spacer
                if (!item.textContent?.trim() || (item.childNodes.length === 1 && item.firstChild?.nodeName === 'BR')) {
                  // Remove BR if present
                  if (item.firstChild?.nodeName === 'BR') {
                    item.removeChild(item.firstChild);
                  }
                  
                  // Clear existing content
                  (item as HTMLElement).innerHTML = '';
                  
                  // Create a spacer element
                  const spacerSpan = document.createElement('span');
                  spacerSpan.className = 'list-item-spacer';
                  spacerSpan.textContent = '\u200B'; // Zero-width space
                  
                  // Add it to the list item
                  item.appendChild(spacerSpan);
                  
                  // Mark as empty
                  (item as HTMLElement).setAttribute('data-empty-item', 'true');
                  
                  // Position cursor after the spacer
                  const selection = window.getSelection();
                  if (selection) {
                    const range = document.createRange();
                    range.setStartAfter(spacerSpan);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                  }
                  
                  console.log('Debug - Added spacer to empty list item');
                }
              }
            }
          });
        }
        
        // Also check for any ordered lists to make sure we didn't miss anything
        const orderedLists = editorRef.current?.querySelectorAll('ol');
        if (orderedLists?.length) {
          console.log('EmptyList: Checking ordered lists:', orderedLists.length);
          
          orderedLists.forEach(list => {
            const items = list.querySelectorAll('li:not(.list-spacing-fixed)');
            if (items.length > 0) {
              console.log('EmptyList: Found unfixed list items:', items.length);
              
              items.forEach(item => {
                // Add the special class
                item.classList.add('list-spacing-fixed');
                
                // If the list item is empty, add a spacer
                if (!item.textContent?.trim()) {
                  // Create a spacer element
                  const spacerSpan = document.createElement('span');
                  spacerSpan.className = 'list-item-spacer';
                  spacerSpan.textContent = '\u200B'; // Zero-width space
                  
                  // Add it to the list item
                  if (item.firstChild) {
                    item.insertBefore(spacerSpan, item.firstChild);
                  } else {
                    item.appendChild(spacerSpan);
                  }
                  
                  // Mark as empty
                  (item as HTMLElement).setAttribute('data-empty-item', 'true');
                  
                  console.log('Debug - Added spacer to unfixed list item');
                }
              });
            }
          });
        }
        
        // Update content after fixing spacing
        onChange(editorRef.current.innerHTML);
      }
    });
    
    // Start observing the editor with specific configuration
    observer.observe(editorRef.current, { 
      childList: true, 
      subtree: true,
      characterData: true
    });
    
    return observer;
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
    
    // Fix list spacing and get observer
    const observer = fixOrderedListSpacing();
    
    return () => {
      editor.removeEventListener('input', handleInput);
      editor.removeEventListener('keydown', handleDOMKeyDown);
      if (observer) {
        observer.disconnect();
      }
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
  list-style-position: outside; /* Use outside positioning by default */
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
}

/* Add space after ordered list numbers */
.rich-text-editor ol li::marker {
  content: counter(list-item) ". "; /* Add space after the period */
}

/* For browsers that don't support ::marker properly, use pseudo-elements */
.rich-text-editor ol {
  counter-reset: list-item;
}

.rich-text-editor ol li {
  display: block;
  position: relative;
  padding-left: 2.2em; /* Adjusted padding to provide space for the numbers */
  list-style-type: none !important; /* Hide the default numbers with higher specificity */
}

.rich-text-editor ol li:before {
  content: counter(list-item) "."; /* Remove the \u00A0 non-breaking space */
  counter-increment: list-item;
  position: absolute;
  left: 0.5em; /* Position the custom number */
  width: 1.5em; /* Fixed width for the number */
  white-space: nowrap;
  text-align: right;
  box-sizing: border-box;
}

/* Add more space after the list marker */
.rich-text-editor ol li.list-spacing-fixed:before {
  margin-right: 0.5em; /* Extra margin after the number */
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