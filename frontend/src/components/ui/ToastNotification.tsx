import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X, ExternalLink } from 'lucide-react';
import { Toast } from '../../hooks/useToast';

interface ToastNotificationProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export const ToastNotification = ({ toasts, onClose }: ToastNotificationProps) => {
  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-error" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'info':
        return <Info className="w-5 h-5 text-accent" />;
    }
  };

  const getBorderColor = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-success';
      case 'error':
        return 'border-l-error';
      case 'warning':
        return 'border-l-warning';
      case 'info':
        return 'border-l-accent';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.2 }}
            className={`bg-card rounded-input shadow-lg border-l-4 ${getBorderColor(toast.type)} p-4 min-w-[300px] max-w-md flex items-start gap-3`}
          >
            {getIcon(toast.type)}
            <div className="flex-1">
              <p className="text-sm text-text-primary">{toast.message}</p>
              {toast.txHash && (
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${toast.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline flex items-center gap-1 mt-1"
                >
                  View transaction
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <button
              onClick={() => onClose(toast.id)}
              className="text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
