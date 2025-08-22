import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { FileDrop } from './FileDrop';
import { FileRow } from './FileRow';
import { cn } from '@/lib/utils';
import { uploadCaptures } from '../../services/captures';

interface FileWithMetadata {
  file: File;
  note: string;
  title: string;
}

interface UploadPanelProps {
  projectId: string;
  onUploadComplete?: (result: any) => void;
  className?: string;
}

export function UploadPanel({ projectId, onUploadComplete, className }: UploadPanelProps) {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    const filesWithMetadata = newFiles.map(file => ({
      file,
      note: '',
      title: file.name
    }));
    setFiles(prev => [...prev, ...filesWithMetadata]);
    setError(null);
    setSuccess(null);
  };

  const handleFileRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleNoteChange = (index: number, note: string) => {
    setFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, note } : item
    ));
  };

  const handleTitleChange = (index: number, title: string) => {
    setFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, title } : item
    ));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await uploadCaptures(projectId, files.map(({ file, note, title }) => ({
        file,
        note: note || undefined,
        title: title || undefined
      })));

      setSuccess(`Successfully uploaded ${result.created.length} file(s)`);
      setFiles([]);
      
      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)} data-testid="upload-panel">
      {/* File Drop Zone */}
      <FileDrop onFilesSelected={handleFilesSelected} />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Files to Upload ({files.length})
            </h3>
            <button
              onClick={() => setFiles([])}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              data-testid="clear-all-button"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-3">
            {files.map((item, index) => (
              <FileRow
                key={`${item.file.name}-${index}`}
                file={item.file}
                note={item.note}
                title={item.title}
                onRemove={() => handleFileRemove(index)}
                onNoteChange={(note) => handleNoteChange(index, note)}
                onTitleChange={(title) => handleTitleChange(index, title)}
              />
            ))}
          </div>

          {/* Upload Button */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500">
              Ready to upload {files.length} file(s)
            </div>
            <button
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                isUploading || files.length === 0
                  ? "frost-card text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
              data-testid="upload-button"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Files
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="frost-card border border-red-200 dark:border-red-800 p-4 rounded-lg" data-testid="error-message">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Upload Failed</span>
          </div>
          <p className="text-sm text-red-500 dark:text-red-300 mt-1">{error}</p>
        </div>
      )}

      {success && (
        <div className="frost-card border border-green-200 dark:border-green-800 p-4 rounded-lg" data-testid="success-message">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}
    </div>
  );
}