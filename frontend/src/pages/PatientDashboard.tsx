import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { RecordCard } from '../components/ui/RecordCard';
import { UploadButton } from '../components/ui/UploadButton';
import { GrantAccessButton } from '../components/ui/GrantAccessButton';
import { EmptyState } from '../components/ui/EmptyState';
import { ToastNotification } from '../components/ui/ToastNotification';
import { OnboardingModal } from '../components/ui/OnboardingModal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { UploadRecordModal } from '../components/modals/UploadRecordModal';
import { GrantAccessModal } from '../components/modals/GrantAccessModal';
import { useToast } from '../hooks/useToast';
import { useWallet } from '../hooks/useWallet';
import { RecordCategory } from '../types';
import { Database, Shield } from 'lucide-react';
import { getState, removeGrant, setWallet, subscribeToWalletChanges } from '../store/appState';

const categories: (RecordCategory | 'All')[] = [
  'All',
  'Prescription',
  'Lab Report',
  'Scan',
  'Vaccination',
  'Discharge Summary',
  'Other',
];

export const PatientDashboard = () => {
  const navigate = useNavigate();
  const { disconnect } = useWallet();
  const [selectedCategory, setSelectedCategory] = useState<RecordCategory | 'All'>('All');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [revokeConfirmation, setRevokeConfirmation] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  // FIX 3: Wallet guard with re-hydration + FIX 2: Reactive wallet subscription
  useEffect(() => {
    const walletStr = sessionStorage.getItem('cv_wallet');
    if (!walletStr) {
      navigate('/connect');
      return;
    }
    try {
      const { address, role } = JSON.parse(walletStr);
      if (role !== 'patient') {
        navigate('/connect');
        return;
      }
      // Re-hydrate global store from sessionStorage
      setWallet(address, role);
      setWalletAddress(address);
    } catch {
      navigate('/connect');
    }
  }, [navigate]);

  // FIX 2: Subscribe to wallet changes and redirect if cleared
  useEffect(() => {
    const unsubscribe = subscribeToWalletChanges((address) => {
      if (address === null) {
        navigate('/connect');
      }
    });
    return unsubscribe;
  }, [navigate]);

  // AREA B FIX 2: Trigger onboarding based on wallet + role-scoped flag + mount
  useEffect(() => {
    const wallet = getState();
    if (wallet.walletAddress && !localStorage.getItem('cv_onboarded_' + wallet.walletRole)) {
      setIsOnboardingOpen(true);
    }
  }, []);

  const state = getState();
  const records = state.records;
  const grants = state.grants.filter(g => g.isActive);

  const filteredRecords = selectedCategory === 'All'
    ? records
    : records.filter(r => r.category === selectedCategory);

  const handleRevoke = (grantId: string) => {
    setRevokeConfirmation(grantId);
  };

  const handleConfirmRevoke = async () => {
    if (!revokeConfirmation) return;
    
    setIsRevoking(true);
    try {
      removeGrant(revokeConfirmation);
      showToast('success', 'Access revoked successfully.');
      setRevokeConfirmation(null);
    } catch (error) {
      showToast('error', 'Failed to revoke access. Please try again.');
    } finally {
      setIsRevoking(false);
    }
  };

  if (!walletAddress) return null;

  return (
    <DashboardLayout role="patient" walletAddress={walletAddress} onDisconnect={disconnect}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text-primary">My Medical Records</h1>
          <UploadButton onClick={() => setUploadModalOpen(true)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-card shadow-custom p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-input bg-surface-hover text-accent">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Records</p>
                <p className="text-2xl font-bold text-text-primary">{records.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-card shadow-custom p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-input bg-surface-hover text-success">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Active Grants</p>
                <p className="text-2xl font-bold text-text-primary">{grants.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="bg-card rounded-card shadow-custom p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">Records</h2>
            <GrantAccessButton onClick={() => setGrantModalOpen(true)} />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-badge text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-accent text-white'
                    : 'bg-surface-hover text-text-secondary hover:bg-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredRecords.length === 0 ? (
            <EmptyState
              variant="records"
              role="patient"
              onAction={() => setUploadModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredRecords.map((record, i) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <RecordCard record={record} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-card shadow-custom p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Active Access Grants</h2>
          {grants.length === 0 ? (
            <EmptyState variant="grants" onAction={() => setGrantModalOpen(true)} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-text-primary">Doctor Wallet</th>
                    <th className="text-left py-3 px-4 font-semibold text-text-primary">Granted</th>
                    <th className="text-left py-3 px-4 font-semibold text-text-primary">Expires</th>
                    <th className="text-left py-3 px-4 font-semibold text-text-primary">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-text-primary">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {grants.map((grant) => {
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

                    return (
                      <tr key={grant.id} className="border-b border-border hover:bg-surface-hover">
                        <td className="py-3 px-4 font-mono">{grant.doctorWallet.slice(0, 4)}…{grant.doctorWallet.slice(-4)}</td>
                        <td className="py-3 px-4">{new Date(grant.grantedAt).toLocaleDateString()}</td>
                        <td className={`py-3 px-4 ${expiryColor}`}>{expiryText}</td>
                        <td className="py-3 px-4"><span className="px-2 py-1 bg-success/10 text-success text-xs rounded">Active</span></td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleRevoke(grant.id)}
                            className="text-error hover:bg-error/10 px-2 py-1 rounded text-xs transition-colors"
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <UploadRecordModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />

      <GrantAccessModal
        isOpen={grantModalOpen}
        onClose={() => setGrantModalOpen(false)}
      />

      <ToastNotification toasts={toasts} onClose={removeToast} />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      <ConfirmationModal
        isOpen={!!revokeConfirmation}
        title="Revoke Access?"
        message="Are you sure you want to revoke access? The doctor will no longer be able to view your medical records."
        confirmLabel="Revoke"
        cancelLabel="Cancel"
        isDangerous={true}
        isLoading={isRevoking}
        onConfirm={handleConfirmRevoke}
        onCancel={() => setRevokeConfirmation(null)}
      />
    </DashboardLayout>
  );
};
