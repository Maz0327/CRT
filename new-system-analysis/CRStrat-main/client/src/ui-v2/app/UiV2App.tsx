import { Router, Route, Switch } from 'wouter';
import { Providers } from './providers';
import { AppShell } from '../components/AppShell';
import AuthPage from '../pages/AuthPage';
import DashboardPage from '../pages/DashboardPage';
import ProjectsPage from '../pages/ProjectsPage';
import CapturesInboxPage from '../pages/CapturesInboxPage';
import MomentsRadarPage from '../pages/MomentsRadarPage';
import SimpleBriefsPage from '../pages/SimpleBriefsPage';
import BriefCanvasPage from '../pages/BriefCanvasPage';
import FeedsPage from '../pages/FeedsPage';
import SettingsPage from '../pages/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';
import { ProjectUploadPage } from '../pages/ProjectUploadPage';
import { TruthLabPage } from '../pages/TruthLabPage';
import { TruthDetailPage } from '../pages/TruthDetailPage';
import { useAuth } from '../hooks/useAuth';

function AppRouter() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="text-ink">Loading...</div>
      </div>
    );
  }

  // For development, bypass authentication check temporarily
  // if (!isAuthenticated) {
  //   return <AuthPage />;
  // }

  return (
    <AppShell>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/projects" component={ProjectsPage} />
        <Route path="/projects/:projectId/upload" component={ProjectUploadPage} />
        <Route path="/captures" component={CapturesInboxPage} />
        <Route path="/moments" component={MomentsRadarPage} />
        <Route path="/briefs" component={SimpleBriefsPage} />
        <Route path="/briefs/:id" component={BriefCanvasPage} />
        <Route path="/feeds" component={FeedsPage} />
        <Route path="/truth-lab" component={TruthLabPage} />
        <Route path="/truth-lab/:id" component={TruthDetailPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </AppShell>
  );
}

export function UiV2App() {
  return (
    <Providers>
      <Router>
        <div className="ui-v2">
          <AppRouter />
        </div>
      </Router>
    </Providers>
  );
}