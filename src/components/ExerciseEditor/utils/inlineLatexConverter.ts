import { Node, Text, Element } from 'slate';
import { CustomElement, CustomText } from '../types';

// Convert text node to LaTeX
const textToLatex = (node: CustomText): string => {
  let text = node.text;
  
  // Apply formatting
  if (node.math) {
    text = `$${text}$`;
  }
  if (node.bold) {
    text = `\\textbf{${text}}`;
  }
  if (node.italic) {
    text = `\\textit{${text}}`;
  }
  if (node.underline) {
    text = `\\underline{${text}}`;
  }
  
  return text;
};

// Convert element to LaTeX
const elementToLatex = (node: CustomElement): string => {
  const children = node.children.map(child => 
    Text.isText(child) ? textToLatex(child) : elementToLatex(child as CustomElement)
  ).join('');

  switch (node.type) {
    case 'paragraph':
      return `${children}\n\n`;
    case 'math':
      return `\\[\n${children}\n\\]`;
    default:
      return children;
  }
};

// Convert Slate nodes to LaTeX
export const convertToLatex = (nodes: Node[]): string => {
  return nodes.map(node => 
    Text.isText(node) ? textToLatex(node) : elementToLatex(node as CustomElement)
  ).join('');
};

// Convert LaTeX to Slate nodes
export const convertFromLatex = (latex: string): Node[] => {
  // This is a simplified implementation
  // A full implementation would need a proper LaTeX parser
  const nodes: Node[] = [];
  let currentText = '';
  let inMath = false;
  let inCommand = false;
  let commandBuffer = '';

  for (let i = 0; i < latex.length; i++) {
    const char = latex[i];

    if (char === '$' && latex[i + 1] !== '$') {
      // Handle inline math
      if (inMath) {
        if (currentText) {
          nodes.push({
            type: 'text',
            children: [{ text: currentText, math: true }]
          });
          currentText = '';
        }
      } else {
        if (currentText) {
          nodes.push({
            type: 'text',
            children: [{ text: currentText }]
          });
          currentText = '';
        }
      }
      inMath = !inMath;
    } else if (char === '\\') {
      // Start of a command
      inCommand = true;
      commandBuffer = '';
    } else if (inCommand && char === '{') {
      // Process command
      switch (commandBuffer) {
        case 'textbf':
          // Handle bold text
          let boldContent = '';
          i++;
          while (i < latex.length && latex[i] !== '}') {
            boldContent += latex[i];
            i++;
          }
          nodes.push({
            type: 'text',
            children: [{ text: boldContent, bold: true }]
          });
          break;
        case 'textit':
          // Handle italic text
          let italicContent = '';
          i++;
          while (i < latex.length && latex[i] !== '}') {
            italicContent += latex[i];
            i++;
          }
          nodes.push({
            type: 'text',
            children: [{ text: italicContent, italic: true }]
          });
          break;
        case 'underline':
          // Handle underlined text
          let underlineContent = '';
          i++;
          while (i < latex.length && latex[i] !== '}') {
            underlineContent += latex[i];
            i++;
          }
          nodes.push({
            type: 'text',
            children: [{ text: underlineContent, underline: true }]
          });
          break;
        default:
          // Unknown command, treat as plain text
          currentText += '\\' + commandBuffer + '{';
      }
      inCommand = false;
      commandBuffer = '';
    } else if (inCommand) {
      // Build command name
      commandBuffer += char;
    } else {
      // Regular text
      currentText += char;
    }
  }

  // Add any remaining text
  if (currentText) {
    nodes.push({
      type: 'text',
      children: [{ text: currentText }]
    });
  }

  return nodes;
}; 