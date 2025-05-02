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

interface EditorToolbarProps {
  showRawLatex: boolean;
  toggleRawLatex: () => void;
  onInsertMath: () => void;
  onInsertTable: (rows: number, cols: number) => void;
  editorRef: React.RefObject<HTMLDivElement>;
}

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
  
  // Predefined colors for text and background
  const textColors = [
    "#000000", "#e60000", "#008a00", "#0066cc", "#9933cc", 
    "#ff9900", "#0099ff", "#ff0000", "#38761d", "#134f5c", "#351c75"
  ];
  
  const highlightColors = [
    "#ffff00", "#00ffff", "#00ff00", "#ff00ff", "#ff9900", 
    "#ff6600", "#ff0000", "#9999ff", "#99ffff", "#99ff99", "#ffcc99"
  ];

  const execFormatCommand = (command: string, value?: string) => {
    // Ensure the editor is focused before applying commands
    if (editorRef.current) {
      editorRef.current.focus();
      
      // For lists, we need to make sure we're in a valid container
      if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
        // If no text is selected, and we're not in a paragraph, create one
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          if (range.collapsed) {
            const container = range.startContainer;
            // If we're directly in the editor div, wrap in a paragraph first
            if (container === editorRef.current) {
              document.execCommand('formatBlock', false, 'p');
            }
          }
        }
      }
      
      // Execute the command after ensuring focus
      setTimeout(() => {
        document.execCommand(command, false, value);
        // Update format states after command execution
        updateFormatStates();
      }, 0);
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
  
  // Update formatting states based on current selection
  const updateFormatStates = () => {
    setIsBulletList(isInListType('UL'));
    setIsNumberedList(isInListType('OL'));
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
    
    // Clean up
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [editorRef]);
  
  // Apply text color
  const applyTextColor = (color: string) => {
    execFormatCommand('foreColor', color);
  };
  
  // Apply highlight color
  const applyHighlightColor = (color: string) => {
    execFormatCommand('hiliteColor', color);
  };
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-md border p-2 flex flex-wrap gap-1">
      <div className="flex gap-1 mr-2">
        <Toggle 
          aria-label="Toggle bold" 
          onClick={() => execFormatCommand('bold')}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle 
          aria-label="Toggle italic" 
          onClick={() => execFormatCommand('italic')}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle 
          aria-label="Toggle underline" 
          onClick={() => execFormatCommand('underline')}
        >
          <Underline className="h-4 w-4" />
        </Toggle>
      </div>
      
      <div className="flex gap-1 mr-2">
        <Toggle 
          aria-label="Align left" 
          onClick={() => execFormatCommand('justifyLeft')}
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle 
          aria-label="Align center" 
          onClick={() => execFormatCommand('justifyCenter')}
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle 
          aria-label="Align right" 
          onClick={() => execFormatCommand('justifyRight')}
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>
      </div>
      
      <div className="flex gap-1 mr-2">
        <Toggle
          aria-label="Bullet list"
          onClick={() => execFormatCommand('insertUnorderedList')}
          pressed={isBulletList}
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          aria-label="Numbered list"
          onClick={() => execFormatCommand('insertOrderedList')}
          pressed={isNumberedList}
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
      </div>
      
      {/* Text Color */}
      <div className="flex gap-1 mr-2">
        <Popover>
          <PopoverTrigger asChild>
            <Toggle aria-label="Text color">
              <Paintbrush className="h-4 w-4" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="flex flex-wrap gap-1 max-w-[180px]">
              {textColors.map((color, index) => (
                <button
                  key={`text-${index}`}
                  className="w-6 h-6 rounded-md border border-gray-200 cursor-pointer"
                  style={{ backgroundColor: color }}
                  onClick={() => applyTextColor(color)}
                  aria-label={`Text color: ${color}`}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Highlight Color */}
      <div className="flex gap-1 mr-2">
        <Popover>
          <PopoverTrigger asChild>
            <Toggle aria-label="Highlight color">
              <Highlighter className="h-4 w-4" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="flex flex-wrap gap-1 max-w-[180px]">
              {highlightColors.map((color, index) => (
                <button
                  key={`highlight-${index}`}
                  className="w-6 h-6 rounded-md border border-gray-200 cursor-pointer"
                  style={{ backgroundColor: color }}
                  onClick={() => applyHighlightColor(color)}
                  aria-label={`Highlight color: ${color}`}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex gap-1 mr-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onInsertMath}
          className="flex items-center gap-1"
        >
          <Type className="h-4 w-4" />
          <span>Math</span>
        </Button>
        <TableSelector onSelectTable={onInsertTable} />
      </div>
      
      <div className="ml-auto">
        <Toggle 
          pressed={showRawLatex}
          onPressedChange={toggleRawLatex}
          aria-label="Toggle raw LaTeX view"
          className="flex items-center gap-1"
        >
          <Code className="h-4 w-4" />
          <span>Raw LaTeX</span>
        </Toggle>
      </div>
    </div>
  );
};

export default EditorToolbar; 