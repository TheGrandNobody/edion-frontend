import React, { useEffect, useRef } from 'react';
import { MathBlock as MathBlockType } from './types';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'mathlive';

// Extending the global Window interface to include MathfieldElement
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        value?: string;
        onInput?: (event: any) => void;
      }, HTMLElement>;
    }
  }
}

interface MathBlockProps {
  block: MathBlockType;
  onUpdate: (latex: string) => void;
  onDelete: () => void;
}

const MathBlock: React.FC<MathBlockProps> = ({ block, onUpdate, onDelete }) => {
  const mathFieldRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mathFieldRef.current) {
      // Setup MathLive options if needed
      const mathfield = mathFieldRef.current as any;
      
      // Set initial value
      if (block.latex) {
        mathfield.value = block.latex;
      }
      
      // Listen for changes
      mathfield.addEventListener('input', (evt: any) => {
        onUpdate(evt.target.value);
      });
    }
  }, [block.id]); // Only re-run when block ID changes

  return (
    <div className="relative group p-2 border border-dashed border-muted-foreground/50 rounded-md bg-muted/30">
      <div className="flex justify-center">
        <math-field 
          ref={mathFieldRef}
          className="w-full p-2 focus:outline-none min-h-[2.5rem]"
          value={block.latex}
        />
      </div>
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

export default MathBlock; 