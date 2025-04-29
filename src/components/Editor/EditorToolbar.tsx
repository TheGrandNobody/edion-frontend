import { Button } from "../ui/button";
import { Toggle } from "../ui/toggle";
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
  ListOrdered
} from "lucide-react";
import { useEffect, useRef } from "react";

interface EditorToolbarProps {
  showRawLatex: boolean;
  toggleRawLatex: () => void;
  onInsertMath: () => void;
  editorRef: React.RefObject<HTMLDivElement>;
}

const EditorToolbar = ({ 
  showRawLatex, 
  toggleRawLatex,
  onInsertMath,
  editorRef
}: EditorToolbarProps) => {
  
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
      }, 0);
    }
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
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          aria-label="Numbered list"
          onClick={() => execFormatCommand('insertOrderedList')}
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
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