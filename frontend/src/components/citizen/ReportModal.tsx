import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { Offer, User } from '../../types';
import { dbService } from '../../services/supabase';
import { useToast } from '../common/Toast';

interface ReportModalProps {
  offer: Offer | null;
  currentUser: User;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  offer,
  currentUser,
  onClose,
}) => {
  const { showToast } = useToast();
  const [reason, setReason] = useState('Deal already expired');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!offer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const fullReason = details.trim() ? `${reason}: ${details.trim()}` : reason;

    dbService.addReport({
      citizen_id: currentUser.id,
      offer_id: offer.id,
      reason: fullReason,
    });

    setIsSubmitting(false);
    showToast(
      'Report Submitted',
      'Thank you. Our Perinthalmanna Admin team will review and take necessary action.',
      'success'
    );
    onClose();
  };

  const reasons = [
    'Deal already expired',
    'Price in shop is different from app',
    'Out of stock / Shop owner refused offer',
    'Misleading product description',
    'Suspected fake or unauthorized deal'
  ];

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

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Report Deal</h3>
            <p className="text-xs text-slate-500">Flag issues with this listing</p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-5 text-xs">
          <p className="font-bold text-slate-800">{offer.product_name}</p>
          <p className="text-slate-500">{offer.shop?.shop_name || 'Perinthalmanna Store'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Reason for reporting
            </label>
            <div className="space-y-2">
              {reasons.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    reason === r
                      ? 'border-rose-500 bg-rose-50/70 text-rose-900 font-semibold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Additional Details (Optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide extra context (e.g. visited on Sunday and price was ₹3,000 instead of ₹2,499)..."
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
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
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-500/20 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
