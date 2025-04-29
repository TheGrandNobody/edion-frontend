/**
 * Builds a complete LaTeX document from HTML content, preserving math expressions
 * @param htmlContent The HTML content from the editor
 * @returns A complete LaTeX document
 */
export const buildLatexDocument = (htmlContent: string): string => {
  let latexContent = convertHtmlToLatex(htmlContent);
  
  // Wrap with LaTeX document structure
  return `\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{enumitem}
\\begin{document}

${latexContent}

\\end{document}`;
};

/**
 * Converts HTML content to LaTeX, preserving math expressions
 * @param htmlContent The HTML content from the editor
 * @returns LaTeX content
 */
const convertHtmlToLatex = (htmlContent: string): string => {
  // Create a temporary DOM element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  let latexOutput = '';
  
  // Process the DOM nodes to extract text and math
  processNode(tempDiv, (text, isMath, formattingTags, listContext) => {
    if (isMath) {
      // This is a math expression, already in LaTeX format
      latexOutput += text;
    } else {
      // This is normal text, apply formatting
      let formattedText = escapeLatexSpecialChars(text);
      
      // Apply formatting from innermost to outermost
      formattingTags.forEach(tag => {
        switch (tag) {
          case 'b':
          case 'strong':
            formattedText = `\\textbf{${formattedText}}`;
            break;
          case 'i':
          case 'em':
            formattedText = `\\textit{${formattedText}}`;
            break;
          case 'u':
            formattedText = `\\underline{${formattedText}}`;
            break;
          // Add more formatting cases as needed
        }
      });
      
      latexOutput += formattedText;
    }
  });
  
  // Handle paragraphs
  latexOutput = latexOutput.replace(/\n\n+/g, '\n\n');
  
  return latexOutput;
};

/**
 * Process DOM nodes and extract text with formatting context
 */
const processNode = (
  node: Node,
  callback: (text: string, isMath: boolean, formattingTags: string[], listContext: string | null) => void,
  formattingTags: string[] = [],
  listContext: string | null = null
) => {
  if (node.nodeType === Node.TEXT_NODE) {
    // This is a text node, add its content directly
    const text = node.textContent || '';
    if (text.trim()) {
      callback(text, false, formattingTags, listContext);
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    
    // Check if this is a math field
    if (element.classList.contains('math-field')) {
      const latex = element.getAttribute('data-latex') || '';
      callback(`\\(${latex}\\)`, true, [], listContext);
      return; // Don't process children of math fields
    }
    
    // Handle lists
    if (element.tagName === 'UL') {
      callback('\n\\begin{itemize}[leftmargin=*]\n', false, [], listContext);
      for (let i = 0; i < element.childNodes.length; i++) {
        processNode(element.childNodes[i], callback, formattingTags, 'itemize');
      }
      callback('\n\\end{itemize}\n', false, [], listContext);
      return;
    }
    
    if (element.tagName === 'OL') {
      callback('\n\\begin{enumerate}[leftmargin=*]\n', false, [], listContext);
      for (let i = 0; i < element.childNodes.length; i++) {
        processNode(element.childNodes[i], callback, formattingTags, 'enumerate');
      }
      callback('\n\\end{enumerate}\n', false, [], listContext);
      return;
    }
    
    if (element.tagName === 'LI') {
      callback('\\item ', false, [], listContext);
      // Process all child nodes
      for (let i = 0; i < element.childNodes.length; i++) {
        processNode(element.childNodes[i], callback, formattingTags, listContext);
      }
      callback('\n', false, [], listContext);
      return;
    }
    
    // Handle paragraph and div elements - add newline before and after
    if (element.tagName === 'P' || element.tagName === 'DIV') {
      if (element.previousElementSibling) {
        callback('\n\n', false, [], listContext);
      }
    }
    
    // Add the current element to formatting tags if it's a formatting element
    const newFormattingTags = [...formattingTags];
    if (['B', 'STRONG', 'I', 'EM', 'U'].includes(element.tagName)) {
      newFormattingTags.push(element.tagName.toLowerCase());
    }
    
    // Process all child nodes
    for (let i = 0; i < element.childNodes.length; i++) {
      processNode(element.childNodes[i], callback, newFormattingTags, listContext);
    }
    
    // Add a newline after paragraphs and divs
    if (element.tagName === 'P' || element.tagName === 'DIV') {
      if (element.nextElementSibling) {
        callback('\n\n', false, [], listContext);
      }
    }
  }
};

/**
 * Escape LaTeX special characters in regular text
 */
const escapeLatexSpecialChars = (text: string): string => {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\$/g, '\\$')
    .replace(/&/g, '\\&')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/%/g, '\\%');
}; 