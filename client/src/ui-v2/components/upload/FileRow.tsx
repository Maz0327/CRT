import React, { useState } from 'react';
import { FileText, Image, File, X, Edit3 } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface FileRowProps {
  file: File;
  note?: string;
  title?: string;
  onRemove: () => void;
  onNoteChange: (note: string) => void;
  onTitleChange: (title: string) => void;
  className?: string;
}

export function FileRow({
  file,
  note = '',
  title = '',
  onRemove,
  onNoteChange,
  onTitleChange,
  className
}: FileRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localNote, setLocalNote] = useState(note);
  const [localTitle, setLocalTitle] = useState(title || file.name);

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    if (file.type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSave = () => {
    onTitleChange(localTitle);
    onNoteChange(localNote);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalTitle(title || file.name);
    setLocalNote(note);
    setIsEditing(false);
  };

  return (
    <div className={cn("frost-card border", className)} data-testid={`file-row-${file.name}`}>
      <div className="flex items-start gap-3 p-4">
        <div className="frost-subtle rounded-lg p-2">
          {getFileIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                className="w-full px-3 py-2 frost-card border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="File title..."
                data-testid="file-title-input"
              />
              <textarea
                value={localNote}
                onChange={(e) => setLocalNote(e.target.value)}
                className="w-full px-3 py-2 frost-card border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
                placeholder="Add a note for this file..."
                data-testid="file-note-input"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                  data-testid="file-save-button"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 frost-card hover:frost-strong text-xs rounded-lg transition-colors"
                  data-testid="file-cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {localTitle}
                </h4>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:frost-subtle rounded transition-colors"
                  data-testid="file-edit-button"
                >
                  <Edit3 className="w-3 h-3 text-gray-400" />
                </button>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {formatFileSize(file.size)} • {file.type || 'Unknown type'}
              </p>
              
              {localNote && (
                <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 mt-2">
                  {localNote}
                </p>
              )}
              
              {!localNote && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  data-testid="add-note-button"
                >
                  + Add note
                </button>
              )}
            </div>
          )}
        </div>
        
        <button
          onClick={onRemove}
          className="p-1 hover:frost-subtle rounded transition-colors text-gray-400 hover:text-red-500"
          data-testid="file-remove-button"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}