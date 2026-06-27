import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coins, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { track } from '../../utils/analytics';

export const FundWalletPage = () => {
  const navigate = useNavigate();
  const { address, balance, refreshBalance } = useWallet();
  const [funding, setFunding] = useState(false);
  const [funded, setFunded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (parseFloat(balance) > 0) {
      setFunded(true);
      track.onboardingStepCompleted(3);
      setTimeout(() => {
        navigate('/onboarding/record');
      }, 2000);
    }
  }, [balance, navigate]);

  const handleFund = async () => {
    if (!address) return;

    setFunding(true);
    setError(null);

    try {
      // Friendbot URL for Testnet
      const friendbotUrl = `https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`;
      await fetch(friendbotUrl);
      
      // Poll for balance update
      const checkBalance = setInterval(async () => {
        await refreshBalance();
      }, 3000);

      setTimeout(() => clearInterval(checkBalance), 30000);
    } catch (err: any) {
      setError(err.message || 'Failed to fund wallet');
      setFunding(false);
    }
  };

  const handleSkip = () => {
    track.onboardingStepCompleted(3);
    navigate('/onboarding/record');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <button
          onClick={() => navigate('/onboarding/role')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-card shadow-custom p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Fund Your Testnet Wallet
            </h2>
            <p className="text-sm text-text-secondary">
              Get free testnet XLM to start using CareVault
            </p>
          </div>

          {funded ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
              <p className="text-lg font-semibold text-success mb-2">Wallet Funded!</p>
              <p className="text-sm text-text-secondary mb-4">
                Balance: {parseFloat(balance).toFixed(2)} XLM
              </p>
              <p className="text-xs text-muted">Continuing to next step...</p>
            </div>
          ) : (
            <>
              <div className="bg-surface-hover rounded-input p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">Current Balance</span>
                  <span className="text-lg font-semibold text-text-primary">
                    {parseFloat(balance).toFixed(2)} XLM
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Wallet Address</span>
                  <span className="text-xs font-mono text-muted">
                    {address?.substring(0, 8)}...{address?.substring(address.length - 4)}
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-error/10 border-l-4 border-error rounded-input p-4 mb-6">
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              <div className="bg-accent/10 border-l-4 border-accent rounded-input p-4 mb-6">
                <p className="text-sm text-text-primary">
                  Friendbot will add 10,000 testnet XLM to your wallet. This is only for testing and has no real value.
                </p>
              </div>

              <button
                onClick={handleFund}
                disabled={funding}
                className="w-full px-4 py-3 bg-accent text-white rounded-input font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-3"
              >
                {funding ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Funding Wallet...</span>
                  </div>
                ) : (
                  'Fund with Friendbot'
                )}
              </button>

              <button
                onClick={handleSkip}
                className="w-full text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Skip for now
              </button>
            </>
          )}
        </motion.div>

        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full ${step === 3 ? 'bg-accent' : step < 3 ? 'bg-success' : 'bg-border'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
