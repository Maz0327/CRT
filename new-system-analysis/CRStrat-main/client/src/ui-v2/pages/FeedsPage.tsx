import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ExternalLink, MoreVertical, Edit, Trash2, Rss, ToggleLeft, ToggleRight } from 'lucide-react';
import { GlassCard } from '../components/primitives/GlassCard';
import { PopoverMenu, PopoverMenuItem } from '../components/primitives/PopoverMenu';
import { useFeeds } from '../hooks/useFeeds';
import { useProjectContext } from '../app/providers';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

const suggestedFeeds = [
  { title: 'Vogue Fashion News', url: 'https://www.vogue.com/rss' },
  { title: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  { title: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { title: 'Fast Company', url: 'https://www.fastcompany.com/rss.xml' },
];

export default function FeedsPage() {
  const { currentProjectId } = useProjectContext();
  const { feeds, createFeed, updateFeed, toggleFeed, deleteFeed, isCreating, isLoading } = useFeeds();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFeed, setEditingFeed] = useState<any>(null);
  const [formData, setFormData] = useState({ feedUrl: '', title: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.feedUrl.trim()) {
      if (editingFeed) {
        updateFeed({ 
          id: editingFeed.id, 
          feedUrl: formData.feedUrl.trim(),
          title: formData.title.trim() || undefined,
        }).then(() => {
          setEditingFeed(null);
          setFormData({ feedUrl: '', title: '' });
        }).catch((error) => {
          console.error('Failed to update feed:', error);
        });
      } else {
        createFeed({
          feedUrl: formData.feedUrl.trim(),
          title: formData.title.trim() || undefined,
          projectId: currentProjectId || undefined,
        }).then(() => {
          setFormData({ feedUrl: '', title: '' });
          setShowAddModal(false);
        }).catch((error) => {
          console.error('Failed to create feed:', error);
        });
      }
    }
  };

  const startEdit = (feed: any) => {
    setEditingFeed(feed);
    setFormData({ feedUrl: feed.feedUrl, title: feed.title || '' });
  };

  const handleQuickAdd = (suggestedFeed: typeof suggestedFeeds[0]) => {
    createFeed({
      feedUrl: suggestedFeed.url,
      title: suggestedFeed.title,
      projectId: currentProjectId || undefined,
    }).catch((error) => {
      console.error('Failed to add feed:', error);
    });
  };

  const handleDelete = (feedId: string) => {
    if (confirm('Are you sure you want to delete this feed?')) {
      deleteFeed(feedId).catch((error) => {
        console.error('Failed to delete feed:', error);
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-tight">Content Feeds</h1>
            <p className="text-ink/70 mt-1 text-sm md:text-base leading-relaxed">
              Manage RSS feeds and content sources for automated capture
            </p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
           className="flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 frost-strong hover:frost-card hover:scale-[1.02] rounded-lg transition-all duration-200 glass-shadow text-sm md:text-base text-ink"
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Add Feed</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Quick Add Suggestions */}
        <GlassCard>
          <div className="space-y-4">
            <h3 className="font-medium">Suggested Feeds</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {suggestedFeeds.map((feed) => (
                <button
                  key={feed.url}
                  onClick={() => handleQuickAdd(feed)}
                  className="p-3 glass rounded-lg hover:frost-subtle hover:scale-[1.02] transition-all duration-200 text-left touch-target"
                >
                  <div className="font-medium text-sm">{feed.title}</div>
                  <div className="text-xs text-ink/50 truncate mt-1">
                    {new URL(feed.url).hostname}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Active Feeds */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Feeds ({feeds.filter(f => f.isActive).length})</h2>
          
          {isLoading ? (
            <LoadingSkeleton count={4} variant="list" />
          ) : feeds.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rss className="w-8 h-8 text-ink/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No feeds configured</h3>
              <p className="text-ink/70 mb-6">
                Add RSS feeds to automatically capture content for analysis.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 hover:scale-[1.02] rounded-lg transition-all duration-200"
              >
                Add Your First Feed
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
              {feeds.map((feed, index) => (
                <motion.div
                  key={feed.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <GlassCard className="group">
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className={`p-2 rounded-lg ${
                        feed.isActive 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        <Rss className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm md:text-base font-medium truncate">
                          {feed.title || new URL(feed.feedUrl).hostname}
                        </h3>
                        <p className="text-sm text-ink/70 truncate mt-1">
                          {feed.feedUrl}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-ink/50">
                          <span className="hidden md:inline">Added {new Date(feed.createdAt).toLocaleDateString()}</span>
                          <a
                            href={feed.feedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-ink/80 transition-colors touch-target"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="hidden md:inline">View Feed</span>
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 md:gap-2">
                        <button
                          onClick={() => toggleFeed({ id: feed.id, isActive: !feed.isActive }).catch(console.error)}
                          className={`p-1 rounded transition-colors ${
                            feed.isActive 
                              ? 'text-green-400 hover:text-green-300' 
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                          title={feed.isActive ? 'Disable feed' : 'Enable feed'}
                        >
                          {feed.isActive ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                        
                        <PopoverMenu
                          trigger={
                            <button className="p-1 opacity-0 group-hover:opacity-100 md:opacity-100 hover:bg-white/10 rounded transition-all touch-target">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          }
                          align="right"
                        >
                          <PopoverMenuItem
                            onClick={() => startEdit(feed)}
                            icon={<Edit className="w-4 h-4" />}
                          >
                            Edit Feed
                          </PopoverMenuItem>
                          <PopoverMenuItem
                            onClick={() => handleDelete(feed.id)}
                            icon={<Trash2 className="w-4 h-4" />}
                            destructive
                          >
                            Delete Feed
                          </PopoverMenuItem>
                        </PopoverMenu>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Feed Modal */}
      <AnimatePresence>
        {(showAddModal || editingFeed) && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowAddModal(false);
              setEditingFeed(null);
              setFormData({ feedUrl: '', title: '' });
            }}
          >
            <motion.div
              className="glass rounded-2xl p-6 w-full max-w-md mx-4"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">
                {editingFeed ? 'Edit Feed' : 'Add New Feed'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Feed URL *
                  </label>
                  <input
                    type="url"
                    value={formData.feedUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, feedUrl: e.target.value }))}
                    placeholder="https://example.com/rss"
                    className="w-full px-3 py-2 glass rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500/50"
                    autoFocus
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Custom Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Optional custom name for this feed"
                    className="w-full px-3 py-2 glass rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingFeed(null);
                      setFormData({ feedUrl: '', title: '' });
                    }}
                    className="flex-1 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.feedUrl.trim() || isCreating}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    {isCreating ? 'Saving...' : editingFeed ? 'Update' : 'Add Feed'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}