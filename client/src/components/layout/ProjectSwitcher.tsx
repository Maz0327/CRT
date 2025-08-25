// client/src/components/layout/ProjectSwitcher.tsx
import React, { useState } from 'react';
import { useProjectContext } from '@/context/ProjectContext';
import { useProjects } from '@/hooks/useProjects';

export const ProjectSwitcher: React.FC = () => {
  const { activeProjectId, setActiveProjectId } = useProjectContext();
  const { projects, addProject } = useProjects();
  const [newName, setNewName] = useState('');

  if (projects.isLoading) return <div className="text-xs text-zinc-400">Loading projects…</div>;
  if (projects.error) return <div className="text-xs text-red-400">Failed to load projects</div>;

  const projectsList = projects.data ?? [];

  return (
    <div className="rounded-md border border-zinc-700 bg-zinc-950 p-2">
      <div className="mb-2 text-xs uppercase tracking-wide text-zinc-400">Project</div>
      <select
        value={activeProjectId ?? ''}
        onChange={(e) => setActiveProjectId(e.target.value || null)}
        className="mb-2 w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm"
      >
        <option value="">All projects</option>
        {projectsList.map((p: any) => (
          <option key={p.id} value={p.id}>
            {p.name || '(untitled)'}
          </option>
        ))}
      </select>

      <div className="mt-2 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New project name"
          className="flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm"
        />
        <button
          onClick={() => {
            if (!newName.trim()) return;
            addProject.mutate({ name: newName.trim() });
            setNewName('');
          }}
          className="rounded-md border border-zinc-700 bg-zinc-800 px-2 text-sm hover:bg-zinc-700"
        >
          + Add
        </button>
      </div>
    </div>
  );
};