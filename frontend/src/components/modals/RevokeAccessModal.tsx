import { useState } from 'react';
import { X, Check, Loader } from 'lucide-react';
import { removeGrant, addAuditEntry, getState } from '../../store/appState';
import { buildRevokeAccessTx, submitTransaction } from '../../utils/stellar';
import { useToast } from '../../hooks/useToast';

interface RevokeAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  grantId: string;
  doctorAddress: string;
}

type ProcessingPhase = 'building' | 'awaiting-signature' | 'submitting' | 'confirming' | 'done';

export const RevokeAccessModal = ({ isOpen, onClose, grantId, doctorAddress }: RevokeAccessModalProps) => {
  const [processingPhase, setProcessingPhase] = useState<ProcessingPhase>('building');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleClose = () => {
    setProcessingPhase('building');
    setTxHash(null);
    setError(null);
    setIsProcessing(false);
    setShowCloseButton(false);
    onClose();
  };

  const handleRevoke = async () => {
    setIsProcessing(true);
    setError(null);
    setProcessingPhase('building');
    setShowCloseButton(false);

    try {
      const state = getState();
      if (!state.walletAddress) {
        throw new Error('Wallet not connected');
      }

      // Extract grant ID from UUID (use index)
      const grantIdNum = parseInt(grantId.split('-')[0], 16) % 1000000;

      // Step 1: Build Soroban transaction
      setProcessingPhase('building');
      const xdr = await buildRevokeAccessTx({
        patientAddress: state.walletAddress,
        grantId: grantIdNum,
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
      const errorMsg = err instanceof Error ? err.message : 'Failed to revoke access';
      setError(errorMsg);
      setProcessingPhase('done');
      setShowCloseButton(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccessClose = () => {
    removeGrant(grantId);
    addAuditEntry({
      id: crypto.randomUUID(),
      action: 'revoke' as const,
      timestamp: new Date().toISOString(),
      txHash: txHash,
      details: `Access revoked for ${doctorAddress.slice(0, 4)}…${doctorAddress.slice(-4)}`,
    });

    showToast('success', 'Access revoked successfully.');
    handleClose();
  };

  const getPhaseLabel = (phase: ProcessingPhase): string => {
    switch (phase) {
      case 'building': return 'Building transaction…';
      case 'awaiting-signature': return 'Awaiting signature…';
      case 'submitting': return 'Submitting to blockchain…';
      case 'confirming': return 'Confirming transaction…';
      case 'done': return 'Complete';
      default: return '';
    }
  };

  const isPhaseComplete = (phase: ProcessingPhase): boolean => {
    const phases: ProcessingPhase[] = ['building', 'awaiting-signature', 'submitting', 'confirming', 'done'];
    const currentIndex = phases.indexOf(processingPhase);
    const phaseIndex = phases.indexOf(phase);
    return phaseIndex < currentIndex;
  };

  const isPhaseActive = (phase: ProcessingPhase): boolean => processingPhase === phase;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-card shadow-lg border border-border max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">
            {processingPhase === 'done' ? (error ? 'Revoke Failed' : 'Access Revoked') : 'Revoke Access'}
          </h2>
          {!isProcessing && (
            <button onClick={handleClose} className="text-text-secondary hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {!isProcessing && processingPhase === 'building' ? (
          // Confirmation screen
          <div className="space-y-4">
            <p className="text-text-secondary text-sm">
              Are you sure you want to revoke access for {doctorAddress.slice(0, 6)}…{doctorAddress.slice(-4)}?
            </p>
            <p className="text-xs text-muted">
              This action will create a blockchain transaction. They will no longer be able to access your records.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-border text-text-primary rounded-input hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                className="flex-1 px-4 py-2 bg-error text-white rounded-input hover:bg-error/90 transition-colors"
              >
                Revoke
              </button>
            </div>
          </div>
        ) : processingPhase === 'done' ? (
          // Success or error state
          <div className="text-center py-8">
            {error ? (
              <>
                <div className="text-error text-4xl mb-4">✕</div>
                <p className="text-lg font-bold text-error mb-2">Revoke Failed</p>
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
                <p className="text-lg font-bold text-success mb-2">Access revoked successfully</p>
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
                onClick={error ? handleClose : handleSuccessClose}
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
};
