import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { RecordCard } from '../components/ui/RecordCard';
import { UploadButton } from '../components/ui/UploadButton';
import { GrantAccessButton } from '../components/ui/GrantAccessButton';
import { EmptyState } from '../components/ui/EmptyState';
import { ToastNotification } from '../components/ui/ToastNotification';
import { UploadRecordModal } from '../components/modals/UploadRecordModal';
import { GrantAccessModal } from '../components/modals/GrantAccessModal';
import { mockRecords, mockGrants } from '../data/mockData';
import { useToast } from '../hooks/useToast';
import { RecordCategory } from '../types';
import { Database, Shield, Clock, HardDrive } from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = useState<RecordCategory | 'All'>('All');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [records] = useState(mockRecords);
  const [grants, setGrants] = useState(mockGrants);
  const { toasts, showToast, removeToast } = useToast();

  const filteredRecords = selectedCategory === 'All'
    ? records
    : records.filter(r => r.category === selectedCategory);

  const handleRevoke = (grantId: string) => {
    setGrants(prev => prev.map(g => g.id === grantId ? { ...g, isActive: false } : g));
    showToast('success', 'Access revoked successfully');
  };

  const handleDownload = () => {
    showToast('info', 'Download initiated (IPFS node not connected)');
  };

  const stats = [
    { icon: Database, label: 'Total Records', value: records.length.toString(), color: 'text-accent' },
    { icon: Shield, label: 'Active Grants', value: grants.filter(g => g.isActive).length.toString(), color: 'text-success' },
    { icon: Clock, label: 'Pending Verification', value: records.filter(r => r.verificationStatus === 'pending').length.toString(), color: 'text-warning' },
    { icon: HardDrive, label: 'Storage Used', value: '13.2 MB', color: 'text-text-primary' },
  ];

  return (
    <DashboardLayout role="patient" walletAddress="GDKW…P91M">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text-primary">My Medical Records</h1>
          <UploadButton onClick={() => setUploadModalOpen(true)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-card rounded-card shadow-custom p-6"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-input bg-surface-hover ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
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
                  <RecordCard
                    record={record}
                    onShare={() => setGrantModalOpen(true)}
                    onDownload={handleDownload}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-card shadow-custom p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Active Access Grants</h2>
          {grants.filter(g => g.isActive).length === 0 ? (
            <EmptyState variant="grants" onAction={() => setGrantModalOpen(true)} />
          ) : (
            <div className="space-y-3">
              {grants.filter(g => g.isActive).map((grant) => (
                <div key={grant.id} className="flex items-center justify-between p-4 bg-surface-hover rounded-input">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{grant.doctorName}</p>
                      <p className="text-xs text-muted font-mono">{grant.doctorWallet}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted">{grant.recordIds.length} records</p>
                      <p className="text-xs text-success">Expires {new Date(grant.expiresAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => handleRevoke(grant.id)}
                      className="px-3 py-1 text-xs text-error hover:bg-error/10 rounded-badge transition-colors"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <UploadRecordModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={(msg) => showToast('success', msg)}
      />

      <GrantAccessModal
        isOpen={grantModalOpen}
        onClose={() => setGrantModalOpen(false)}
        onSuccess={(msg) => showToast('success', msg)}
        records={records}
        grants={grants}
        onRevoke={handleRevoke}
      />

      <ToastNotification toasts={toasts} onClose={removeToast} />
    </DashboardLayout>
  );
};
