import { ReactNode } from 'react';
import { Navbar } from '../components/ui/Navbar';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="landing" />
      <main>{children}</main>
    </div>
  );
};
