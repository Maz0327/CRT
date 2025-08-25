import { ReactNode } from "react";
import { FadeIn } from "../components/ui/fade-in";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  onRefresh?: () => void;
}

export default function PageLayout({ children, title, description, onRefresh }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Strategic Intelligence
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Refresh"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
              {description && (
                <p className="mt-2 text-sm lg:text-base text-gray-600 dark:text-gray-400">{description}</p>
              )}
            </div>
          </FadeIn>
          
          {children}
        </div>
      </main>
    </div>
  );
}