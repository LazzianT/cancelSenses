import { ReactNode } from 'react';
import Sidebar from '../components/layout/Sidebar';

interface MainLayoutProps {
  children: ReactNode;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function MainLayout({ children, currentTab, setCurrentTab }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex relative overflow-hidden">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <main className="flex-1 min-w-0 h-screen overflow-y-auto px-8 py-8 relative z-10">
        {children}
      </main>
    </div>
  );
}