import React from 'react';
import { 
  X, Heart, MapPin, Phone, Calendar, Clock, 
  ShieldCheck, AlertTriangle, Share2, Tag, Navigation, CheckCircle2 
} from 'lucide-react';
import { Offer, User } from '../../types';
import { dbService } from '../../services/supabase';
import { useToast } from '../common/Toast';
import confetti from 'canvas-confetti';

interface OfferDetailModalProps {
  offer: Offer | null;
  currentUser: User;
  onClose: () => void;
  onOpenReportModal: (offer: Offer) => void;
  onSelectShop: (shopId: string) => void;
}

export const OfferDetailModal: React.FC<OfferDetailModalProps> = ({
  offer,
  currentUser,
  onClose,
  onOpenReportModal,
  onSelectShop
}) => {
  const { showToast } = useToast();

  if (!offer) return null;

  const isFav = currentUser.role === 'citizen' 
    ? dbService.getFavourites(currentUser.id).includes(offer.id)
    : false;

  const handleToggleFav = () => {
    if (currentUser.role !== 'citizen') {
      showToast('Citizen Feature', 'Please switch to citizen role to save favourites.', 'info');
      return;
    }
    const next = dbService.toggleFavourite(currentUser.id, offer.id);
    if (next) {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      showToast('Saved to Favourites', `"${offer.product_name}" saved.`);
    } else {
      showToast('Removed', 'Removed from saved deals.', 'info');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: offer.product_name,
        text: `Check out this deal in Perinthalmanna: ${offer.product_name} at ${offer.discount_percentage}% OFF!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link Copied', 'Offer link copied to clipboard.', 'success');
    }
  };

  const savings = offer.original_price - offer.offer_price;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Close & Share Bar */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-white/85 hover:bg-white text-slate-700 shadow-md backdrop-blur-md transition-colors"
            title="Share deal"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/85 hover:bg-white text-slate-700 shadow-md backdrop-blur-md transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Main Media & Header */}
          <div className="relative aspect-16/9 sm:aspect-21/9 bg-slate-100 overflow-hidden">
            <img
              src={offer.image_url}
              alt={offer.product_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full shadow-md">
                  {offer.discount_percentage}% OFF
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white">
                  {offer.category.toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                {offer.product_name}
              </h2>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 space-y-6">
            {/* Price Showcase */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Special Offer Price</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    ₹{offer.offer_price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-slate-400 line-through font-medium">
                    ₹{offer.original_price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-emerald-800 font-bold block">
                  You Save ₹{savings.toLocaleString('en-IN')} ({offer.discount_percentage}%)
                </span>
                {offer.stock_status && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {offer.stock_status}
                  </span>
                )}
              </div>
            </div>

            {/* Shop Card */}
            {offer.shop && (
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={offer.shop.image_url}
                    alt={offer.shop.shop_name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectShop(offer.shop!.id);
                      }}
                      className="font-bold text-slate-900 text-sm hover:text-emerald-700 flex items-center gap-1.5 transition-colors text-left"
                    >
                      <span>{offer.shop.shop_name}</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    </button>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{offer.shop.address}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`tel:${offer.shop.phone}`}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Shop</span>
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${offer.shop.latitude},${offer.shop.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Deal Description
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {offer.description}
              </p>
            </div>

            {/* Offer Validity & Timings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2.5 text-slate-600">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800">Valid Until: </span>
                  <span>{new Date(offer.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2.5 text-slate-600">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800">Status: </span>
                  <span className="text-emerald-700 font-bold uppercase">Active Verified Deal</span>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            {offer.terms && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Terms & Conditions
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed italic bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
                  {offer.terms}
                </p>
              </div>
            )}

            {/* Tags */}
            {offer.tags && offer.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {offer.tags.map(t => (
                  <span key={t} className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={() => onOpenReportModal(offer)}
            className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report fake or expired offer</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFav}
              className={`px-4 py-2.5 rounded-xl border font-semibold text-xs flex items-center gap-1.5 transition-all ${
                isFav
                  ? 'bg-rose-50 border-rose-300 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
              <span>{isFav ? 'Saved' : 'Save Deal'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-xs shadow-md transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
