import { useState } from 'react';
import { MessageSquare, X, Star } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import posthog from 'posthog-js';

export const FeedbackWidget = () => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setSubmitting(true);
    try {
      const walletAddress = sessionStorage.getItem('cv_wallet')
        ? JSON.parse(sessionStorage.getItem('cv_wallet')!).address
        : null;

      const truncated = walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : null;

      await supabase.from('feedback').insert([
        {
          rating,
          comment: comment || null,
          wallet_address: truncated,
        },
      ]);

      posthog.capture('feedback_submitted', { rating });

      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setRating(0);
        setComment('');
        setSubmitted(false);
      }, 2000);
    } catch (err) {
      console.error('Feedback submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 bg-accent text-white p-3 rounded-full shadow-lg hover:bg-accent/90 transition-colors z-40 md:rounded-input md:px-4 md:flex md:items-center md:gap-2"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="hidden md:inline text-sm font-medium">Feedback</span>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-card shadow-lg border border-border max-w-md w-full p-6">
            {submitted ? (
              <div className="text-center">
                <p className="text-text-primary font-medium">Thank you! Your feedback helps us improve.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-text-primary">How is CareVault?</h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-text-secondary hover:text-text-primary"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-colors"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-border'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What could be better? (optional)"
                  className="w-full px-3 py-2 border border-border rounded-input resize-none text-sm focus:outline-none focus:ring-2 focus:ring-accent mb-4"
                  rows={3}
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => setOpen(false)}
                    className="flex-1 px-4 py-2 border border-border text-text-primary rounded-input hover:bg-surface-hover transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={rating === 0 || submitting}
                    className="flex-1 px-4 py-2 bg-accent text-white rounded-input disabled:opacity-50 hover:bg-accent/90 transition-colors"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
