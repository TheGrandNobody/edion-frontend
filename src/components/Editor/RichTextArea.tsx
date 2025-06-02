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
      let selection = window.getSelection(); // Use let as it might be updated
      if (!selection || !selection.rangeCount) {
        return;
      }
      
      e.preventDefault();

      let range = selection.getRangeAt(0); // Use let as it might be updated
      
      // Check if the current selection needs to be wrapped in a paragraph
      // This is for cases like raw text nodes directly in the editor or an empty editor state.
      const container = range.startContainer;
      const parentIsEditor = container.parentNode === editorRef.current;
      const editorIsEmptyOrBr = editorRef.current && (!editorRef.current.firstChild || editorRef.current.firstChild.nodeName === 'BR');
      const isRawTextNodeInEditor = container.nodeType === Node.TEXT_NODE && parentIsEditor;
      const isCursorAtEditorRoot = container === editorRef.current;

      if (isRawTextNodeInEditor || (isCursorAtEditorRoot && editorIsEmptyOrBr) || (parentIsEditor && container.nodeName === 'BR')) {
        document.execCommand('formatBlock', false, 'P');
        // Re-acquire selection and range as formatBlock can change them
        selection = window.getSelection();
        if (!selection || !selection.rangeCount) {
            return;
        }
        range = selection.getRangeAt(0);
      }

      let node = range.startContainer; // Node for traversal might have changed
      let listItem: HTMLElement | null = null;
      let listElement: HTMLElement | null = null;
      let currentBlockElement: HTMLElement | null = null;
      let isNewlyCreatedP = false; // Flag if we just made a P (though formatBlock handles this)

      // 1. Find existing block element or list item
      let tempNode = range.startContainer;
      if (tempNode === editorRef.current) { // Handle if cursor is on editor div itself
          tempNode = tempNode.childNodes[range.startOffset] || tempNode.firstChild;
      }

      while (tempNode && tempNode !== editorRef.current) {
        if (tempNode.nodeType === Node.ELEMENT_NODE) {
          const element = tempNode as HTMLElement;
          if (element.tagName === 'LI') {
            listItem = element;
            listElement = element.closest('ul, ol') as HTMLElement | null;
            currentBlockElement = listItem;
            break;
          } else if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
            currentBlockElement = element;
            const parentLi = element.closest('li');
            if (parentLi && listElement?.contains(parentLi)) {
                listItem = parentLi;
                currentBlockElement = parentLi; 
            }
            break;
          }
        }
        if (!tempNode.parentNode) break;
        tempNode = tempNode.parentNode;
      }
      
      // This case should ideally be caught by formatBlock now, but as a fallback:
      if (!currentBlockElement && node?.parentElement?.tagName === 'LI') {
        listItem = node.parentElement as HTMLElement;
        listElement = listItem.parentElement as HTMLElement;
        currentBlockElement = listItem;
      } else if (!currentBlockElement && node?.nodeType === Node.TEXT_NODE && node.parentElement && ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(node.parentElement.tagName)) {
        currentBlockElement = node.parentElement as HTMLElement;
      }
      
      // If after formatBlock and traversal, currentBlockElement is the editor itself, something is wrong or editor is truly empty.
      if (currentBlockElement === editorRef.current) {
          currentBlockElement = null; // Don't indent the editor div itself
      }

      // 3. Determine if the cursor is at the beginning of the block
      let isAtStartOfBlock = false;
      if (currentBlockElement) { // No longer check !== editorRef.current here, handled above
        const testRange = document.createRange();
        testRange.selectNodeContents(currentBlockElement);
        testRange.setEnd(range.startContainer, range.startOffset);
        if (testRange.toString().trim() === '') {
          isAtStartOfBlock = true;
        }
        if (listItem && (listItem.innerHTML === '' || listItem.innerHTML === '<br>' || listItem.innerHTML.includes('list-item-spacer'))) {
          isAtStartOfBlock = true;
        }
      } else if (editorRef.current && range.commonAncestorContainer === editorRef.current && range.startOffset === 0) {
         // This might be if editor is truly empty and formatBlock didn't run or create a P (e.g. no text typed yet)
         // We want to avoid inserting spaces if the intent is to indent a new line.
         // However, formatBlock should have created a P if text was typed.
         // If editor is empty and Tab is hit, it should create a P and indent it.
         isAtStartOfBlock = true; // Allow proceeding to indent logic which might create P if needed or use currentBlockElement.
      }

      // 4. Indentation Logic
      if (listItem && listElement && isAtStartOfBlock) {
        if (e.shiftKey) {
          handleOutdent(listItem, listElement);
        } else {
          handleIndent(listItem, listElement);
        }
        
        // Update content
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      } else if (isAtStartOfBlock && !listItem && currentBlockElement) { // Indent paragraph or other block if at the start
        const currentPadding = parseFloat(currentBlockElement.style.paddingLeft || '0');
        const indentAmount = 40; // Corresponds to 40px, consistent with list indentation logic

        if (e.shiftKey) { // Outdent
          const newPadding = Math.max(0, currentPadding - indentAmount);
          currentBlockElement.style.paddingLeft = newPadding === 0 ? '' : `${newPadding}px`;
        } else { // Indent
          // You might want to add a max indent level here
          currentBlockElement.style.paddingLeft = `${currentPadding + indentAmount}px`;
        }
        
        // Update content
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      }
      else {
        // Not at the start of a block, or in a list but not at the start of LI: insert spaces
        const tabTextNode = document.createTextNode('    '); // Four non-breaking spaces
        range.deleteContents();
        range.insertNode(tabTextNode);
        
        // Move cursor after the inserted spaces
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
        const hasVisibleContent = !!listItem.textContent?.replace(/[\u200B\u00A0\s]/g, '').trim();
        
        // Only consider a list item "effectively empty" if it has a spacer, is empty, or has just a BR
        const isEffectivelyEmpty = 
          (spacer !== null && !hasVisibleContent) || 
          listItem.innerHTML === '<br>' || 
          listItem.innerHTML === '' ||
          (listItem.hasAttribute('data-empty-item') && !hasSpace && !hasVisibleContent);
        
        // If the list item is empty and the cursor is not visible, make it visible
        if (isEffectivelyEmpty && !hasSpace) {
          // Clear any existing content
          if (listItem.innerHTML === '<br>') {
            listItem.innerHTML = '';
          }
          
          // Add non-breaking space and position cursor
          const nbspNode = document.createTextNode('\u00A0');
          listItem.appendChild(nbspNode);
          
          // Position cursor after the space
          const newRange = document.createRange();
          newRange.setStart(nbspNode, 1);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          
          // Mark as fixed to avoid repeating
          listItem.classList.add('space-directly-fixed');
          
          // Prevent default to handle it ourselves
          e.preventDefault();
          
          // Update content
          if (editorRef.current) {
            const event = new Event('input', { bubbles: true });
            editorRef.current.dispatchEvent(event);
          }
          
          return;
        }
        
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
      
      // First check if we're in a math field
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
        return;
      }
      
      // Check if we're in a list item and at the beginning of it
      let node = range.startContainer;
      let listItem = null;
      let list = null;
      
      // Find the list item containing the cursor
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          if (element.tagName === 'LI') {
            listItem = element;
          } else if (element.tagName === 'UL' || element.tagName === 'OL') {
            list = element;
            break;
          }
        }
        node = node.parentNode;
      }
      
      // If we found a list item and we're at the beginning of it
      if (listItem && list) {
        // Check if we're at the beginning of the list item's content
        let isAtStart = false;
        
        // For text nodes, check if we're at the beginning
        if (range.startContainer.nodeType === Node.TEXT_NODE) {
          isAtStart = range.startOffset === 0;
          
          // If we're at the start of a text node, make sure it's the first text node
          if (isAtStart) {
            const walker = document.createTreeWalker(
              listItem,
              NodeFilter.SHOW_TEXT,
              null
            );
            
            const firstTextNode = walker.nextNode();
            isAtStart = firstTextNode === range.startContainer;
          }
        } 
        // For element nodes, check if we're at the first position
        else if (range.startContainer === listItem) {
          isAtStart = range.startOffset === 0;
        }
        
        // Check if the list item is empty or contains only a non-breaking space
        const isEmpty = !listItem.textContent || 
                        listItem.textContent === '\u00A0' || 
                        listItem.textContent === '\u200B' ||
                        listItem.innerHTML === '<br>';
        
        // If we're at the start of a list item
        if (isAtStart) {
          // Add special handling for Shift+Backspace to directly remove list formatting
          if (e.shiftKey && list) {
            // Remove the list formatting but keep the content
            
            // Create a document fragment to hold list items content
            const fragment = document.createDocumentFragment();
            
            // Collect all list items
            const items = Array.from(list.querySelectorAll('li')).map(item => item as HTMLLIElement);
            
            // Create paragraphs for each list item's content
            items.forEach(item => {
              const p = document.createElement('p');
              p.innerHTML = item.innerHTML;
              fragment.appendChild(p);
            });
            
            // Replace list with the fragment
            list.parentNode?.replaceChild(fragment, list);
            
            // Set cursor to the first paragraph
            const firstP = fragment.firstChild as HTMLElement;
            if (firstP) {
              const newRange = document.createRange();
              if (firstP.firstChild && firstP.firstChild.nodeType === Node.TEXT_NODE) {
                newRange.setStart(firstP.firstChild, 0);
              } else {
                newRange.setStart(firstP, 0);
              }
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

          // If this is the first item in the list and it's empty, remove the entire list formatting
          const isFirstItem = listItem === list.querySelector('li:first-child');
          
          if (isFirstItem && isEmpty) {
            // If there's only one item in the list, convert to paragraph
            if (list.querySelectorAll('li').length === 1) {
              // Replace the list with a paragraph
              const p = document.createElement('p');
              p.innerHTML = '<br>'; // Empty paragraph needs BR to be visible
              list.parentNode?.replaceChild(p, list);
              
              // Set cursor to the paragraph
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
            // If there are more items, just remove this one
            else {
              listItem.remove();
              
              // Prevent default backspace behavior
              e.preventDefault();
              
              // Update content
              if (editorRef.current) {
                onChange(editorRef.current.innerHTML);
              }
              return;
            }
          }
          // If this is not the first item, merge with the previous item
          else if (!isFirstItem) {
            const prevItem = listItem.previousElementSibling as HTMLElement;
            
            if (prevItem && prevItem.tagName === 'LI') {
              // If current item is empty, just remove it and place cursor at end of previous item
              if (isEmpty) {
                // Set cursor to end of previous item
                const walker = document.createTreeWalker(
                  prevItem,
                  NodeFilter.SHOW_TEXT,
                  null
                );
                
                let lastTextNode = null;
                let currentNode;
                
                while (currentNode = walker.nextNode()) {
                  lastTextNode = currentNode;
                }
                
                if (lastTextNode) {
                  const newRange = document.createRange();
                  newRange.setStart(lastTextNode, lastTextNode.textContent?.length || 0);
                  newRange.collapse(true);
                  selection.removeAllRanges();
                  selection.addRange(newRange);
                } else {
                  // If no text node, place at end of element
                  const newRange = document.createRange();
                  newRange.selectNodeContents(prevItem);
                  newRange.collapse(false);
                  selection.removeAllRanges();
                  selection.addRange(newRange);
                }
                
                // Remove the current list item
                listItem.remove();
              }
              // If not empty, merge content with previous item
              else {
                // Append current item's content to previous item
                prevItem.innerHTML += listItem.innerHTML;
                
                // Remove current item
                listItem.remove();
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
          // Handle regular backspace at start of any list item (not just first/empty)
          else {
            // For any list item at the start, remove the list formatting from this item
            // Convert this list item to a paragraph
            const p = document.createElement('p');
            p.innerHTML = listItem.innerHTML || '<br>';
            
            // If this was the only item in the list, replace the entire list
            if (list.querySelectorAll('li').length === 1) {
              list.parentNode?.replaceChild(p, list);
            } else {
              // Insert the paragraph before the list and remove this item
              list.parentNode?.insertBefore(p, list);
              listItem.remove();
            }
            
            // Set cursor to the paragraph
            const newRange = document.createRange();
            if (p.firstChild && p.firstChild.nodeType === Node.TEXT_NODE) {
              newRange.setStart(p.firstChild, 0);
            } else {
              newRange.setStart(p, 0);
            }
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
            const computedStyle = window.getComputedStyle(targetElement);
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
    };
  }, [editorRef]); // Rerun if editorRef instance changes, though its .current is what matters
  
  // Add a MutationObserver to preserve alignment when list type changes
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    
    // Use a "recently added/removed lists" approach with a small time window
    let recentlyAddedLists: {element: HTMLElement, time: number}[] = [];
    let recentlyRemovedLists: {element: HTMLElement, items: {el: HTMLElement, style: string}[], time: number}[] = [];
    const RECENT_WINDOW_MS = 500; // Look back 500ms for related list operations
    
    // Function to save a list's items and their styles
    const captureListItems = (list: HTMLElement) => {
      const items = list.querySelectorAll('li');
      const itemsData: {el: HTMLElement, style: string}[] = [];
      
      items.forEach(item => {
        const style = item.getAttribute('style') || '';
        itemsData.push({el: item as HTMLElement, style});
      });
      
      return itemsData;
    };
    
    // Function to apply stored styles to a new list, based on item position
    const applyStoredStyles = (newList: HTMLElement) => {
      
      // Clean up expired entries
      const now = Date.now();
      recentlyRemovedLists = recentlyRemovedLists.filter(entry => now - entry.time < RECENT_WINDOW_MS);
      
      if (recentlyRemovedLists.length === 0) {
        return;
      }
      
      // Sort by recency, most recent first
      recentlyRemovedLists.sort((a, b) => b.time - a.time);
      
      // Try to find a removed list with similar structure
      const newItems = newList.querySelectorAll('li');
      
      // Use the most recently removed list
      const mostRecentRemoved = recentlyRemovedLists[0];
      
      // Apply styles based on position
      newItems.forEach((newItem, index) => {
        if (index < mostRecentRemoved.items.length) {
          const oldItemData = mostRecentRemoved.items[index];
          const oldStyle = oldItemData.style;
          
          // Extract text-align from old style if it exists
          const alignMatch = oldStyle.match(/text-align:\s*(left|center|right|start|end)/i);
          if (alignMatch && alignMatch[1]) {
            const alignment = alignMatch[1];
            
            // Apply alignment to new item
            const currentStyle = newItem.getAttribute('style') || '';
            const newStyle = currentStyle.replace(/text-align:\s*(left|center|right|start|end);?/i, '') +
                           (currentStyle.endsWith(';') || currentStyle === '' ? '' : ';') +
                           `text-align: ${alignment};`;
            
            newItem.setAttribute('style', newStyle);
            
            // Force a reflow
            void newItem.offsetHeight;
          }
        }
      });
    };
    
    // Observer for list changes
    const listObserver = new MutationObserver((mutations) => {
      const now = Date.now();
      
      // First, process all removed lists to capture their styles
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
          mutation.removedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (element.tagName === 'UL' || element.tagName === 'OL') {
                
                // Capture all items and their styles
                const itemsData = captureListItems(element);
                
                // Debug: log the first item's style if available
                if (itemsData.length > 0) {
                }
                
                // Store in recently removed lists
                recentlyRemovedLists.push({
                  element,
                  items: itemsData,
                  time: now
                });
              }
            }
          });
        }
      });
      
      // Then, process all added lists and try to apply styles from recently removed lists
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (element.tagName === 'UL' || element.tagName === 'OL') {
                
                // Add to recently added lists
                recentlyAddedLists.push({
                  element,
                  time: now
                });
                
                // Try to apply styles from a recently removed list
                setTimeout(() => {
                  applyStoredStyles(element);
                }, 0);
              }
            }
          });
        }
      });
      
      // Clean up old entries
      recentlyAddedLists = recentlyAddedLists.filter(entry => now - entry.time < RECENT_WINDOW_MS);
    });
    
    // Observe the entire editor for list changes
    listObserver.observe(editor, {
      childList: true,
      subtree: true
    });
    
    return () => {
      listObserver.disconnect();
    };
  }, [editorRef]);
  
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
}

