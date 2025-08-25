// @ts-nocheck
import React, { Suspense } from "react";
import { Router, Route } from "wouter";
import AppLayout from "./components/layout/AppLayout";
import { AuthProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import RequireAuth from "./components/auth/RequireAuth";

// Lazy import UI-v2 pages if they exist; fall back handled by placeholders we created.
const BriefsListPage = React.lazy(() => import("./ui-v2/pages/BriefsListPage"));
const CapturesInboxPage = React.lazy(() => import("./ui-v2/pages/CapturesInboxPage"));
const FeedsPage = React.lazy(() => import("./ui-v2/pages/FeedsPage"));
const ProjectsPage = React.lazy(() => import("./ui-v2/pages/ProjectsPage"));
const SettingsPage = React.lazy(() => import("./ui-v2/pages/SettingsPage"));

const Home = () => (
  <div>
    <h2>Welcome to CRT</h2>
    <p>Select a section in the top nav to get started.</p>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Router>
          <AppLayout>
            <Suspense fallback={<div style={{padding:16}}>Loading…</div>}>
              <Route path="/" component={Home} />
              <Route path="/briefs">
                <RequireAuth><BriefsListPage /></RequireAuth>
              </Route>
              <Route path="/captures">
                <RequireAuth><CapturesInboxPage /></RequireAuth>
              </Route>
              <Route path="/feeds">
                <RequireAuth><FeedsPage /></RequireAuth>
              </Route>
              <Route path="/projects">
                <RequireAuth><ProjectsPage /></RequireAuth>
              </Route>
              <Route path="/settings">
                <RequireAuth><SettingsPage /></RequireAuth>
              </Route>
              <Route> {/* catch-all */}
                <div style={{padding:16}}>Not found.</div>
              </Route>
            </Suspense>
          </AppLayout>
        </Router>
      </ProjectProvider>
    </AuthProvider>
  );
};

export default App;