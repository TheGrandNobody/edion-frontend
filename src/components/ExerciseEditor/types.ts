import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

// Custom types for Slate editor
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

export interface CustomElement {
  type: 'paragraph' | 'math';
  children: CustomText[];
}

export interface CustomText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

// Block types
export interface BaseBlock {
  id: string;
  type: string;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: CustomElement[];
}

export interface MathBlock extends BaseBlock {
  type: 'math';
  content: string;
  displayMode: boolean;
}

export interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MultipleChoiceBlock extends BaseBlock {
  type: 'multiple-choice';
  choices: Choice[];
}

export interface DiagramBlock extends BaseBlock {
  type: 'diagram';
  imageUrl: string | null;
  caption: string;
}

export type Block = TextBlock | MathBlock | MultipleChoiceBlock | DiagramBlock;

// Exercise type
export interface Exercise {
  id: string;
  title: string;
  blocks: Block[];
}

// Core model representing the exercise
export interface ExerciseModel {
  id: string;
  title: string;
  blocks: Block[];
  
  // Methods
  addBlock: (type: Block['type'], index?: number) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  deleteBlock: (id: string) => void;
  
  // Getters
  getBlock: (id: string) => Block | undefined;
  getBlocks: () => Block[];
  
  // Serialization
  toLatex: () => string;
  fromLatex: (latex: string) => void;
}

// Text formatting options
export interface TextFormatting {
  type: 'bold' | 'italic' | 'underline' | 'math';
  range: [number, number];
  content?: string;
  points?: { x: number; y: number }[];
}

// Math element for visual editing
export interface MathElement {
  type: 'symbol' | 'fraction' | 'superscript' | 'subscript' | 'matrix';
  value: string;
  children?: MathElement[];
}

// Diagram element for TikZ
export interface DiagramElement {
  type: 'node' | 'edge' | 'shape';
  id: string;
  position?: { x: number; y: number };
  style?: Record<string, string>;
  content?: string;
  points?: { x: number; y: number }[];
} 