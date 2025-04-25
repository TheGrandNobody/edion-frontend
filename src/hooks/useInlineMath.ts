import { useCallback } from 'react';

/**
 * Hook to handle inline math operations in the WYSIWYG editor
 */
export const useInlineMath = () => {
  /**
   * Insert math delimiters at the current cursor position
   * and handle special key commands
   */
  const insertMathDelimiters = useCallback(() => {
    // Insert the delimiters at cursor
    document.execCommand('insertText', false, '\\(\\)');
    
    // Get the current selection
    const selection = window.getSelection();
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // Move the cursor between the delimiters
      try {
        // Create a new range
        const newRange = document.createRange();
        
        // Set the position to be between the delimiters
        newRange.setStart(range.startContainer, range.startOffset - 2);
        newRange.setEnd(range.startContainer, range.startOffset - 2);
        
        // Apply the new range
        selection.removeAllRanges();
        selection.addRange(newRange);
      } catch (e) {
        console.error('Failed to position cursor between math delimiters:', e);
      }
    }
  }, []);
  
  /**
   * Handle keyboard shortcuts for inserting math
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Check for Ctrl+M or Cmd+M
    if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
      event.preventDefault();
      insertMathDelimiters();
    }
  }, [insertMathDelimiters]);
  
  return {
    insertMathDelimiters,
    handleKeyDown
  };
};

export default useInlineMath; 