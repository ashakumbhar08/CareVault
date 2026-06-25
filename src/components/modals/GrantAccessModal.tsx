import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { MedicalRecord, AccessGrant } from '../../types';

interface GrantAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  records: MedicalRecord[];
  grants: AccessGrant[];
  onRevoke?: (grantId: string) => void;
}

const durations = [
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
  { label: 'Custom', value: 0 },
];

export const GrantAccessModal = ({ isOpen, onClose, onSuccess, records, grants, onRevoke }: GrantAccessModalProps) => {
  const [tab, setTab] = useState<'new' | 'active'>('new');
  const [step, setStep] = useState(1);
  const [doctorAddress, setDoctorAddress] = useState('');
  const [duration, setDuration] = useState(30);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [grantSuccess, setGrantSuccess] = useState(false);

  const handleGrant = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setGrantSuccess(true);
      setTimeout(() => {
        onSuccess(`Access granted to ${doctorAddress}`);
        handleClose();
      }, 2000);
    }, 2000);
  };

  const handleClose = () => {
    setTab('new');
    setStep(1);
    setDoctorAddress('');
    setDuration(30);
    setSelectedRecords([]);
    setSubmitting(false);
    setGrantSuccess(false);
    onClose();
  };

  const toggleRecord = (id: string) => {
    setSelectedRecords(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={handleClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="relative bg-card rounded-card shadow-custom max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          {grantSuccess ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-xl font-bold text-text-primary mb-2">Access Granted</h3>
              <p className="text-sm text-muted font-mono">{doctorAddress}</p>
            </div>
          ) : submitting ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-text-secondary">Submitting to Stellar...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-bold text-text-primary">Grant Access</h2>
                <button onClick={handleClose} className="text-muted hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex border-b border-border">
                <button
                  onClick={() => setTab('new')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    tab === 'new'
                      ? 'text-accent border-b-2 border-accent'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  New Grant
                </button>
                <button
                  onClick={() => setTab('active')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    tab === 'active'
                      ? 'text-accent border-b-2 border-accent'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Active Grants ({grants.filter(g => g.isActive).length})
                </button>
              </div>

              <div className="p-6">
                {tab === 'new' && (
                  <>
                    {step === 1 && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">
                            Doctor's Stellar wallet address
                          </label>
                          <input
                            type="text"
                            value={doctorAddress}
                            onChange={(e) => setDoctorAddress(e.target.value)}
                            placeholder="Enter wallet address"
                            className="w-full px-4 py-2 border border-border rounded-input focus:border-accent focus:outline-none font-mono text-sm"
                          />
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              onClick={() => setDoctorAddress('GB5K…R82L')}
                              className="px-3 py-1 text-xs bg-surface-hover hover:bg-accent/10 rounded-badge text-text-secondary"
                            >
                              Dr. Arjun Patel (GB5K…R82L)
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-3">
                            Access duration
                          </label>
                          <div className="flex gap-2">
                            {durations.map((d) => (
                              <button
                                key={d.value}
                                onClick={() => setDuration(d.value)}
                                className={`flex-1 px-3 py-2 text-sm rounded-input border-2 transition-all ${
                                  duration === d.value
                                    ? 'border-accent bg-accent/5 text-accent font-medium'
                                    : 'border-border hover:border-accent/50'
                                }`}
                              >
                                {d.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-3">
                            Select Records
                          </label>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {records.map((record) => (
                              <label
                                key={record.id}
                                className="flex items-center gap-3 p-3 border border-border rounded-input hover:bg-surface-hover cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedRecords.includes(record.id)}
                                  onChange={() => toggleRecord(record.id)}
                                  className="w-4 h-4"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-text-primary truncate">
                                    {record.fileName}
                                  </p>
                                  <p className="text-xs text-muted">{record.category}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        <button
                          disabled={!doctorAddress || selectedRecords.length === 0}
                          onClick={() => setStep(2)}
                          className="w-full px-4 py-2 bg-accent text-white rounded-input font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
                        >
                          Review Grant →
                        </button>
                      </div>
                    )}

                    {step === 2 && (
                      <div>
                        <div className="p-4 bg-surface-hover rounded-input mb-4 space-y-2">
                          <div>
                            <p className="text-xs text-muted">Doctor</p>
                            <p className="text-sm font-mono text-text-primary">{doctorAddress}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted">Records</p>
                            <p className="text-sm text-text-primary">{selectedRecords.length} selected</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted">Duration</p>
                            <p className="text-sm text-text-primary">{duration} days</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted">Expires</p>
                            <p className="text-sm text-text-primary">
                              {new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-warning/10 border-l-4 border-warning rounded-input mb-6">
                          <p className="text-sm text-text-primary">
                            This doctor will be able to view selected records until the access expires
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setStep(1)}
                            className="flex-1 px-4 py-2 border border-border text-text-primary rounded-input font-medium hover:bg-surface-hover transition-colors"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleGrant}
                            className="flex-1 px-4 py-2 bg-accent text-white rounded-input font-medium hover:bg-accent/90 transition-colors"
                          >
                            Confirm Grant
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {tab === 'active' && (
                  <div className="space-y-3">
                    {grants.filter(g => g.isActive).map((grant) => (
                      <div key={grant.id} className="p-4 border border-border rounded-input">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-text-primary">{grant.doctorName}</p>
                            <p className="text-xs text-muted font-mono">{grant.doctorWallet}</p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-badge">
                            Active
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted">
                            {grant.recordIds.length} records • Expires {new Date(grant.expiresAt).toLocaleDateString()}
                          </p>
                          {onRevoke && (
                            <button
                              onClick={() => onRevoke(grant.id)}
                              className="text-xs text-error hover:underline"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {grants.filter(g => g.isActive).length === 0 && (
                      <p className="text-sm text-muted text-center py-8">No active grants</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
