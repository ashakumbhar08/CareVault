import { FileText, Share2, MoreVertical, ShieldCheck, Clock, ShieldX } from 'lucide-react';
import { MedicalRecord } from '../../types';
import { CategoryBadge } from './CategoryBadge';
import { motion } from 'framer-motion';

interface RecordCardProps {
  record: MedicalRecord;
  onShare?: () => void;
  onRevoke?: () => void;
  onDownload?: () => void;
}

const categoryStripeColors: Record<MedicalRecord['category'], string> = {
  'Prescription': 'bg-[#1D4ED8]',
  'Lab Report': 'bg-[#6D28D9]',
  'Scan': 'bg-[#4338CA]',
  'Vaccination': 'bg-[#065F46]',
  'Discharge Summary': 'bg-[#92400E]',
  'Other': 'bg-[#374151]',
};

export const RecordCard = ({ record, onShare }: RecordCardProps) => {
  const getVerificationDisplay = () => {
    switch (record.verificationStatus) {
      case 'verified':
        return (
          <div className="flex items-center gap-1 text-success">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs">Verified</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1 text-warning">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Pending</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-1 text-error">
            <ShieldX className="w-4 h-4" />
            <span className="text-xs">Failed</span>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-card shadow-custom hover:shadow-lg transition-shadow relative overflow-hidden"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${categoryStripeColors[record.category]}`}></div>
      
      <div className="p-4 pl-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-text-secondary flex-shrink-0" />
              <h3 className="text-sm font-semibold text-text-primary truncate">{record.fileName}</h3>
            </div>
            <CategoryBadge category={record.category} />
          </div>
          <button className="text-muted hover:text-text-primary transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-text-secondary mb-3">
          <span>{new Date(record.uploadedAt).toLocaleDateString()}</span>
          <span>{record.fileSize}</span>
        </div>

        <div className="flex items-center justify-between">
          {getVerificationDisplay()}
          {onShare && (
            <button
              onClick={onShare}
              className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
            >
              <Share2 className="w-3 h-3" />
              Share Access
            </button>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted font-mono truncate">IPFS: {record.ipfsHash}</p>
        </div>
      </div>
    </motion.div>
  );
};
