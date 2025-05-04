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
\\usepackage{booktabs}
\\usepackage{xcolor}
\\usepackage{soul}
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
    
    // Handle tables
    if (element.tagName === 'TABLE' && element.classList.contains('editor-table')) {
      const rows = parseInt(element.getAttribute('data-rows') || '0', 10);
      const cols = parseInt(element.getAttribute('data-cols') || '0', 10);
      
      if (rows > 0 && cols > 0) {
        // Start table environment
        const colDef = Array(cols).fill('c').join(' | ');
        callback('\n\\begin{table}[h]\n\\centering\n\\begin{tabular}{|' + colDef + '|}\n\\hline\n', false, [], listContext);
        
        // Process the table rows and cells
        processTableContent(element, callback, formattingTags);
        
        // End table environment
        callback('\\end{tabular}\n\\caption{Table Caption}\n\\label{tab:mytable}\n\\end{table}\n', false, [], listContext);
        return; // Skip further processing - we've handled children
      }
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
      const isInOrderedList = listContext === 'enumerate';
      
      // Handle list item in the LaTeX output
      if (isInOrderedList) {
        // Check for marker formatting classes
        const hasMarkerBold = element.classList.contains('marker-bold');
        const hasMarkerItalic = element.classList.contains('marker-italic');
        const hasMarkerUnderline = element.classList.contains('marker-underline');
        
        if (hasMarkerBold || hasMarkerItalic || hasMarkerUnderline) {
          // Use LaTeX's \item[custom] feature to specify formatted counters
          let markerFormat = '\\arabic*';
          
          if (hasMarkerBold) {
            markerFormat = `\\textbf{${markerFormat}}`;
          }
          if (hasMarkerItalic) {
            markerFormat = `\\textit{${markerFormat}}`;
          }
          if (hasMarkerUnderline) {
            markerFormat = `\\underline{${markerFormat}}`;
          }
          
          callback(`\\item[${markerFormat}.] `, false, [], listContext);
        } else {
          // Standard numbered list item
          callback('\\item ', false, [], listContext);
        }
      } else {
        // For unordered lists: Normal \item processing
      callback('\\item ', false, [], listContext);
      }
      
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
    
    // Handle text with colors - created with 'foreColor' command
    const computedStyle = window.getComputedStyle(element);
    const textColor = element.style.color || computedStyle.color;
    const bgColor = element.style.backgroundColor || computedStyle.backgroundColor;
    
    // If element has a text color or background color, create color command wrappers
    let colorPrefix = '';
    let colorSuffix = '';
    
    if (textColor && textColor !== 'rgb(0, 0, 0)' && textColor !== '#000000') {
      const hexColor = rgbToHex(textColor);
      colorPrefix += `\\textcolor{${hexColor}}{`;
      colorSuffix = `}${colorSuffix}`;
    }
    
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      const hexColor = rgbToHex(bgColor);
      colorPrefix += `\\hl{`;
      colorSuffix = `}${colorSuffix}`;
      // Add a color definition for highlighting
      callback(`\\definecolor{highlightcolor}{HTML}{${hexColor.replace('#', '')}}\n\\sethlcolor{highlightcolor}\n`, false, [], listContext);
    }
    
    // Add color prefix if needed
    if (colorPrefix) {
      callback(colorPrefix, false, [], listContext);
    }
    
    // Process all child nodes
    for (let i = 0; i < element.childNodes.length; i++) {
      processNode(element.childNodes[i], callback, newFormattingTags, listContext);
    }
    
    // Add color suffix if needed
    if (colorSuffix) {
      callback(colorSuffix, false, [], listContext);
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
 * Process table content for LaTeX conversion
 */
const processTableContent = (
  tableElement: HTMLElement,
  callback: (text: string, isMath: boolean, formattingTags: string[], listContext: string | null) => void,
  formattingTags: string[] = []
) => {
  // Process table headers (TH elements)
  const headerCells = tableElement.querySelectorAll('th');
  if (headerCells.length > 0) {
    for (let i = 0; i < headerCells.length; i++) {
      const cell = headerCells[i];
      // Process cell content
      let cellLatex = '';
      processNode(cell, (text, isMath, tags) => {
        if (isMath) {
          cellLatex += text;
        } else {
          let formattedText = escapeLatexSpecialChars(text);
          tags.forEach(tag => {
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
            }
          });
          cellLatex += formattedText;
        }
      }, ['b']);  // Default bold for headers
      
      callback(cellLatex, false, [], null);
      
      // Add cell separator or end of row
      if (i < headerCells.length - 1) {
        callback(' & ', false, [], null);
      } else {
        callback(' \\\\ \\hline\n', false, [], null);
      }
    }
  }
  
  // Process table body rows (TR elements in TBODY)
  const rows = tableElement.querySelectorAll('tbody tr');
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll('td');
    for (let j = 0; j < cells.length; j++) {
      const cell = cells[j];
      // Process cell content
      let cellLatex = '';
      processNode(cell, (text, isMath, tags) => {
        if (isMath) {
          cellLatex += text;
        } else {
          let formattedText = escapeLatexSpecialChars(text);
          tags.forEach(tag => {
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
            }
          });
          cellLatex += formattedText;
        }
      }, formattingTags);
      
      callback(cellLatex, false, [], null);
      
      // Add cell separator or end of row
      if (j < cells.length - 1) {
        callback(' & ', false, [], null);
      } else {
        callback(' \\\\ \\hline\n', false, [], null);
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

/**
 * Converts RGB color value to hex format
 * @param rgb RGB color as string (e.g., 'rgb(255, 0, 0)')
 * @returns Hex color (e.g., '#FF0000')
 */
const rgbToHex = (rgb: string): string => {
  // If already in hex format, return as is
  if (rgb.startsWith('#')) {
    return rgb;
  }
  
  // Parse RGB format
  const rgbMatch = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (!rgbMatch) {
    return '#000000'; // Default to black if unable to parse
  }
  
  const r = parseInt(rgbMatch[1], 10);
  const g = parseInt(rgbMatch[2], 10);
  const b = parseInt(rgbMatch[3], 10);
  
  // Convert to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}; 