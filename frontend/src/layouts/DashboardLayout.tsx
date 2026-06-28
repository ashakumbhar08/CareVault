import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/ui/Sidebar';
import { clearWallet } from '../store/appState';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'patient' | 'doctor';
  walletAddress: string;
  onDisconnect?: () => void;
  onWalletCleared?: () => void;
}

export const DashboardLayout = ({ children, role, walletAddress, onDisconnect, onWalletCleared }: DashboardLayoutProps) => {
  const navigate = useNavigate();

  const handleDisconnect = () => {
    // Clear React state via hook
    onDisconnect?.();
    
    // Clear Zustand store
    clearWallet();
    
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Navigate to landing
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={role} walletAddress={walletAddress} onDisconnect={handleDisconnect} onWalletCleared={onWalletCleared} />
      <div className="flex-1 ml-60">
        <main className="p-8 bg-background min-h-screen">{children}</main>
      </div>
    </div>
  );
};
