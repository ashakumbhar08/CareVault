import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AuditEvent } from '../components/ui/AuditEvent';
import { EmptyState } from '../components/ui/EmptyState';
import { ToastNotification } from '../components/ui/ToastNotification';
import { mockAuditLog } from '../data/mockData';
import { useToast } from '../hooks/useToast';
import { AuditEventType } from '../types';
import { Download, UploadCloud, UserCheck, UserX } from 'lucide-react';

const eventTypes: (AuditEventType | 'all')[] = ['all', 'upload', 'grant', 'revoke', 'expiry'];

export const AuditPage = () => {
  const [selectedType, setSelectedType] = useState<AuditEventType | 'all'>('all');
  const { toasts, showToast, removeToast } = useToast();

  const filteredEvents = selectedType === 'all'
    ? mockAuditLog
    : mockAuditLog.filter(e => e.type === selectedType);

  const handleExport = () => {
    showToast('info', 'Audit log exported as CSV');
  };

  const stats = [
    { icon: UploadCloud, label: 'Total Events', value: mockAuditLog.length.toString(), color: 'text-accent' },
    { icon: UploadCloud, label: 'Uploads', value: mockAuditLog.filter(e => e.type === 'upload').length.toString(), color: 'text-accent' },
    { icon: UserCheck, label: 'Grants', value: mockAuditLog.filter(e => e.type === 'grant').length.toString(), color: 'text-success' },
    { icon: UserX, label: 'Revocations', value: mockAuditLog.filter(e => e.type === 'revoke').length.toString(), color: 'text-error' },
  ];

  return (
    <DashboardLayout role="patient" walletAddress="GDKW…P91M">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Audit Trail</h1>
            <p className="text-sm text-text-secondary mt-2">
              Every action on CareVault is recorded immutably on the Stellar blockchain
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-border text-text-primary rounded-input text-sm font-medium hover:bg-surface-hover transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="flex flex-wrap gap-2 mb-6">
            {eventTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-badge text-sm font-medium transition-colors capitalize ${
                  selectedType === type
                    ? 'bg-accent text-white'
                    : 'bg-surface-hover text-text-secondary hover:bg-border'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {filteredEvents.length === 0 ? (
            <EmptyState variant="records" />
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <AuditEvent event={event} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ToastNotification toasts={toasts} onClose={removeToast} />
    </DashboardLayout>
  );
};
