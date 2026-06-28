import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WifiOff, ShieldCheck, Lock, RefreshCw, Wallet } from 'lucide-react';

interface WalletDisconnectedOverlayProps {
  onReconnect: () => void;
}

export const WalletDisconnectedOverlay = ({ onReconnect }: WalletDisconnectedOverlayProps) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onReconnect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onReconnect]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center px-6"
    >
      <div className="max-w-sm w-full text-center">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 12 }}
          className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto mb-6"
        >
          <WifiOff size={36} className="text-red-400" />
        </motion.div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Disconnected</h2>

        {/* Subtext */}
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Your Freighter wallet has been disconnected.
          <br />
          All session data has been cleared securely.
        </p>

        {/* Divider */}
        <div className="w-12 h-0.5 bg-gray-100 mx-auto mb-8" />

        {/* Info Row */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck size={18} className="text-green-400" />
            <span className="text-xs text-gray-400">Data Secured</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Lock size={18} className="text-blue-400" />
            <span className="text-xs text-gray-400">Session Cleared</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <RefreshCw size={18} className="text-purple-400" />
            <span className="text-xs text-gray-400">Ready to Reconnect</span>
          </div>
        </div>

        {/* Reconnect Button */}
        <button
          onClick={onReconnect}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <Wallet size={16} />
          Reconnect Wallet
        </button>

        {/* Countdown Text */}
        <p className="text-xs text-gray-400 mt-4">Redirecting in {countdown}s…</p>
      </div>
    </motion.div>
  );
};
