import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Key, Palette, Keyboard, Bell, Shield } from 'lucide-react';
import { GlassCard } from '../components/primitives/GlassCard';
import { useAuth } from '../hooks/useAuth';
import ExtensionManager from '../components/ExtensionManager';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');

  const sections = [
    { id: 'profile', title: 'Profile', icon: User },
    { id: 'tokens', title: 'API Tokens', icon: Key },
    { id: 'appearance', title: 'Appearance', icon: Palette },
    { id: 'shortcuts', title: 'Shortcuts', icon: Keyboard },
    { id: 'notifications', title: 'Notifications', icon: Bell },
    { id: 'privacy', title: 'Privacy', icon: Shield },
  ];

  const shortcuts = [
    { keys: ['⌘', 'K'], description: 'Open command palette' },
    { keys: ['⌘', 'S'], description: 'Save current work' },
    { keys: ['G'], description: 'Toggle grid in canvas' },
    { keys: ['⌘', 'Z'], description: 'Undo' },
    { keys: ['⌘', '⇧', 'Z'], description: 'Redo' },
    { keys: ['⌫'], description: 'Delete selected blocks' },
    { keys: ['⌘', 'D'], description: 'Duplicate selected blocks' },
    { keys: ['↑', '↓', '←', '→'], description: 'Nudge selected blocks' },
    { keys: ['⇧', '↑', '↓', '←', '→'], description: 'Nudge selected blocks (10px)' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || user.email}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 frost-subtle rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">{user?.name || 'User'}</h3>
                <p className="text-ink/70">{user?.email}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                <input
                  type="text"
                  defaultValue={user?.name || ''}
                  className="w-full px-3 py-2 glass rounded-lg bg-transparent outline-none focus:ring-2 glass-border-focus"
                  placeholder="Enter your display name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 glass rounded-lg bg-transparent outline-none opacity-50 cursor-not-allowed"
                />
                <p className="text-xs text-ink/50 mt-1">Email cannot be changed</p>
              </div>
              
              <button className="px-4 py-2 frost-strong hover:frost-card rounded-lg transition-colors text-ink">
                Save Changes
              </button>
            </div>
          </div>
        );

      case 'tokens':
        return <ExtensionManager />;

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Theme</h3>
              <p className="text-ink/70 text-sm mb-4">
                Customize the appearance of Content Radar.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 glass rounded-lg border-2 border-blue-500/50 bg-blue-500/10">
                  <div className="w-full h-20 bg-gradient-to-br from-gray-900 to-gray-800 rounded mb-2"></div>
                  <div className="text-sm font-medium">Dark (Current)</div>
                </button>
                <button className="p-4 glass rounded-lg hover:frost-subtle transition-colors">
                  <div className="w-full h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-2"></div>
                  <div className="text-sm font-medium">Light (Coming Soon)</div>
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Density</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input type="radio" name="density" value="comfortable" defaultChecked className="text-blue-500" />
                  <span>Comfortable</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="radio" name="density" value="compact" className="text-blue-500" />
                  <span>Compact</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'shortcuts':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Keyboard Shortcuts</h3>
              <p className="text-ink/70 text-sm">
                Learn the keyboard shortcuts to work more efficiently.
              </p>
            </div>
            
            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between p-3 glass rounded-lg">
                  <span className="text-sm">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span key={keyIndex} className="flex items-center gap-1">
                        <kbd className="px-2 py-1 text-xs font-mono frost-subtle rounded glass-border text-ink">
                          {key}
                        </kbd>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="text-xs text-ink/50">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Notification Preferences</h3>
              <p className="text-ink/70 text-sm">
                Choose what notifications you'd like to receive.
              </p>
            </div>
            
            <div className="space-y-4">
              {[
                { title: 'Export Complete', description: 'When brief exports finish processing' },
                { title: 'New Captures', description: 'When new content is captured from feeds' },
                { title: 'Cultural Moments', description: 'When new moments are detected' },
                { title: 'System Updates', description: 'Important system announcements' },
              ].map((item, index) => (
                <label key={index} className="flex items-start gap-3 p-3 glass rounded-lg cursor-pointer hover:frost-subtle transition-colors">
                  <input type="checkbox" defaultChecked className="mt-1 text-blue-500" />
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-ink/70">{item.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Privacy & Data</h3>
              <p className="text-ink/70 text-sm">
                Control how your data is used and stored.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 glass rounded-lg">
                <h4 className="font-medium mb-2">Data Export</h4>
                <p className="text-sm text-ink/70 mb-3">
                  Download all your data including projects, captures, and briefs.
                </p>
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
                  Export Data
                </button>
              </div>
              
              <div className="p-4 glass rounded-lg border border-red-500/20">
                <h4 className="font-medium mb-2 text-red-400">Delete Account</h4>
                <p className="text-sm text-ink/70 mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <GlassCard>
            <nav className="grid grid-cols-2 lg:grid-cols-1 gap-1 lg:space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 leading-relaxed ${
                    activeSection === section.id
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'hover:bg-white/5 focus:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50'
                  } touch-target`}
                >
                  <section.icon className="w-4 h-4" />
                  <span className="text-xs md:text-sm">{section.title}</span>
                </button>
              ))}
            </nav>
          </GlassCard>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard>
              {renderContent()}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}