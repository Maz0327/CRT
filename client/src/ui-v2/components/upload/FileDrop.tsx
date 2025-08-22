import React, { useCallback, useState } from 'react';
import { Upload, FileText, Image, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropProps {
  onFilesSelected: (files: File[]) => void;
  className?: string;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export function FileDrop({ 
  onFilesSelected, 
  className, 
  maxFiles = 10,
  acceptedTypes = ['image/*', 'application/pdf', 'text/plain', '.docx', '.doc']
}: FileDropProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).slice(0, maxFiles);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected, maxFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, maxFiles);
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected, maxFiles]);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  return (
    <div
      className={cn(
        "frost-card border-2 border-dashed transition-all duration-200",
        isDragOver 
          ? "border-blue-400 bg-blue-50/10 dark:bg-blue-900/10" 
          : "border-gray-300 dark:border-gray-600 hover:border-gray-400",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid="file-drop-zone"
    >
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="frost-subtle rounded-full p-3 mb-4">
          <Upload className="w-8 h-8 text-gray-500" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Drop files here or click to upload
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Support for images, PDFs, and documents (max {maxFiles} files)
        </p>

        <label className="frost-card hover:frost-strong cursor-pointer px-4 py-2 rounded-lg transition-all">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Choose Files
          </span>
          <input
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            data-testid="file-input"
          />
        </label>

        <div className="flex items-center gap-4 mt-6 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Image className="w-4 h-4" />
            <span>Images</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>PDFs</span>
          </div>
          <div className="flex items-center gap-1">
            <File className="w-4 h-4" />
            <span>Docs</span>
          </div>
        </div>
      </div>
    </div>
  );
}