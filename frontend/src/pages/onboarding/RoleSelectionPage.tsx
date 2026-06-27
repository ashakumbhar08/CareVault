import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Stethoscope, ArrowLeft } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { track } from '../../utils/analytics';

export const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const { connect } = useWallet();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = async (role: 'patient' | 'doctor') => {
    setConnecting(true);
    setError(null);

    try {
      await connect(role);
      track.walletConnected(role, 'testnet');
      track.onboardingStepCompleted(2);
      navigate('/onboarding/fund');
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      setConnecting(false);
    }
  };

  const roles = [
    {
      id: 'patient' as const,
      icon: User,
      title: "I'm a Patient",
      description: 'Upload, manage, and share your medical records securely',
    },
    {
      id: 'doctor' as const,
      icon: Stethoscope,
      title: "I'm a Doctor",
      description: 'Access patient records shared with you by consent',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <button
          onClick={() => navigate('/onboarding/wallet')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-text-primary mb-4">Choose Your Role</h2>
          <p className="text-lg text-text-secondary">
            Select how you'll be using CareVault
          </p>
        </motion.div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 bg-error/10 border-l-4 border-error rounded-input p-4">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {roles.map((role, i) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handleRoleSelect(role.id)}
              disabled={connecting}
              className="bg-card rounded-card shadow-custom p-8 text-center hover:shadow-lg hover:border-accent border-2 border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <role.icon className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">{role.title}</h3>
              <p className="text-sm text-text-secondary mb-6">{role.description}</p>
              {connecting ? (
                <div className="text-accent text-sm font-medium">Connecting...</div>
              ) : (
                <div className="text-accent text-sm font-medium">Select →</div>
              )}
            </motion.button>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-12">
          {[0, 1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-accent' : step < 2 ? 'bg-success' : 'bg-border'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
