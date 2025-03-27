import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathBlockEditorProps {
  content: string;
  displayMode: boolean;
  onChange: (updates: { content?: string; displayMode?: boolean }) => void;
  darkMode: boolean;
}

const commonSymbols = [
  { symbol: '+', description: 'Plus' },
  { symbol: '-', description: 'Minus' },
  { symbol: '\\times', description: 'Multiply' },
  { symbol: '\\div', description: 'Divide' },
  { symbol: '=', description: 'Equals' },
  { symbol: '\\neq', description: 'Not equals' },
  { symbol: '\\leq', description: 'Less than or equal' },
  { symbol: '\\geq', description: 'Greater than or equal' },
  { symbol: '\\frac{a}{b}', description: 'Fraction' },
  { symbol: '\\sqrt{x}', description: 'Square root' },
  { symbol: '\\sum', description: 'Sum' },
  { symbol: '\\int', description: 'Integral' },
  { symbol: '\\infty', description: 'Infinity' },
  { symbol: '\\pi', description: 'Pi' },
  { symbol: '\\alpha', description: 'Alpha' },
  { symbol: '\\beta', description: 'Beta' },
  { symbol: '\\gamma', description: 'Gamma' },
  { symbol: '\\theta', description: 'Theta' }
];

const MathBlockEditor: React.FC<MathBlockEditorProps> = ({
  content,
  displayMode,
  onChange,
  darkMode
}) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      katex.renderToString(content || '', { displayMode });
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [content, displayMode]);

  const insertSymbol = (symbol: string) => {
    const textarea = document.activeElement as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.slice(0, start) + symbol + content.slice(end);
    onChange({ content: newContent });

    // Set cursor position after the inserted symbol
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + symbol.length;
      textarea.focus();
    }, 0);
  };

  return (
    <div className="space-y-4">
      {/* Display Mode Toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => onChange({ displayMode: !displayMode })}
          className={cn(
            "p-1.5 rounded",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            "text-gray-600 dark:text-gray-300"
          )}
          title={displayMode ? "Switch to inline mode" : "Switch to display mode"}
        >
          {displayMode ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Common Symbols */}
      <div className="grid grid-cols-6 gap-1">
        {commonSymbols.map(({ symbol, description }) => (
          <button
            key={symbol}
            onClick={() => insertSymbol(symbol)}
            className={cn(
              "p-1.5 rounded text-sm",
              "bg-white dark:bg-gray-900",
              "border border-gray-200 dark:border-gray-800",
              "hover:bg-gray-50 dark:hover:bg-gray-800",
              "text-gray-900 dark:text-gray-100"
            )}
            title={description}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(symbol, {
                  throwOnError: false,
                  displayMode: false
                })
              }}
            />
          </button>
        ))}
      </div>

      {/* LaTeX Editor */}
      <div className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => onChange({ content: e.target.value })}
          className={cn(
            "w-full min-h-[100px] p-3 rounded-lg",
            "bg-white dark:bg-gray-900",
            "border border-gray-200 dark:border-gray-800",
            "text-gray-900 dark:text-gray-100",
            "font-mono text-sm",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            error ? "border-red-500 dark:border-red-500" : ""
          )}
          placeholder="Enter LaTeX equation..."
        />
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">
            {error}
          </p>
        )}
      </div>

      {/* Preview */}
      {content && (
        <div
          className={cn(
            "p-4 rounded-lg",
            "bg-gray-50 dark:bg-gray-800/50",
            "border border-gray-200 dark:border-gray-800",
            "overflow-x-auto"
          )}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: katex.renderToString(content, {
                throwOnError: false,
                displayMode,
                errorColor: '#ef4444'
              })
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MathBlockEditor; 