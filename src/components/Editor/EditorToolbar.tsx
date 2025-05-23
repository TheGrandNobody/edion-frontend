import { Button } from "../ui/button";
import { Toggle } from "../ui/toggle";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Code,
  Type,
  List,
  ListOrdered,
  Paintbrush,
  Highlighter,
  Indent,
  Outdent
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import TableSelector from "./TableSelector";
import ColorPicker from "./ColorPicker";
import TextColorIcon from "./TextColorIcon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface EditorToolbarProps {
  showRawLatex: boolean;
  toggleRawLatex: () => void;
  onInsertMath: () => void;
  onInsertTable: (rows: number, cols: number) => void;
  onIndent: () => void;
  onOutdent: () => void;
  editorRef: React.RefObject<HTMLDivElement>;
}

type TextAlignment = 'left' | 'center' | 'right';

// Helper function to normalize color to hex
const normalizeColorToHex = (colorValue: string): string => {
  if (!colorValue) return '#000000';
  
  // Handle hex format
  if (colorValue.startsWith('#')) {
    // Normalize 3-digit hex to 6-digit
    if (colorValue.length === 4) {
      return `#${colorValue[1]}${colorValue[1]}${colorValue[2]}${colorValue[2]}${colorValue[3]}${colorValue[3]}`.toLowerCase();
    }
    return colorValue.toLowerCase();
  }
  
  // Handle RGB/RGBA format
  if (colorValue.startsWith('rgb')) {
    const rgbMatch = colorValue.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10);
      const g = parseInt(rgbMatch[2], 10);
      const b = parseInt(rgbMatch[3], 10);
      const toHex = (c: number) => c.toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toLowerCase();
    }
  }

  // Handle basic color names
  const colorMap: { [key: string]: string } = {
    black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000', blue: '#0000ff', 
    yellow: '#ffff00', cyan: '#00ffff', magenta: '#ff00ff', gray: '#808080', 
  };
  const lowerCaseColor = colorValue.toLowerCase();
  if (colorMap[lowerCaseColor]) {
    return colorMap[lowerCaseColor];
  }

  // Default to black if conversion fails
  return '#000000';
};

