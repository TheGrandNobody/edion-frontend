import React, { useState, useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from "@/lib/utils";

interface SimpleMathEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  darkMode?: boolean;
}

const SimpleMathEditor: React.FC<SimpleMathEditorProps> = ({
  initialValue = '',
  onChange,
  className,
  darkMode = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(initialValue);
  const [lastSelection, setLastSelection] = useState<{ start: number, end: number } | null>(null);
  
  // Apply changes and update parent if needed
  useEffect(() => {
    onChange?.(content);
  }, [content, onChange]);

  // Convert content with math delimiters to HTML with rendered math
  const getContentWithRenderedMath = () => {
    if (!content) return '';

    // Split content by $ delimiters and alternate between text and math
    const parts = content.split(/(\$.*?\$)/g);
    
    return parts.map((part, index) => {
      // Check if this part is a math expression (starts and ends with $)
      if (part.startsWith('$') && part.endsWith('$') && part.length > 1) {
        // Extract the math expression without $ delimiters
        const mathExpression = part.slice(1, -1);
        
        try {
          // Generate a unique ID for this math part
          const mathId = `math-${index}`;
          
          // Render the math expression
          const renderedMath = katex.renderToString(mathExpression, {
            throwOnError: false,
            displayMode: false,
            output: 'html'
          });
          
          // Return rendered math with data attributes for editing
          return `<span class="math-rendered cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded px-1" 
                      data-math-id="${mathId}" 
                      data-math-content="${mathExpression}">${renderedMath}</span>`;
        } catch (error) {
          console.error('KaTeX error:', error);
          return part; // Fall back to raw text if rendering fails
        }
      }
      
      // Regular text, just return it
      return part;
    }).join('');
  };

  // Handle all key presses in the editor
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const div = editorRef.current;
    if (!div) return;
    
    const selection = window.getSelection();
    if (!selection) return;
    
    // Handle $ key to start/end math mode
    if (e.key === '$') {
      e.preventDefault();
      
      // Get current selection information
      const range = selection.getRangeAt(0);
      const startOffset = range.startOffset;
      
      // Insert $ at cursor position
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = div.innerHTML;
      const textNodes = getTextNodesIn(tempDiv);
      let currentOffset = 0;
      let inserted = false;
      
      // Find the right text node to insert $ at
      for (const node of textNodes) {
        const nodeLength = node.textContent?.length || 0;
        
        if (currentOffset <= startOffset && startOffset <= currentOffset + nodeLength) {
          const localOffset = startOffset - currentOffset;
          const oldText = node.textContent || '';
          node.textContent = oldText.slice(0, localOffset) + '$' + oldText.slice(localOffset);
          inserted = true;
          break;
        }
        
        currentOffset += nodeLength;
      }
      
      if (inserted) {
        // Update content and selection
        div.innerHTML = tempDiv.innerHTML;
        saveTempContent();
        
        // Set selection position right after the inserted $
        const newRange = document.createRange();
        const newNode = getTextNodesIn(div)[0]; // simplified - would need proper node finding
        newRange.setStart(newNode, startOffset + 1);
        newRange.setEnd(newNode, startOffset + 1);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
      
      return;
    }
    
    // Handle space key for auto-saving
    if (e.key === ' ') {
      // Let the space be inserted normally, then save content
      setTimeout(() => {
        saveTempContent();
      }, 0);
      return;
    }
  };
  
  // Helper function to get all text nodes in an element
  const getTextNodesIn = (node: Node): Node[] => {
    const textNodes: Node[] = [];
    const walker = document.createTreeWalker(
      node,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let n: Node | null = walker.nextNode();
    while (n) {
      textNodes.push(n);
      n = walker.nextNode();
    }
    
    return textNodes;
  };
  
  // Save the current content
  const saveTempContent = () => {
    if (!editorRef.current) return;
    
    // Get current content and selection
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      setLastSelection({
        start: range.startOffset,
        end: range.endOffset
      });
    }
    
    // Process content to convert rendered math back to raw format
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editorRef.current.innerHTML;
    
    // Find all rendered math spans and replace with raw $ format
    const mathSpans = tempDiv.querySelectorAll('.math-rendered');
    mathSpans.forEach(span => {
      const mathContent = span.getAttribute('data-math-content');
      if (mathContent) {
        const textNode = document.createTextNode(`$${mathContent}$`);
        span.parentNode?.replaceChild(textNode, span);
      }
    });
    
    // Set the processed content
    setContent(tempDiv.textContent || '');
  };

  // Handle editor blur to save content
  const handleBlur = () => {
    saveTempContent();
  };
  
  // Handle clicking on rendered math to edit it
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Check if we clicked on a math element or its container
    const mathEl = target.closest('.math-rendered');
    if (mathEl) {
      const mathContent = mathEl.getAttribute('data-math-content');
      if (mathContent) {
        // Replace the rendered element with editable $ format
        const textNode = document.createTextNode(`$${mathContent}$`);
        mathEl.parentNode?.replaceChild(textNode, mathEl);
        
        // Save the updated DOM content
        setTimeout(() => {
          // Try to position cursor inside the math expression
          const selection = window.getSelection();
          const range = document.createRange();
          
          if (selection && textNode.parentNode) {
            const nodeIndex = Array.from(textNode.parentNode.childNodes).indexOf(textNode);
            if (nodeIndex >= 0) {
              // Position cursor after first $
              range.setStart(textNode, 1);
              range.setEnd(textNode, 1);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        }, 0);
      }
    }
  };

  // Handle paste to clean up html
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    saveTempContent();
  };

  return (
    <div 
      className={cn(
        "w-full min-h-[200px] p-4 rounded-lg",
        "bg-white dark:bg-gray-900",
        "border border-gray-200 dark:border-gray-800",
        "focus-within:ring-2 focus-within:ring-blue-500/30 dark:focus-within:ring-blue-500/20",
        className
      )}
    >
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[200px] outline-none prose dark:prose-invert max-w-none"
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onClick={handleClick}
        onPaste={handlePaste}
        onInput={() => setTimeout(saveTempContent, 100)}
        dangerouslySetInnerHTML={{ __html: getContentWithRenderedMath() }}
      />
    </div>
  );
};

export default SimpleMathEditor; 