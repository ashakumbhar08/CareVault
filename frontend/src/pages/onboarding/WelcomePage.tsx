import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Clock, ArrowRight } from 'lucide-react';
import { track } from '../../utils/analytics';

export const WelcomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    track.onboardingStepCompleted(0);
    navigate('/onboarding/wallet');
  };

  const features = [
    {
      icon: Shield,
      title: 'Complete Ownership',
      description: 'Your medical records, your encryption keys',
    },
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'Data encrypted before leaving your device',
    },
    {
      icon: Clock,
      title: 'Time-Bound Access',
      description: 'Grant and revoke access to doctors anytime',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-12 h-12 text-accent" />
            <h1 className="text-4xl font-bold text-text-primary">CareVault</h1>
          </div>
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            Own Your Medical Records
          </h2>
          <p className="text-lg text-text-secondary max-w-xl mx-auto">
            Take control of your health data with blockchain-powered security and privacy
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.2 }}
              className="bg-card rounded-card shadow-custom p-6 text-center"
            >
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <button
            onClick={handleGetStarted}
            className="flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-input text-lg font-semibold hover:bg-accent/90 transition-colors"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

        <div className="flex justify-center gap-2 mt-12">
          {[0, 1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full ${step === 0 ? 'bg-accent' : 'bg-border'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
