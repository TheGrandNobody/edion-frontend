import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Download, X, Maximize2, Minimize2, Save } from 'lucide-react';
import { cn } from "@/lib/utils";
import LatexEditor from './LatexEditor';

interface PDFViewerProps {
  pdfUrl: string;
  onClose?: () => void;
  className?: string;
  isEditing?: boolean;
  darkMode?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, onClose, className, isEditing = false, darkMode = false }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  // Initialize with some sample LaTeX content when editing mode is activated
  useEffect(() => {
    if (isEditing) {
      setEditedContent(`\\section{Introduction}
Welcome to your document! Type normally and use these shortcuts:
• Press $ to enter math mode (e.g. $E = mc^2$)
• Use # for headings
• Type normally for regular text

\\section{Example Math}
Here's an example equation: $F = ma$
And a more complex one: $\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$

\\section{Next Steps}
Start editing this document by clicking anywhere and typing. The math will be rendered automatically!`);
    }
  }, [isEditing]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving edited content:', editedContent);
  };

  return (
    <div className={cn(
      "flex flex-col bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800/50 backdrop-blur-md rounded-xl shadow-lg overflow-hidden",
      isFullscreen ? "fixed inset-4 z-50" : "h-full",
      className
    )}>
      {/* PDF Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200/80 dark:border-gray-800/50">
        <div className="flex items-center space-x-1">
          <button 
            className="p-1.5 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 rounded-lg text-gray-600 dark:text-gray-300"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 rounded-lg text-gray-600 dark:text-gray-300"
            onClick={() => window.history.forward()}
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center space-x-1">
          {isEditing && (
            <button
              onClick={handleSave}
              className="p-1.5 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 rounded-lg text-blue-600 dark:text-blue-400 flex items-center space-x-1"
              title="Save changes"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm">Save</span>
            </button>
          )}
          <a
            href={pdfUrl}
            download
            className="p-1.5 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 rounded-lg text-gray-600 dark:text-gray-300"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 rounded-lg text-gray-600 dark:text-gray-300"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 rounded-lg text-gray-600 dark:text-gray-300"
              title="Close PDF viewer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 bg-gray-50/50 dark:bg-gray-800/50 overflow-hidden">
        {isEditing ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 p-4 overflow-auto">
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Editing mode active - Use LaTeX commands to format your document
              </div>
              <LatexEditor
                initialValue={editedContent}
                onChange={setEditedContent}
                darkMode={darkMode}
                className="min-h-[calc(100vh-200px)]"
              />
            </div>
          </div>
        ) : (
          <iframe
            src={pdfUrl}
            className="w-full h-full rounded-lg bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/50"
            title="PDF Viewer"
          />
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
