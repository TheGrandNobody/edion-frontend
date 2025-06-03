import { useState, useCallback } from 'react';
import { Document, DocumentBlock, TextBlock, MathBlock } from '@/components/Editor/types';
import { v4 as uuidv4 } from 'uuid';

export const useDocument = () => {
  const [document, setDocument] = useState<Document>({
    blocks: [
      {
        id: uuidv4(),
        type: 'text',
        content: '',
      },
    ],
  });

  const [showLatex, setShowLatex] = useState(false);

  const addBlock = useCallback((blockType: 'text' | 'math', position?: number) => {
    setDocument((prevDoc) => {
      const newBlock: DocumentBlock =
        blockType === 'text'
          ? {
              id: uuidv4(),
              type: 'text',
              content: '',
            }
          : {
              id: uuidv4(),
              type: 'math',
              latex: '',
            };

      const newBlocks = [...prevDoc.blocks];
      if (position !== undefined) {
        newBlocks.splice(position + 1, 0, newBlock);
      } else {
        newBlocks.push(newBlock);
      }

      return {
        ...prevDoc,
        blocks: newBlocks,
      };
    });
  }, []);

  const updateBlock = useCallback((id: string, updates: Partial<Omit<TextBlock, 'id' | 'type'>> | Partial<Omit<MathBlock, 'id' | 'type'>>) => {
    setDocument((prevDoc) => {
      const blockIndex = prevDoc.blocks.findIndex((block) => block.id === id);
      if (blockIndex === -1) return prevDoc;

      const updatedBlocks = [...prevDoc.blocks];
      updatedBlocks[blockIndex] = {
        ...updatedBlocks[blockIndex],
        ...updates,
      } as DocumentBlock;

      return {
        ...prevDoc,
        blocks: updatedBlocks,
      };
    });
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setDocument((prevDoc) => {
      // Don't delete if it's the only block
      if (prevDoc.blocks.length <= 1) return prevDoc;

      return {
        ...prevDoc,
        blocks: prevDoc.blocks.filter((block) => block.id !== id),
      };
    });
  }, []);

  const generateLatex = useCallback(() => {
    const preamble = `\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{amsfonts}
\\usepackage{graphicx}
\\usepackage{xcolor}
\\begin{document}
`;

    const postamble = `\\end{document}`;

    const content = document.blocks
      .map((block) => {
        if (block.type === 'text') {
          const { content, format } = block as TextBlock;
          let formattedContent = content;

          // Apply formatting if present
          if (format) {
            if (format.bold) formattedContent = `\\textbf{${formattedContent}}`;
            if (format.italic) formattedContent = `\\textit{${formattedContent}}`;
            if (format.underline) formattedContent = `\\underline{${formattedContent}}`;
            if (format.color) formattedContent = `\\textcolor{${format.color}}{${formattedContent}}`;
            if (format.fontSize) {
              // Map relative sizes to LaTeX commands
              const sizeMap: Record<string, string> = {
                'x-small': 'tiny',
                small: 'small',
                medium: 'normalsize',
                large: 'large',
                'x-large': 'Large',
                'xx-large': 'LARGE',
              };
              const texSize = sizeMap[format.fontSize] || 'normalsize';
              formattedContent = `{\\${texSize} ${formattedContent}}`;
            }
            if (format.alignment) {
              const alignMap: Record<string, string> = {
                left: 'flushleft',
                center: 'center',
                right: 'flushright',
              };
              const alignment = alignMap[format.alignment];
              formattedContent = `\\begin{${alignment}}\n${formattedContent}\n\\end{${alignment}}`;
            }
          }
          
          return formattedContent;
        } else if (block.type === 'math') {
          const { latex } = block as MathBlock;
          return `\\begin{equation*}\n${latex}\n\\end{equation*}`;
        }
        return '';
      })
      .join('\n\n');

    return `${preamble}${content}\n${postamble}`;
  }, [document]);

  return {
    document,
    showLatex,
    setShowLatex,
    addBlock,
    updateBlock,
    deleteBlock,
    generateLatex,
  };
}; 