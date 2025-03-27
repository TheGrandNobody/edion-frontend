import { ExerciseModel, ExerciseBlock, TextBlock, MathBlock, MultipleChoiceBlock, DiagramBlock } from '../types';

const escapeLatex = (text: string): string => {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[&%$#_{}~^]/g, '\\$&')
    .replace(/\[/g, '{[}')
    .replace(/\]/g, '{]}');
};

const generateTextBlock = (block: TextBlock): string => {
  let result = block.content;
  const formattingMap = block.formatting.sort((a, b) => b.range[0] - a.range[0]);

  formattingMap.forEach(format => {
    const [start, end] = format.range;
    const content = result.slice(start, end);
    let formatted = '';

    switch (format.type) {
      case 'bold':
        formatted = `\\textbf{${content}}`;
        break;
      case 'italic':
        formatted = `\\textit{${content}}`;
        break;
      case 'underline':
        formatted = `\\underline{${content}}`;
        break;
      case 'math':
        formatted = `$${content}$`;
        break;
    }

    result = result.slice(0, start) + formatted + result.slice(end);
  });

  return result;
};

const generateMathBlock = (block: MathBlock): string => {
  return block.displayMode
    ? `\\[\n${block.content}\n\\]`
    : `$${block.content}$`;
};

const generateMultipleChoiceBlock = (block: MultipleChoiceBlock): string => {
  const options = block.options
    .map(option => `\\item[${option.isCorrect ? '\\checkmark' : ' '}] ${escapeLatex(option.text)}`)
    .join('\n');

  return `
${escapeLatex(block.question)}

\\begin{itemize}[label=\\alph*)]
${options}
\\end{itemize}`;
};

const generateDiagramBlock = (block: DiagramBlock): string => {
  // Convert base64 image to TikZ or include as external image
  return `
\\begin{figure}[h]
\\centering
\\includegraphics[width=0.8\\textwidth]{${block.content}}
${block.caption ? `\\caption{${escapeLatex(block.caption)}}` : ''}
\\end{figure}`;
};

const generateBlock = (block: ExerciseBlock): string => {
  switch (block.type) {
    case 'text':
      return generateTextBlock(block);
    case 'math':
      return generateMathBlock(block);
    case 'multiple-choice':
      return generateMultipleChoiceBlock(block);
    case 'diagram':
      return generateDiagramBlock(block);
    default:
      return '';
  }
};

export const generateLatex = (exercise: ExerciseModel): string => {
  const preamble = `\\documentclass{${exercise.metadata.documentClass}}

% Required packages
${exercise.metadata.requiredPackages.map(pkg => `\\usepackage{${pkg}}`).join('\n')}

${exercise.metadata.additionalPreamble || ''}

\\begin{document}

\\section*{${escapeLatex(exercise.title)}}
`;

  const content = exercise.blocks
    .map(block => generateBlock(block))
    .filter(Boolean)
    .join('\n\n');

  const footer = `
\\end{document}`;

  return `${preamble}${content}${footer}`;
}; 