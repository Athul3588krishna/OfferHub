import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import { Shop, User } from '../../types';
import { dbService } from '../../services/supabase';
import { useToast } from '../common/Toast';
import confetti from 'canvas-confetti';

interface ShopReviewModalProps {
  shop: Shop | null;
  currentUser: User;
  onClose: () => void;
}

export const ShopReviewModal: React.FC<ShopReviewModalProps> = ({
  shop,
  currentUser,
  onClose,
}) => {
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!shop) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      showToast('Review Required', 'Please share a brief comment on your experience.', 'error');
      return;
    }

    setIsSubmitting(true);
    dbService.addReview({
      citizen_id: currentUser.id,
      citizen_name: currentUser.name,
      shop_id: shop.id,
      rating,
      review: reviewText.trim(),
    });

    setIsSubmitting(false);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    showToast('Review Published', `Thank you for reviewing ${shop.shop_name}!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <img
            src={shop.image_url}
            alt={shop.shop_name}
            className="w-16 h-16 rounded-2xl object-cover mx-auto ring-2 ring-emerald-500/30 shadow-md mb-3"
          />
          <h3 className="text-lg font-bold text-slate-900">Rate & Review Shop</h3>
          <p className="text-xs text-slate-500">{shop.shop_name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Selection */}
          <div className="text-center">
            <span className="text-xs font-semibold text-slate-500 block mb-2">
              Select your rating
            </span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-slate-300 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-amber-600 mt-1">
              {rating === 5 ? '5 Stars - Outstanding!' : `${rating} Stars`}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Your Review & Experience
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell others about discount authenticity, staff behavior, product quality..."
              rows={4}
              required
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
