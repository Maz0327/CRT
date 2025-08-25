import React from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css";
import "./ui-v2/index.css";

console.log('[Content Radar] Starting application...');

// Error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error('[Content Radar] React Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#1a1a1a', color: 'white', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ color: '#ff6b6b' }}>Application Error</h1>
          <pre style={{ background: '#2a2a2a', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
            {this.state.error?.toString()}
            {'\n\nStack:\n'}
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '20px', padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (rootElement) {
  console.log('[Content Radar] Root element found, attempting to load UI-v2...');
  
  // Lazy load the app to catch import errors
  import('./ui-v2/app/UiV2App')
    .then(({ UiV2App }) => {
      console.log('[Content Radar] UiV2App loaded successfully');
      createRoot(rootElement).render(
        <React.StrictMode>
          <ErrorBoundary>
            <UiV2App />
          </ErrorBoundary>
        </React.StrictMode>
      );
      console.log('[Content Radar] React app rendered');
    })
    .catch(error => {
      console.error('[Content Radar] Failed to load UiV2App:', error);
      createRoot(rootElement).render(
        <div style={{ padding: '20px', background: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
          <h1 style={{ color: '#ff6b6b' }}>Failed to Load Application</h1>
          <pre style={{ background: '#2a2a2a', padding: '10px', borderRadius: '4px' }}>
            {error.toString()}
            {'\n\nThis usually means there are import or compilation errors.'}
            {'\n\nCheck the browser console for details.'}
          </pre>
        </div>
      );
    });
} else {
  console.error('[Content Radar] Could not find root element!');
}
