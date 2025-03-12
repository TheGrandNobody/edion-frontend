
import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  FileUp,
  Upload,
  X,
  Paperclip,
  FileText,
  File
} from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FileUploadMenuProps {
  onFileSelect?: (file: File) => void;
  triggerClassName?: string;
  triggerIconClassName?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  showMobile?: boolean;
}

const FileUploadMenu: React.FC<FileUploadMenuProps> = ({
  onFileSelect,
  triggerClassName,
  triggerIconClassName,
  position = 'top',
  align = 'center',
  sideOffset = 10,
  showMobile = true,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (onFileSelect) {
        onFileSelect(file);
      }
      
      toast({
        title: "File selected",
        description: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      });
    }
    // Reset file input
    e.target.value = '';
  };
  
  const handleLocalUpload = () => {
    fileInputRef.current?.click();
  };
  
  const handleGoogleDrive = () => {
    toast({
      title: "Google Drive",
      description: "Google Drive integration is coming soon",
    });
  };
  
  const handleOneDrive = () => {
    toast({
      title: "Microsoft OneDrive",
      description: "OneDrive integration is coming soon",
    });
  };
  
  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <Popover>
        <PopoverTrigger asChild>
          <button 
            type="button" 
            className={cn(
              "p-1.5 sm:p-2 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 rounded-lg text-gray-500 dark:text-gray-400 backdrop-blur-sm",
              triggerClassName,
              showMobile ? "" : "hidden sm:block"
            )}
            aria-label="Attach file"
          >
            <Paperclip className={cn("h-4 w-4 sm:w-5 sm:h-5", triggerIconClassName)} />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          side={position} 
          align={align} 
          sideOffset={sideOffset}
          className="w-56 p-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-800 shadow-xl rounded-xl"
        >
          <div className="p-1.5">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 px-2 pt-1">
              Attach from
            </div>
            
            <div className="space-y-1">
              <button
                onClick={handleLocalUpload}
                className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm"
              >
                <Upload className="h-4 w-4 text-blue-500" />
                <span>Upload from computer</span>
              </button>
              
              <button
                onClick={handleGoogleDrive}
                className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm"
              >
                <Cloud className="h-4 w-4 text-green-500" />
                <span>Google Drive</span>
              </button>
              
              <button
                onClick={handleOneDrive}
                className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm"
              >
                <Cloud className="h-4 w-4 text-blue-500" />
                <span>Microsoft OneDrive</span>
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default FileUploadMenu;
