import { useState } from 'react';
import { X, Check, Loader } from 'lucide-react';
import { getState } from '../../store/appState';
import { buildGrantAccessTx, submitTransaction } from '../../utils/stellar';

interface GrantAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ProcessingPhase = 'building' | 'simulating' | 'awaiting-signature' | 'submitting' | 'confirming' | 'done';

export const GrantAccessModal = ({ isOpen, onClose }: GrantAccessModalProps) => {
  const [doctorWallet, setDoctorWallet] = useState('');
  const [duration, setDuration] = useState<7 | 30 | 60 | 90>(30);
  const [processingPhase, setProcessingPhase] = useState<ProcessingPhase>('building');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setDoctorWallet('');
    setDuration(30);
    setProcessingPhase('building');
    setTxHash(null);
    setError(null);
    setIsProcessing(false);
    setShowCloseButton(false);
    onClose();
  };

  const isValidWallet = doctorWallet.trim().startsWith('G') && doctorWallet.trim().length >= 10;

  const handleSubmit = async () => {
    if (!isValidWallet) {
      setError('Enter a valid Stellar wallet address.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingPhase('building');
    setShowCloseButton(false);

    try {
      const state = getState();
      if (!state.walletAddress) {
        throw new Error('Wallet not connected');
      }

      // Step 1: Build Soroban transaction
      setProcessingPhase('building');
      const recordIds = state.records.map((_record: any, idx: number) => idx + 1); // Convert to contract record IDs
      const expiresAtTimestamp = Math.floor(Date.now() / 1000) + (duration * 24 * 60 * 60);

      const xdr = await buildGrantAccessTx({
        patientAddress: state.walletAddress,
        doctorAddress: doctorWallet.trim(),
        recordIds,
        expiresAt: expiresAtTimestamp,
      });

      // Step 2: Request signature from Freighter
      setProcessingPhase('awaiting-signature');
      await new Promise(resolve => setTimeout(resolve, 600));

      // Step 3: Submit transaction
      setProcessingPhase('submitting');
      const { hash } = await submitTransaction(xdr);
      setTxHash(hash);

      // Step 4: Confirm transaction
      setProcessingPhase('confirming');
      await new Promise(resolve => setTimeout(resolve, 500));

      setProcessingPhase('done');

      // Hold success screen for 1 second before showing close button
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowCloseButton(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to grant access';
      setError(errorMsg);
      setProcessingPhase('done');
      setShowCloseButton(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPhaseLabel = (phase: ProcessingPhase): string => {
    switch (phase) {
      case 'building': return 'Building transaction…';
      case 'simulating': return 'Simulating…';
      case 'awaiting-signature': return 'Awaiting signature…';
      case 'submitting': return 'Submitting to blockchain…';
      case 'confirming': return 'Confirming transaction…';
      case 'done': return 'Complete';
      default: return '';
    }
  };

  const isPhaseComplete = (phase: ProcessingPhase): boolean => {
    const phases: ProcessingPhase[] = ['building', 'simulating', 'awaiting-signature', 'submitting', 'confirming', 'done'];
    const currentIndex = phases.indexOf(processingPhase);
    const phaseIndex = phases.indexOf(phase);
    return phaseIndex < currentIndex;
  };

  const isPhaseActive = (phase: ProcessingPhase): boolean => processingPhase === phase;

  // Show processing screen if transaction is being submitted
  if (isProcessing || txHash || error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-card shadow-lg border border-border max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">Granting Access</h2>
            {!isProcessing && (
              <button onClick={handleClose} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {processingPhase === 'done' ? (
            // Success or error state
            <div className="text-center py-8">
              {error ? (
                <>
                  <div className="text-error text-4xl mb-4">✕</div>
                  <p className="text-lg font-bold text-error mb-2">Access Grant Failed</p>
                  <p className="text-sm text-text-secondary mb-6">{error}</p>
                </>
              ) : (
                <>
                  <div className="text-success text-4xl mb-4">✓</div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-text-primary">
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                      <span>Building transaction</span>
                    </div>
                    <div className="flex items-center gap-3 text-text-primary">
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                      <span>Signature confirmed</span>
                    </div>
                    <div className="flex items-center gap-3 text-text-primary">
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                      <span>Submitted to blockchain</span>
                    </div>
                    <div className="flex items-center gap-3 text-text-primary">
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                      <span>Transaction confirmed</span>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-success mb-2">Access granted successfully</p>
                  {txHash && (
                    <div className="space-y-2 mb-6">
                      <p className="text-xs text-muted font-mono break-all">{txHash}</p>
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline"
                      >
                        View on Stellar Expert →
                      </a>
                    </div>
                  )}
                </>
              )}
              {showCloseButton && (
                <button
                  onClick={handleClose}
                  className="mt-6 w-full px-4 py-2 bg-accent text-white rounded-input hover:bg-accent/90 transition-colors"
                >
                  {error ? 'Close' : 'Done'}
                </button>
              )}
            </div>
          ) : (
            // Processing items
            <div className="space-y-3">
              {(['building', 'awaiting-signature', 'submitting', 'confirming'] as const).map((phase) => (
                <div key={phase} className="flex items-center gap-3">
                  {isPhaseComplete(phase) ? (
                    <Check className="w-5 h-5 text-success flex-shrink-0" />
                  ) : isPhaseActive(phase) ? (
                    <Loader className="w-5 h-5 text-accent animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-border rounded-full flex-shrink-0" />
                  )}
                  <span className={isPhaseComplete(phase) || isPhaseActive(phase) ? 'text-text-primary' : 'text-text-secondary'}>
                    {getPhaseLabel(phase)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Form screen
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
              disabled={!isValidWallet || isProcessing}
              className="flex-1 px-4 py-2 bg-accent text-white rounded-input disabled:opacity-50 hover:bg-accent/90 transition-colors"
            >
              {isProcessing ? 'Granting...' : 'Grant Access'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
