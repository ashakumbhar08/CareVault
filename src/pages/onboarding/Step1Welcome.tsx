import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Check } from 'lucide-react';
import { OnboardingLayout } from './OnboardingLayout';

export const Step1Welcome = () => {
  const navigate = useNavigate();

  return (
    <OnboardingLayout step={1}>
      <ShieldCheck className="w-16 h-16 text-accent mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-text-primary mb-6 text-center">Own Your Medical Records</h1>
      
      <div className="space-y-4 mb-8">
        {[
          'End-to-end encrypted storage',
          'Consent-based doctor access',
          'Immutable audit trail on Stellar',
        ].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <Check className="w-5 h-5 text-success flex-shrink-0" />
            <span className="text-text-secondary">{item}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/onboarding/wallet')}
        className="w-full px-6 py-3 bg-accent text-white rounded-input hover:bg-accent/90 transition-colors font-medium"
      >
        Get Started
      </button>
    </OnboardingLayout>
  );
};
