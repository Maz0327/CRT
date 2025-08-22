import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Plus, Search, Grid, List, MoreVertical, Edit, Trash2, FileText } from 'lucide-react';
import { GlassCard } from '../components/primitives/GlassCard';
import { SearchInput } from '../components/forms/SearchInput';
import { TagInput } from '../components/forms/TagInput';
import { PopoverMenu, PopoverMenuItem } from '../components/primitives/PopoverMenu';
import { useBriefs } from '../hooks/useBriefs';
import { useProjectContext } from '../app/providers';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export default function BriefsListPage() {
  const [, setLocation] = useLocation();
  const { currentProjectId } = useProjectContext() || { currentProjectId: null };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBriefTitle, setNewBriefTitle] = useState('');

  const { briefs: briefsData, createBrief, deleteBrief, isCreating, isLoading } = useBriefs({
    projectId: currentProjectId || undefined,
    q: searchQuery,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  });

  const briefs = Array.isArray((briefsData as any)?.items) ? (briefsData as any).items : Array.isArray(briefsData) ? (briefsData as any) : [];

  const handleCreateBrief = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBriefTitle.trim() && currentProjectId) {
      createBrief({
        project_id: currentProjectId,
        title: newBriefTitle.trim(),
      }).then((brief) => {
        setLocation(`/briefs/${brief.id}`);
        setNewBriefTitle('');
        setShowCreateModal(false);
      }).catch((error) => {
        console.error('Failed to create brief:', error);
      });
    }
  };

  const handleDeleteBrief = (briefId: string) => {
    if (confirm('Are you sure you want to delete this brief? This action cannot be undone.')) {
      deleteBrief(briefId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'frost-subtle text-ink/80';
      case 'in_review':
        return 'frost-card text-ink/90';
      case 'final':
        return 'frost-strong text-ink';
      default:
        return 'frost-card text-ink/60';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-tight">Strategic Briefs</h1>
            <p className="text-ink/70 mt-1 text-sm md:text-base leading-relaxed">
              Create and manage your strategic content briefs
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 frost-strong glass-hover hover:scale-[1.02] rounded-lg transition-all duration-200 text-sm md:text-base"
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">New Brief</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* Filters and View Controls */}
        <GlassCard>
          <div className="space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 min-w-0">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search briefs..."
              />
              
              <TagInput
                tags={selectedTags}
                onChange={setSelectedTags}
                placeholder="Filter by tags..."
              />
            </div>
            
            <div className="flex items-center gap-2 justify-center md:justify-end flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`icon-container-sm rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'frost-strong text-ink' 
                    : 'glass-hover'
                }`}
              >
                <Grid className="w-4 h-4 stroke-1" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`icon-container-sm rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'frost-strong text-ink' 
                    : 'glass-hover'
                }`}
              >
                <List className="w-4 h-4 stroke-1" />
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Briefs Grid/List */}
        {isLoading ? (
          <LoadingSkeleton count={6} variant="card" />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {briefs.map((brief: any, index: number) => (
              <motion.div
                key={brief.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <GlassCard hover onClick={() => setLocation(`/briefs/${brief.id}`)}>
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold line-clamp-2 flex-1">
                        {brief.title}
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(brief.status)}`}>
                          {brief.status}
                        </span>
                        
                        <PopoverMenu
                          trigger={
                            <button className="p-1 opacity-0 group-hover:opacity-100 md:opacity-100 hover:bg-white/10 rounded transition-all touch-target">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          }
                          align="right"
                        >
                          <PopoverMenuItem
                            onClick={() => setLocation(`/briefs/${brief.id}`)}
                            icon={<Edit className="w-4 h-4" />}
                          >
                            Edit Brief
                          </PopoverMenuItem>
                          <PopoverMenuItem
                            onClick={() => handleDeleteBrief(brief.id)}
                            icon={<Trash2 className="w-4 h-4" />}
                            destructive
                          >
                            Delete Brief
                          </PopoverMenuItem>
                        </PopoverMenu>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-ink/60">
                      <span>{brief.slideCount} slides</span>
                      <span>•</span>
                      <span>Updated {new Date(brief.updatedAt).toLocaleDateString()}</span>
                    </div>

                    {/* Tags */}
                    {(brief.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(brief.tags || []).slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {brief.tags.length > 3 && (
                          <span className="px-2 py-1 bg-white/10 rounded text-xs">
                            +{brief.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard>
            <div className="space-y-1">
              {briefs.map((brief: any, index: number) => (
                <motion.div
                  key={brief.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-lg cursor-pointer group transition-colors"
                  onClick={() => setLocation(`/briefs/${brief.id}`)}
                >
                  <FileText className="w-5 h-5 text-ink/50" />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{brief.title}</h3>
                    <div className="text-sm text-ink/60">
                      {brief.slideCount} slides • Updated {new Date(brief.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {(brief.tags || []).slice(0, 2).map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(brief.status)}`}>
                      {brief.status}
                    </span>
                    
                    <PopoverMenu
                      trigger={
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      }
                      align="right"
                    >
                      <PopoverMenuItem
                        onClick={() => setLocation(`/briefs/${brief.id}`)}
                        icon={<Edit className="w-4 h-4" />}
                      >
                        Edit Brief
                      </PopoverMenuItem>
                      <PopoverMenuItem
                        onClick={() => handleDeleteBrief(brief.id)}
                        icon={<Trash2 className="w-4 h-4" />}
                        destructive
                      >
                        Delete Brief
                      </PopoverMenuItem>
                    </PopoverMenu>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Empty State */}
        {briefs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-ink/50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No briefs yet</h3>
            <p className="text-ink/70 mb-6">
              {searchQuery || selectedTags.length > 0
                ? 'Try adjusting your filters to see more briefs.'
                : 'Create your first strategic brief to get started.'}
            </p>
            {!searchQuery && selectedTags.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                Create Brief
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Brief Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              className="glass rounded-2xl p-6 w-full max-w-md mx-4"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Create New Brief</h3>
              
              <form onSubmit={handleCreateBrief} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Brief Title *
                  </label>
                  <input
                    type="text"
                    value={newBriefTitle}
                    onChange={(e) => setNewBriefTitle(e.target.value)}
                    placeholder="Enter brief title..."
                    className="w-full px-3 py-2 glass rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500/50"
                    autoFocus
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewBriefTitle('');
                    }}
                    className="flex-1 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newBriefTitle.trim() || isCreating}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    {isCreating ? 'Creating...' : 'Create'}
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