import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WalletConnectCard } from '../components/ui/WalletConnectCard';
import { AppLayout } from '../layouts/AppLayout';

export const ConnectWalletPage = () => {
  const navigate = useNavigate();

  const handleConnect = (role: 'patient' | 'doctor') => {
    navigate(role === 'patient' ? '/patient' : '/doctor');
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="max-w-6xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-text-primary mb-4">Connect to CareVault</h1>
            <p className="text-lg text-text-secondary mb-4">Choose your role to get started</p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="font-mono">Wallet Connected: GDKW…P91M</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-8"
          >
            <WalletConnectCard role="patient" onConnect={() => handleConnect('patient')} />
            <WalletConnectCard role="doctor" onConnect={() => handleConnect('doctor')} />
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};
