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
  Highlighter
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

    // Function to ensure editor focus
    const ensureEditorFocus = () => {
      if (document.activeElement !== editorRef.current) {
        editorRef.current?.focus();
      }
    };

    // Add click listener to the editor
    editorRef.current.addEventListener('blur', ensureEditorFocus);

    return () => {
      editorRef.current?.removeEventListener('blur', ensureEditorFocus);
    };
  }, [editorRef]);
  
  // Modify execFormatCommand to ensure focus
  const execFormatCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;

    // Ensure editor is focused
    editorRef.current.focus();

    // Store current selection if it exists
    const selection = window.getSelection();
    const hadSelection = selection && selection.rangeCount > 0;
    const range = hadSelection ? selection?.getRangeAt(0).cloneRange() : null;

    // If no selection, create one at the last known position
    if (!hadSelection && editorRef.current.lastChild) {
      const newRange = document.createRange();
      newRange.selectNodeContents(editorRef.current.lastChild);
      newRange.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(newRange);
    }

    // Execute command
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
    if (!editorRef.current) return 'left';
    
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return 'left';
    
    // Get the current node where the cursor is
    let node = selection.anchorNode;
    
    // Find the nearest block element
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const computedStyle = window.getComputedStyle(element);
        const textAlign = computedStyle.textAlign;
        
        if (textAlign === 'center') return 'center';
        if (textAlign === 'right') return 'right';
        if (textAlign === 'left' || textAlign === 'start') return 'left';
      }
      node = node.parentNode;
    }
    
    return 'left'; // Default
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
    }
    
    setIsBulletList(isBullet);
    setIsNumberedList(isNumbered);
    setTextAlignment(alignment);
    
    // Update text color
    const detectedColor = getColorAtSelection();
    setCurrentTextColor(detectedColor);
    
    // Update highlight color
    const detectedHighlight = getHighlightColorAtSelection();
    setCurrentHighlightColor(detectedHighlight);
    
    // If in a list, log the list element's properties
    if (isBullet || isNumbered) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let node = selection.anchorNode;
        while (node && node !== editorRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            if (element.tagName === 'UL' || element.tagName === 'OL') {
              break;
            }
          }
          node = node.parentNode;
        }
      }
    }
  };
  
  // Track selection changes to update format states
  useEffect(() => {
    if (!editorRef.current) return;
    
    const handleSelectionChange = () => {
      updateFormatStates();
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
    
    // Clean up
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      editorRef.current?.removeEventListener('mouseup', handleEditorMouseUp);
    };
  }, [editorRef]);
  
  // Apply text color
  const applyTextColor = (color: string) => {
    execFormatCommand('foreColor', color);
    // Immediately update the current text color to reflect the change
    setCurrentTextColor(color);
    // Add to color history
    addToColorHistory(color);
  };
  
  // Apply highlight color
  const applyHighlightColor = (color: string) => {
    execFormatCommand('hiliteColor', color);
    // Immediately update the current highlight color to reflect the change
    setCurrentHighlightColor(color);
    // Add to color history (except transparent)
    if (color !== 'transparent') {
      addToColorHistory(color);
    }
  };

  // Special handling for alignment to ensure it works with lists
  const handleAlignment = (alignType: 'justifyLeft' | 'justifyCenter' | 'justifyRight') => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    
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
      
      // Update format states
      updateFormatStates();
    } else {
      // Standard alignment for non-list elements
      execFormatCommand(alignType);
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
    
    // If we're already in a list
    if (currentList && listItem) {
      // If trying to apply the same list type, remove the list formatting
      if (currentList.tagName === listType) {
        document.execCommand(listType === 'UL' ? 'insertUnorderedList' : 'insertOrderedList', false);
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
      
      // Find the newly created list in aligned content
      if (currentAlignment !== 'left') {
        // Find the newly created list
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
        
        // Apply alignment to the new list if found
        if (newList) {
          (newList as HTMLElement).style.textAlign = currentAlignment;
          
          // For right and center alignment on UL lists, ensure proper bullet positioning
          if (listType === 'UL') {
            const listItems = newList.querySelectorAll('li');
            listItems.forEach(item => {
              (item as HTMLElement).style.listStylePosition = 'inside';
            });
          }
          
          // For ordered lists with center/right alignment, set proper justification on list items
          if (listType === 'OL') {
            const listItems = newList.querySelectorAll('li');
            listItems.forEach(item => {
              if (currentAlignment === 'center') {
                (item as HTMLElement).style.justifyContent = 'center';
              } else if (currentAlignment === 'right') {
                (item as HTMLElement).style.justifyContent = 'flex-end';
              }
            });
          }
        }
      }
    }
    
    // Update formatting states
    updateFormatStates();
    
    // Trigger update
    if (editorRef.current) {
      const event = new Event('input', { bubbles: true });
      editorRef.current.dispatchEvent(event);
    }
  };
  
  // Add handler to prevent toolbar clicks from removing focus
  const handleToolbarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (editorRef.current) {
      editorRef.current.focus();
    }
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
      
        {/* Separator */}
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