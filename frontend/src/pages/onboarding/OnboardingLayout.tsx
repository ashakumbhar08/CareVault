import { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OnboardingLayout = ({
  children,
  step,
  totalSteps = 5,
  onBack,
}: {
  children: ReactNode;
  step: number;
  totalSteps?: number;
  onBack?: () => void;
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-card shadow-lg border border-border max-w-lg w-full p-8">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-8 rounded-full transition-colors ${
                i < step ? 'bg-accent' : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Back button */}
        {step > 1 && (
          <button
            onClick={onBack || (() => navigate(-1))}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  );
};
