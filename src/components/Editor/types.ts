export interface TextBlock {
  id: string;
  type: 'text';
  content: string;
  format?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
    fontSize?: string;
    fontFamily?: string;
    alignment?: 'left' | 'center' | 'right';
  };
}

export interface MathBlock {
  id: string;
  type: 'math';
  latex: string;
}

export type DocumentBlock = TextBlock | MathBlock;

export interface Document {
  blocks: DocumentBlock[];
} 