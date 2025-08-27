import { ReactNode, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setScopedProjectId } from "../lib/api";
import { useAuth, AuthProvider } from "../hooks/useAuth";
import { ProjectProvider, useProjectContext as useProjectContextBase } from "../context/ProjectContext";

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

// Re-export for backward compatibility
export const useProjectContext = useProjectContextBase;

// Bridge component to set scoped project ID for API calls
function ProjectScopeBridge() {
  const { currentProjectId } = useProjectContextBase();
  useEffect(() => { 
    setScopedProjectId(currentProjectId || undefined); 
    // invalidate project-scoped queries
    qc.invalidateQueries({ queryKey: ["captures"] });
    qc.invalidateQueries({ queryKey: ["moments"] });
    qc.invalidateQueries({ queryKey: ["briefs"] });
    qc.invalidateQueries({ queryKey: ["feeds"] });
  }, [currentProjectId]);
  return null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const el = document.documentElement;
    const body = document.body;
    const saved = localStorage.getItem("theme");
    const theme = saved || "dark";
    
    el.classList.remove("theme-dark", "theme-light");
    el.classList.add(theme === "light" ? "theme-light" : "theme-dark");
    
    // Ensure body has proper styling
    body.classList.add("bg-app", "text-ink");
    body.style.minHeight = "100vh";
    body.style.margin = "0";
    body.style.padding = "0";
  }, []);
  return <>{children}</>;
}

export function AuthBoundary({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="p-6 text-ink bg-app min-h-screen">Loading…</div>;
  
  // If we have a user (including mock user), show the app
  if (user) return <>{children}</>;
  
  // For development, bypass login redirect temporarily
  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <AuthProvider>
          <ProjectProvider>
            <ProjectScopeBridge />
            {children}
          </ProjectProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

