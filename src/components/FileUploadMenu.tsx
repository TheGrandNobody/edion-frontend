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
  disableResponsive?: boolean;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
}

const FileUploadMenu: React.FC<FileUploadMenuProps> = ({
  onFileSelect,
  triggerClassName,
  triggerIconClassName,
  position = 'top',
  align = 'center',
  sideOffset = 10,
  showMobile = true,
  disableResponsive = false,
  accept = '*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      for (const file of files) {
        if (file.size > maxSize) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds the ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`,
            variant: "destructive"
          });
          continue;
        }
        
        if (onFileSelect) {
          onFileSelect(file);
        }
        
        toast({
          title: "File selected",
          description: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        });
      }
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
        accept={accept}
        multiple={multiple}
        aria-label="File input"
      />
      
      <Popover>
        <PopoverTrigger asChild>
          <button 
            type="button" 
            className={cn(
              disableResponsive ? "p-1" : "p-1.5 sm:p-2",
              "hover:bg-gray-200/70 dark:hover:bg-gray-700/70 rounded-lg text-gray-500 dark:text-gray-400 backdrop-blur-sm",
              triggerClassName,
              showMobile ? "" : "hidden sm:block"
            )}
            aria-label="Attach file"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <Paperclip className={cn(
              disableResponsive ? "w-3.5 h-3.5" : "h-4 w-4 sm:w-5 sm:h-5",
              triggerIconClassName
            )} />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          side={position} 
          align={align} 
          sideOffset={sideOffset}
          className="w-56 p-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-800 shadow-xl rounded-xl"
          role="menu"
          aria-label="File upload options"
        >
          <div className="p-1.5">
            <div className="space-y-1">
              <button
                onClick={handleLocalUpload}
                className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm h-10"
              >
                <Upload className="h-5 w-5 text-blue-500" />
                <span>Upload from computer</span>
              </button>
              
              <button
                onClick={handleGoogleDrive}
                className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm h-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 87.3 78" className="h-5 w-5">
                  <title>Google Drive</title>
                  <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                  <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                  <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                  <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                  <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                  <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                </svg>
                <span>Google Drive</span>
              </button>
              
              <button
                onClick={handleOneDrive}
                className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm h-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                  <title>OneDrive</title>
                  <path d="M20.08 13.64c-.05-.01-.09-.02-.14-.02-.17-.01-.34.03-.5.1-.04-1.45-.68-2.75-1.7-3.69-.93-.87-2.15-1.41-3.49-1.41-1.1 0-2.14.36-2.99.98-.84.61-1.47 1.46-1.79 2.44-.29-.07-.58-.11-.88-.11-1.24 0-2.37.59-3.13 1.57-.77.98-1.1 2.29-.9 3.57.01.05.01.11.02.16-1.11.38-1.9 1.45-1.9 2.68 0 1.57 1.24 2.84 2.77 2.84h11.15c1.83 0 3.32-1.53 3.32-3.41 0-1.65-1.16-3.03-2.69-3.35l.01-.01c.5-.6.82-1.34.84-2.16v-.18z" fill="#0078D4"/>
                </svg>
                <span>OneDrive</span>
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default FileUploadMenu;
