import React, { useState, useEffect } from 'react';
import { 
  X, Star, MapPin, Phone, ShieldCheck, 
  Store, MessageSquarePlus, Navigation 
} from 'lucide-react';
import { Offer, Review, Shop, User } from '../../types';
import { dbService, subscribeToDbChanges } from '../../services/supabase';
import { OfferCard } from './OfferCard';
import { ShopReviewModal } from './ShopReviewModal';

interface ShopProfileModalProps {
  shopId: string | null;
  currentUser: User;
  onClose: () => void;
  onSelectOffer: (offer: Offer) => void;
}

export const ShopProfileModal: React.FC<ShopProfileModalProps> = ({
  shopId,
  currentUser,
  onClose,
  onSelectOffer,
}) => {
  const [shop, setShop] = useState<Shop | undefined>(() => 
    shopId ? dbService.getShopById(shopId) : undefined
  );
  const [offers, setOffers] = useState<Offer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const refreshData = () => {
    if (shopId) {
      const s = dbService.getShopById(shopId);
      setShop(s);
      setOffers(dbService.getOffersByShopId(shopId).filter(o => o.status === 'approved'));
      setReviews(dbService.getReviewsByShopId(shopId));
    }
  };

  useEffect(() => {
    refreshData();
    return subscribeToDbChanges(refreshData);
  }, [shopId]);

  if (!shopId || !shop) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
        <div 
          className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Banner */}
          <div className="relative aspect-16/6 bg-slate-900 overflow-hidden">
            <img
              src={shop.image_url}
              alt={shop.shop_name}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-6 right-6 text-white flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950">
                    {shop.category}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/20 text-white flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Verified Perinthalmanna Store
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black">{shop.shop_name}</h2>
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{shop.address}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${shop.phone}`}
                  className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call Store</span>
                </a>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>Add Review</span>
                </button>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            {/* Description & Rating summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  About the Store
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {shop.description}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-black text-amber-500">
                  <Star className="w-6 h-6 fill-amber-400" />
                  <span>{shop.rating}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Based on {shop.total_reviews} verified citizen ratings
                </p>
              </div>
            </div>

            {/* Active Offers published by this shop */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Active Deals from this Store ({offers.length})
                </h4>
              </div>

              {offers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {offers.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      currentUser={currentUser}
                      onViewDetails={onSelectOffer}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                  No active offers currently published.
                </div>
              )}
            </div>

            {/* Customer Reviews */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Customer Reviews ({reviews.length})
                </h4>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  Write a Review
                </button>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800">
                          {rev.citizen_name || 'Citizen of Perinthalmanna'}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{rev.rating}.0</span>
                        </div>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{rev.review}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No reviews submitted yet. Be the first!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ShopReviewModal
        shop={shop}
        currentUser={currentUser}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </>
  );
};