/* Base styles for list items */
.rich-text-editor ol li,
.rich-text-editor ul li {
  position: relative;
  list-style-type: none !important;
  list-style-position: outside !important;
  margin-bottom: 0.5em;
  padding-left: calc(2.2em + (var(--indent-level, 0) * 1.5em));
  display: flex;
  align-items: baseline;
  transition: padding-left 0.2s ease;
}

/* Common styles for ::before as a marker */
.rich-text-editor ol li::before,
.rich-text-editor ul li::before {
  flex-shrink: 0;
  white-space: nowrap;
  display: inline-block;
  width: 2em;
  margin-right: 0.5em;
  box-sizing: border-box;
  text-align: right;
  position: absolute;
  left: calc(0.5em + (var(--indent-level, 0) * 1.5em));
}

/* Number styling for ordered lists */
.rich-text-editor ol li::before {
  content: counter(list-item) ". ";
}

/* Bullet styling for unordered lists */
.rich-text-editor ul li::before {
  content: "•";
}

/* List style variations for ordered lists */
.rich-text-editor ol.list-decimal li::before {
  content: counter(list-item) ". ";
}

.rich-text-editor ol.list-alpha li::before {
  content: counter(list-item, lower-alpha) ". ";
}

.rich-text-editor ol.list-roman li::before {
  content: counter(list-item, lower-roman) ". ";
}

/* List style variations for unordered lists */
.rich-text-editor ul.list-disc li::before {
  content: "•";
}

.rich-text-editor ul.list-circle li::before {
  content: "○";
}

.rich-text-editor ul.list-square li::before {
  content: "▪";
}

/* Alignment handling - use flex for alignment */
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

/* Keep counter resets */
.rich-text-editor ol {
  counter-reset: list-item;
}

.rich-text-editor ol li {
  counter-increment: list-item;
}

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

/* Add CSS transitions for padding-left on block elements */
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

/* Ensure cursor visibility */
.rich-text-editor {
  caret-color: currentColor;
}

.rich-text-editor li {
  min-height: 1.2em; /* Ensure list items have minimum height for cursor visibility */
  caret-color: currentColor;
}

/* Zero-width spaces need explicit cursor styling */
.rich-text-editor *:empty::after {
  content: '';
  display: inline-block;
  width: 1px;
  height: 1em;
  vertical-align: text-bottom;
  background-color: transparent;
}

/* Ensure cursor visibility when editing empty content */
.rich-text-editor *:focus:empty {
  outline: none;
  min-width: 1px;
  display: inline-block;
}
`;

// Apply the styles
const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);

export default RichTextArea; 