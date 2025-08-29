import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ExternalLink, MoreVertical, Edit, Trash2, Rss, ToggleLeft, ToggleRight, RefreshCw, Clock } from 'lucide-react';
import { GlassCard } from '../components/primitives/GlassCard';
import { PopoverMenu, PopoverMenuItem } from '../components/primitives/PopoverMenu';
import { useFeeds, useFeedItems } from '../hooks/useFeeds';
import { useProjectContext } from '../app/providers';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { FeedData } from '../services/feeds';

const suggestedFeeds = [
  { title: 'Vogue Fashion News', url: 'https://www.vogue.com/rss' },
  { title: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  { title: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { title: 'Fast Company', url: 'https://www.fastcompany.com/rss.xml' },
];

export default function FeedsPage() {
  const { currentProjectId } = useProjectContext();
  const { feeds, createFeed, pullFeed, isCreating, isLoading, isPulling } = useFeeds(currentProjectId);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ feed_url: '', title: '' });
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.feed_url.trim() && currentProjectId) {
      createFeed({
        projectId: currentProjectId,
        feed_url: formData.feed_url.trim(),
        title: formData.title.trim() || undefined,
      }).then(() => {
        setFormData({ feed_url: '', title: '' });
        setShowAddModal(false);
      }).catch((error) => {
        console.error('Failed to create feed:', error);
      });
    }
  };

  const handleQuickAdd = (suggestedFeed: typeof suggestedFeeds[0]) => {
    if (currentProjectId) {
      createFeed({
        projectId: currentProjectId,
        feed_url: suggestedFeed.url,
        title: suggestedFeed.title,
      }).catch((error) => {
        console.error('Failed to add feed:', error);
      });
    }
  };

  const handlePullFeed = (feedId: string) => {
    if (currentProjectId) {
      pullFeed({ feedId, projectId: currentProjectId }).catch((error) => {
        console.error('Failed to pull feed:', error);
      });
    }
  };

  const formatLastPulled = (lastPulledAt: string | null) => {
    if (!lastPulledAt) return 'Never';
    const date = new Date(lastPulledAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
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
          <h2 className="text-lg font-semibold">Active Feeds ({feeds.filter(f => f.is_active).length})</h2>
          
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
                <FeedCard 
                  key={feed.id} 
                  feed={feed} 
                  index={index}
                  onPull={() => handlePullFeed(feed.id)}
                  onPreview={() => setSelectedFeedId(feed.id)}
                  isPulling={isPulling}
                  formatLastPulled={formatLastPulled}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feed Preview Modal */}
      <AnimatePresence>
        {selectedFeedId && (
          <FeedPreviewModal 
            feedId={selectedFeedId}
            onClose={() => setSelectedFeedId(null)}
          />
        )}
      </AnimatePresence>

      {/* Add Feed Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowAddModal(false);
              setFormData({ feed_url: '', title: '' });
            }}
          >
            <motion.div
              className="glass rounded-2xl p-6 w-full max-w-md mx-4"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Add New Feed</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Feed URL *
                  </label>
                  <input
                    type="url"
                    value={formData.feed_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, feed_url: e.target.value }))}
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
                      setFormData({ feed_url: '', title: '' });
                    }}
                    className="flex-1 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.feed_url.trim() || isCreating}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    {isCreating ? 'Saving...' : 'Add Feed'}
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

interface FeedCardProps {
  feed: FeedData;
  index: number;
  onPull: () => void;
  onPreview: () => void;
  isPulling: boolean;
  formatLastPulled: (date: string | null) => string;
}

function FeedCard({ feed, index, onPull, onPreview, isPulling, formatLastPulled }: FeedCardProps) {
  return (
    <motion.div
      key={feed.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <GlassCard className="group">
        <div className="flex items-start gap-3 md:gap-4">
          <div className={`p-2 rounded-lg ${
            feed.is_active 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-gray-500/20 text-gray-400'
          }`}>
            <Rss className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-medium truncate">
              {feed.title || new URL(feed.feed_url).hostname}
            </h3>
            <p className="text-sm text-ink/70 truncate mt-1">
              {feed.feed_url}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-ink/50">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Last: {formatLastPulled(feed.last_pulled_at)}</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                feed.status === 'healthy' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {feed.status}
              </span>
              <a
                href={feed.feed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-ink/80 transition-colors touch-target"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="hidden md:inline">View</span>
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={onPull}
              disabled={isPulling}
              className="p-1 rounded transition-colors text-blue-400 hover:text-blue-300 disabled:opacity-50"
              title="Pull feed now"
            >
              <RefreshCw className={`w-4 h-4 ${isPulling ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={onPreview}
              className="px-2 py-1 text-xs glass rounded hover:bg-white/10 transition-colors"
            >
              Preview
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

interface FeedPreviewModalProps {
  feedId: string;
  onClose: () => void;
}

function FeedPreviewModal({ feedId, onClose }: FeedPreviewModalProps) {
  const { currentProjectId } = useProjectContext();
  const { items, isLoading } = useFeedItems(feedId, currentProjectId, 5);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden mx-4"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Feed Preview</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-3 overflow-y-auto max-h-96">
          {isLoading ? (
            <LoadingSkeleton count={3} variant="list" />
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-ink/50">
              No items found. Try pulling the feed to fetch latest content.
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="p-3 glass rounded-lg">
                <h4 className="font-medium text-sm mb-2 line-clamp-2">{item.title}</h4>
                {item.summary && (
                  <p className="text-xs text-ink/70 line-clamp-3 mb-2">{item.summary}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-ink/50">
                  {item.author && <span>{item.author}</span>}
                  {item.published_at && (
                    <span>{new Date(item.published_at).toLocaleDateString()}</span>
                  )}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-ink/80 transition-colors ml-auto"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Read
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}