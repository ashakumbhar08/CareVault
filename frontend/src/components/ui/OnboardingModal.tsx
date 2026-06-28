import { ShieldCheck, X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal = ({ isOpen, onClose }: OnboardingModalProps) => {
  if (!isOpen) return null;

  const handleGotIt = () => {
    localStorage.setItem('cv_onboarded', 'true');
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('cv_onboarded', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <ShieldCheck size={24} className="text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">Welcome to CareVault</h2>
          </div>
          <button
            onClick={handleSkip}
            className="text-text-secondary hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-text-primary mb-2">Here's what you can do:</h3>
            <ol className="space-y-3 text-sm text-text-secondary">
              <li className="flex gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-semibold flex-shrink-0">1</span>
                <span><strong className="text-text-primary">Upload records</strong> - Store prescriptions, lab results, scans, and more</span>
              </li>
              <li className="flex gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-semibold flex-shrink-0">2</span>
                <span><strong className="text-text-primary">Grant access</strong> - Share records with doctors securely</span>
              </li>
              <li className="flex gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-semibold flex-shrink-0">3</span>
                <span><strong className="text-text-primary">Control access</strong> - Revoke or modify permissions anytime</span>
              </li>
              <li className="flex gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-semibold flex-shrink-0">4</span>
                <span><strong className="text-text-primary">Audit everything</strong> - Track all activity on your records</span>
              </li>
            </ol>
          </div>
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
