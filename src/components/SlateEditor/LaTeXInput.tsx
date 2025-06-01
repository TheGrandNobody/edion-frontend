import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface LaTeXInputProps {
  onConvert: (latex: string) => void;
  onClose: () => void;
}

const LaTeXInput: React.FC<LaTeXInputProps> = ({ onConvert, onClose }) => {
  const [latexInput, setLatexInput] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!latexInput.trim()) return;
    
    setIsConverting(true);
    setError(null);
    
    try {
      onConvert(latexInput);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert LaTeX');
    } finally {
      setIsConverting(false);
    }
  };

  const sampleLatex = `\\section{Sample Document}

This is a sample LaTeX document that demonstrates various features:

\\subsection{Text Formatting}
This text has \\textbf{bold}, \\textit{italic}, and \\underline{underlined} formatting.

\\subsection{Lists}
\\begin{itemize}
\\item First bullet point
\\item Second bullet point
  \\item Indented item
\\end{itemize}

\\begin{enumerate}
\\item First numbered item
\\item Second numbered item
\\end{enumerate}

\\subsection{Mathematics}
Inline math: \\(E = mc^2\\)

Display math:
\\[
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
\\]

\\subsection{Alignment}
\\begin{center}
This text is centered
\\end{center}

\\begin{flushright}
This text is right-aligned
\\end{flushright}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
        <h2 className="text-xl font-bold mb-4">Import from LaTeX</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="latex-input" className="block text-sm font-medium mb-2">
              Paste your LaTeX content:
            </label>
            <Textarea
              id="latex-input"
              value={latexInput}
              onChange={(e) => setLatexInput(e.target.value)}
              placeholder="Paste LaTeX here..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded">
              {error}
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setLatexInput(sampleLatex)}
              disabled={isConverting}
            >
              Load Sample
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isConverting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConvert}
                disabled={!latexInput.trim() || isConverting}
              >
                {isConverting ? 'Converting...' : 'Convert to WYSIWYG'}
              </Button>
            </div>
          </div>
        </div>
        
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium">
            Supported LaTeX Features
          </summary>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>• <strong>Text formatting:</strong> \textbf{}, \textit{}, \underline{}</p>
            <p>• <strong>Sections:</strong> \section{}, \subsection{}, \subsubsection{}</p>
            <p>• <strong>Lists:</strong> itemize, enumerate environments</p>
            <p>• <strong>Math:</strong> \(...\) for inline, \[...\] for display</p>
            <p>• <strong>Alignment:</strong> center, flushright environments</p>
            <p>• <strong>Colors:</strong> \textcolor{}{}, basic color names</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default LaTeXInput; 