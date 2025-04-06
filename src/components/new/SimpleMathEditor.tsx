import React, { useState, useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from "@/lib/utils";

interface SimpleMathEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  darkMode?: boolean;
}

const SimpleMathEditor: React.FC<SimpleMathEditorProps> = ({
  initialValue = '',
  onChange,
  className,
  darkMode = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(initialValue);
  const [inMathMode, setInMathMode] = useState(false);
  const [currentMathBuffer, setCurrentMathBuffer] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [lastSelection, setLastSelection] = useState<{ start: number, end: number } | null>(null);
  
  // Apply changes and update parent if needed
  useEffect(() => {
    onChange?.(content);
  }, [content, onChange]);

  // Helper function to place caret at the start of an element
  const placeCaretAtStart = (element: HTMLElement) => {
    const range = document.createRange();
    const selection = window.getSelection();
    if (!selection) return;

    // Find the first text node or BR element
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (node.nodeType === Node.TEXT_NODE) return NodeFilter.FILTER_ACCEPT;
          if (node.nodeName === 'BR') return NodeFilter.FILTER_ACCEPT;
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    const firstNode = walker.nextNode() || element;
    
    if (firstNode.nodeName === 'BR') {
      range.setStartBefore(firstNode);
    } else {
      range.setStart(firstNode, 0);
    }
    range.collapse(true);
    
    selection.removeAllRanges();
    selection.addRange(range);
  };

  // Effect to handle empty state
  useEffect(() => {
    if (!content && editorRef.current) {
      // Force a reset of the editor DOM structure
      editorRef.current.innerHTML = '<br>';
      
      // Re-establish focus and proper selection
      const selection = window.getSelection();
      if (selection) {
        placeCaretAtStart(editorRef.current);
        editorRef.current.focus();
      }
    }
  }, [content]);

  // Set up MutationObserver to monitor DOM changes
  useEffect(() => {
    if (!editorRef.current) return;
    
    const observer = new MutationObserver((mutations) => {
      // Check if editor has become empty through DOM manipulation
      if (editorRef.current && !editorRef.current.textContent?.trim() && 
          editorRef.current.innerHTML !== '<br>') {
        // Reset editor state to ensure it remains editable
        editorRef.current.innerHTML = '<br>';
        placeCaretAtStart(editorRef.current);
        editorRef.current.focus();
      }
    });
    
    observer.observe(editorRef.current, { 
      childList: true, 
      subtree: true, 
      characterData: true 
    });
    
    return () => observer.disconnect();
  }, []);

  // Helper function to detect math expressions
  const isMathExpression = (text: string): boolean => {
    const mathPatterns = [
      /\^/, // superscript
      /\_/, // subscript
      /\\frac/, // fractions
      /\\sqrt/, // square root
      /\d+\/\d+/, // Simple fractions like 1/2
      /\d+\*\d+/, // Multiplication
      /log\d*\s*\(/, // Logarithm with optional base and parentheses
      /(sin|cos|tan|csc|sec|cot|arcsin|arccos|arctan)\s*\(/, // Trigonometric functions
      /(sinh|cosh|tanh)\s*\(/, // Hyperbolic functions
      /(lim|sup|inf|max|min)\s*\{/, // Functions with curly braces
      /(sum|prod|int)\s*/, // Summation, product, integral
      /sqrt\s*\(/, // Square root
      /root\d*\s*\(/, // nth root
      /pi|theta|alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|omicron|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega/, // Greek letters
      /inf(inity)?/, // Infinity
      /!=|<=|>=|~=/, // Comparison operators
      /\+-|-\+|==|=>|->|<-|<=>/, // Special operators
      /\\int/, // Integral
      /\\sum/, // Summation
      /\\lim/, // Limit
      /\\infty/, // Infinity
      /\\left|\\right/, // Parentheses and brackets
      /\\begin|\\end/ // Environment markers
    ];
    
    return mathPatterns.some(pattern => pattern.test(text));
  };

  // Helper function to convert text to LaTeX
  const convertToLatex = (text: string): string => {
    // Convert simple fractions (e.g., "1/2" to "\frac{1}{2}")
    const fractionRegex = /(\d+)\/(\d+)/g;
    text = text.replace(fractionRegex, '\\frac{$1}{$2}');

    // Convert multiplication (e.g., "2*3" to "2 \times 3")
    const multiplicationRegex = /(\d+)\*(\d+)/g;
    text = text.replace(multiplicationRegex, '$1 \\times $2');

    // Convert logarithm with base and parentheses (e.g., "log2(x)" to "\log_2(x)")
    const logBaseParenRegex = /log(\d+)\s*(\(.*?\))/g;
    text = text.replace(logBaseParenRegex, '\\log_{$1}$2');

    // Convert natural logarithm (e.g., "log(x)" to "\log(x)")
    const logParenRegex = /log\s*(\(.*?\))/g;
    text = text.replace(logParenRegex, '\\log$1');

    // Convert trigonometric functions
    const mathFunctions = {
      // Trigonometric
      sin: '\\sin',
      cos: '\\cos',
      tan: '\\tan',
      csc: '\\csc',
      sec: '\\sec',
      cot: '\\cot',
      arcsin: '\\arcsin',
      arccos: '\\arccos',
      arctan: '\\arctan',
      // Hyperbolic
      sinh: '\\sinh',
      cosh: '\\cosh',
      tanh: '\\tanh',
      // Other functions
      lim: '\\lim',
      sup: '\\sup',
      inf: '\\inf',
      max: '\\max',
      min: '\\min',
      sqrt: '\\sqrt'
    };

    // Convert math functions with parentheses
    const funcPattern = new RegExp(`(${Object.keys(mathFunctions).join('|')})\\s*(\\(.*?\\))`, 'g');
    text = text.replace(funcPattern, (match, func, args) => {
      return `${mathFunctions[func as keyof typeof mathFunctions]}${args}`;
    });

    // Convert nth root (e.g., "root3(x)" to "\sqrt[3]{x}")
    const rootRegex = /root(\d+)\s*\((.*?)\)/g;
    text = text.replace(rootRegex, '\\sqrt[$1]{$2}');

    // Convert Greek letters
    const greekLetters = {
      alpha: '\\alpha',
      beta: '\\beta',
      gamma: '\\gamma',
      delta: '\\delta',
      epsilon: '\\epsilon',
      zeta: '\\zeta',
      eta: '\\eta',
      theta: '\\theta',
      iota: '\\iota',
      kappa: '\\kappa',
      lambda: '\\lambda',
      mu: '\\mu',
      nu: '\\nu',
      xi: '\\xi',
      omicron: '\\omicron',
      pi: '\\pi',
      rho: '\\rho',
      sigma: '\\sigma',
      tau: '\\tau',
      upsilon: '\\upsilon',
      phi: '\\phi',
      chi: '\\chi',
      psi: '\\psi',
      omega: '\\omega'
    };

    // Convert Greek letters (case-sensitive)
    Object.entries(greekLetters).forEach(([letter, latex]) => {
      const pattern = new RegExp(`\\b${letter}\\b`, 'g');
      text = text.replace(pattern, latex);
    });

    // Convert special operators
    const operators = {
      '!=': '\\neq',
      '<=': '\\leq',
      '>=': '\\geq',
      '~=': '\\approx',
      '+-': '\\pm',
      '-+': '\\mp',
      '==': '\\equiv',
      '=>': '\\Rightarrow',
      '->': '\\rightarrow',
      '<-': '\\leftarrow',
      '<=>': '\\Leftrightarrow',
      'inf': '\\infty',
      'infinity': '\\infty'
    };

    // Convert operators
    Object.entries(operators).forEach(([op, latex]) => {
      const pattern = new RegExp(op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      text = text.replace(pattern, latex);
    });

    return text;
  };

  // Function to render math expressions
  const renderMathExpression = (expression: string) => {
    if (!editorRef.current || !expression.trim()) return;
    
    const selection = window.getSelection();
    if (!selection) return;
    
    const range = selection.getRangeAt(0);
    const startNode = range.startContainer;
    
    // Create a container for the rendered math
    const mathSpan = document.createElement('span');
    mathSpan.className = 'math-rendered cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded px-1';
    mathSpan.style.display = 'inline-block';
    mathSpan.style.verticalAlign = 'middle';
    mathSpan.style.lineHeight = 'normal';
    
    // Convert to LaTeX before storing and rendering
    const latexExpression = convertToLatex(expression);
    mathSpan.setAttribute('data-math-content', latexExpression);
    
    try {
      const renderedMath = katex.renderToString(latexExpression, {
        throwOnError: false,
        displayMode: false
      });
      mathSpan.innerHTML = renderedMath;
      
      // Create a text node for the space after math
      const spaceNode = document.createTextNode('\u200B'); // Zero-width space for better cursor handling
      
      // Replace text with rendered math
      const wordRange = document.createRange();
      const textContent = startNode.textContent || '';
      const wordStart = textContent.lastIndexOf(expression, range.startOffset);
      
      if (wordStart >= 0) {
        wordRange.setStart(startNode, wordStart);
        wordRange.setEnd(startNode, wordStart + expression.length);
        wordRange.deleteContents();
        
        // Insert math span and space node
        wordRange.insertNode(mathSpan);
        mathSpan.after(spaceNode);
        
        // Position cursor after the space
        range.setStartAfter(spaceNode);
        range.setEndAfter(spaceNode);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } catch (error) {
      console.error('KaTeX error:', error);
    }
  };

  // Convert content with math delimiters to HTML with rendered math
  const getContentWithRenderedMath = () => {
    if (!content) return '<br>'; // Ensure there's always at least a line break

    // Split content by $ delimiters and alternate between text and math
    const parts = content.split(/(\$.*?\$)/g);
    
    return parts.map((part, index) => {
      // Check if this part is a math expression (starts and ends with $)
      if (part.startsWith('$') && part.endsWith('$') && part.length > 1) {
        // Extract the math expression without $ delimiters
        const mathExpression = part.slice(1, -1);
        
        try {
          // Generate a unique ID for this math part
          const mathId = `math-${index}`;
          
          // Render the math expression
          const renderedMath = katex.renderToString(mathExpression, {
            throwOnError: false,
            displayMode: false
          });
          
          // Return rendered math with data attributes for editing and proper inline styling
          return `<span class="math-rendered cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded px-1" 
                      style="display: inline-block; vertical-align: middle; line-height: normal;"
                      data-math-id="${mathId}" 
                      data-math-content="${mathExpression}">${renderedMath}</span>`;
        } catch (error) {
          console.error('KaTeX error:', error);
          return part; // Fall back to raw text if rendering fails
        }
      }
      
      // Regular text, just return it
      return part;
    }).join('');
  };

  // Handle input changes
  const handleInput = (e: React.FormEvent) => {
    const selection = window.getSelection();
    if (!selection) return;
    
    const textNode = selection.focusNode;
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;
    
    const text = textNode.textContent || '';
    const caretPos = selection.focusOffset;
    
    // Extract current word being typed
    const currentWordMatch = text.substring(0, caretPos).match(/\S+$/);
    const currentWord = currentWordMatch ? currentWordMatch[0] : '';
    
    if (!inMathMode && isMathExpression(currentWord)) {
      // Enter math mode
      setInMathMode(true);
      setCurrentMathBuffer(currentWord);
      
      // If it's a complete expression, render it immediately
      if (/^\d+\/\d+$/.test(currentWord) || 
          /^\d+\*\d+$/.test(currentWord) ||
          /^log\d*\s*\([^)]+\)$/.test(currentWord) ||
          /^(sin|cos|tan|csc|sec|cot|arcsin|arccos|arctan|sinh|cosh|tanh)\s*\([^)]+\)$/.test(currentWord) ||
          /^root\d*\s*\([^)]+\)$/.test(currentWord) ||
          /^(lim|sup|inf|max|min)\s*\{.*\}$/.test(currentWord) ||
          /^(alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|omicron|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega)$/.test(currentWord) ||
          /^(!=|<=|>=|~=|\+-|-\+|==|=>|->|<-|<=>)$/.test(currentWord) ||
          /^inf(inity)?$/.test(currentWord)) {
        renderMathExpression(currentWord);
        setInMathMode(false);
        setCurrentMathBuffer('');
        // Add space after the expression
        document.execCommand('insertText', false, ' ');
      }
    } else if (inMathMode) {
      // Update math buffer
      setCurrentMathBuffer(currentWord);
      
      // Check if we've completed an expression
      if (/^\d+\/\d+$/.test(currentWord) || 
          /^\d+\*\d+$/.test(currentWord) ||
          /^log\d*\s*\([^)]+\)$/.test(currentWord) ||
          /^(sin|cos|tan|csc|sec|cot|arcsin|arccos|arctan|sinh|cosh|tanh)\s*\([^)]+\)$/.test(currentWord) ||
          /^root\d*\s*\([^)]+\)$/.test(currentWord) ||
          /^(lim|sup|inf|max|min)\s*\{.*\}$/.test(currentWord) ||
          /^(alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|omicron|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega)$/.test(currentWord) ||
          /^(!=|<=|>=|~=|\+-|-\+|==|=>|->|<-|<=>)$/.test(currentWord) ||
          /^inf(inity)?$/.test(currentWord)) {
        renderMathExpression(currentWord);
        setInMathMode(false);
        setCurrentMathBuffer('');
        // Add space after the expression
        document.execCommand('insertText', false, ' ');
      }
    }
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const div = editorRef.current;
    if (!div) return;
    
    const selection = window.getSelection();
    if (!selection) return;

    // Special handling for Ctrl+A followed by Delete/Backspace
    if ((e.key === 'Delete' || e.key === 'Backspace') && 
        selection.toString() === div.innerText && 
        div.innerText.trim() !== '') {
      e.preventDefault();
      
      // Clear content but maintain structure
      div.innerHTML = '<br>';
      setContent('');
      setInMathMode(false);
      setCurrentMathBuffer('');
      
      // Force cursor positioning and focus
      requestAnimationFrame(() => {
        if (div) {
          div.focus();
          placeCaretAtStart(div);
        }
      });
      return;
    }

    // Handle space to exit math mode
    if (e.key === ' ' && inMathMode) {
      e.preventDefault();
      renderMathExpression(currentMathBuffer);
      setInMathMode(false);
      setCurrentMathBuffer('');
      
      // Insert space after rendered math
      document.execCommand('insertText', false, ' ');
      return;
    }
    
    // Handle backspace in math mode
    if (e.key === 'Backspace' && inMathMode) {
      const newBuffer = currentMathBuffer.slice(0, -1);
      setCurrentMathBuffer(newBuffer);
      
      // Exit math mode if buffer is empty
      if (!newBuffer) {
        setInMathMode(false);
      }
    }

    // Handle backspace when content is empty
    if (e.key === 'Backspace' && div.innerHTML === '<br>') {
      e.preventDefault(); // Prevent removing the <br>
    }
  };

  // Handle composition events (for IME input)
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  // Helper function to get all text nodes in an element
  const getTextNodesIn = (node: Node): Node[] => {
    const textNodes: Node[] = [];
    const walker = document.createTreeWalker(
      node,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let n: Node | null = walker.nextNode();
    while (n) {
      textNodes.push(n);
      n = walker.nextNode();
    }
    
    return textNodes;
  };
  
  // Save the current content
  const saveTempContent = () => {
    if (!editorRef.current) return;
    
    // Get current content and selection
    const selection = window.getSelection();
    const currentRange = selection?.getRangeAt(0);
    let cursorPosition = currentRange?.startOffset || 0;
    
    // Process content to convert rendered math back to raw format
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editorRef.current.innerHTML;
    
    // Find all rendered math spans and replace with raw format
    const mathSpans = tempDiv.querySelectorAll('.math-rendered');
    mathSpans.forEach(span => {
      const mathContent = span.getAttribute('data-math-content');
      if (mathContent) {
        const textNode = document.createTextNode(mathContent);
        span.parentNode?.replaceChild(textNode, span);
      }
    });
    
    // Get the processed content, ensuring it's never completely empty
    const processedContent = tempDiv.textContent || '';
    setContent(processedContent);
    
    // If the content is empty, reset the editor to a usable state
    if (!processedContent && editorRef.current) {
      editorRef.current.innerHTML = '<br>';
      if (selection) {
        const range = document.createRange();
        range.setStart(editorRef.current, 0);
        range.setEnd(editorRef.current, 0);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      return;
    }
    
    // Restore cursor position after content update
    setTimeout(() => {
      if (editorRef.current && selection && currentRange) {
        const range = document.createRange();
        const textNode = getTextNodesIn(editorRef.current)[0];
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          const newPosition = Math.min(cursorPosition, textNode.textContent?.length || 0);
          range.setStart(textNode, newPosition);
          range.setEnd(textNode, newPosition);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }, 0);
  };

  // Handle editor blur to save content
  const handleBlur = () => {
    saveTempContent();
  };
  
  // Handle clicking on rendered math to edit it
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Check if we clicked on a math element or its container
    const mathEl = target.closest('.math-rendered');
    if (mathEl) {
      const mathContent = mathEl.getAttribute('data-math-content');
      if (mathContent) {
        // Replace the rendered element with editable $ format
        const textNode = document.createTextNode(mathContent);
        mathEl.parentNode?.replaceChild(textNode, mathEl);
        
        // Save the updated DOM content
        setTimeout(() => {
          // Try to position cursor inside the math expression
          const selection = window.getSelection();
          const range = document.createRange();
          
          if (selection && textNode.parentNode) {
            const nodeIndex = Array.from(textNode.parentNode.childNodes).indexOf(textNode);
            if (nodeIndex >= 0) {
              // Position cursor after first $
              range.setStart(textNode, 1);
              range.setEnd(textNode, 1);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
          saveTempContent();
        }, 0);
      }
    }
  };

  // Handle paste to clean up html
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    saveTempContent();
  };

  return (
    <div 
      className={cn(
        "w-full min-h-[200px] p-4 rounded-lg",
        "bg-white dark:bg-gray-900",
        "border border-gray-200 dark:border-gray-800",
        "focus-within:ring-2 focus-within:ring-blue-500/30 dark:focus-within:ring-blue-500/20",
        inMathMode && "math-mode",
        className
      )}
    >
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className={cn(
          "min-h-[200px] outline-none prose dark:prose-invert max-w-none",
          "whitespace-pre-wrap break-words",
          inMathMode && "bg-blue-50/30 dark:bg-blue-900/10"
        )}
        style={{
          lineHeight: '1.5'
        }}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onBlur={handleBlur}
        onClick={handleClick}
        onPaste={handlePaste}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        dangerouslySetInnerHTML={{ __html: getContentWithRenderedMath() }}
      />
    </div>
  );
};

export default SimpleMathEditor; 