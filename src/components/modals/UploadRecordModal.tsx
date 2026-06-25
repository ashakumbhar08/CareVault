import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileUp, CheckCircle2 } from 'lucide-react';
import { RecordCategory } from '../../types';

interface UploadRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const categories: RecordCategory[] = [
  'Prescription',
  'Lab Report',
  'Scan',
  'Vaccination',
  'Discharge Summary',
  'Other',
];

export const UploadRecordModal = ({ isOpen, onClose, onSuccess }: UploadRecordModalProps) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<RecordCategory | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        alert('Only PDF files are accepted');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploadSuccess(true);
      setTimeout(() => {
        onSuccess('Record uploaded successfully');
        handleClose();
      }, 2000);
    }, 3000);
  };

  const handleClose = () => {
    setStep(1);
    setFile(null);
    setCategory(null);
    setUploading(false);
    setUploadSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={handleClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="relative bg-card rounded-card shadow-custom max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          {uploadSuccess ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-xl font-bold text-text-primary mb-2">Record uploaded successfully</h3>
              <p className="text-sm text-muted font-mono">QmX...o6uco</p>
            </div>
          ) : uploading ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-text-secondary">Encrypting file...</p>
              <p className="text-xs text-muted mt-2">Then uploading to IPFS...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-4">
                  {step > 1 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="text-text-secondary hover:text-text-primary"
                    >
                      ←
                    </button>
                  )}
                  <h2 className="text-xl font-bold text-text-primary">Upload Record</h2>
                </div>
                <button onClick={handleClose} className="text-muted hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 px-6 py-4">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 w-8 rounded-full ${s === step ? 'bg-accent' : 'bg-surface-hover'}`}
                  ></div>
                ))}
              </div>

              <div className="p-6">
                {step === 1 && (
                  <div>
                    <label className="block">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-border rounded-input p-12 text-center hover:border-accent hover:bg-accent/5 cursor-pointer transition-colors">
                        <FileUp className="w-12 h-12 text-muted mx-auto mb-4" />
                        <p className="text-sm text-text-primary mb-1">
                          Drag your file here
                        </p>
                        <p className="text-xs text-accent">or click to browse</p>
                      </div>
                    </label>
                    {file && (
                      <div className="mt-4 p-4 bg-surface-hover rounded-input">
                        <p className="text-sm font-medium text-text-primary">{file.name}</p>
                        <p className="text-xs text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    )}
                    <p className="mt-4 text-xs text-muted text-center">
                      Supported: PDF only, max 10MB
                    </p>
                    <button
                      disabled={!file}
                      onClick={() => setStep(2)}
                      className="w-full mt-6 px-4 py-2 bg-accent text-white rounded-input font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-3">
                      Select a category for this record
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={`p-4 text-left rounded-input border-2 transition-all ${
                            category === cat
                              ? 'border-accent bg-accent/5'
                              : 'border-border hover:border-accent/50'
                          }`}
                        >
                          <p className="text-sm font-medium text-text-primary">{cat}</p>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 px-4 py-2 border border-border text-text-primary rounded-input font-medium hover:bg-surface-hover transition-colors"
                      >
                        Back
                      </button>
                      <button
                        disabled={!category}
                        onClick={() => setStep(3)}
                        className="flex-1 px-4 py-2 bg-accent text-white rounded-input font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <div className="p-4 bg-surface-hover rounded-input mb-4">
                      <p className="text-sm font-medium text-text-primary mb-1">{file?.name}</p>
                      <p className="text-xs text-muted">Category: {category}</p>
                    </div>
                    <div className="p-4 bg-accent/10 border-l-4 border-accent rounded-input mb-4">
                      <p className="text-sm text-text-primary">
                        Your file will be encrypted before upload
                      </p>
                    </div>
                    <p className="text-xs text-muted mb-6">Estimated gas fee: ~0.00001 XLM</p>
                    <button
                      onClick={handleUpload}
                      className="w-full px-4 py-2 bg-accent text-white rounded-input font-medium hover:bg-accent/90 transition-colors"
                    >
                      Upload
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
