import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chrome, Copy, Check, X, Plus, Smartphone, Monitor } from 'lucide-react';

interface Device {
  id: string;
  label: string | null;
  created_at: string;
  last_active: string | null;
}

interface PairingCode {
  code: string;
  expiresAt: string;
}

export default function ExtensionManager() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [pairingCode, setPairingCode] = useState<PairingCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch devices on component mount
  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/extension/devices', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setDevices(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    }
  };

  const generatePairingCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/extension/pairing-codes', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          label: 'Chrome Extension',
          ttlSeconds: 600 // 10 minutes
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPairingCode(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to generate pairing code');
      }
    } catch (err) {
      setError('Network error generating pairing code');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (pairingCode?.code) {
      await navigator.clipboard.writeText(pairingCode.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const revokeDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/extension/devices/${deviceId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ revoke: true })
      });

      if (response.ok) {
        setDevices(devices.filter(d => d.id !== deviceId));
      }
    } catch (err) {
      console.error('Failed to revoke device:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDeviceIcon = (label: string | null) => {
    if (label?.toLowerCase().includes('mobile') || label?.toLowerCase().includes('phone')) {
      return Smartphone;
    }
    return Monitor;
  };

  const isCodeExpired = () => {
    if (!pairingCode) return true;
    return new Date() > new Date(pairingCode.expiresAt);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Chrome Extension</h3>
        <p className="text-ink/70 text-sm">
          Manage your Chrome Extension connections and generate pairing codes for new devices.
        </p>
      </div>

      {error && (
        <div className="p-4 glass rounded-lg border border-red-500/20 bg-red-500/10">
          <div className="flex items-center gap-2 text-red-400">
            <X className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Pairing Code Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Pair New Extension</h4>
          <button
            onClick={generatePairingCode}
            disabled={loading || (pairingCode !== null && !isCodeExpired())}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {loading ? 'Generating...' : 'Generate Code'}
          </button>
        </div>

        <AnimatePresence>
          {pairingCode && !isCodeExpired() && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 glass rounded-lg border border-blue-500/20 bg-blue-500/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-blue-400 mb-1">Pairing Code</div>
                  <div className="flex items-center gap-2">
                    <code className="px-3 py-2 bg-black/20 rounded font-mono text-lg tracking-widest text-blue-300">
                      {pairingCode.code}
                    </code>
                    <button
                      onClick={copyCode}
                      className="p-2 hover:bg-white/10 rounded transition-colors"
                      title="Copy code"
                    >
                      {copiedCode ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-ink/60 mt-2">
                    Expires in {Math.ceil((new Date(pairingCode.expiresAt).getTime() - Date.now()) / 60000)} minutes
                  </div>
                </div>
                <div className="text-4xl opacity-20">
                  <Chrome />
                </div>
              </div>
              <div className="mt-3 p-3 bg-black/20 rounded text-xs text-ink/70">
                <strong>Instructions:</strong> Open your Chrome Extension settings and enter this code to connect.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Connected Devices */}
      <div className="space-y-4">
        <h4 className="font-medium">Connected Devices</h4>
        
        {devices.length === 0 ? (
          <div className="p-8 glass rounded-lg text-center">
            <Chrome className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <div className="font-medium mb-2">No devices connected</div>
            <div className="text-sm text-ink/70">
              Generate a pairing code to connect your first Chrome Extension.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {devices.map((device) => {
              const DeviceIcon = getDeviceIcon(device.label);
              return (
                <motion.div
                  key={device.id}
                  layout
                  className="flex items-center justify-between p-4 glass rounded-lg hover:frost-subtle transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 frost-subtle rounded-lg">
                      <DeviceIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {device.label || 'Chrome Extension'}
                      </div>
                      <div className="text-sm text-ink/70">
                        Connected {formatDate(device.created_at)}
                        {device.last_active && (
                          <span> • Last active {formatDate(device.last_active)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => revokeDevice(device.id)}
                    className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                  >
                    Revoke
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 glass rounded-lg">
        <h4 className="font-medium mb-2">About Chrome Extension</h4>
        <p className="text-sm text-ink/70 mb-3">
          The Content Radar Chrome Extension lets you capture content directly from any webpage, 
          automatically analyze it with AI, and add it to your Content Radar workspace.
        </p>
        <div className="text-xs text-ink/60">
          ⚡ Instant capture • 🔒 Secure authentication • 🤖 AI-powered analysis
        </div>
      </div>
    </div>
  );
}