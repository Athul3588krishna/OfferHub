import React, { useState } from 'react';
import { Heart, MapPin, Clock, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Offer, User } from '../../types';
import { dbService } from '../../services/supabase';
import { useToast } from '../common/Toast';
import confetti from 'canvas-confetti';

interface OfferCardProps {
  offer: Offer;
  currentUser: User;
  onViewDetails: (offer: Offer) => void;
  onSelectShop?: (shopId: string) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  currentUser,
  onViewDetails,
  onSelectShop
}) => {
  const { showToast } = useToast();
  const [isFav, setIsFav] = useState(() => {
    if (currentUser.role === 'citizen') {
      const favs = dbService.getFavourites(currentUser.id);
      return favs.includes(offer.id);
    }
    return false;
  });

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser.role !== 'citizen') {
      showToast('Citizen Feature', 'Please switch to citizen role to save favourites.', 'info');
      return;
    }

    const nextState = dbService.toggleFavourite(currentUser.id, offer.id);
    setIsFav(nextState);

    if (nextState) {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
      });
      showToast('Saved to Favourites', `"${offer.product_name}" saved to your list.`);
    } else {
      showToast('Removed', 'Removed from saved deals.', 'info');
    }
  };

  // Calculate days remaining
  const calculateDaysLeft = (expiryDate: string) => {
    const diffTime = new Date(expiryDate).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Ends Today!';
    return `${diffDays} days left`;
  };

  const daysLeft = calculateDaysLeft(offer.expiry_date);

  return (
    <div 
      onClick={() => onViewDetails(offer)}
      className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image Header with Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <img
          src={offer.image_url}
          alt={offer.product_name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Discount Badge */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
          <span>{offer.discount_percentage}% OFF</span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleToggleFav}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-md transition-all ${
            isFav
              ? 'bg-rose-500 text-white hover:bg-rose-600 scale-110'
              : 'bg-white/85 text-slate-700 hover:bg-white hover:text-rose-500'
          }`}
          title={isFav ? "Remove from favourites" : "Save to favourites"}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Days Left Chip */}
        <div className="absolute bottom-2.5 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
          <Clock className="w-3 h-3 text-emerald-400" />
          <span>{daysLeft}</span>
        </div>

        {/* Stock tag if available */}
        {offer.stock_status && (
          <div className="absolute bottom-2.5 right-3 bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs">
            {offer.stock_status}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Shop Name & Verified Badge */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectShop && offer.shop_id) onSelectShop(offer.shop_id);
              }}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 truncate flex items-center gap-1 hover:underline"
            >
              <span>{offer.shop?.shop_name || 'Perinthalmanna Store'}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            </button>
            <span className="text-[11px] text-slate-400 uppercase font-medium tracking-wider">
              {offer.category}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {offer.product_name}
          </h3>

          {/* Location Landmark */}
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{offer.shop?.address.split(',')[0].trim() || 'Perinthalmanna Town'}</span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-extrabold text-slate-900">
                ₹{offer.offer_price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-400 line-through font-medium">
                ₹{offer.original_price.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">
              Save ₹{(offer.original_price - offer.offer_price).toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={() => onViewDetails(offer)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold group-hover:bg-emerald-600 transition-colors shadow-xs"
          >
            <span>View Deal</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
