'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'mathlive';
import { MathfieldElement } from 'mathlive';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<
        React.HTMLAttributes<MathfieldElement> & { 
          value?: string;
          'virtual-keyboard-mode'?: string;
          'math-mode'?: string;
        },
        MathfieldElement
      >;
    }
  }
}

interface Block {
  id: string;
  content: string;
  type: 'text' | 'math';
}

const MathEditorDemo: React.FC = () => {
  const [content, setContent] = useState<Block[]>([
    { id: '1', type: 'text', content: 'The area of a circle is ' },
    { id: '2', type: 'math', content: 'A = \\pi r^2' },
    { id: '3', type: 'text', content: ' where r is the radius. If we double the radius to ' },
    { id: '4', type: 'math', content: '2r' },
    { id: '5', type: 'text', content: ', the new area is ' },
    { id: '6', type: 'math', content: 'A = \\pi(2r)^2 = 4\\pi r^2' },
    { id: '7', type: 'text', content: '.' },
  ]);

  const insertMathBlock = (index: number) => {
    const newId = String(Date.now());
    setContent(prev => [
      ...prev.slice(0, index + 1),
      { id: newId, type: 'math', content: '' },
      { id: newId + '-text', type: 'text', content: '' },
      ...prev.slice(index + 1)
    ]);
  };

  const updateBlock = (id: string, newContent: string) => {
    setContent(prev => prev.map(block => 
      block.id === id ? { ...block, content: newContent } : block
    ));
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === '$' && !event.shiftKey) {
      event.preventDefault();
      insertMathBlock(index);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Inline Math Editor</h1>
      
      <div className="w-full bg-white rounded-lg shadow-lg p-2">
        <div className="w-full">
          <div className="flex flex-wrap items-baseline gap-0 leading-normal">
            {content.map((block, index) => (
              <React.Fragment key={block.id}>
                {block.type === 'text' ? (
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="inline-block p-0 border-none resize-none overflow-hidden focus:outline-none focus:ring-0 bg-transparent align-baseline"
                    style={{
                      width: `${Math.max(1, block.content.length)}ch`,
                      minWidth: '1ch',
                      height: '1.5em',
                      margin: 0,
                      fontSize: '1rem',
                      lineHeight: 'inherit'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.width = `${Math.max(1, target.value.length)}ch`;
                    }}
                  />
                ) : (
                  <math-field
                    value={block.content}
                    onInput={(e) => updateBlock(block.id, (e.target as MathfieldElement).value)}
                    virtual-keyboard-mode="onfocus"
                    math-mode="inline"
                    className="focus:outline-none align-baseline"
                    style={{ 
                      fontSize: '1rem',
                      padding: 0,
                      margin: 0,
                      lineHeight: 'inherit',
                      minWidth: 0,
                      width: 'auto',
                      display: 'inline'
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full text-sm text-gray-600">
        <h3 className="font-semibold mb-2">Quick Tips:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Type $ to insert a math block</li>
          <li>Use \frac&#123;a&#125;&#123;b&#125; for fractions</li>
          <li>Use ^ for superscript and _ for subscript</li>
          <li>Use \sqrt&#123;x&#125; for square root</li>
          <li>Press Tab in math blocks to use the virtual keyboard</li>
        </ul>
      </div>
    </div>
  );
};

export default MathEditorDemo; 