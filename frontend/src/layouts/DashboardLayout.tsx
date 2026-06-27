import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/ui/Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'patient' | 'doctor';
  walletAddress: string;
}

export const DashboardLayout = ({ children, role, walletAddress }: DashboardLayoutProps) => {
  const navigate = useNavigate();

  const handleDisconnect = () => {
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={role} walletAddress={walletAddress} onDisconnect={handleDisconnect} />
      <div className="flex-1 ml-60">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
};
