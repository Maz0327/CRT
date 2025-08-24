// client/src/context/ProjectContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

type ProjectContextValue = {
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;
};

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentProjectId, setCurrentProjectIdState] = useState<string | null>(null);

  useEffect(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('currentProjectId') : null;
    if (saved) setCurrentProjectIdState(saved);
  }, []);

  function setCurrentProjectId(id: string | null) {
    setCurrentProjectIdState(id);
    try {
      if (id) localStorage.setItem('currentProjectId', id);
      else localStorage.removeItem('currentProjectId');
    } catch {}
  }

  return (
    <ProjectContext.Provider value={{ currentProjectId, setCurrentProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjectContext must be used within <ProjectProvider>');
  return ctx;
}