import { Component, ErrorInfo, ReactNode } from 'react';
import { AppHeader } from './layout/AppHeader';
import { SideNav } from './SideNav';
import { PageHeader } from './PageHeader';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AppShell Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-app min-h-screen text-ink p-6 flex items-center justify-center">
          <div className="glass rounded-xl p-6 max-w-md text-center">
            <h2 className="text-xl font-semibold mb-3">Something went wrong</h2>
            <p className="text-ink/70 mb-4">An error occurred while loading the application.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <div className="bg-app min-h-screen text-ink transition-colors duration-300">
        <AppHeader />
        <div className="flex">
          <SideNav />
          <main className="flex-1">
            <PageHeader />
            <div className="p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}