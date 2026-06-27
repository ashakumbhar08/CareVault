import { FileText, Share2, Download, Eye } from 'lucide-react';
import { MedicalRecord } from '../../types';
import { CategoryBadge } from './CategoryBadge';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';

interface RecordCardProps {
  record: MedicalRecord;
}

const categoryStripeColors: Record<MedicalRecord['category'], string> = {
  'Prescription': 'bg-[#1D4ED8]',
  'Lab Report': 'bg-[#6D28D9]',
  'Scan': 'bg-[#4338CA]',
  'Vaccination': 'bg-[#065F46]',
  'Discharge Summary': 'bg-[#92400E]',
  'Other': 'bg-[#374151]',
};

export const RecordCard = ({ record }: RecordCardProps) => {
  const { showToast } = useToast();

  const handleView = () => {
    if (record.localObjectUrl) {
      window.open(record.localObjectUrl, '_blank');
    } else if (record.ipfsHash) {
      window.open('https://gateway.pinata.cloud/ipfs/' + record.ipfsHash, '_blank');
    } else if (record.fileRef instanceof Blob) {
      const url = URL.createObjectURL(record.fileRef);
      window.open(url, '_blank');
    } else {
      showToast('info', 'File preview not available.');
    }
  };

  const handleDownload = () => {
    if (record.localObjectUrl) {
      const a = document.createElement('a');
      a.href = record.localObjectUrl;
      a.download = record.fileName;
      a.click();
    } else if (record.fileRef instanceof Blob) {
      const url = URL.createObjectURL(record.fileRef);
      const a = document.createElement('a');
      a.href = url;
      a.download = record.fileName;
      a.click();
      URL.revokeObjectURL(url);
    } else if (record.ipfsHash) {
      window.open(`https://gateway.pinata.cloud/ipfs/${record.ipfsHash}`, '_blank');
    } else {
      showToast('info', 'File not available for download.');
    }
  };

  const handleShare = () => {
    const linkText = record.ipfsHash 
      ? `https://gateway.pinata.cloud/ipfs/${record.ipfsHash}`
      : 'File stored locally — no shareable link available.';
    navigator.clipboard.writeText(linkText);
    showToast('success', 'Link copied to clipboard.');
  };

  const getStatusDisplay = () => {
    if (record.status === 'verified') {
      return <span className="px-2 py-1 bg-success/10 text-success text-xs rounded">Verified</span>;
    }
    return <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded">Uploaded</span>;
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
        </div>

        <div className="flex items-center justify-between text-xs text-text-secondary mb-3">
          <span>{new Date(record.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          {getStatusDisplay()}
        </div>

        {record.ipfsHash ? (
          <p className="text-xs text-muted font-mono mb-3 truncate">
            {record.ipfsHash.slice(0, 8)}…{record.ipfsHash.slice(-4)}
          </p>
        ) : (
          <p className="text-xs text-muted mb-3">Local</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleView}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-accent/10 text-accent hover:bg-accent/20 rounded transition-colors"
          >
            <Eye className="w-3 h-3" />
            View
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-accent/10 text-accent hover:bg-accent/20 rounded transition-colors"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-accent/10 text-accent hover:bg-accent/20 rounded transition-colors"
          >
            <Share2 className="w-3 h-3" />
            Share
          </button>
        </div>
      </div>
    </motion.div>
  );
};
