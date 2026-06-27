import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileUp, CheckCircle2, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RecordCategory } from '../../types';
import { track } from '../../utils/analytics';

const categories: RecordCategory[] = [
  'Prescription',
  'Lab Report',
  'Scan',
  'Vaccination',
  'Discharge Summary',
  'Other',
];

export const FirstRecordPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<RecordCategory | null>(null);
  const [uploading, setUploading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !category) return;

    setUploading(true);

    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 3000));

    track.recordUploaded(category, file.size / 1024 / 1024);
    track.onboardingStepCompleted(4);
    track.onboardingCompleted('patient');

    setUploading(false);
    setCompleted(true);

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Mark onboarding as complete
    localStorage.setItem('cv_onboarded', 'true');

    setTimeout(() => {
      navigate('/patient');
    }, 2000);
  };

  const handleSkip = () => {
    localStorage.setItem('cv_onboarded', 'true');
    track.onboardingCompleted('patient');
    navigate('/patient');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <button
          onClick={() => navigate('/onboarding/fund')}
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
          {completed ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-20 h-20 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                🎉 Welcome to CareVault!
              </h2>
              <p className="text-text-secondary mb-4">
                Your first record has been uploaded successfully
              </p>
              <p className="text-sm text-muted">Redirecting to dashboard...</p>
            </div>
          ) : uploading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-text-primary mb-2">Encrypting and Uploading...</p>
              <p className="text-sm text-text-secondary">This may take a moment</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileUp className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  Upload Your First Record
                </h2>
                <p className="text-sm text-text-secondary">
                  Try uploading a medical record to see CareVault in action
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-3">
                    Select File
                  </label>
                  <label className="block">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-border rounded-input p-8 text-center hover:border-accent hover:bg-accent/5 cursor-pointer transition-colors">
                      <FileUp className="w-8 h-8 text-muted mx-auto mb-2" />
                      {file ? (
                        <>
                          <p className="text-sm font-medium text-text-primary">{file.name}</p>
                          <p className="text-xs text-muted mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-text-primary">Drop your file here</p>
                          <p className="text-xs text-accent mt-1">or click to browse</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-3">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`p-3 text-sm font-medium rounded-input border-2 transition-all ${
                          category === cat
                            ? 'border-accent bg-accent/5 text-accent'
                            : 'border-border text-text-primary hover:border-accent/50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!file || !category}
                  className="w-full px-4 py-3 bg-accent text-white rounded-input font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Upload Record
                </button>

                <button
                  onClick={handleSkip}
                  className="w-full text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </>
          )}
        </motion.div>

        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full ${step === 4 ? 'bg-accent' : step < 4 ? 'bg-success' : 'bg-border'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
