import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { authService } from "./lib/auth";
import AuthPage from "./pages/auth";
import Dashboard from "./pages/dashboard";
import AdminRegister from "./components/admin-register";
import { DebugPanel } from "./components/debug-panel";
import { TutorialOverlay } from "./components/tutorial-overlay";
import { useTutorial } from "./hooks/use-tutorial";

function AppContent() {
  const [user, setUser] = useState<{ id: number; email: string } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState("briefing");
  const { isEnabled: tutorialEnabled, toggleTutorial } = useTutorial();

  // Check for existing session on app load
  const { data: userData, isLoading: isCheckingAuth, error: authError } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        return await authService.getCurrentUser();
      } catch (error) {
        // Silent fail for auth check - user just isn't logged in
        return null;
      }
    },
    retry: false,
    enabled: !isInitialized,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isCheckingAuth) {
      if (userData?.user) {
        setUser(userData.user);
      }
      setIsInitialized(true);
    }
  }, [userData, isCheckingAuth]);

  const handleAuthSuccess = (userData: { id: number; email: string }) => {
    setUser(userData);
    queryClient.invalidateQueries({ queryKey: ["/api/signals"] });
  };

  const handleLogout = () => {
    setUser(null);
    queryClient.clear();
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if we should show admin registration
  const currentPath = window.location.pathname;
  if (currentPath === "/admin-register") {
    return (
      <TooltipProvider>
        <Toaster />
        <AdminRegister />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      {user ? (
        <div className="min-h-screen bg-gray-50">
          <Dashboard user={user} onLogout={handleLogout} onPageChange={setCurrentPage} />
          <TutorialOverlay 
            currentPage={currentPage}
            isEnabled={tutorialEnabled}
            onToggle={toggleTutorial}
          />
        </div>
      ) : (
        <AuthPage onAuthSuccess={handleAuthSuccess} />
      )}
      <DebugPanel />
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
