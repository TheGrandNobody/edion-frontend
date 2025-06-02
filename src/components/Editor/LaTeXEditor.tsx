import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDocument } from '@/hooks/useDocument';
import EditorToolbar from './EditorToolbar';
import TextBlock from './TextBlock';
import MathBlock from './MathBlock';

const LaTeXEditor: React.FC = () => {
  const { 
    document, 
    showLatex,
    setShowLatex,
    addBlock, 
    updateBlock, 
    deleteBlock, 
    generateLatex 
  } = useDocument();

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    document.blocks.length > 0 ? document.blocks[0].id : null
  );

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-md bg-card">
      <div className="flex justify-between items-center">
        <EditorToolbar 
          selectedBlockId={selectedBlockId} 
          onAddMathBlock={() => {
            const selectedIndex = document.blocks.findIndex(block => block.id === selectedBlockId);
            addBlock('math', selectedIndex !== -1 ? selectedIndex : undefined);
          }}
          onUpdateBlock={(updates) => {
            if (selectedBlockId) {
              updateBlock(selectedBlockId, updates);
            }
          }}
        />
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowLatex(!showLatex)}
          >
            {showLatex ? 'Hide LaTeX' : 'Show LaTeX'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          {showLatex && <TabsTrigger value="latex">LaTeX</TabsTrigger>}
        </TabsList>

        <TabsContent value="editor" className="p-4 min-h-[400px] border rounded-md">
          <div className="flex flex-col gap-2">
            {document.blocks.map((block) => (
              <div
                key={block.id}
                className={`p-2 rounded ${
                  selectedBlockId === block.id ? 'bg-accent/20' : ''
                }`}
                onClick={() => setSelectedBlockId(block.id)}
              >
                {block.type === 'text' ? (
                  <TextBlock
                    block={block}
                    onUpdate={(content) => updateBlock(block.id, { content })}
                    onDelete={() => deleteBlock(block.id)}
                  />
                ) : (
                  <MathBlock
                    block={block}
                    onUpdate={(latex) => updateBlock(block.id, { latex })}
                    onDelete={() => deleteBlock(block.id)}
                  />
                )}
              </div>
            ))}
            <Button 
              variant="ghost" 
              className="mt-2" 
              onClick={() => {
                addBlock('text');
                // Select the newly added block
                if (document.blocks.length > 0) {
                  setSelectedBlockId(document.blocks[document.blocks.length - 1].id);
                }
              }}
            >
              + Add Text Block
            </Button>
          </div>
        </TabsContent>

        {showLatex && (
          <TabsContent value="latex" className="p-4 min-h-[400px] border rounded-md">
            <pre className="whitespace-pre-wrap p-4 bg-muted rounded-md overflow-auto">
              {generateLatex()}
            </pre>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default LaTeXEditor; 