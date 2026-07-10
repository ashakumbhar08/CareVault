import { useState } from 'react';
import { X, Check, Loader } from 'lucide-react';
import { RecordCategory } from '../../types';
import { useRecords } from '../../hooks/useRecords';
import { useWallet } from '../../hooks/useWallet';
import { useToast } from '../../hooks/useToast';
import { getState } from '../../store/appState';

interface UploadRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'file' | 'category' | 'processing';
type ProcessingPhase = 'building' | 'encrypting' | 'awaiting-signature' | 'submitting' | 'confirming' | 'done';

export const UploadRecordModal = ({ isOpen, onClose }: UploadRecordModalProps) => {
  const [step, setStep] = useState<Step>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<RecordCategory | null>(null);
  const [processingPhase, setProcessingPhase] = useState<ProcessingPhase>('building');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const { upload } = useRecords();
  const { address: walletHookAddress } = useWallet();
  const { showToast } = useToast();
  
  // Get address from global state as fallback/primary source
  const globalState = getState();
  const address = globalState.walletAddress || walletHookAddress;

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('file');
    setSelectedFile(null);
    setSelectedCategory(null);
    setProcessingPhase('building');
    setTxHash(null);
    setExplorerUrl(null);
    setFileError(null);
    setProcessingError(null);
    setShowCloseButton(false);
    onClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError('File too large. Maximum size is 10MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleCategorySelect = (category: RecordCategory) => {
    setSelectedCategory(category);
  };

  const handleNext = async () => {
    if (step === 'file') {
      if (!selectedFile) return;
      setStep('category');
    } else if (step === 'category') {
      if (!selectedCategory || !selectedFile) return;
      setStep('processing');
      await runProcessing();
    }
  };

  const runProcessing = async () => {
    try {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!selectedFile || !selectedCategory) {
        throw new Error('Missing required data');
      }

      setProcessingPhase('building');
      await new Promise(resolve => setTimeout(resolve, 300));

      setProcessingPhase('encrypting');
      const result = await upload(selectedFile, selectedCategory);

      setTxHash(result.txHash);
      setExplorerUrl(result.explorerUrl);

      setProcessingPhase('confirming');
      await new Promise(resolve => setTimeout(resolve, 500));

      setProcessingPhase('done');

      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowCloseButton(true);

      showToast('success', 'Record uploaded to Stellar blockchain!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Processing failed';
      setProcessingError(errorMsg);
      setProcessingPhase('done');
      setShowCloseButton(true);
      showToast('error', errorMsg);
    }
  };

  const categories: RecordCategory[] = [
    'Prescription',
    'Lab Report',
    'Scan',
    'Vaccination',
  ];

  const getPhaseLabel = (phase: ProcessingPhase): string => {
    switch (phase) {
      case 'building': return 'Building transaction…';
      case 'encrypting': return 'Encrypting and uploading file…';
      case 'awaiting-signature': return 'Awaiting signature…';
      case 'submitting': return 'Submitting to blockchain…';
      case 'confirming': return 'Confirming transaction…';
      case 'done': return 'Complete';
      default: return '';
    }
  };

  const isPhaseComplete = (phase: ProcessingPhase): boolean => {
    const phases: ProcessingPhase[] = ['building', 'encrypting', 'awaiting-signature', 'submitting', 'confirming', 'done'];
    const currentIndex = phases.indexOf(processingPhase);
    const phaseIndex = phases.indexOf(phase);
    return phaseIndex < currentIndex;
  };

  const isPhaseActive = (phase: ProcessingPhase): boolean => processingPhase === phase;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-card shadow-lg border border-border max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Upload Record</h2>
          <button onClick={handleClose} className="text-text-secondary hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Step */}
        {step === 'file' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">Choose File</label>
              <label className="block">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-border rounded-input p-8 text-center hover:border-accent hover:bg-accent/5 cursor-pointer transition-colors">
                  {selectedFile ? (
                    <>
                      <p className="text-sm font-medium text-text-primary">{selectedFile.name}</p>
                      <div className="text-xs text-muted mt-2 space-y-1">
                        <p>File size: {selectedFile.size < 1024 * 1024 ? (selectedFile.size / 1024).toFixed(1) + ' KB' : (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB'}</p>
                        <p>File type: {selectedFile.type || selectedFile.name.split('.').pop()?.toUpperCase() || 'Unknown'}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-text-primary">Drop your file here</p>
                      <p className="text-xs text-accent mt-1">or click to browse</p>
                    </>
                  )}
                </div>
              </label>

              <p className="text-xs text-muted mt-3">Supported formats: PDF, JPG, JPEG, PNG · Maximum size: 10MB</p>

              {fileError && (
                <p className="text-xs text-error mt-2">{fileError}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-border text-text-primary rounded-input hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedFile || fileError !== null}
                className="flex-1 px-4 py-2 bg-accent text-white rounded-input disabled:opacity-50 hover:bg-accent/90 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Category Step */}
        {step === 'category' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">Select Category</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`p-3 text-sm font-medium rounded-input border-2 transition-all ${
                      selectedCategory === cat
                        ? 'border-accent bg-accent/5 text-accent'
                        : 'border-border text-text-primary hover:border-accent/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep('file')}
                className="flex-1 px-4 py-2 border border-border text-text-primary rounded-input hover:bg-surface-hover transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedCategory}
                className="flex-1 px-4 py-2 bg-accent text-white rounded-input disabled:opacity-50 hover:bg-accent/90 transition-colors"
              >
                Upload
              </button>
            </div>
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="space-y-4">
            {processingPhase === 'done' ? (
              <div className="text-center py-8">
                {processingError ? (
                  <>
                    <div className="text-error text-4xl mb-4">✕</div>
                    <p className="text-lg font-bold text-error mb-2">Upload Failed</p>
                    <p className="text-sm text-text-secondary mb-6">{processingError}</p>
                  </>
                ) : (
                  <>
                    <div className="text-success text-4xl mb-4">✓</div>
                    <p className="text-lg font-bold text-success mb-4">Record uploaded successfully</p>
                    {txHash && explorerUrl && (
                      <div className="space-y-2 mb-6">
                        <p className="text-xs text-muted font-mono break-all">{txHash}</p>
                        <a
                          href={explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-xs text-accent hover:underline"
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
                    Close
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {(['building', 'encrypting', 'awaiting-signature', 'submitting', 'confirming'] as const).map((phase) => (
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
        )}
      </div>
    </div>
  );
};
