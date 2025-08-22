import { IS_MOCK_MODE } from '../services/http';
import { useAuth } from '../hooks/useAuth';

export function DebugPanel() {
  const { user, loading } = useAuth();
  
  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded z-50 text-xs font-mono">
      <div>✅ Mock user detected!</div>
      <div>IS_MOCK_MODE: {String(IS_MOCK_MODE)}</div>
      <div>hostname: {window.location.hostname}</div>
      <div>loading: {String(loading)}</div>
      <div>user: {user ? JSON.stringify(user) : 'null'}</div>
      <div>Should show app: {user ? 'YES' : 'NO'}</div>
    </div>
  );
}