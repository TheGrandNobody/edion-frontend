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
      
      let range = selection.getRangeAt(0);

      // Pre-adjustment for LI with startOffset 1 that is effectively empty
      if (range.collapsed &&
          range.startContainer.nodeType === Node.ELEMENT_NODE &&
          (range.startContainer as HTMLElement).tagName === 'LI' &&
          range.startOffset === 1) {
        
        const currentLi = range.startContainer as HTMLElement;
        
        const isEffectivelyEmptyLi = 
            currentLi.hasAttribute('data-empty-item') ||
            !currentLi.textContent?.trim() || // Check if visually empty
            (currentLi.childNodes.length === 0) || // No children at all
            (currentLi.childNodes.length === 1 && currentLi.firstChild?.nodeName === 'BR') || // Only a BR tag
            (currentLi.childNodes.length === 1 && currentLi.firstChild instanceof HTMLElement && currentLi.firstChild.classList.contains('list-item-spacer')); // Only our spacer

        if (isEffectivelyEmptyLi) {
          const newRange = document.createRange();
          newRange.setStart(currentLi, 0);
          newRange.collapse(true);
          selection.removeAllRanges(); 
          selection.addRange(newRange);   
          range = newRange;
        }
      }
      
      let node = range.startContainer;
      let listItem: HTMLElement | null = null;

      // Attempt to find the list item more directly, especially considering spacers
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).classList.contains('list-item-spacer')) {
        listItem = (node as HTMLElement).closest('li');
        if (listItem) {
          // If the spacer is the only content, or at the very start, adjust range
          const parentLi = node.parentElement;
          if (parentLi === listItem && (listItem.childNodes.length === 1 || (listItem.childNodes.length === 2 && listItem.firstChild?.nodeType === Node.TEXT_NODE && listItem.firstChild.textContent === ''))) {
            range.setStartBefore(node);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range); 
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'LI') {
        listItem = node as HTMLElement;
      } else if (node.parentNode && (node.parentNode as HTMLElement).tagName === 'LI') {
        // If cursor is in a text node that is the first child of LI (or after an empty text node)
        const parentLi = node.parentNode as HTMLElement;
        if (range.startOffset === 0 && (parentLi.firstChild === node || (parentLi.firstChild?.nodeType === Node.TEXT_NODE && parentLi.firstChild?.textContent === '' && parentLi.firstChild?.nextSibling === node))) {
           listItem = parentLi;
        }
      }
      
      // Check if cursor is at the beginning of a list item
      if (range.collapsed && range.startOffset === 0) {
        let node = range.startContainer;
        let listItem: HTMLElement | null = null;

        // If we're in a text node, check if it's the first child of a list item
        if (node.nodeType === Node.TEXT_NODE) {
          const parent = node.parentNode;
          if (parent && parent.firstChild === node) {
            let ancestor = parent;
            while (ancestor && ancestor !== editorRef.current) {
              if (ancestor.nodeType === Node.ELEMENT_NODE && (ancestor as HTMLElement).tagName === 'LI') {
                listItem = ancestor as HTMLElement;
                break;
              }
              ancestor = ancestor.parentNode;
            }
          } else if (parent) {
            // Check if parent is LI and this text node is effectively at the start
            if (parent.nodeType === Node.ELEMENT_NODE && (parent as HTMLElement).tagName === 'LI') {
              listItem = parent as HTMLElement;
            } else {
              // Try to find LI by going up from parent if text node is not first child
              let liCandidate = parent.parentElement;
              while(liCandidate && liCandidate !== editorRef.current && liCandidate.tagName !== 'LI') {
                liCandidate = liCandidate.parentElement;
              }
              if (liCandidate && liCandidate.tagName === 'LI') {
                listItem = liCandidate as HTMLElement;
              }
            }
          }
        } 
        // If we're directly in a list item element
        else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          if (element.classList.contains('list-item-spacer')) {
            listItem = element.closest('li');
          } else if (element.tagName === 'LI' && range.startOffset === 0) {
            listItem = element;
          } else if (element.parentElement?.tagName === 'LI' && 
                    element.parentElement.firstChild === element && 
                    range.startOffset === 0) {
            listItem = element.parentElement;
          }
        }
        
        if (listItem) {
          // Special handling for our spacer spans
          const spacer = listItem.querySelector('.list-item-spacer');
          if (spacer && (range.startContainer === spacer || range.startContainer.parentNode === spacer || (range.startContainer.nodeType === Node.TEXT_NODE && range.startContainer.parentNode === listItem && listItem.firstChild === spacer))) {
            // Check if text node before spacer is empty or doesn't exist
            if (spacer.previousSibling === null || (spacer.previousSibling.nodeType === Node.TEXT_NODE && spacer.previousSibling.textContent === '')) {
              // Let the existing logic handle it
            } else if (spacer.previousSibling?.nodeType === Node.TEXT_NODE) {
                range.setStart(spacer.previousSibling, spacer.previousSibling.textContent?.length || 0);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                return;
            }
          }
          
          // Check if this is the only item in the list
          const parentList = listItem.parentElement;
          if (parentList && parentList.children.length === 1) {
            const isEmpty = !listItem.textContent?.trim() ||
              listItem.hasAttribute('data-empty-item') ||
              listItem.innerHTML === '<br>' ||
              (listItem.childNodes.length === 1 && listItem.firstChild?.nodeName === 'BR') ||
              (listItem.childNodes.length === 1 && listItem.firstChild instanceof HTMLElement &&
                listItem.firstChild.classList.contains('list-item-spacer'));

            if (isEmpty) {
              const listContainer = parentList.parentNode;
              const prevSibling = parentList.previousSibling;
              const nextSibling = parentList.nextSibling;

              listContainer?.removeChild(parentList);

              const newRange = document.createRange();

              if (editorRef.current && editorRef.current.childNodes.length === 0) {
                newRange.setStart(editorRef.current, 0);
              } else if (prevSibling) {
                if (prevSibling.nodeType === Node.ELEMENT_NODE) {
                  newRange.setStartAfter(prevSibling);
                } else { // Text node
                  newRange.setStart(prevSibling, prevSibling.textContent?.length || 0);
                }
              } else if (nextSibling) {
                if (nextSibling.nodeType === Node.ELEMENT_NODE) {
                  newRange.setStartBefore(nextSibling);
                } else { // Text node
                  newRange.setStart(nextSibling, 0);
                }
              } else if (listContainer && listContainer.childNodes.length > 0) {
                 // List was inside a container that is not the editor root and now has other children,
                 // or listContainer is the editorRef itself and it's not empty.
                 // Try to place cursor at the start of the container or editor.
                newRange.setStart(listContainer, 0);
              } else if (listContainer) {
                // Container is empty, but it's not the editor (e.g. a div that held the list)
                // Place cursor inside this container.
                newRange.setStart(listContainer, 0);
              } else {
                 // Fallback: editor is not empty, but no obvious place for cursor, put at start of editor.
                if (editorRef.current && editorRef.current.childNodes.length > 0) {
                    newRange.setStart(editorRef.current.firstChild!, 0);
                } else if (editorRef.current) { // Editor is empty (should have been caught by first case)
                    newRange.setStart(editorRef.current, 0);
                }
                // If editorRef.current is null, newRange remains uninitialized - selection won't change.
              }
              
              if (editorRef.current) { // Only try to set range if editor exists
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
                editorRef.current.focus(); // Ensure editor has focus
              }

            } else {
              // Single, NON-empty list item. Replace list with a paragraph containing item's content.
              const p = document.createElement('p');
              let contentToTransfer = listItem.innerHTML;
              const tempDivForSpacerRemoval = document.createElement('div');
              tempDivForSpacerRemoval.innerHTML = contentToTransfer;
              const spacers = tempDivForSpacerRemoval.querySelectorAll('.list-item-spacer');
              spacers.forEach(s => s.remove());
              contentToTransfer = tempDivForSpacerRemoval.innerHTML;
              if (contentToTransfer.trim() === '' || contentToTransfer.toLowerCase() === '<br>') {
                p.innerHTML = '<br>';
              } else {
                p.innerHTML = contentToTransfer;
              }
              parentList.parentNode?.replaceChild(p, parentList);
              const newRange = document.createRange();
              newRange.setStart(p, 0);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
              p.focus();
            }
            
            e.preventDefault();
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
          
          const isEffectivelyEmptyDueToSpacerOrBr = (firstSpan && (firstSpan === listItem.firstChild || 
              (listItem.firstChild?.nodeType === Node.TEXT_NODE && 
               listItem.firstChild.textContent === '' && 
               listItem.firstChild.nextSibling === firstSpan))) || onlyContainsBr;

          if (isEffectivelyEmptyDueToSpacerOrBr) {
            if (listItem.childNodes.length <= 2 || 
                (listItem.childNodes.length === 3 && 
                 listItem.firstChild?.nodeType === Node.TEXT_NODE && 
                 listItem.firstChild.textContent === '') ||
                listItem.hasAttribute('data-empty-item') ||
                onlyContainsBr) {
              const parentList = listItem.parentElement;
              parentList?.removeChild(listItem);
              
              if (parentList && parentList.children.length === 0) {
                const p = document.createElement('p');
                p.innerHTML = '<br>';
                parentList.parentNode?.replaceChild(p, parentList);
                const newRange = document.createRange();
                newRange.setStart(p, 0);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
              }
              
              e.preventDefault();
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
              }
              
              // OL element inside the added node
              const nestedOl = (node as HTMLElement).querySelector('ol');
              if (nestedOl) {
                shouldProcessLists = true;
              }
              
              // Check for newly added list items
              if ((node as HTMLElement).tagName === 'LI') {
                newListItems.push(node as HTMLLIElement);
                shouldProcessLists = true;
              }
              
              // Check for list items inside the added node
              const nestedItems = (node as HTMLElement).querySelectorAll('li');
              if (nestedItems.length > 0) {
                nestedItems.forEach(item => {
                  newListItems.push(item as HTMLLIElement);
                });
                shouldProcessLists = true;
              }
            }
          });
        }
      });
      
      // Process lists if needed
      if (shouldProcessLists) {
        // First process any directly identified new list items
        if (newListItems.length > 0) {
          newListItems.forEach(item => {
            const isInOrderedList = item.closest('ol') !== null;
            
            if (isInOrderedList) {
              // Only process if it doesn't already have our special marker
              if (!item.classList.contains('list-spacing-fixed')) {
                // Add the special class
                item.classList.add('list-spacing-fixed');
                
                // If the list item is empty or only has a BR, add a spacer
                const isEmpty = !item.textContent?.trim() || 
                  (item.childNodes.length === 1 && item.firstChild?.nodeName === 'BR');

                if (isEmpty) {
                  // Remove BR if present
                  if (item.firstChild?.nodeName === 'BR') {
                    item.removeChild(item.firstChild);
                  }
                  
                  // Clear existing content
                  item.innerHTML = '';
                  
                  // Create a spacer element
                  const spacerSpan = document.createElement('span');
                  spacerSpan.className = 'list-item-spacer';
                  spacerSpan.textContent = '\u200B'; // Zero-width space
                  
                  // Add it to the list item
                  item.appendChild(spacerSpan);
                  
                  // Mark as empty
                  item.setAttribute('data-empty-item', 'true');
                  
                  // Position cursor after the spacer
                  const selection = window.getSelection();
                  if (selection) {
                    const range = document.createRange();
                    range.setStartAfter(spacerSpan);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                  }
                }
              }
            }
          });
        }
        
        // Also check for any ordered lists to make sure we didn't miss anything
        const orderedLists = editorRef.current?.querySelectorAll('ol');
        if (orderedLists?.length) {
          orderedLists.forEach(list => {
            const items = list.querySelectorAll('li:not(.list-spacing-fixed)');
            if (items.length > 0) {
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
    
    const handleInput = (e: Event) => {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
      
      let node = selection.anchorNode;
      let listItem: HTMLElement | null = null;
      
      // Find if we're in a list item
      while (node && node !== editor) {
        if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'LI') {
          listItem = node as HTMLElement;
          break;
        }
        node = node.parentNode;
      }
      
      if (listItem) {
        // Check if we're typing inside a spacer
        const spacer = listItem.querySelector('.list-item-spacer');
        if (spacer && spacer.textContent !== '\u200B') {
          // Get the content that was typed
          const content = spacer.textContent?.replace('\u200B', '') || '';
          
          // Remove the spacer
          spacer.remove();
          
          // Create a new text node with the content
          const textNode = document.createTextNode(content);
          
          // Add it to the list item
          listItem.appendChild(textNode);
          
          // Position cursor after the content
          const range = document.createRange();
          range.setStart(textNode, content.length);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          
          // Remove empty markers
          listItem.removeAttribute('data-empty-item');
          
          // Update content and return early since we've handled the input
          if (onChange) {
            onChange((e.target as HTMLDivElement).innerHTML);
          }
          return;
        }
        
        // Check if there's actual content (ignoring spacers and zero-width spaces)
        const hasActualContent = Array.from(listItem.childNodes).some(node => {
          // Skip spacer elements
          if (node instanceof HTMLElement && node.classList.contains('list-item-spacer')) {
            return false;
          }
          // Skip empty text nodes or those with only zero-width space
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || '';
            return text.replace(/[\u200B\s]/g, '').length > 0;
          }
          // Consider any other node as content
          return true;
        });
        
        if (hasActualContent) {
          // Remove the empty marker
          listItem.removeAttribute('data-empty-item');
          
          // Remove any spacers
          const spacers = listItem.querySelectorAll('.list-item-spacer');
          spacers.forEach(spacer => {
            spacer.remove();
          });
          
          // Clean up any leftover zero-width spaces
          const cleanText = listItem.innerHTML.replace(/\u200B/g, '');
          if (cleanText !== listItem.innerHTML) {
            listItem.innerHTML = cleanText;
            
            // Restore cursor position at the end of the content
            const range = document.createRange();
            range.selectNodeContents(listItem);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }
      
      if (onChange) {
        onChange((e.target as HTMLDivElement).innerHTML);
      }
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
  counter-reset: list-item;
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

/* Base styles for ordered list items */
.rich-text-editor ol li {
  display: flex;
  position: relative;
  padding-left: 2.2em; /* Adjusted padding to provide space for the numbers */
  list-style-type: none !important; /* Hide the default numbers */
  counter-increment: list-item;
}

/* Number styling for ordered lists */
.rich-text-editor ol li:before {
  content: counter(list-item) ".";
  position: absolute;
  left: 0.5em;
  width: 1.5em;
  text-align: right;
  box-sizing: border-box;
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