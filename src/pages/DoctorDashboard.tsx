import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { RecordCard } from '../components/ui/RecordCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ToastNotification } from '../components/ui/ToastNotification';
import { mockRecords, mockGrants } from '../data/mockData';
import { useToast } from '../hooks/useToast';
import { Shield, Clock, AlertCircle } from 'lucide-react';

export const DoctorDashboard = () => {
  const { toasts, showToast, removeToast } = useToast();
  const [grants] = useState(mockGrants);

  const activeGrant = grants.find(g => g.isActive);
  const accessibleRecords = activeGrant
    ? mockRecords.filter(r => activeGrant.recordIds.includes(r.id))
    : [];

  const expiringSoonCount = grants.filter(g => {
    const daysUntilExpiry = Math.floor(
      (new Date(g.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return g.isActive && daysUntilExpiry <= 7;
  }).length;

  const handleViewRecord = () => {
    showToast('info', 'Decryption requires patient confirmation');
  };

  const stats = [
    { icon: Shield, label: 'Active Patient Consents', value: grants.filter(g => g.isActive).length.toString(), color: 'text-success' },
    { icon: Clock, label: 'Records Accessible', value: accessibleRecords.length.toString(), color: 'text-accent' },
    { icon: AlertCircle, label: 'Expiring This Week', value: expiringSoonCount.toString(), color: 'text-warning' },
  ];

  return (
    <DashboardLayout role="doctor" walletAddress="GB5K…R82L">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Records Shared With You</h1>
            <div className="mt-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-sm text-muted font-mono">Connected as: GB5K…R82L</span>
            </div>
          </div>
          <div className="px-4 py-2 bg-warning/10 border border-warning rounded-badge">
            <span className="text-sm font-medium text-warning">Read-only Access</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {expiringSoonCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-warning/10 border-l-4 border-warning rounded-input p-4"
          >
            <p className="text-sm text-text-primary">
              <strong>{expiringSoonCount}</strong> access grant{expiringSoonCount > 1 ? 's' : ''} expiring this week
            </p>
          </motion.div>
        )}

        {activeGrant && (
          <div className="bg-card rounded-card shadow-custom p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-text-primary mb-1">
                  Patient: Rahul Mehta
                </h2>
                <p className="text-sm text-muted font-mono">GDKW…P91M</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted mb-1">Access expires in</p>
                <p className="text-lg font-semibold text-success">
                  {Math.floor((new Date(activeGrant.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>

            {accessibleRecords.length === 0 ? (
              <EmptyState variant="patients" />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {accessibleRecords.map((record, i) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <div onClick={handleViewRecord} className="cursor-pointer">
                      <RecordCard record={record} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {grants.filter(g => !g.isActive).length > 0 && (
          <div className="bg-card rounded-card shadow-custom p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Expired Access</h2>
            <div className="bg-error/10 border-l-4 border-error rounded-input p-4">
              <p className="text-sm text-text-primary">
                Dr. Priya Nair's access to your records expired on {new Date(grants.find(g => !g.isActive)!.expiresAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      <ToastNotification toasts={toasts} onClose={removeToast} />
    </DashboardLayout>
  );
};
