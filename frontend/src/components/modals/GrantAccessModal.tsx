import { useState } from 'react';
import { X } from 'lucide-react';
import { addGrant, addAuditEntry, getState } from '../../store/appState';
import { useToast } from '../../hooks/useToast';

interface GrantAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GrantAccessModal = ({ isOpen, onClose }: GrantAccessModalProps) => {
  const [doctorWallet, setDoctorWallet] = useState('');
  const [duration, setDuration] = useState<7 | 30 | 60 | 90>(30);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleClose = () => {
    setDoctorWallet('');
    setDuration(30);
    setSubmitting(false);
    setError(null);
    onClose();
  };

  const isValidWallet = doctorWallet.trim().startsWith('G') && doctorWallet.trim().length >= 10;

  const handleSubmit = async () => {
    if (!isValidWallet) {
      setError('Enter a valid Stellar wallet address.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString();
      const grant = {
        id: crypto.randomUUID(),
        doctorWallet: doctorWallet.trim(),
        grantedAt: new Date().toISOString(),
        expiresAt,
        recordIds: getState().records.map(r => r.id),
        isActive: true,
      };

      addGrant(grant);
      addAuditEntry({
        id: crypto.randomUUID(),
        action: 'grant' as const,
        timestamp: new Date().toISOString(),
        txHash: null,
        details: 'Access granted to ' + doctorWallet.slice(0, 4) + '…' + doctorWallet.slice(-4),
      });

      showToast('success', 'Access granted successfully.');
      handleClose();
    } catch (err) {
      setError('Failed to grant access. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-card shadow-lg border border-border max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Grant Record Access</h2>
          <button onClick={handleClose} className="text-text-secondary hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Doctor Wallet Input */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Doctor's Stellar Wallet Address</label>
            <input
              type="text"
              value={doctorWallet}
              onChange={(e) => setDoctorWallet(e.target.value)}
              placeholder="GABC…XYZ"
              className="w-full px-4 py-2 border border-border rounded-input font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Access Duration</label>
            <div className="grid grid-cols-4 gap-2">
              {([7, 30, 60, 90] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`py-2 px-3 rounded-input text-sm font-medium transition-all ${
                    duration === d
                      ? 'bg-accent text-white'
                      : 'border border-border text-text-secondary hover:border-accent'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-sm text-error">{error}</p>}

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-border text-text-primary rounded-input hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValidWallet || submitting}
              className="flex-1 px-4 py-2 bg-accent text-white rounded-input disabled:opacity-50 hover:bg-accent/90 transition-colors"
            >
              {submitting ? 'Granting...' : 'Grant Access'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
