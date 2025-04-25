import React, { useState, useRef, useEffect } from 'react';
import { TextBlock as TextBlockType } from './types';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TextBlockProps {
  block: TextBlockType;
  onUpdate: (content: string) => void;
  onDelete: () => void;
}

const TextBlock: React.FC<TextBlockProps> = ({ block, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && isEditing) {
      editorRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    if (editorRef.current) {
      onUpdate(editorRef.current.innerHTML);
      setIsEditing(false);
    }
  };

  const handleClick = () => {
    setIsEditing(true);
  };

  const getInlineStyles = () => {
    const styles: React.CSSProperties = {};
    
    if (block.format) {
      if (block.format.fontFamily) styles.fontFamily = block.format.fontFamily;
      if (block.format.fontSize) styles.fontSize = block.format.fontSize;
      if (block.format.color) styles.color = block.format.color;
      
      // Handle text alignment
      if (block.format.alignment) {
        styles.textAlign = block.format.alignment;
      }
    }
    
    return styles;
  };

  const getClassNames = () => {
    const classes = ['min-h-[1.5rem]', 'w-full', 'p-1', 'outline-none', 'rounded'];
    
    if (block.format) {
      if (block.format.bold) classes.push('font-bold');
      if (block.format.italic) classes.push('italic');
      if (block.format.underline) classes.push('underline');
    }
    
    return classes.join(' ');
  };

  return (
    <div className="relative group">
      <div
        ref={editorRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        className={getClassNames()}
        style={getInlineStyles()}
        onClick={handleClick}
        onBlur={handleBlur}
        dangerouslySetInnerHTML={{ __html: block.content || 'Type here...' }}
      />
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onDelete}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default TextBlock; 