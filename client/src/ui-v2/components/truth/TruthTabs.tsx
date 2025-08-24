import React, { useState } from 'react';
import { ExternalLink, Type, Image, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTruthCheck } from '../../services/truth';

interface TruthTabsProps {
  onAnalysisStart?: (result: any) => void;
  projectId?: string;
  className?: string;
}

export function TruthTabs({ onAnalysisStart, projectId, className }: TruthTabsProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'text' | 'image'>('url');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const tabs = [
    { id: 'url' as const, label: 'URL Analysis', icon: ExternalLink },
    { id: 'text' as const, label: 'Text Analysis', icon: Type },
    { id: 'image' as const, label: 'Visual Check', icon: Image }
  ];

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      let payload: any = { kind: activeTab };
      
      if (projectId) {
        payload.projectId = projectId;
      }

      if (activeTab === 'url') {
        if (!urlInput.trim()) {
          throw new Error('Please enter a URL to analyze');
        }
        payload.url = urlInput.trim();
      } else if (activeTab === 'text') {
        if (!textInput.trim()) {
          throw new Error('Please enter text to analyze');
        }
        payload.text = textInput.trim();
      } else if (activeTab === 'image') {
        if (!selectedFile) {
          throw new Error('Please select an image to analyze');
        }
        payload.file = selectedFile;
      }

      const result = await getTruthCheck(payload);
      
      // Clear form
      setUrlInput('');
      setTextInput('');
      setSelectedFile(null);
      
      if (onAnalysisStart) {
        onAnalysisStart(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const isFormValid = () => {
    if (activeTab === 'url') return urlInput.trim().length > 0;
    if (activeTab === 'text') return textInput.trim().length > 0;
    if (activeTab === 'image') return selectedFile !== null;
    return false;
  };

  return (
    <div className={cn("frost-card", className)} data-testid="truth-tabs">
      {/* Tab Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                )}
                data-testid={`truth-tab-${tab.id}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL to Analyze
              </label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full px-3 py-2 frost-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="url-input"
              />
            </div>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Text to Analyze
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter the text content you want to fact-check..."
                rows={6}
                className="w-full px-3 py-2 frost-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                data-testid="text-input"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {textInput.length} characters
              </p>
            </div>
          </div>
        )}

        {activeTab === 'image' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image to Analyze
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                {selectedFile ? (
                  <div className="text-center">
                    <div className="frost-subtle rounded-lg p-2 inline-flex items-center gap-2 mb-2">
                      <Image className="w-4 h-4" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-sm text-red-600 hover:text-red-700 transition-colors"
                      data-testid="remove-file-button"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <label className="cursor-pointer">
                      <span className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                        Choose Image File
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        data-testid="image-file-input"
                      />
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      PNG, JPG, GIF up to 50MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="frost-card border border-red-200 dark:border-red-800 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Analyze Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleAnalyze}
            disabled={!isFormValid() || isAnalyzing}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all",
              isFormValid() && !isAnalyzing
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "frost-card text-gray-400 cursor-not-allowed"
            )}
            data-testid="analyze-button"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze {activeTab === 'url' ? 'URL' : activeTab === 'text' ? 'Text' : 'Image'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}