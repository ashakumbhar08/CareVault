import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { isConnected, requestAccess, getAddress } from '@stellar/freighter-api';
import { Wallet, User, Stethoscope } from 'lucide-react';
import { setWallet } from '../store/appState';

export const ConnectWalletPage = () => {
  const navigate = useNavigate();
  const [freighterInstalled, setFreighterInstalled] = useState<boolean | null>(null);
  const [loadingRole, setLoadingRole] = useState<'patient' | 'doctor' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkFreighter();
  }, []);

  const checkFreighter = async () => {
    try {
      const result = await isConnected();
      setFreighterInstalled(result.isConnected);
    } catch (err) {
      setFreighterInstalled(false);
    }
  };

  const handleConnect = async (role: 'patient' | 'doctor') => {
    setLoadingRole(role);
    setError(null);

    try {
      // Request access
      const accessResult = await requestAccess();
      if (accessResult.error) {
        throw new Error('Connection rejected. Please approve in Freighter.');
      }

      // Get public key
      const keyResult = await getAddress();
      if (keyResult.error) {
        throw new Error('Could not read wallet address. Please try again.');
      }

      const publicKey = keyResult.address;

      // Store in sessionStorage
      sessionStorage.setItem('cv_wallet', JSON.stringify({ address: publicKey, role }));

      // Update app state
      setWallet(publicKey, role);

      // Navigate
      navigate(role === 'patient' ? '/patient' : '/doctor');
    } catch (err: any) {
      setError(err.message || 'Connection failed. Please try again.');
      setLoadingRole(null);
    }
  };

  if (freighterInstalled === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="animate-spin">Loading...</div>
      </div>
    );
  }

  if (!freighterInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-card shadow-lg border border-border p-8 text-center"
          >
            <Wallet className="w-12 h-12 text-accent mx-auto mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-2">Freighter Not Installed</h2>
            <p className="text-text-secondary mb-6">Install the Freighter browser extension to continue.</p>
            <a
              href="https://www.freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 bg-accent text-white rounded-input hover:bg-accent/90 transition-colors"
            >
              Install Freighter
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-text-primary mb-4">Connect to CareVault</h1>
          <p className="text-lg text-text-secondary">Choose your role to get started</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-error/10 border border-error text-error rounded-input"
          >
            {error}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Patient Card */}
          <button
            onClick={() => handleConnect('patient')}
            disabled={loadingRole !== null}
            className="bg-card rounded-card shadow-lg border-2 border-transparent hover:border-accent p-8 text-center transition-all disabled:opacity-50"
          >
            <User className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-bold text-text-primary mb-2">I'm a Patient</h3>
            <p className="text-text-secondary mb-6">Upload and manage your medical records securely</p>
            {loadingRole === 'patient' ? (
              <div className="text-accent">Connecting...</div>
            ) : (
              <div className="text-accent font-medium">Connect as Patient →</div>
            )}
          </button>

          {/* Doctor Card */}
          <button
            onClick={() => handleConnect('doctor')}
            disabled={loadingRole !== null}
            className="bg-card rounded-card shadow-lg border-2 border-transparent hover:border-accent p-8 text-center transition-all disabled:opacity-50"
          >
            <Stethoscope className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-bold text-text-primary mb-2">I'm a Doctor</h3>
            <p className="text-text-secondary mb-6">Access patient records shared with you</p>
            {loadingRole === 'doctor' ? (
              <div className="text-accent">Connecting...</div>
            ) : (
              <div className="text-accent font-medium">Connect as Doctor →</div>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
};
