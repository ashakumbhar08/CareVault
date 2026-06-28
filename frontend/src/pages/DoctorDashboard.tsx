import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { RecordCard } from '../components/ui/RecordCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ToastNotification } from '../components/ui/ToastNotification';
import { OnboardingModal } from '../components/ui/OnboardingModal';
import { WalletDisconnectedOverlay } from '../components/ui/WalletDisconnectedOverlay';
import { useToast } from '../hooks/useToast';
import { useWallet } from '../hooks/useWallet';
import { FolderOpen } from 'lucide-react';
import { getState, setWallet, subscribeToWalletChanges } from '../store/appState';

export const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { disconnect } = useWallet();
  const { toasts, removeToast } = useToast();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [showDisconnected, setShowDisconnected] = useState(false);

  // FIX 3: Wallet guard with re-hydration + FIX 5: Role validation
  useEffect(() => {
    const walletStr = sessionStorage.getItem('cv_wallet');
    if (!walletStr) {
      navigate('/connect');
      return;
    }
    try {
      const { address, role } = JSON.parse(walletStr);
      // FIX 5: Validate role on entry
      if (role !== 'doctor') {
        navigate('/patient');
        return;
      }
      // Re-hydrate global store from sessionStorage
      setWallet(address, role);
      setWalletAddress(address);
    } catch {
      navigate('/connect');
    }
  }, [navigate]);

  // FIX 2: Subscribe to wallet changes and show overlay if cleared
  useEffect(() => {
    const unsubscribe = subscribeToWalletChanges((address) => {
      if (address === null) {
        setShowDisconnected(true);
      }
    });
    return unsubscribe;
  }, []);

  // AREA B FIX 2: Trigger onboarding based on wallet + role-scoped flag + mount
  useEffect(() => {
    const wallet = getState();
    if (wallet.walletAddress && !localStorage.getItem('cv_onboarded_' + wallet.walletRole)) {
      setIsOnboardingOpen(true);
    }
  }, []);

  const state = getState();
  const grants = state.grants.filter(g =>
    g.isActive &&
    g.doctorWallet === walletAddress &&
    new Date(g.expiresAt) > new Date()
  );

  const records = state.records.filter(r => grants.some(g => g.recordIds.includes(r.id)));

  if (!walletAddress) return null;

  if (grants.length === 0) {
    return (
      <>
        {showDisconnected && (
          <WalletDisconnectedOverlay onReconnect={() => navigate('/connect')} />
        )}
        <DashboardLayout role="doctor" walletAddress={walletAddress} onDisconnect={disconnect} onWalletCleared={() => setShowDisconnected(true)}>
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text-primary">Records Shared With You</h1>
            <EmptyState
              variant="patients"
              onAction={() => navigate('/')}
            />
          </div>
          <ToastNotification toasts={toasts} onClose={removeToast} />
          <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
        />
      </DashboardLayout>
      </>
    );
  }

  return (
    <>
      {showDisconnected && (
        <WalletDisconnectedOverlay onReconnect={() => navigate('/connect')} />
      )}
      <DashboardLayout role="doctor" walletAddress={walletAddress} onDisconnect={disconnect} onWalletCleared={() => setShowDisconnected(true)}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-text-primary">Records Shared With You</h1>

        {grants.map((grant, i) => {
          const now = new Date();
          const expiry = new Date(grant.expiresAt);
          const diffMs = expiry.getTime() - now.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

          let expiryText = '';
          let expiryColor = '';
          if (diffMs <= 0) {
            expiryText = 'Expired';
            expiryColor = 'text-error';
          } else if (diffDays === 0) {
            expiryText = 'Expires today';
            expiryColor = 'text-warning';
          } else if (diffDays === 1) {
            expiryText = 'Expires tomorrow';
            expiryColor = 'text-warning';
          } else {
            expiryText = `Expires in ${diffDays} days`;
            expiryColor = 'text-success';
          }

          const grantRecords = records.filter(r => grant.recordIds.includes(r.id));

          return (
            <motion.div
              key={grant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-card shadow-custom p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-text-secondary">Access granted by patient.</p>
                  <div className="flex items-center gap-1">
                    {/* ADDITION 5: Expiry urgency colors */}
                    {diffDays <= 3 && diffDays > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block"></span>
                    )}
                    <p className={`text-sm font-medium ${
                      diffDays <= 3 && diffDays > 0 ? 'bg-amber-50 px-2 py-1 rounded' : ''
                    } ${expiryColor}`}>{expiryText}</p>
                  </div>
                </div>
              </div>

              {grantRecords.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 text-muted mx-auto mb-2 opacity-50" />
                  <p className="text-muted text-sm">No records shared for this access grant</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {grantRecords.map((record, j) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: j * 0.05 }}
                    >
                      <RecordCard record={record} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <ToastNotification toasts={toasts} onClose={removeToast} />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </DashboardLayout>
    </>
  );
};
