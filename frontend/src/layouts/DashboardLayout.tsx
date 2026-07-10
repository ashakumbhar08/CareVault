import { ReactNode } from 'react';
import { Sidebar } from '../components/ui/Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'patient' | 'doctor';
  walletAddress: string;
  onDisconnect?: () => void;
  onWalletCleared?: () => void;
}

export const DashboardLayout = ({ children, role, walletAddress, onDisconnect, onWalletCleared }: DashboardLayoutProps) => {
  const handleDisconnect = () => {
    // Call the disconnect hook callback (from useWallet)
    // This will handle all the cleanup
    onDisconnect?.();
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
