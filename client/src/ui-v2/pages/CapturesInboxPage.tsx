import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Tag, MoreVertical, Grid, List } from 'lucide-react';
import { GlassCard } from '../components/primitives/GlassCard';
import { SearchInput } from '../components/forms/SearchInput';
import { TagInput } from '../components/forms/TagInput';
import { PopoverMenu, PopoverMenuItem } from '../components/primitives/PopoverMenu';
import { useCaptures } from '../hooks/useCaptures';
import { updateCapture } from '../services/captures';
import { useProjectContext } from '../app/providers';
import { Capture } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ShotsPanel, CaptionsPanel, SimilarPanel, TranscriptPanel, AnalysisTrigger } from '../components/capture/AnalysisPanels';

const statusColumns = [
  { id: 'new', title: 'New', color: 'frost-card text-ink' },
  { id: 'keep', title: 'Keep', color: 'frost-strong text-ink' },
  { id: 'trash', title: 'Trash', color: 'frost-subtle text-ink/70' },
] as const;

export default function CapturesInboxPage() {
  const { currentProjectId } = useProjectContext();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const capturesQuery = useCaptures({
    projectId: currentProjectId || undefined,
    q: searchQuery,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    platform: selectedPlatform || undefined,
  });

  const captures = capturesQuery?.data?.data || [];
  const isLoading = capturesQuery?.isLoading || false;

  // Create updateStatus function using the updateCapture service
  type CaptureStatus = 'new' | 'keep' | 'trash';

  async function updateStatus(arg1: string | { id: string; status: CaptureStatus }, arg2?: CaptureStatus) {
    const id = typeof arg1 === 'string' ? arg1 : arg1.id;
    const status = typeof arg1 === 'string' ? (arg2 as CaptureStatus) : arg1.status;
    if (!id || !status) throw new Error('updateStatus requires id and status');

    try {
      await updateCapture(id, { status });
    } catch (error) {
      console.error('Failed to update capture status:', error);
    }
  }

  // Get unique platforms and tags for filters
  const { platforms, allTags } = useMemo(() => {
    const platformSet = new Set<string>();
    const tagSet = new Set<string>();

    if (Array.isArray(captures)) {
      captures.forEach(capture => {
        if (capture.platform) platformSet.add(capture.platform);
        if (Array.isArray(capture.tags)) {
          capture.tags.forEach(tag => tagSet.add(tag));
        }
      });
    }

    return {
      platforms: Array.from(platformSet).sort(),
      allTags: Array.from(tagSet).sort(),
    };
  }, [captures]);

  // Group captures by status
  const capturesByStatus = useMemo(() => {
    const groups: Record<string, any[]> = {
      new: [],
      keep: [],
      trash: [],
    };

    if (Array.isArray(captures)) {
      captures.forEach(capture => {
        const status = capture.status || 'new';
        if (groups[status]) {
          groups[status].push(capture);
        }
      });
    }

    return groups;
  }, [captures]);

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Filters */}
        <GlassCard>
          <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 min-w-0">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search captures..."
            />
            
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-2 md:px-3 py-2 glass rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500/50 text-xs md:text-sm"
            >
              <option value="">All platforms</option>
              {platforms.map(platform => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
            
            <div className="md:col-span-2 lg:col-span-1">
              <TagInput
                tags={selectedTags}
                onChange={setSelectedTags}
                suggestions={allTags}
                placeholder="Filter by tags..."
              />
            </div>
            
            <div className="flex items-center gap-2 justify-center md:justify-end md:col-span-2 lg:col-span-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`icon-container-sm rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'frost-strong text-blue-400' 
                    : 'hover:frost-subtle'
                }`}
              >
                <Grid className="w-4 h-4 stroke-1" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`icon-container-sm rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'frost-strong text-blue-400' 
                    : 'hover:frost-subtle'
                }`}
              >
                <List className="w-4 h-4 stroke-1" />
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Loading State */}
        {isLoading ? (
          <LoadingSkeleton count={6} variant="card" />
        ) : viewMode === 'grid' ? (
          /* Triage Board */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {statusColumns.map(column => (
              <div key={column.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base md:text-lg font-bold tracking-tight">{column.title}</h2>
                  <span className={`px-2 py-1 rounded text-sm ${column.color}`}>
                    {capturesByStatus[column.id].length}
                  </span>
                </div>

                <div className="min-h-[300px] md:min-h-[400px] p-3 md:p-4 rounded-xl border-2 border-dashed glass-border">
                  <AnimatePresence>
                    {capturesByStatus[column.id].map((capture, index) => (
                      <motion.div
                        key={capture.id}
                        className="mb-3 last:mb-0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <GlassCard className="group" onClick={() => setOpenDetailId(capture.id)}>
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <h3 className="text-sm md:text-base font-medium line-clamp-2 flex-1">
                                {capture.title}
                              </h3>
                              
                              <PopoverMenu
                                trigger={
                                  <button 
                                    className="p-1 opacity-0 group-hover:opacity-100 md:opacity-100 glass-hover rounded transition-all touch-target"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                }
                                align="right"
                              >
                                <PopoverMenuItem
                                  onClick={() => updateStatus({ id: capture.id, status: 'new' }).catch(console.error)}
                                >
                                  Move to New
                                </PopoverMenuItem>
                                <PopoverMenuItem
                                  onClick={() => updateStatus({ id: capture.id, status: 'keep' }).catch(console.error)}
                                >
                                  Move to Keep
                                </PopoverMenuItem>
                                <PopoverMenuItem
                                  onClick={() => updateStatus({ id: capture.id, status: 'trash' }).catch(console.error)}
                                >
                                  Move to Trash
                                </PopoverMenuItem>
                              </PopoverMenu>
                            </div>

                            {/* Image/Video Preview */}
                            {(capture.imageUrl || capture.videoUrl) && (
                              <div className="aspect-video rounded-lg overflow-hidden frost-subtle max-h-32 md:max-h-48">
                                {capture.imageUrl ? (
                                  <img
                                    src={capture.imageUrl}
                                    alt={capture.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-ink/50">
                                    Video
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Content */}
                            <p className="text-xs md:text-sm text-ink/70 line-clamp-2">
                              {capture.content}
                            </p>

                            {/* Platform & Tags */}
                            <div className="flex items-center justify-between">
                              {capture.platform && (
                                <span className="px-2 py-1 frost-card rounded text-xs font-medium">
                                  {capture.platform}
                                </span>
                              )}
                              
                              <div className="flex flex-wrap gap-1 justify-end">
                                {capture.tags?.slice(0, 1).map((tag: string) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 frost-subtle text-ink rounded text-xs font-medium"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {(capture.tags?.length || 0) > 1 && (
                                  <span className="px-2 py-1 frost-card rounded text-xs font-medium">
                                    +{(capture.tags?.length || 0) - 1}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {statusColumns.map(column => (
              <div key={column.id}>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-lg font-bold tracking-tight">{column.title}</h2>
                  <span className={`px-2 py-1 rounded text-sm ${column.color}`}>
                    {capturesByStatus[column.id].length}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <AnimatePresence>
                    {capturesByStatus[column.id].map((capture, index) => (
                      <motion.div
                        key={capture.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <GlassCard className="group" onClick={() => setOpenDetailId(capture.id)}>
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate leading-tight">{capture.title}</h3>
                              <p className="text-sm text-ink/70 line-clamp-1 mt-1 leading-relaxed">{capture.content}</p>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {capture.platform && (
                                <span className="px-2 py-1 frost-card rounded text-xs font-medium">
                                  {capture.platform}
                                </span>
                              )}
                              
                              <div className="flex gap-1">
                                {capture.tags?.slice(0, 2).map((tag: string) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 frost-subtle text-ink rounded text-xs font-medium"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              
                              <PopoverMenu
                                trigger={
                                  <button 
                                    className="p-1 opacity-0 group-hover:opacity-100 md:opacity-100 glass-hover rounded transition-all touch-target"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                }
                                align="right"
                              >
                                <PopoverMenuItem
                                  onClick={() => updateStatus({ id: capture.id, status: 'new' }).catch(console.error)}
                                >
                                  Move to New
                                </PopoverMenuItem>
                                <PopoverMenuItem
                                  onClick={() => updateStatus({ id: capture.id, status: 'keep' }).catch(console.error)}
                                >
                                  Move to Keep
                                </PopoverMenuItem>
                                <PopoverMenuItem
                                  onClick={() => updateStatus({ id: capture.id, status: 'trash' }).catch(console.error)}
                                >
                                  Move to Trash
                                </PopoverMenuItem>
                              </PopoverMenu>
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {captures.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 frost-subtle rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-ink/50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No captures found</h3>
            <p className="text-ink/70">
              {searchQuery || selectedTags.length > 0 || selectedPlatform
                ? 'Try adjusting your filters to see more captures.'
                : 'Start capturing content to see it here for triage.'}
            </p>
          </div>
        )}
      </div>

      {/* Capture Detail Sheet */}
      <AnimatePresence>
        {openDetailId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenDetailId(null)}
          >
            <motion.div
              className="glass rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const capture = captures.find(c => c.id === openDetailId);
                if (!capture) return null;
                
                return (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-xl font-bold">{capture.title}</h2>
                      <button
                        onClick={() => setOpenDetailId(null)}
                        className="p-2 glass-hover rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {(capture.imageUrl || capture.videoUrl) && (
                      <div className="aspect-video rounded-lg overflow-hidden frost-subtle">
                        {capture.imageUrl ? (
                          <img
                            src={capture.imageUrl}
                            alt={capture.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-ink/50">
                            Video Content
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-semibold mb-2">Content</h3>
                      <p className="text-ink/80">{capture.content}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Platform</h4>
                        <span className="px-3 py-1 frost-card rounded">
                          {capture.platform || 'Unknown'}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Status</h4>
                        <span className={`px-3 py-1 rounded ${
                          statusColumns.find(col => col.id === capture.status)?.color || 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {capture.status}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {capture.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {capture.url && (
                      <div>
                        <h4 className="font-medium mb-2">Source</h4>
                        <a
                          href={capture.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Original
                        </a>
                      </div>
                    )}

                    {/* Analysis Read-Model Panels */}
                    <div>
                      <h3 className="font-semibold mb-4">Media Analysis</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <AnalysisTrigger captureId={capture.id} />
                          <ShotsPanel captureId={capture.id} />
                          <TranscriptPanel captureId={capture.id} />
                        </div>
                        <div className="space-y-4">
                          <CaptionsPanel captureId={capture.id} />
                          <SimilarPanel captureId={capture.id} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}