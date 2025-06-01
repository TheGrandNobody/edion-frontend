// Slate.js document model types that map cleanly to LaTeX
import { BaseEditor, Descendant } from 'slate';
import { ReactEditor } from 'slate-react';

export type TextAlign = 'left' | 'center' | 'right';

export interface BaseElement {
  children: Descendant[];
}

export interface ParagraphElement extends BaseElement {
  type: 'paragraph';
  align?: TextAlign;
}

export interface HeadingElement extends BaseElement {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  align?: TextAlign;
}

export interface BulletedListElement extends BaseElement {
  type: 'bulleted-list';
  align?: TextAlign;
}

export interface NumberedListElement extends BaseElement {
  type: 'numbered-list';
  align?: TextAlign;
}

export interface ListItemElement extends BaseElement {
  type: 'list-item';
  indentLevel?: number;
}

export interface MathElement extends BaseElement {
  type: 'math';
  formula: string;
  display: boolean; // true for block math, false for inline
}

export interface TableElement extends BaseElement {
  type: 'table';
  rows: number;
  cols: number;
}

export interface TableRowElement extends BaseElement {
  type: 'table-row';
}

export interface TableCellElement extends BaseElement {
  type: 'table-cell';
  header?: boolean;
}

export type CustomElement = 
  | ParagraphElement
  | HeadingElement
  | BulletedListElement
  | NumberedListElement
  | ListItemElement
  | MathElement
  | TableElement
  | TableRowElement
  | TableCellElement;

export interface FormattedText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  backgroundColor?: string;
}

export type CustomText = FormattedText;

// Extend Slate's types
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
} 