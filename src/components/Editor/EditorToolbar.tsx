import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Type, 
  PaintBucket, 
  Pi
} from 'lucide-react';
import { TextBlock } from './types';

interface EditorToolbarProps {
  selectedBlockId: string | null;
  onAddMathBlock: () => void;
  onUpdateBlock: (updates: Partial<Omit<TextBlock, 'id' | 'type'>>) => void;
}

const FONT_SIZES = ['x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'];
const FONT_FAMILIES = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];
const COLORS = ['black', 'red', 'blue', 'green', 'purple', 'orange'];

const EditorToolbar: React.FC<EditorToolbarProps> = ({ 
  selectedBlockId,
  onAddMathBlock,
  onUpdateBlock
}) => {
  const updateFormat = (formatKey: string, value: any) => {
    onUpdateBlock({
      format: {
        [formatKey]: value
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => updateFormat('bold', true)}
        disabled={!selectedBlockId}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => updateFormat('italic', true)}
        disabled={!selectedBlockId}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => updateFormat('underline', true)}
        disabled={!selectedBlockId}
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-border mx-1" />
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => updateFormat('alignment', 'left')}
        disabled={!selectedBlockId}
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => updateFormat('alignment', 'center')}
        disabled={!selectedBlockId}
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => updateFormat('alignment', 'right')}
        disabled={!selectedBlockId}
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-border mx-1" />
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" disabled={!selectedBlockId} title="Font Size">
            <Type className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="grid grid-cols-2 gap-1">
            {FONT_SIZES.map(size => (
              <Button 
                key={size} 
                variant="ghost" 
                size="sm" 
                onClick={() => updateFormat('fontSize', size)}
                className="justify-start"
              >
                <span style={{ fontSize: size }}>{size}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" disabled={!selectedBlockId} title="Font Family">
            <span className="text-xs font-bold">F</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="flex flex-col gap-1">
            {FONT_FAMILIES.map(family => (
              <Button 
                key={family} 
                variant="ghost" 
                size="sm" 
                onClick={() => updateFormat('fontFamily', family)}
                className="justify-start"
                style={{ fontFamily: family }}
              >
                {family}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" disabled={!selectedBlockId} title="Text Color">
            <PaintBucket className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="grid grid-cols-3 gap-1">
            {COLORS.map(color => (
              <Button 
                key={color} 
                variant="outline" 
                size="sm" 
                onClick={() => updateFormat('color', color)}
                className="p-1 h-8"
              >
                <div 
                  className="w-full h-full rounded-sm" 
                  style={{ backgroundColor: color }}
                ></div>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      <div className="w-px h-6 bg-border mx-1" />
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onAddMathBlock}
        className="gap-1"
      >
        <Pi className="h-4 w-4" /> Math
      </Button>
    </div>
  );
};

export default EditorToolbar; 