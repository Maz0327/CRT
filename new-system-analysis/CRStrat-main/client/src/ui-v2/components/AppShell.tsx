import { AppHeader } from './layout/AppHeader';
import { SideNav } from './SideNav';
import { PageHeader } from './PageHeader';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-app min-h-screen text-ink transition-colors duration-300">
      <AppHeader />
      <div className="flex">
        <SideNav />
        <main className="flex-1">
          <PageHeader />
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}