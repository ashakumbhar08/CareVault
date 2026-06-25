import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Star } from 'lucide-react';
import { track } from '../utils/analytics';

export const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    // Track feedback submission
    track.feedbackSubmitted(rating);

    // In production, save to Supabase or send to Tally.so
    console.log('Feedback submitted:', { rating, feedback });

    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setRating(0);
      setFeedback('');
    }, 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 w-12 h-12 bg-accent text-white rounded-full shadow-lg hover:bg-accent/90 transition-all hover:scale-110 flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed bottom-20 left-4 z-50 w-80 bg-card rounded-card shadow-custom p-6"
            >
              {submitted ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-success fill-success" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Thank you!
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Your feedback helps us improve CareVault
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">
                      Share Feedback
                    </h3>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-muted hover:text-text-primary transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        How would you rate CareVault? *
                      </label>
                      <div className="flex gap-2 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= rating
                                  ? 'text-warning fill-warning'
                                  : 'text-border'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        What could be better? (optional)
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full px-3 py-2 border border-border rounded-input text-sm resize-none focus:border-accent focus:outline-none"
                        rows={3}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={rating === 0}
                      className="w-full px-4 py-2 bg-accent text-white rounded-input font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Submit Feedback
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
