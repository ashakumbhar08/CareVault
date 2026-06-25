import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Download, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { track } from '../../utils/analytics';

export const InstallWalletPage = () => {
  const navigate = useNavigate();
  const { checkInstalled } = useWallet();
  const [isInstalled, setIsInstalled] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkWallet();
  }, []);

  const checkWallet = async () => {
    setChecking(true);
    const installed = await checkInstalled();
    setIsInstalled(installed);
    setChecking(false);

    if (installed) {
      track.onboardingStepCompleted(1);
      setTimeout(() => {
        navigate('/onboarding/role');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <button
          onClick={() => navigate('/onboarding/welcome')}
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
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Install Freighter Wallet
            </h2>
            <p className="text-sm text-text-secondary">
              Freighter is a secure wallet for the Stellar network
            </p>
          </div>

          {checking ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-text-secondary">Checking for Freighter...</p>
            </div>
          ) : isInstalled ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
              <p className="text-lg font-semibold text-success mb-2">Freighter Detected!</p>
              <p className="text-sm text-text-secondary">Continuing to next step...</p>
            </div>
          ) : (
            <>
              <div className="bg-warning/10 border-l-4 border-warning rounded-input p-4 mb-6">
                <p className="text-sm text-text-primary">
                  Freighter wallet is not installed in your browser
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <a
                  href="https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 border border-border rounded-input hover:border-accent hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">Chrome Extension</p>
                      <p className="text-xs text-text-secondary">For Chrome, Edge, Brave</p>
                    </div>
                  </div>
                  <span className="text-xs text-accent">Install →</span>
                </a>

                <a
                  href="https://addons.mozilla.org/en-US/firefox/addon/freighter/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 border border-border rounded-input hover:border-accent hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">Firefox Add-on</p>
                      <p className="text-xs text-text-secondary">For Firefox</p>
                    </div>
                  </div>
                  <span className="text-xs text-accent">Install →</span>
                </a>
              </div>

              <button
                onClick={checkWallet}
                className="w-full px-4 py-3 bg-accent text-white rounded-input font-medium hover:bg-accent/90 transition-colors"
              >
                Check Again
              </button>

              <button
                onClick={() => navigate('/onboarding/role')}
                className="w-full mt-3 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Skip (Demo Mode)
              </button>
            </>
          )}
        </motion.div>

        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-accent' : step < 1 ? 'bg-success' : 'bg-border'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
