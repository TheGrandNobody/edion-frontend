import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

interface DiagramBlockEditorProps {
  imageUrl: string | null;
  caption: string;
  onChange: (updates: { imageUrl?: string | null; caption?: string }) => void;
  darkMode: boolean;
}

const DiagramBlockEditor: React.FC<DiagramBlockEditorProps> = ({
  imageUrl,
  caption,
  onChange,
  darkMode
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange({ imageUrl: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    onChange({ imageUrl: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Image Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative min-h-[200px] rounded-lg",
          "border-2 border-dashed",
          isDragging ? (
            "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
          ) : (
            "border-gray-300 dark:border-gray-700"
          ),
          "transition-colors"
        )}
      >
        {imageUrl ? (
          <div className="relative group">
            <img
              src={imageUrl}
              alt={caption}
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              onClick={handleClear}
              className={cn(
                "absolute top-2 right-2",
                "p-1 rounded-full",
                "bg-red-100 dark:bg-red-900/50",
                "text-red-600 dark:text-red-400",
                "opacity-0 group-hover:opacity-100",
                "transition-opacity"
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileChange(file);
              }}
              className="hidden"
            />
            <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-2" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "px-4 py-2 rounded-lg",
                "bg-white dark:bg-gray-800",
                "border border-gray-200 dark:border-gray-700",
                "text-gray-600 dark:text-gray-300",
                "hover:bg-gray-50 dark:hover:bg-gray-700",
                "flex items-center space-x-2"
              )}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Image</span>
            </button>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              or drag and drop
            </p>
          </div>
        )}
      </div>

      {/* Caption Input */}
      <input
        type="text"
        value={caption}
        onChange={(e) => onChange({ caption: e.target.value })}
        placeholder="Enter image caption..."
        className={cn(
          "w-full px-3 py-2 rounded-lg",
          "bg-white dark:bg-gray-900",
          "border border-gray-200 dark:border-gray-800",
          "text-gray-900 dark:text-gray-100",
          "focus:outline-none focus:ring-2 focus:ring-blue-500"
        )}
      />
    </div>
  );
};

export default DiagramBlockEditor; 