const EditorToolbar = ({ 
  showRawLatex, 
  toggleRawLatex,
  onInsertMath,
  onInsertTable,
  onIndent,
  onOutdent,
  editorRef
}: EditorToolbarProps) => {
  // Track formatting states
  const [isBulletList, setIsBulletList] = useState(false);
  const [isNumberedList, setIsNumberedList] = useState(false);
  const [textAlignment, setTextAlignment] = useState<TextAlignment>('left');
  const [currentTextColor, setCurrentTextColor] = useState<string>('#000000');
  const [currentHighlightColor, setCurrentHighlightColor] = useState<string>('transparent');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  
  // Track color history - maximum 6 recent colors
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const MAX_RECENT_COLORS = 6;
  
  // New ref to track if the editor has focus
  const editorHasFocusRef = useRef<boolean>(false);
  // New ref to store the last valid alignment when editor had focus
  const lastKnownAlignmentRef = useRef<TextAlignment>('left');
  
  // Function to add a color to the history
  const addToColorHistory = (color: string) => {
    // Don't add transparent to history
    if (color === 'transparent') return;
    
    setRecentColors(prev => {
      // Remove this color if it already exists (to move it to the front)
      const filteredColors = prev.filter(c => c !== color);
      // Add new color to the beginning
      const newColors = [color, ...filteredColors];
      // Limit to maximum number of recent colors
      return newColors.slice(0, MAX_RECENT_COLORS);
    });
  };
  
  // Add new useEffect for focus handling
  useEffect(() => {
    if (!editorRef.current) return;

    // Remove the aggressive focus handling
    // We'll rely on more intentional focus management instead
    
    return () => {
      // Clean up any remaining listeners
    };
  }, [editorRef]);
  
  // Function to check if a list item is fully selected
  const isListItemFullySelected = (selection: Selection): HTMLElement | null => {
    if (!selection || !selection.rangeCount) return null;
    
    const range = selection.getRangeAt(0);
    
    // Find the list item parent
    let node = range.commonAncestorContainer;
    let listItem: HTMLElement | null = null;
    
    // Walk up the DOM tree to find if we're in a list item
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'LI') {
        listItem = node as HTMLElement;
        break;
      }
      node = node.parentNode;
    }
    
    // If not in a list item, return null
    if (!listItem) return null;
    
    // Now we need to determine if the entire content is selected
    // We have several cases to handle:
    
    // Case 1: Selection starts and ends outside the list item but encompasses it
    if (range.startContainer !== listItem && 
        range.endContainer !== listItem && 
        range.intersectsNode(listItem)) {
      
      // Check if the selection contains the entire list item
      const listItemRange = document.createRange();
      listItemRange.selectNodeContents(listItem);
      
      // If the selection contains the entire list item's content
      if (range.compareBoundaryPoints(Range.START_TO_START, listItemRange) <= 0 &&
          range.compareBoundaryPoints(Range.END_TO_END, listItemRange) >= 0) {
        return listItem;
      }
    }
    
    // Case 2: Selection starts and ends inside the list item
    // Check if the selection covers all the content
    
    // Create a range for the entire list item content
    const listItemContentRange = document.createRange();
    listItemContentRange.selectNodeContents(listItem);
    
    // Check if the selection range covers the entire content
    const selectionStartsAtBeginning = 
      (range.startContainer === listItem && range.startOffset === 0) ||
      (range.startContainer === listItem.firstChild && range.startOffset === 0);
    
    const selectionEndsAtEnd =
      (range.endContainer === listItem && range.endOffset === listItem.childNodes.length) ||
      (range.endContainer === listItem.lastChild && 
       range.endOffset === (range.endContainer.nodeType === Node.TEXT_NODE ? 
                           range.endContainer.textContent?.length || 0 : 
                           (range.endContainer as HTMLElement).childNodes.length));

    if (selectionStartsAtBeginning && selectionEndsAtEnd) {
      return listItem;
    }
    
    // Case 3: If the list item only has one text node child and it's fully selected
    if (listItem.childNodes.length === 1 && 
        listItem.firstChild?.nodeType === Node.TEXT_NODE && 
        range.startContainer === listItem.firstChild && 
        range.endContainer === listItem.firstChild) {
      const textNode = listItem.firstChild;
      if (range.startOffset === 0 && range.endOffset === textNode.textContent?.length) {
        return listItem;
      }
    }
    
    // Case 4: Compare text content as a fallback
    // This is less reliable but can catch additional cases
    const listItemText = listItem.textContent || '';
    const selectedText = range.toString();
    
    if (selectedText.trim() === listItemText.trim() && selectedText.length > 0) {
      return listItem;
    }
    
    return null;
  };
  
  // Modify execFormatCommand to only focus when necessary for text operations
  const execFormatCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;

    // Only focus for direct text formatting commands
    const shouldFocus = ['bold', 'italic', 'underline', 'foreColor', 'hiliteColor', 
                        'justifyLeft', 'justifyCenter', 'justifyRight'].includes(command);
    
    if (shouldFocus) {
      // Store current selection state
      const selection = window.getSelection();
      const hadSelection = selection && selection.rangeCount > 0;
      const range = hadSelection ? selection?.getRangeAt(0).cloneRange() : null;

      // Focus if needed for formatting commands
      editorRef.current.focus();
      
      // If no selection, create one at the last known position
      if (!hadSelection && editorRef.current.lastChild) {
        const newRange = document.createRange();
        newRange.selectNodeContents(editorRef.current.lastChild);
        newRange.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(newRange);
      }
    }
    
    // Check if a list item is fully selected - only for formatting commands
    let listItem: HTMLElement | null = null;
    const selection = window.getSelection();
    if (selection && ['bold', 'italic', 'underline'].includes(command)) {
      listItem = isListItemFullySelected(selection);
    }
    
    // Handle list marker formatting for both ordered and unordered lists
    if (listItem) {
      // Determine marker class based on the command
      const markerClass = `marker-${command}`;
      
      // Toggle the marker class on the list item
      if (listItem.classList.contains(markerClass)) {
        listItem.classList.remove(markerClass);
      } else {
        listItem.classList.add(markerClass);
      }
      
      // If it's a bullet list, we need to apply styling to the ::marker in addition to the ::before
      if (listItem.closest('ul')) {
        // We can't directly style ::marker with JS, but we can add a class to the list item
        // The CSS in RichTextArea.tsx should be updated to style UL markers as well
      }
    }

    // Execute command for the content
    document.execCommand(command, false, value);

    // Update states
    switch (command) {
      case 'bold':
        setIsBold(document.queryCommandState(command));
        break;
      case 'italic':
        setIsItalic(document.queryCommandState(command));
        break;
      case 'underline':
        setIsUnderline(document.queryCommandState(command));
        break;
    }

    // Update format states
    updateFormatStates();
    
    // Trigger input event to ensure changes are saved
    if (editorRef.current) {
      const event = new Event('input', { bubbles: true });
      editorRef.current.dispatchEvent(event);
    }
  };
  
  // Function to check if selection is in a specific list type
  const isInListType = (listType: string): boolean => {
    if (!editorRef.current) return false;
    
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return false;
    
    let node = selection.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.tagName === listType) {
          return true;
        }
      }
      node = node.parentNode;
    }
    return false;
  };
  
  // Function to determine the current text alignment
  const getCurrentAlignment = (): TextAlignment => {
    if (!editorRef.current) return lastKnownAlignmentRef.current;
    
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return lastKnownAlignmentRef.current;
    
    // Get the current node where the cursor is
    let node = selection.anchorNode;
    
    // First check if we're in a list, since lists need special handling
    let parentList = null;
    let currentNode = node;
    let foundAlignedElement = false;
    
    // Check direct parents for inline alignment style first (highest priority)
    while (currentNode && currentNode !== editorRef.current) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as HTMLElement;
        
        // First check for direct inline style (highest priority)
        if (element.style && element.style.textAlign) {
          // Only consider valid alignments
          if (element.style.textAlign === 'center') {
            lastKnownAlignmentRef.current = 'center';
            return 'center';
          }
          if (element.style.textAlign === 'right') {
            lastKnownAlignmentRef.current = 'right';
            return 'right';
          }
          if (element.style.textAlign === 'left') {
            lastKnownAlignmentRef.current = 'left';
            return 'left';
          }
        }
        
        // Special handling for lists
        if (element.tagName === 'UL' || element.tagName === 'OL') {
          parentList = element;
          // Check the list's alignment directly
          const listStyle = window.getComputedStyle(element);
          const listAlign = listStyle.textAlign;
          
          // Only update if we found a meaningful alignment
          if (listAlign === 'center') {
            lastKnownAlignmentRef.current = 'center';
            foundAlignedElement = true;
            return 'center';
          }
          if (listAlign === 'right') {
            lastKnownAlignmentRef.current = 'right';
            foundAlignedElement = true;
            return 'right';
          }
          if (listAlign === 'left' || listAlign === 'start') {
            lastKnownAlignmentRef.current = 'left';
            foundAlignedElement = true;
            return 'left';
          }
        }
        
        // Special handling for paragraphs and div elements
        if (element.tagName === 'P' || element.tagName === 'DIV') {
          const computedStyle = window.getComputedStyle(element);
          const textAlign = computedStyle.textAlign;
          
          // Check if we have the data-alignment-fixed attribute (our custom marker)
          const hasFixedAlignment = element.hasAttribute('data-alignment-fixed');
          
          // Only update if it's not the default left alignment or it has our fixed attribute
          if (textAlign === 'center' || hasFixedAlignment) {
            lastKnownAlignmentRef.current = 'center';
            foundAlignedElement = true;
            return 'center';
          }
          if (textAlign === 'right' || hasFixedAlignment) {
            lastKnownAlignmentRef.current = 'right';
            foundAlignedElement = true;
            return 'right';
          }
          if (hasFixedAlignment) {
            // If we explicitly set left alignment, ensure it's honored
            lastKnownAlignmentRef.current = 'left';
            foundAlignedElement = true;
            return 'left';
          }
        }
      }
      currentNode = currentNode.parentNode;
    }
    
    // If we haven't found list or paragraph with alignment, check any element's computed style
    while (node && node !== editorRef.current && !foundAlignedElement) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const computedStyle = window.getComputedStyle(element);
        const textAlign = computedStyle.textAlign;
        
        // Only update for non-default alignments (center/right) - leave left alone
        // unless it's explicitly set as an inline style
        if (textAlign === 'center') {
          lastKnownAlignmentRef.current = 'center';
          foundAlignedElement = true;
          return 'center';
        }
        if (textAlign === 'right') {
          lastKnownAlignmentRef.current = 'right';
          foundAlignedElement = true;
          return 'right';
        }
        if (element.style.textAlign === 'left') {
          lastKnownAlignmentRef.current = 'left';
          foundAlignedElement = true;
          return 'left';
        }
      }
      node = node.parentNode;
    }
    
    return lastKnownAlignmentRef.current; // Return last known alignment if nothing found
  };
  
  // Function to get the computed color at a specific selection point
  const getColorAtSelection = (): string => {
    // Default to black if no selection or editor ref
    if (!editorRef.current) return '#000000';
    
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return '#000000';
    
    // Get the focused node and check if it's inside the editor
    const range = selection.getRangeAt(0);
    let node = range.startContainer;
    
    // For text nodes, get their parent element
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.parentElement) return '#000000';
      node = node.parentElement;
    }
    
    // Check if this node or any parent has a specific color style
    let currentNode = node as HTMLElement;
    while (currentNode && currentNode !== editorRef.current) {
      // Check inline style first (highest priority)
      if (currentNode.style && currentNode.style.color) {
        return normalizeColorToHex(currentNode.style.color);
      }
      
      // Check for font elements with color attribute
      if (currentNode.tagName === 'FONT' && currentNode.getAttribute('color')) {
        return normalizeColorToHex(currentNode.getAttribute('color') || '');
      }
      
      // Move up to parent
      if (!currentNode.parentElement) break;
      currentNode = currentNode.parentElement;
    }
    
    // If no explicit color is found in the ancestors, check computed style
    // of the immediate container at the selection point
    if (node instanceof HTMLElement) {
      const computedColor = window.getComputedStyle(node).color;
      if (computedColor && computedColor !== 'rgb(0, 0, 0)') {
        return normalizeColorToHex(computedColor);
      }
    }
    
    // Default to black if no color is detected
    return '#000000';
  };

  // Function to get the highlight color at the current selection
  const getHighlightColorAtSelection = (): string => {
    // Default to transparent if no selection or editor ref
    if (!editorRef.current) return 'transparent';
    
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return 'transparent';
    
    // Get the focused node and check if it's inside the editor
    const range = selection.getRangeAt(0);
    let node = range.startContainer;
    
    // For text nodes, get their parent element
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.parentElement) return 'transparent';
      node = node.parentElement;
    }
    
    // Check if this node or any parent has a background color style
    let currentNode = node as HTMLElement;
    while (currentNode && currentNode !== editorRef.current) {
      // Check inline style first (highest priority)
      if (currentNode.style && currentNode.style.backgroundColor && 
          currentNode.style.backgroundColor !== 'transparent' && 
          currentNode.style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        return normalizeColorToHex(currentNode.style.backgroundColor);
      }
      
      // Move up to parent
      if (!currentNode.parentElement) break;
      currentNode = currentNode.parentElement;
    }
    
    // If no explicit highlight is found in the ancestors, check computed style
    if (node instanceof HTMLElement) {
      const computedBgColor = window.getComputedStyle(node).backgroundColor;
      // Only return computed background color if it's not transparent and not the editor's default
      if (computedBgColor && 
          computedBgColor !== 'transparent' && 
          computedBgColor !== 'rgba(0, 0, 0, 0)') {
        // Make sure it's not the default background of the editor or its parent elements
        const editorBgColor = window.getComputedStyle(editorRef.current).backgroundColor;
        if (computedBgColor !== editorBgColor) {
          return normalizeColorToHex(computedBgColor);
        }
      }
    }
    
    // Default to transparent if no highlight color is detected
    return 'transparent';
  };
  
  // Update formatting states based on current selection
  const updateFormatStates = () => {
    // If editor doesn't have focus, don't update the alignment in the toolbar
    if (!editorHasFocusRef.current) {
      return;
    }
    
    const isBullet = isInListType('UL');
    const isNumbered = isInListType('OL');
    const alignment = getCurrentAlignment();
    
    // Get the current selection
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      // Check if we're in a text node
      let node = selection.anchorNode;
      
      // Check formatting states using document.queryCommandState
      const boldState = document.queryCommandState('bold');
      const italicState = document.queryCommandState('italic');
      const underlineState = document.queryCommandState('underline');
      
      setIsBold(boldState);
      setIsItalic(italicState);
      setIsUnderline(underlineState);
      
      // Check for list item marker formatting
      const isInList = isBullet || isNumbered;
      if (isInList) {
        // Find the list item containing the selection
        let listItemElement = null;
        let currentNode = node;
        
        while (currentNode && currentNode !== editorRef.current) {
          if (currentNode.nodeType === Node.ELEMENT_NODE && 
              (currentNode as HTMLElement).tagName === 'LI') {
            listItemElement = currentNode as HTMLElement;
            break;
          }
          currentNode = currentNode.parentNode;
        }
        
        // If we found a list item, check for marker formatting classes
        if (listItemElement) {
          // If the entire list item is selected, consider the marker formatting
          const isFullySelected = isListItemFullySelected(selection);
          
          if (isFullySelected) {
            // Update toolbar states based on marker classes
            const hasMarkerBold = listItemElement.classList.contains('marker-bold');
            const hasMarkerItalic = listItemElement.classList.contains('marker-italic');
            const hasMarkerUnderline = listItemElement.classList.contains('marker-underline');
            
            // Update the state only if the marker has formatting
            // (This might override the content formatting, but that's ok when selecting the whole item)
            if (hasMarkerBold) setIsBold(true);
            if (hasMarkerItalic) setIsItalic(true);
            if (hasMarkerUnderline) setIsUnderline(true);
          }
        }
      }
    }
    
    // Update list states
    setIsBulletList(isBullet);
    setIsNumberedList(isNumbered);
    
    // Only update alignment if it's different to avoid unnecessary re-renders
    if (textAlignment !== alignment) {
      setTextAlignment(alignment);
    }
    
    // Update text color
    const detectedColor = getColorAtSelection();
    setCurrentTextColor(detectedColor);
    
    // Update highlight color
    const detectedHighlight = getHighlightColorAtSelection();
    setCurrentHighlightColor(detectedHighlight);
  };
  
  // Track selection changes to update format states
  useEffect(() => {
    if (!editorRef.current) return;
    
    const handleSelectionChange = () => {
      // Only update format states if the editor has focus
      if (editorHasFocusRef.current) {
        updateFormatStates();
      }
    };
    
    // Update format states initially
    updateFormatStates();
    
    // Listen for selection changes
    document.addEventListener('selectionchange', handleSelectionChange);
    
    // Add mouseup listener to editor to catch selection changes
    const handleEditorMouseUp = () => {
      // Small delay to ensure selection is fully updated
      setTimeout(() => {
        updateFormatStates();
      }, 10);
    };
    
    editorRef.current.addEventListener('mouseup', handleEditorMouseUp);
    
    // Add focus/blur event listeners to track when editor loses/gains focus
    const handleEditorFocus = () => {
      editorHasFocusRef.current = true;
      updateFormatStates();
    };
    
    const handleEditorBlur = () => {
      editorHasFocusRef.current = false;
      // Don't update the format states on blur to keep the current toolbar state
    };
    
    editorRef.current.addEventListener('focus', handleEditorFocus);
    editorRef.current.addEventListener('blur', handleEditorBlur);
    
    // Clean up
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      editorRef.current?.removeEventListener('mouseup', handleEditorMouseUp);
      editorRef.current?.removeEventListener('focus', handleEditorFocus);
      editorRef.current?.removeEventListener('blur', handleEditorBlur);
    };
  }, [editorRef]);
  
  // Apply text color
  const applyTextColor = (color: string) => {
    // Immediately update the current text color to reflect the change
    setCurrentTextColor(color);
    
    // Only force focus if we're not already in a color picker interaction
    const isInColorPickerInteraction = document.activeElement && 
      (document.activeElement.closest('.popover-content') !== null);
    
    if (!isInColorPickerInteraction) {
      execFormatCommand('foreColor', color);
    } else {
      // If we're in a picker interaction, just apply the command without focusing
      if (editorRef.current) {
        // Store the current selection
        const selection = window.getSelection();
        
        // Only proceed if there's a valid selection
        if (selection && selection.rangeCount > 0) {
          // Apply the color without forcing focus
          document.execCommand('foreColor', false, color);
          
          // Update states
          updateFormatStates();
          
          // Trigger input event
          const event = new Event('input', { bubbles: true });
          editorRef.current.dispatchEvent(event);
        }
      }
    }
    
    // Add to color history
    addToColorHistory(color);
  };
  
  // Apply highlight color
  const applyHighlightColor = (color: string) => {
    // Immediately update the current highlight color to reflect the change
    setCurrentHighlightColor(color);
    
    // Only force focus if we're not already in a color picker interaction
    const isInColorPickerInteraction = document.activeElement && 
      (document.activeElement.closest('.popover-content') !== null);
    
    if (!isInColorPickerInteraction) {
      execFormatCommand('hiliteColor', color);
    } else {
      // If we're in a picker interaction, just apply the command without focusing
      if (editorRef.current) {
        // Store the current selection
        const selection = window.getSelection();
        
        // Only proceed if there's a valid selection
        if (selection && selection.rangeCount > 0) {
          // Apply the highlight without forcing focus
          document.execCommand('hiliteColor', false, color);
          
          // Update states
          updateFormatStates();
          
          // Trigger input event
          const event = new Event('input', { bubbles: true });
          editorRef.current.dispatchEvent(event);
        }
      }
    }
    
    // Add to color history (except transparent)
    if (color !== 'transparent') {
      addToColorHistory(color);
    }
  };

  // Special handling for alignment to ensure it works with lists
  const handleAlignment = (alignType: 'justifyLeft' | 'justifyCenter' | 'justifyRight') => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      return;
    }
    
    // Find if we're in a list
    let listElement = null;
    let node = selection.anchorNode;
    
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.tagName === 'UL' || element.tagName === 'OL') {
          listElement = element;
          break;
        }
      }
      node = node.parentNode;
    }
    
    // Also check what element we're directly in
    node = selection.anchorNode;
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentNode;
    }

    if (listElement) {
      // The key issue: ordered lists (OL) created in non-left aligned text
      // have their style.textAlign property directly set, which isn't being properly overridden
      
      // First, determine the actual target alignment value
      const targetAlign = alignType === 'justifyLeft' ? 'left' : 
                         alignType === 'justifyCenter' ? 'center' : 'right';
      
      // Clear any direct alignment style first to reset any previous alignment
      (listElement as HTMLElement).style.removeProperty('text-align');
      
      // Then set the new alignment
      (listElement as HTMLElement).style.textAlign = targetAlign;
      
      // IMPORTANT FIX: Also clear and set text-align on all list items to prevent conflicting styles
      const listItems = listElement.querySelectorAll('li');
      listItems.forEach(item => {
        // Remove any text-align on list items that might override the parent
        (item as HTMLElement).style.removeProperty('text-align');
        // Apply the same alignment to ensure consistency
        (item as HTMLElement).style.textAlign = targetAlign;
      });
      
      // For right and center alignment, ensure list items have the proper list-style-position
      if (alignType !== 'justifyLeft' && listElement.tagName === 'UL') {
        const listItems = listElement.querySelectorAll('li');
        listItems.forEach(item => {
          (item as HTMLElement).style.listStylePosition = 'inside';
        });
      }
      
      // For ordered lists, handle proper justification based on the align type
      if (listElement.tagName === 'OL') {
        const listItems = listElement.querySelectorAll('li');
        listItems.forEach(item => {
          // First clear any existing justify-content style
          (item as HTMLElement).style.removeProperty('justify-content');
          
          if (alignType === 'justifyCenter') {
            (item as HTMLElement).style.justifyContent = 'center';
          } else if (alignType === 'justifyRight') {
            (item as HTMLElement).style.justifyContent = 'flex-end';
          }
        });
        
        // Force a redraw to make the change take effect immediately
        listElement.style.display = 'none';
        listElement.offsetHeight; // Force reflow
        listElement.style.display = '';
      }
      
      // Update content
      if (editorRef.current) {
        const event = new Event('input', { bubbles: true });
        editorRef.current.dispatchEvent(event);
      }
      
      // Force update the UI state immediately
      setTextAlignment(targetAlign as TextAlignment);
      // Also update the last known alignment ref
      lastKnownAlignmentRef.current = targetAlign as TextAlignment;
      
      // Update format states
      updateFormatStates();
    } else {
      // Standard alignment for non-list elements
      execFormatCommand(alignType);
      
      // Update the last known alignment ref based on the command
      const newAlignment: TextAlignment = 
        alignType === 'justifyLeft' ? 'left' :
        alignType === 'justifyCenter' ? 'center' : 'right';
      lastKnownAlignmentRef.current = newAlignment;
    }
  };

  // Handle list formatting specifically
  const handleListFormatting = (listType: 'UL' | 'OL') => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    
    // Find if we're already in a list
    let currentList = null;
    let listItem = null;
    let node = selection.anchorNode;
    
    // Find the current list and list item if any
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.tagName === 'LI') {
          listItem = element;
        }
        if (element.tagName === 'UL' || element.tagName === 'OL') {
          currentList = element;
          break;
        }
      }
      node = node.parentNode;
    }
    
    // Check for existing alignment before creating list
    let currentAlignment = 'left';
    let alignedParentNode = null;
    
    if (!currentList) {
      // If not in a list, check for text alignment in the closest parent block element
      node = selection.anchorNode;
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          const computedStyle = window.getComputedStyle(element);
          const textAlign = computedStyle.textAlign;
          
          if (textAlign === 'center' || textAlign === 'right') {
            currentAlignment = textAlign;
            alignedParentNode = element;
            break;
          }
        }
        node = node.parentNode;
      }
    }
    
    // If already in a list, but not of the desired type, convert between UL and OL
    if (currentList && currentList.tagName !== listType) {
      const currentListType = currentList.tagName;
      const alignmentToTransfer = currentList.style.textAlign;
      
      // Check if we're trying to convert between list types
      if (currentListType === 'UL' && listType === 'OL' || currentListType === 'OL' && listType === 'UL') {
        // Store cursor node identifier
        const cursorNodeId = selection.anchorNode?.textContent?.substring(0, 20) || '';
        
        // Store original list item content for potential restoration
        const listItems = currentList ? Array.from(currentList.querySelectorAll('li')) : [];
        const originalContent = listItems.map(item => ({
          html: item.innerHTML,
          textContent: item.textContent || ''
        }));

        // If list has alignment, we need to preserve it
        if (alignmentToTransfer && alignmentToTransfer !== 'left' && alignmentToTransfer !== 'start') {
          // Method 1: Direct approach to apply alignment to each list item content
          const items = Array.from(currentList.querySelectorAll('li'));
          const contents = items.map(item => (item as HTMLElement).innerHTML);
          
          // Remove the list but keep the content
          document.execCommand(listType === 'UL' ? 'insertUnorderedList' : 'insertOrderedList', false);
          
          // Find all paragraphs that were created from the list items
          const range = selection.getRangeAt(0);
          const commonAncestor = range.commonAncestorContainer;
          let paragraphs: HTMLElement[] = [];
          
          if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
            // Walk up a few levels to find paragraphs or divs that were created
            let container = commonAncestor as HTMLElement;
            if (container.tagName !== 'DIV' && container.tagName !== 'P') {
              container = container.parentElement || editorRef.current;
            }
            
            // Find all paragraphs that might have been created
            paragraphs = Array.from(container.querySelectorAll('p'));
          }
          
          // Apply the alignment to all created paragraphs
          paragraphs.forEach((p) => {
            p.style.textAlign = alignmentToTransfer;
            p.setAttribute('data-alignment-fixed', 'true');
          });
          
          // Update the last known alignment
          lastKnownAlignmentRef.current = alignmentToTransfer as TextAlignment;
          setTextAlignment(alignmentToTransfer as TextAlignment);
          
          // Special case for single paragraph - make sure it gets the alignment
          if (paragraphs.length === 0) {
            // If we can't find paragraphs, try a different approach - look at the selection
            const selNode = selection.anchorNode;
            if (selNode) {
              let paragraphNode = selNode;
              if (selNode.nodeType === Node.TEXT_NODE) {
                paragraphNode = selNode.parentNode;
              }
              
              // Apply alignment to the closest paragraph or div
              while (paragraphNode && paragraphNode !== editorRef.current) {
                if (paragraphNode.nodeType === Node.ELEMENT_NODE) {
                  const element = paragraphNode as HTMLElement;
                  if (element.tagName === 'P' || element.tagName === 'DIV') {
                    element.style.textAlign = alignmentToTransfer;
                    element.setAttribute('data-alignment-fixed', 'true');
                    break;
                  }
                }
                paragraphNode = paragraphNode.parentNode;
              }
            }
          }
        } else {
          // Standard removal for left-aligned lists
          document.execCommand(listType === 'UL' ? 'insertUnorderedList' : 'insertOrderedList', false);
          
          // Fix cursor position for OL → UL conversion
          if (currentListType === 'OL' && listType === 'UL') {
            setTimeout(() => {
              // Find the newly created UL list
              let newList = null;
              
              // Try multiple methods to find the new list
              // Method 1: Starting from selection
              if (selection.anchorNode) {
                let node = selection.anchorNode;
                
                while (node && node !== editorRef.current) {
                  if (node.nodeType === 1 && (node as HTMLElement).tagName === 'UL') {
                    newList = node;
                    break;
                  }
                  node = node.parentNode;
                }
              }
              
              // Method 2: Direct query if method 1 fails
              if (!newList) {
                newList = editorRef.current?.querySelector('ul');
              }
              
              if (newList) {
                // Get all list items
                const listItems = (newList as HTMLElement).querySelectorAll('li');
                
                // Check if we have original content to restore
                if (originalContent && originalContent.length > 0) {
                  // Try to restore original content to the new list
                  Array.from(listItems).forEach((item, index) => {
                    if (index < originalContent.length && originalContent[index].html) {
                      // Only restore if current item appears empty or just has a spacer
                      const isEmpty = !item.textContent || 
                                     item.textContent === '\u200B' ||
                                     item.innerHTML.includes('list-item-spacer');
                      
                      if (isEmpty) {
                        item.innerHTML = originalContent[index].html;
                      }
                    }
                  });
                }
                
                // Calculate a target list item - either one containing selection or first item
                let targetItem = null;
                
                if (selection.rangeCount > 0) {
                  for (let i = 0; i < listItems.length; i++) {
                    if (selection.containsNode(listItems[i], true)) {
                      targetItem = listItems[i];
                      break;
                    }
                  }
                }
                
                // If no item contains selection, use first item
                if (!targetItem && listItems.length > 0) {
                  targetItem = listItems[0];
                }
                
                if (targetItem) {
                  // Place cursor at the end of the item text
                  const range = document.createRange();
                  
                  // First try to find a text node to place cursor in
                  let textNode = null;
                  
                  // Try to get all text nodes
                  const walker = document.createTreeWalker(
                    targetItem,
                    NodeFilter.SHOW_TEXT,
                    null
                  );
                  
                  // Get the last text node (to place cursor at the end)
                  let lastTextNode = null;
                  while (walker.nextNode()) {
                    lastTextNode = walker.currentNode as Text;
                  }
                  
                  if (lastTextNode) {
                    textNode = lastTextNode;
                  }
                  
                  if (textNode) {
                    // Place cursor at the end of text
                    range.setStart(textNode, textNode.textContent ? textNode.textContent.length : 0);
                  } else {
                    // Create a text node to position the cursor in
                    textNode = document.createTextNode('\u200B'); // Zero-width space
                    
                    // If there's a span.list-item-spacer, replace it with our text node
                    const spacer = targetItem.querySelector('.list-item-spacer');
                    if (spacer) {
                      spacer.parentNode?.replaceChild(textNode, spacer);
                    } else {
                      // No spacer, append text node
                      targetItem.appendChild(textNode);
                    }
                    
                    // Position cursor after the zero-width space
                    range.setStart(textNode, 1);
                  }
                  
                  // Apply the selection
                  range.collapse(false); // Collapse to end
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              }
            }, 0);
          }
        }
        
        // Update format states immediately
        updateFormatStates();
        
        // Trigger content update
        if (editorRef.current) {
          const event = new Event('input', { bubbles: true });
          editorRef.current.dispatchEvent(event);
        }
      }
      // If trying to change list type, convert it
      else {
        // 1. Remember the content and any marker formatting classes
        const items = Array.from(currentList.querySelectorAll('li'));
        const contents = items.map(item => ({
          html: (item as HTMLElement).innerHTML,
          markerBold: (item as HTMLElement).classList.contains('marker-bold'),
          markerItalic: (item as HTMLElement).classList.contains('marker-italic'),
          markerUnderline: (item as HTMLElement).classList.contains('marker-underline'),
          justifyContent: (item as HTMLElement).style.justifyContent
        }));
        
        // Remember alignment of the current list
        const currentAlign = currentList.style.textAlign;
        
        // 2. Remove the current list
        const range = document.createRange();
        range.selectNode(currentList);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand(currentList.tagName === 'UL' ? 'insertUnorderedList' : 'insertOrderedList', false);
        
        // 3. Create the new list type
        document.execCommand(listType === 'UL' ? 'insertUnorderedList' : 'insertOrderedList', false);
        
        // 4. Find the newly created list
        let newList = null;
        const currentNode = selection.anchorNode;
        if (currentNode) {
          let node = currentNode;
          while (node && node !== editorRef.current) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (element.tagName === listType) {
                newList = element;
                break;
              }
            }
            node = node.parentNode;
          }
        }
        
        // 5. If we found the new list, restore content and marker formatting
        if (newList) {
          // Add the appropriate list style class
          if (listType === 'UL') {
            newList.classList.add('list-disc');
            newList.style.listStyleType = 'disc';
          } else {
            newList.classList.add('list-decimal');
            newList.style.listStyleType = 'decimal';
          }
          
          // Restore previous alignment
          if (currentAlign) {
            (newList as HTMLElement).style.textAlign = currentAlign;
            
            // For right and center alignment on UL lists, ensure proper bullet positioning
            if ((currentAlign === 'right' || currentAlign === 'center') && listType === 'UL') {
              const listItems = newList.querySelectorAll('li');
              listItems.forEach(item => {
                (item as HTMLElement).style.listStylePosition = 'inside';
              });
            }
            
            // For ordered lists with center/right alignment, set proper justification on list items
            if (listType === 'OL' && (currentAlign === 'right' || currentAlign === 'center')) {
              const listItems = newList.querySelectorAll('li');
              listItems.forEach(item => {
                if (currentAlign === 'center') {
                  (item as HTMLElement).style.justifyContent = 'center';
                } else if (currentAlign === 'right') {
                  (item as HTMLElement).style.justifyContent = 'flex-end';
                }
              });
            }
          }
          
          const newItems = Array.from(newList.querySelectorAll('li'));
          newItems.forEach((item, index) => {
            if (index < contents.length) {
              (item as HTMLElement).innerHTML = contents[index].html;
              
              // Restore marker formatting if this is an ordered list
              if (listType === 'OL') {
                if (contents[index].markerBold) (item as HTMLElement).classList.add('marker-bold');
                if (contents[index].markerItalic) (item as HTMLElement).classList.add('marker-italic');
                if (contents[index].markerUnderline) (item as HTMLElement).classList.add('marker-underline');
                
                // Restore justifyContent if it was set
                if (contents[index].justifyContent) {
                  (item as HTMLElement).style.justifyContent = contents[index].justifyContent;
                }
              }
            }
          });
        }
      }
    } else {
      // Not in a list, use standard command
      document.execCommand(listType === 'UL' ? 'insertUnorderedList' : 'insertOrderedList', false);
      
      // For ordered lists, ensure there's always a space after the number
      if (listType === 'OL') {
        // Small delay to allow the browser to finish creating the list
        setTimeout(() => {
          // Find the newly created list
          let newList = null;
          const currentSelection = window.getSelection();
          if (!currentSelection) return;
          
          let node = currentSelection.anchorNode;
          
          while (node && node !== editorRef.current) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (element.tagName === 'OL') {
                newList = element;
                break;
              }
            }
            node = node.parentNode;
          }
          
          // Add a class to handle spacing for all list items
          if (newList) {
            const items = newList.querySelectorAll('li');
            
            items.forEach(item => {
              // Add class for CSS ::marker styling
              (item as HTMLElement).classList.add('list-spacing-fixed');
              
              // Improve empty detection - check if the item is really empty
              const isEmpty = !(item as HTMLElement).textContent?.trim() || 
                (item.childNodes.length === 1 && item.firstChild?.nodeName === 'BR') ||
                (item as HTMLElement).innerHTML === '&nbsp;' ||
                (item as HTMLElement).innerHTML === '';
              
              // If the list item is empty, insert a spacer for proper positioning
              if (isEmpty) {
                // Create a span with a zero-width space that will follow the number
                const spacerSpan = document.createElement('span');
                spacerSpan.className = 'list-item-spacer';
                // Use zero-width space which is less likely to be modified by browser
                spacerSpan.textContent = '\u200B'; 
                
                // Insert the spacer at the beginning of the list item
                item.appendChild(spacerSpan);
                
                // Set a data attribute to mark this as a truly empty item
                (item as HTMLElement).setAttribute('data-empty-item', 'true');
                
                // Create a selection after the spacer
                const range = document.createRange();
                range.setStartAfter(spacerSpan);
                range.collapse(true);
                currentSelection.removeAllRanges();
                currentSelection.addRange(range);
              }
            });
            
            // Trigger content update to save the changes
            if (editorRef.current) {
              const event = new Event('input', { bubbles: true });
              editorRef.current.dispatchEvent(event);
            }
          }
        }, 10); // Small delay to ensure the list is fully created
      }
      
      // Store the current alignment to apply to the new list
      if (currentAlignment !== 'left') {
        // Find the newly created list immediately
        let newList = null;
        node = selection.anchorNode;
        
        while (node && node !== editorRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            if (element.tagName === 'UL' || element.tagName === 'OL') {
              newList = element;
              break;
            }
          }
          node = node.parentNode;
        }
        
        // Apply alignment to the new list if found
        if (newList) {
          (newList as HTMLElement).style.textAlign = currentAlignment;
          
          // For ordered lists with center/right alignment, set proper justification
          if ((newList as HTMLElement).tagName === 'OL') {
            const listItems = newList.querySelectorAll('li');
            listItems.forEach(item => {
              if (currentAlignment === 'center') {
                (item as HTMLElement).style.justifyContent = 'center';
              } else if (currentAlignment === 'right') {
                (item as HTMLElement).style.justifyContent = 'flex-end';
              }
            });
          }
          
          // For unordered lists, set list-style-position for center/right alignment
          if ((newList as HTMLElement).tagName === 'UL' && currentAlignment !== 'left') {
            const listItems = newList.querySelectorAll('li');
            listItems.forEach(item => {
              (item as HTMLElement).style.listStylePosition = 'inside';
            });
          }
          
          // Update the last known alignment
          lastKnownAlignmentRef.current = currentAlignment as TextAlignment;
          setTextAlignment(currentAlignment as TextAlignment);
        }
      }
      
      // Update format states immediately
      updateFormatStates();
      
      // Trigger content update
      if (editorRef.current) {
        const event = new Event('input', { bubbles: true });
        editorRef.current.dispatchEvent(event);
      }
    }
  };
  
  // Update handleToolbarClick to only prevent default but not force focus
  const handleToolbarClick = (e: React.MouseEvent) => {
    // Only prevent default to avoid losing selection
    // Don't force focus back to editor
    e.preventDefault();
  };
  
  return (
    <TooltipProvider>
      <div 
        className="bg-white dark:bg-zinc-800 rounded-md border p-2 flex flex-wrap gap-1 items-center"
        onMouseDown={handleToolbarClick}
      >
        {/* Text formatting */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle 
              aria-label="Toggle bold" 
              onClick={() => execFormatCommand('bold')}
              pressed={isBold}
              data-state={isBold ? 'on' : 'off'}
              className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
            >
              <Bold className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Bold</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle 
              aria-label="Toggle italic" 
              onClick={() => execFormatCommand('italic')}
              pressed={isItalic}
              data-state={isItalic ? 'on' : 'off'}
              className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
            >
              <Italic className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Italic</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle 
              aria-label="Toggle underline" 
              onClick={() => execFormatCommand('underline')}
              pressed={isUnderline}
              data-state={isUnderline ? 'on' : 'off'}
              className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
            >
              <Underline className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Underline</TooltipContent>
        </Tooltip>
      
        {/* Separator */}
        <div className="w-px h-6 bg-gray-200 dark:bg-zinc-700 mx-1"></div>
        
        {/* Alignment */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle 
              aria-label="Align left" 
              onClick={() => handleAlignment('justifyLeft')}
              pressed={textAlignment === 'left'}
              data-state={textAlignment === 'left' ? 'on' : 'off'}
              className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
            >
              <AlignLeft className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Align left</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle 
              aria-label="Align center" 
              onClick={() => handleAlignment('justifyCenter')}
              pressed={textAlignment === 'center'}
              data-state={textAlignment === 'center' ? 'on' : 'off'}
              className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
            >
              <AlignCenter className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Align center</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle 
              aria-label="Align right" 
              onClick={() => handleAlignment('justifyRight')}
              pressed={textAlignment === 'right'}
              data-state={textAlignment === 'right' ? 'on' : 'off'}
              className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
            >
              <AlignRight className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Align right</TooltipContent>
        </Tooltip>
      
        {/* Separator before Indent/Outdent */}
        <div className="w-px h-6 bg-gray-200 dark:bg-zinc-700 mx-1"></div>
        
        {/* Indent/Outdent Buttons */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onOutdent}
              className="flex items-center gap-1"
            >
              <Outdent className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Outdent</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onIndent}
              className="flex items-center gap-1"
            >
              <Indent className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Indent</TooltipContent>
        </Tooltip>

        {/* Separator after Indent/Outdent */}
        <div className="w-px h-6 bg-gray-200 dark:bg-zinc-700 mx-1"></div>
        
        {/* Lists */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              aria-label="Bullet list"
              onClick={() => handleListFormatting('UL')}
              pressed={isBulletList}
              data-state={isBulletList ? 'on' : 'off'}
              className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
            >
              <List className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Bullet list</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              aria-label="Numbered list"
              onClick={() => handleListFormatting('OL')}
              pressed={isNumberedList}
              data-state={isNumberedList ? 'on' : 'off'}
              className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
            >
              <ListOrdered className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Numbered list</TooltipContent>
        </Tooltip>
        
        {/* Separator */}
        <div className="w-px h-6 bg-gray-200 dark:bg-zinc-700 mx-1"></div>
        
        {/* Colors */}
        <Tooltip>
          <TooltipTrigger asChild>
            <ColorPicker 
              onSelectColor={applyTextColor}
              triggerIcon={<TextColorIcon className="h-4 w-4" color={currentTextColor} />}
              label="Text color"
              initialColor={currentTextColor}
              showTransparentOption={false}
              recentColors={recentColors}
            />
          </TooltipTrigger>
          <TooltipContent>Text color</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <ColorPicker 
              onSelectColor={applyHighlightColor}
              triggerIcon={
                <div className="relative">
                  <Highlighter className="h-4 w-4" />
                </div>
              }
              label="Highlight color"
              initialColor={currentHighlightColor}
              showTransparentOption={true}
              recentColors={recentColors}
            />
          </TooltipTrigger>
          <TooltipContent>Highlight color</TooltipContent>
        </Tooltip>
        
        {/* Separator */}
        <div className="w-px h-6 bg-gray-200 dark:bg-zinc-700 mx-1"></div>
        
        {/* Special content */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onInsertMath}
              className="flex items-center gap-1"
            >
              <Type className="h-4 w-4" />
              <span>Math</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Insert math equation</TooltipContent>
        </Tooltip>

        {/* Push LaTeX toggle to the right */}
        <div className="flex-1"></div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle 
              pressed={showRawLatex}
              onPressedChange={toggleRawLatex}
              aria-label="Toggle raw LaTeX view"
              className="flex items-center gap-1 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
              data-state={showRawLatex ? 'on' : 'off'}
            >
              <Code className="h-4 w-4" />
              <span>Raw LaTeX</span>
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Toggle raw LaTeX view</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default EditorToolbar; 