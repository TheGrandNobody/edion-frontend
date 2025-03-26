import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Download, X, Maximize2, Minimize2, Save } from 'lucide-react';
import { cn } from "@/lib/utils";

interface PDFViewerProps {
  pdfUrl: string;
  onClose?: () => void;
  className?: string;
  isEditing?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, onClose, className, isEditing = false }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editedContent, setEditedContent] = useState('');

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
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className={cn(
                  "w-full h-full p-4 rounded-lg",
                  "bg-white dark:bg-gray-900",
                  "border border-gray-200/80 dark:border-gray-800/50",
                  "text-sm text-gray-900 dark:text-gray-100",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/20",
                  "resize-none"
                )}
                placeholder="Edit your document here..."
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
