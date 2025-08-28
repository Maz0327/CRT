import { RouteObject } from 'react-router-dom';
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
import SignalsInboxPage from '../pages/SignalsInboxPage';

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <AuthPage />,
  },
  {
    path: '/',
    element: <AppShell><div /></AppShell>,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'projects',
        element: <ProjectsPage />,
      },
      {
        path: 'projects/:projectId/upload',
        element: <ProjectUploadPage />,
      },
      {
        path: 'captures',
        element: <CapturesInboxPage />,
      },
      {
        path: 'moments',
        element: <MomentsRadarPage />,
      },
      {
        path: 'briefs',
        element: <SimpleBriefsPage />,
      },
      {
        path: 'briefs/:id',
        element: <BriefCanvasPage />,
      },
      {
        path: 'feeds',
        element: <FeedsPage />,
      },
      {
        path: 'truth-lab',
        element: <TruthLabPage />,
      },
      {
        path: 'truth-lab/:id',
        element: <TruthDetailPage />,
      },
      {
        path: 'signals',
        element: <SignalsInboxPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];