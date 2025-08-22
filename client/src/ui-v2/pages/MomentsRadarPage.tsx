import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Filter, Calendar } from 'lucide-react';
import { GlassCard } from '../components/primitives/GlassCard';
import { SearchInput } from '../components/forms/SearchInput';
import { TagInput } from '../components/forms/TagInput';
import { useMoments } from '../hooks/useMoments';
import { useProjectContext } from '../app/providers';
import { Loading } from '../components/Loading';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export default function MomentsRadarPage() {
  const { currentProjectId } = useProjectContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [minIntensity, setMinIntensity] = useState(0);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const { moments, isLoading } = useMoments({
    projectId: currentProjectId || undefined,
    q: searchQuery,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  });

  // Filter moments by intensity and platforms
  const filteredMoments = useMemo(() => {
    return moments.filter(moment => {
      if (moment.intensity < minIntensity) return false;
      if (selectedPlatforms.length > 0) {
        return selectedPlatforms.some(platform => moment.platforms.includes(platform));
      }
      return true;
    });
  }, [moments, minIntensity, selectedPlatforms]);

  // Get unique platforms and tags
  const { allPlatforms, allTags } = useMemo(() => {
    const platformSet = new Set<string>();
    const tagSet = new Set<string>();

    moments.forEach(moment => {
      moment.platforms.forEach(platform => platformSet.add(platform));
      moment.tags.forEach(tag => tagSet.add(tag));
    });

    return {
      allPlatforms: Array.from(platformSet).sort(),
      allTags: Array.from(tagSet).sort(),
    };
  }, [moments]);

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 80) return 'text-red-400 frost-card';
    if (intensity >= 60) return 'text-orange-400 frost-card';
    if (intensity >= 40) return 'text-yellow-400 frost-card';
    return 'text-green-400 frost-card';
  };

  const getIntensityLabel = (intensity: number) => {
    if (intensity >= 80) return 'Very High';
    if (intensity >= 60) return 'High';
    if (intensity >= 40) return 'Medium';
    return 'Low';
  };

  if (isLoading) {
    return (
      <LoadingSkeleton count={6} variant="card" />
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-tight">Moments Radar</h1>
        <p className="text-ink/70 mt-1 text-sm md:text-base leading-relaxed">
          Cultural moments will appear here as they are detected from your captures.
        </p>

        {/* Filters */}
        <GlassCard>
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5" />
              <h3 className="font-medium">Filters</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search moments..."
              />
              
              <TagInput
                tags={selectedTags}
                onChange={setSelectedTags}
                suggestions={allTags}
                placeholder="Filter by tags..."
              />
              
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium mb-2">
                  Min Intensity: {minIntensity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={minIntensity}
                  onChange={(e) => setMinIntensity(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium mb-2">
                  Platforms
                </label>
                <select
                  multiple
                  value={selectedPlatforms}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setSelectedPlatforms(values);
                  }}
                  className="w-full px-2 md:px-3 py-2 glass rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500/50 text-xs md:text-sm"
                  size={3}
                >
                  {allPlatforms.map(platform => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Intensity Overview */}
        {filteredMoments.length > 0 && (
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-medium">Intensity Overview</h3>
            </div>
            
            <div className="space-y-2">
              {filteredMoments.slice(0, 5).map(moment => (
                <div key={moment.id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-sm font-medium truncate">{moment.title}</div>
                  </div>
                  <div className="w-32 frost-subtle rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full glass-gradient transition-all duration-500"
                      style={{ width: `${moment.intensity}%` }}
                    />
                  </div>
                  <div className="text-sm font-medium w-12 text-right">
                    {moment.intensity}%
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Moments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredMoments.map((moment, index) => (
            <motion.div
              key={moment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <GlassCard hover className="h-full">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm md:text-base font-semibold line-clamp-2 flex-1">
                      {moment.title}
                    </h3>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getIntensityColor(moment.intensity)}`}>
                      {getIntensityLabel(moment.intensity)}
                    </div>
                  </div>

                  {/* Intensity Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span className="text-ink/70">Intensity</span>
                      <span className="font-medium">{moment.intensity}%</span>
                    </div>
                    <div className="w-full frost-subtle rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full glass-gradient"
                        initial={{ width: 0 }}
                        animate={{ width: `${moment.intensity}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs md:text-sm text-ink/70 line-clamp-2 md:line-clamp-3">
                    {moment.description}
                  </p>

                  {/* Platforms */}
                  <div className="space-y-2">
                    <div className="text-xs text-ink/50 uppercase tracking-wide">
                      Platforms
                    </div>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {moment.platforms.map(platform => (
                        <span
                          key={platform}
                          className="px-1.5 md:px-2 py-0.5 md:py-1 frost-card rounded text-xs"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  {moment.tags.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs text-ink/50 uppercase tracking-wide">
                        Tags
                      </div>
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        {moment.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-1.5 md:px-2 py-0.5 md:py-1 frost-strong text-blue-300 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {moment.tags.length > 3 && (
                          <span className="px-2 py-1 frost-card rounded text-xs">
                            +{moment.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="flex items-center gap-1 text-xs text-ink/50 mt-auto">
                    <Calendar className="w-3 h-3" />
                    {new Date(moment.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMoments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 frost-card rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-ink/50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No moments found</h3>
            <p className="text-ink/70">
              Cultural moments will appear here as they are detected from your captures.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}