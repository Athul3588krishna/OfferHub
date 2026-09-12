import React, { useState, useEffect } from 'react';
import { 
  Plus, Eye, Heart, CheckCircle2, Clock, 
  AlertCircle, Sparkles, TrendingUp, Store, Edit3, Trash2 
} from 'lucide-react';
import { Offer, Shop, User } from '../../types';
import { dbService, subscribeToDbChanges } from '../../services/supabase';
import { useToast } from '../common/Toast';

interface ShopDashboardProps {
  currentUser: User;
  onOpenAddOffer: () => void;
  onOpenProfile: () => void;
  onViewOffer: (offer: Offer) => void;
}

export const ShopDashboard: React.FC<ShopDashboardProps> = ({
  currentUser,
  onOpenAddOffer,
  onOpenProfile,
  onViewOffer,
}) => {
  const { showToast } = useToast();
  const [shop, setShop] = useState<Shop | undefined>(() => 
    dbService.getShopByOwnerId(currentUser.id) || dbService.getShops()[0]
  );
  const [stats, setStats] = useState(() => dbService.getShopStats(shop?.id || 'shop-oxygen'));
  const [offers, setOffers] = useState<Offer[]>(() => dbService.getOffersByShopId(shop?.id || 'shop-oxygen'));

  const refreshData = () => {
    const currentShop = dbService.getShopByOwnerId(currentUser.id) || dbService.getShops()[0];
    setShop(currentShop);
    if (currentShop) {
      setStats(dbService.getShopStats(currentShop.id));
      setOffers(dbService.getOffersByShopId(currentShop.id));
    }
  };

  useEffect(() => {
    refreshData();
    return subscribeToDbChanges(refreshData);
  }, [currentUser]);

  const handleDeleteOffer = (offerId: string) => {
    if (window.confirm('Are you sure you want to remove this offer?')) {
      dbService.deleteOffer(offerId);
      showToast('Offer Deleted', 'The offer has been removed.', 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Shop Header & Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={shop?.image_url || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=200&q=80'}
              alt={shop?.shop_name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-indigo-400/50 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {shop?.shop_name || 'My Perinthalmanna Shop'}
                </h1>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  shop?.verification_status === 'approved'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {shop?.verification_status === 'approved' ? 'Verified Store' : 'Pending Verification'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Owner: <span className="font-semibold text-white">{shop?.owner_name}</span> • {shop?.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={onOpenProfile}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/10 flex items-center justify-center gap-1.5"
            >
              <Store className="w-4 h-4" />
              <span>Edit Store</span>
            </button>
            <button
              onClick={onOpenAddOffer}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Add New Offer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row per requirements: Total Offers, Active Offers, Pending Offers, Expired Offers, Total Views, Total Favourites */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Total Offers</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{stats.totalOffers}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-emerald-700 font-semibold block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Active Offers
          </span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{stats.activeOffers}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-amber-700 font-semibold block flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Offers
          </span>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{stats.pendingOffers}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            Expired Offers
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-500 mt-1">{stats.expiredOffers}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-indigo-700 font-semibold block flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            Total Views
          </span>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">{stats.totalViews}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-rose-700 font-semibold block flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-600" />
            Total Saves
          </span>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">{stats.totalFavourites}</p>
        </div>
      </div>

      {/* Offers Management Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Manage Published Offers</h3>
            <p className="text-xs text-slate-500">Live, pending, and expired listings for this store.</p>
          </div>

          <button
            onClick={onOpenAddOffer}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Offer</span>
          </button>
        </div>

        {offers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4 pl-6">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Original</th>
                  <th className="p-4">Offer Price</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Views</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={offer.image_url}
                          alt={offer.product_name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <span className="font-bold text-slate-900 max-w-[200px] truncate block">
                          {offer.product_name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 uppercase text-[11px] font-semibold text-slate-500">
                      {offer.category}
                    </td>
                    <td className="p-4 text-slate-400 line-through">
                      ₹{offer.original_price.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      ₹{offer.offer_price.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                        {offer.discount_percentage}% OFF
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        offer.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : offer.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {offer.status}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-600">
                      {offer.views}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewOffer(offer)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-emerald-700 transition-colors"
                          title="View Offer Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Offer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <p className="font-semibold text-sm">No offers published yet.</p>
            <p className="text-xs max-w-sm mx-auto">
              Start by clicking "Add New Offer" to list your local discounts and reach citizens across Perinthalmanna!
            </p>
            <button
              onClick={onOpenAddOffer}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
            >
              + Create First Offer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
