import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

type Project = { id: string; name: string };

type Ctx = {
  projects: Project[];
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;
  refresh: () => Promise<void>;
  create: (name: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const ProjectContext = createContext<Ctx | null>(null);
const KEY = "cr.currentProjectId";

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectIdState] = useState<string | null>(
    () => window.localStorage.getItem(KEY) || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setCurrentProjectId = useCallback((id: string | null) => {
    setCurrentProjectIdState(id);
    if (id) window.localStorage.setItem(KEY, id);
    else window.localStorage.removeItem(KEY);
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await api.get<Project[]>("/projects");
      const safe = Array.isArray(list) ? list : [];
      setProjects(safe);

      if (safe.length === 0) {
        // leave currentProjectId as-is (null)
      } else if (!currentProjectId || !safe.find(p => p.id === currentProjectId)) {
        setCurrentProjectId(safe[0].id);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }, [currentProjectId, setCurrentProjectId]);

  const create = useCallback(async (name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const proj = await api.post<Project>("/projects", { name });
      setProjects(prev => [proj, ...prev]);
      setCurrentProjectId(proj.id);
    } catch (e: any) {
      setError(e?.message || "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  }, [setCurrentProjectId]);

  useEffect(() => {
    void refresh();
  }, []); // initial load

  const value = useMemo<Ctx>(() => ({
    projects,
    currentProjectId,
    setCurrentProjectId,
    refresh,
    create,
    isLoading,
    error,
  }), [projects, currentProjectId, setCurrentProjectId, refresh, create, isLoading, error]);

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export function useProjectContext(): Ctx {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjectContext must be used within ProjectProvider");
  return ctx;
}