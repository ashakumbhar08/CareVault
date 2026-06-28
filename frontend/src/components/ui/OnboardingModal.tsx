import { ShieldCheck, X } from 'lucide-react';
import { getState } from '../../store/appState';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal = ({ isOpen, onClose }: OnboardingModalProps) => {
  if (!isOpen) return null;

  const wallet = getState();
  const role = wallet.walletRole;

  const handleGotIt = () => {
    // AREA B FIX 3: Set role-scoped flag
    localStorage.setItem('cv_onboarded_' + role, 'true');
    onClose();
  };

  const handleSkip = () => {
    // AREA B FIX 3: Set role-scoped flag
    localStorage.setItem('cv_onboarded_' + role, 'true');
    onClose();
  };

  // AREA B FIX 6: Role-specific content
  const content = role === 'doctor' ? {
    title: 'Welcome, Doctor',
    subtitle: 'View medical records shared with you by your patients on Stellar.',
    steps: [
      { num: 1, title: 'Your patients must grant you access', sub: 'to their records' },
      { num: 2, title: 'Access is time-limited', sub: 'and can be revoked at any time' },
      { num: 3, title: 'All record views are logged', sub: 'on the blockchain audit trail' },
      { num: 4, title: 'Records expire automatically', sub: 'check expiry dates' },
    ]
  } : {
    title: 'Welcome to CareVault',
    subtitle: undefined,
    steps: [
      { num: 1, title: 'Upload records', sub: 'Store prescriptions, lab results, scans, and more' },
      { num: 2, title: 'Grant access', sub: 'Share records with doctors securely' },
      { num: 3, title: 'Control access', sub: 'Revoke or modify permissions anytime' },
      { num: 4, title: 'Audit everything', sub: 'Track all activity on your records' },
    ]
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <ShieldCheck size={24} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{content.title}</h2>
              {content.subtitle && (
                <p className="text-xs text-text-secondary mt-1">{content.subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-text-secondary hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <ol className="space-y-3 text-sm text-text-secondary">
            {content.steps.map((step) => (
              <li key={step.num} className="flex gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-semibold flex-shrink-0">{step.num}</span>
                <span><strong className="text-text-primary">{step.title}</strong> - {step.sub}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="p-6 border-t border-border flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-text-secondary hover:text-accent transition-colors font-medium"
          >
            Skip for now
          </button>
          <button
            onClick={handleGotIt}
            className="px-4 py-2 bg-accent text-white rounded-input text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
