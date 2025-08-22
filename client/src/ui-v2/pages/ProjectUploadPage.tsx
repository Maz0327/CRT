import React from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, Upload } from 'lucide-react';
import { UploadPanel } from '../components/upload/UploadPanel';
// import { PageHeader } from '../components/PageHeader';
import { Link } from 'wouter';

export function ProjectUploadPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [, setLocation] = useLocation();

  if (!projectId) {
    return (
      <div className="p-6">
        <div className="frost-card p-8 text-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Project Not Found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The project ID is missing or invalid.
          </p>
          <Link href="/projects" className="text-blue-600 hover:text-blue-700 transition-colors">
            Return to Projects
          </Link>
        </div>
      </div>
    );
  }

  const handleUploadComplete = (result: any) => {
    console.log('Upload completed:', result);
    // Optionally redirect to project captures or show success
    setTimeout(() => {
      setLocation(`/projects/${projectId}/captures`);
    }, 2000);
  };

  return (
    <div className="min-h-screen frost-subtle">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="frost-subtle p-2 rounded-lg">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Upload Files
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Add documents, images, and files to your project
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Navigation */}
        <div className="mb-6">
          <Link 
            href={`/projects/${projectId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            data-testid="back-to-project"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Project
          </Link>
        </div>

        {/* Upload Panel */}
        <div className="frost-card p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Upload Project Files
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Upload documents, images, PDFs, and other files to analyze and include in your strategic briefs.
              You can add notes to each file to provide context and insights.
            </p>
          </div>

          <UploadPanel 
            projectId={projectId}
            onUploadComplete={handleUploadComplete}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Link
            href={`/projects/${projectId}/captures`}
            className="frost-card hover:frost-strong p-4 text-center transition-all"
            data-testid="view-captures"
          >
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              View All Captures
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Browse uploaded files and captures
            </p>
          </Link>

          <Link
            href="/truth-lab"
            className="frost-card hover:frost-strong p-4 text-center transition-all"
            data-testid="truth-lab-link"
          >
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              Truth Lab
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Analyze URLs, text, and images
            </p>
          </Link>

          <Link
            href={`/projects/${projectId}/brief`}
            className="frost-card hover:frost-strong p-4 text-center transition-all"
            data-testid="brief-canvas-link"
          >
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              Brief Canvas
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create strategic presentations
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}