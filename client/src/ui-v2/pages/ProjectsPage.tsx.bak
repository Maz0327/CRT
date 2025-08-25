import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreVertical, Edit, Trash2, Folder } from 'lucide-react';
import { GlassCard } from '../components/primitives/GlassCard';
import { PopoverMenu, PopoverMenuItem } from '../components/primitives/PopoverMenu';
import { useProjects } from '../hooks/useProjects';
import { useProjectContext } from '../app/providers';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export default function ProjectsPage() {
  const { projects, createProject, updateProject, deleteProject, isCreating, isLoading } = useProjects();
  const { currentProjectId, setCurrentProjectId } = useProjectContext();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      createProject(formData).then((project) => {
        setCurrentProjectId(project.id);
        setFormData({ name: '', description: '' });
        setShowCreateModal(false);
      }).catch((error) => {
        console.error('Failed to create project:', error);
      });
    }
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject && formData.name.trim()) {
      updateProject({ id: editingProject.id, ...formData }).then(() => {
        setEditingProject(null);
        setFormData({ name: '', description: '' });
      }).catch((error) => {
        console.error('Failed to update project:', error);
      });
    }
  };

  const startEdit = (project: any) => {
    setEditingProject(project);
    setFormData({ name: project.name, description: project.description || '' });
  };

  const handleDelete = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProject(projectId).then(() => {
        if (currentProjectId === projectId) {
          const remainingProjects = projects.filter(p => p.id !== projectId);
          setCurrentProjectId(remainingProjects[0]?.id || null);
        }
      }).catch((error) => {
        console.error('Failed to delete project:', error);
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-tight">Projects</h1>
            <p className="text-ink/70 mt-1 text-sm md:text-base leading-relaxed">
              Organize your content analysis and strategic work
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 frost-strong hover:frost-card hover:scale-[1.02] rounded-lg transition-all duration-200 glass-shadow text-sm md:text-base text-ink"
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <LoadingSkeleton count={6} variant="card" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
              <GlassCard className="relative group">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    currentProjectId === project.id 
                      ? 'frost-strong text-blue-400' 
                      : 'frost-subtle text-ink/70'
                  }`}>
                    <Folder className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-ink/70 mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <div className="text-xs text-ink/50 mt-2">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Current project indicator */}
                {currentProjectId === project.id && (
                  <div className="absolute top-3 right-12">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  </div>
                )}

                {/* Actions */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <PopoverMenu
                    trigger={
                      <button className="p-1 hover:bg-white/10 rounded transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    }
                    align="right"
                  >
                    {currentProjectId !== project.id && (
                      <PopoverMenuItem
                        onClick={() => setCurrentProjectId(project.id)}
                      >
                        Switch to Project
                      </PopoverMenuItem>
                    )}
                    <PopoverMenuItem
                      onClick={() => startEdit(project)}
                      icon={<Edit className="w-4 h-4" />}
                    >
                      Edit Project
                    </PopoverMenuItem>
                    {projects.length > 1 && (
                      <PopoverMenuItem
                        onClick={() => handleDelete(project.id)}
                        icon={<Trash2 className="w-4 h-4" />}
                        destructive
                      >
                        Delete Project
                      </PopoverMenuItem>
                    )}
                  </PopoverMenu>
                </div>
              </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {projects.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-ink/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-ink/70 mb-6">
              Create your first project to start organizing your content analysis.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              Create Project
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingProject) && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowCreateModal(false);
              setEditingProject(null);
              setFormData({ name: '', description: '' });
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
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>
              
              <form onSubmit={editingProject ? handleEdit : handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter project name..."
                    className="w-full px-3 py-2 glass rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500/50"
                    autoFocus
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description..."
                    rows={3}
                    className="w-full px-3 py-2 glass rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingProject(null);
                      setFormData({ name: '', description: '' });
                    }}
                    className="flex-1 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.name.trim() || isCreating}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    {isCreating ? 'Creating...' : editingProject ? 'Update' : 'Create'}
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