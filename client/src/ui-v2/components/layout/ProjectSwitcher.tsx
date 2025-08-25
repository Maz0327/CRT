import { useEffect } from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Folder } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { useProjectContext } from '../../app/providers';
import { PopoverMenu, PopoverMenuItem } from '../primitives/PopoverMenu';
import { Project } from '../../types';

export function ProjectSwitcher() {
  const { projects, createProject, isCreating } = useProjects();
  const { currentProjectId, setCurrentProjectId } = useProjectContext();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Ensure projects is always an array
  const projectsList = Array.isArray(projects) ? projects : [];

  // Auto-select first project if none selected
  useEffect(() => {
    if (!currentProjectId && projectsList.length > 0) {
      setCurrentProjectId(projectsList[0].id);
    }
  }, [currentProjectId, projectsList, setCurrentProjectId]);

  const currentProject = projectsList.find((p: Project) => p.id === currentProjectId);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      createProject(
        { name: newProjectName.trim() },
      );
      setNewProjectName('');
      setShowCreateModal(false);
    }
  };

  return (
    <>
      <PopoverMenu
        trigger={
          <button className="flex items-center gap-2 px-3 py-2 glass rounded-lg hover:frost-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[40px] min-w-0">
            <Folder className="w-4 h-4 stroke-1" />
            <span className="text-sm font-medium truncate max-w-[120px]">
              {currentProject?.name || 'Select Project'}
            </span>
            <ChevronDown className="w-4 h-4 stroke-1 ml-auto" />
          </button>
        }
      >
        {projectsList.map((project: Project) => (
          <PopoverMenuItem
            key={project.id}
            onClick={() => setCurrentProjectId(project.id)}
            icon={
              currentProject?.id === project.id ? (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              ) : (
                <Folder className="w-4 h-4" />
              )
            }
          >
            {project.name}
          </PopoverMenuItem>
        ))}
        
        {projectsList.length > 0 && (
          <div className="border-t border-white/10 my-2"></div>
        )}
        
        <PopoverMenuItem
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Create New Project
        </PopoverMenuItem>
      </PopoverMenu>

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
              <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
              
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Enter project name..."
                    className="w-full px-3 py-2 glass rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500/50"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newProjectName.trim() || isCreating}
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
    </>
  );
}