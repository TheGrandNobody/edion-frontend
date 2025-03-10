
import React from 'react';
import { ArrowLeft, ArrowRight, Download, Link, Bookmark, MoreVertical } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  darkMode: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, darkMode }) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* PDF Toolbar */}
      <div className="flex items-center justify-between p-1.5 sm:p-2 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/70 backdrop-blur-md">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button className="p-1.5 sm:p-2 hover:bg-gray-100/70 dark:hover:bg-gray-900 rounded-lg">
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
          </button>
          <button className="p-1.5 sm:p-2 hover:bg-gray-100/70 dark:hover:bg-gray-900 rounded-lg">
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button className="p-1.5 sm:p-2 hover:bg-gray-100/70 dark:hover:bg-gray-900 rounded-lg">
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
          </button>
          <button className="p-1.5 sm:p-2 hover:bg-gray-100/70 dark:hover:bg-gray-900 rounded-lg">
            <Link className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
          </button>
          <button className="p-1.5 sm:p-2 hover:bg-gray-100/70 dark:hover:bg-gray-900 rounded-lg">
            <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
          </button>
          <button className="p-1.5 sm:p-2 hover:bg-gray-100/70 dark:hover:bg-gray-900 rounded-lg">
            <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto p-2 sm:p-4 bg-gray-50 dark:bg-gray-900">
        <iframe
          src={pdfUrl}
          className="w-full h-full border rounded-lg bg-white"
          title="PDF Viewer"
        />
      </div>
    </div>
  );
};

export default PDFViewer;
