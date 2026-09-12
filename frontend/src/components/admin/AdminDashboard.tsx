import React, { useState, useEffect } from 'react';
import { 
  Store, CheckCircle2, XCircle, AlertTriangle, Users, 
  Tag, Eye, Clock, ShieldCheck, Check, Trash2, ArrowUpRight 
} from 'lucide-react';
import { Offer, Shop, User, Report } from '../../types';
import { dbService, subscribeToDbChanges } from '../../services/supabase';
import { useToast } from '../common/Toast';
import confetti from 'canvas-confetti';

interface AdminDashboardProps {
  currentUser: User;
  onViewOffer: (offer: Offer) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onViewOffer,
}) => {
  const { showToast } = useToast();
  const [stats, setStats] = useState(() => dbService.getAdminStats());
  const [shops, setShops] = useState<Shop[]>(() => dbService.getShops());
  const [offers, setOffers] = useState<Offer[]>(() => dbService.getOffers());
  const [reports, setReports] = useState<Report[]>(() => dbService.getReports());
  const [activeTab, setActiveTab] = useState<'shops' | 'offers' | 'reports'>('shops');

  const refreshAll = () => {
    setStats(dbService.getAdminStats());
    setShops(dbService.getShops());
    setOffers(dbService.getOffers());
    setReports(dbService.getReports());
  };

  useEffect(() => {
    refreshAll();
    return subscribeToDbChanges(refreshAll);
  }, []);

  // Approve / Reject Shop
  const handleApproveShop = (shopId: string, shopName: string) => {
    dbService.updateShopStatus(shopId, 'approved');
    confetti({ particleCount: 30, spread: 50 });
    showToast('Shop Approved', `${shopName} can now publish verified offers.`, 'success');
  };

  const handleRejectShop = (shopId: string, shopName: string) => {
    dbService.updateShopStatus(shopId, 'rejected');
    showToast('Shop Rejected', `${shopName} registration rejected.`, 'info');
  };

  // Approve / Reject Offer
  const handleApproveOffer = (offerId: string, productName: string) => {
    dbService.updateOfferStatus(offerId, 'approved');
    confetti({ particleCount: 30, spread: 50 });
    showToast('Offer Approved', `"${productName}" is now live for citizens in Perinthalmanna!`, 'success');
  };

  const handleRejectOffer = (offerId: string, productName: string) => {
    dbService.updateOfferStatus(offerId, 'rejected');
    showToast('Offer Rejected', `"${productName}" rejected.`, 'info');
  };

  // Resolve Report
  const handleDismissReport = (reportId: string) => {
    dbService.updateReportStatus(reportId, 'resolved');
    showToast('Report Resolved', 'Dismissed citizen report.', 'info');
  };

  const handleRemoveReportedOffer = (reportId: string, offerId: string) => {
    dbService.deleteOffer(offerId);
    dbService.updateReportStatus(reportId, 'resolved');
    showToast('Offer Removed', 'Reported offer has been removed from Perinthalmanna platform.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Title Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-900/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Super Admin Portal
            </span>
            <span className="text-xs text-slate-400">Perinthalmanna Municipality Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Governance & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Review pending shop registrations, moderate citizen reports, and approve authentic local deals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-2xl text-center border border-white/10">
            <p className="text-xs text-amber-300 font-semibold">Action Items</p>
            <p className="text-2xl font-black text-white">
              {stats.pendingShops + stats.pendingOffers + stats.pendingReports}
            </p>
          </div>
        </div>
      </div>

      {/* Admin Real Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Total Shops</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{stats.totalShops}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-amber-300 bg-amber-50/50 shadow-xs">
          <span className="text-xs text-amber-800 font-semibold block">Pending Shops</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">{stats.pendingShops}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Citizens</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{stats.totalCitizens}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-emerald-300 bg-emerald-50/50 shadow-xs">
          <span className="text-xs text-emerald-800 font-semibold block">Active Deals</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">{stats.activeOffers}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-amber-300 bg-amber-50/50 shadow-xs">
          <span className="text-xs text-amber-800 font-semibold block">Pending Deals</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">{stats.pendingOffers}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Total Views</span>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">{stats.totalOfferViews}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-rose-300 bg-rose-50/50 shadow-xs">
          <span className="text-xs text-rose-800 font-semibold block">Reports</span>
          <p className="text-2xl sm:text-3xl font-black text-rose-700 mt-1">{stats.pendingReports}</p>
        </div>
      </div>

      {/* Tabs for Moderation Queues */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 p-4 sm:p-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('shops')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                activeTab === 'shops'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Shop Registrations ({shops.length})
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                activeTab === 'offers'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Deal Approvals ({offers.length})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                activeTab === 'reports'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Citizen Reports ({reports.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Shops Approval */}
        {activeTab === 'shops' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4 pl-6">Store Name</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Address in Perinthalmanna</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Approval Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={shop.image_url}
                          alt={shop.shop_name}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <span className="font-bold text-slate-900">{shop.shop_name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">{shop.owner_name}</td>
                    <td className="p-4 uppercase text-[11px] font-semibold text-slate-500">{shop.category}</td>
                    <td className="p-4 text-slate-600">{shop.phone}</td>
                    <td className="p-4 text-slate-500 max-w-[220px] truncate">{shop.address}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        shop.verification_status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : shop.verification_status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}>
                        {shop.verification_status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {shop.verification_status !== 'approved' && (
                          <button
                            onClick={() => handleApproveShop(shop.id, shop.shop_name)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 shadow-2xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                        {shop.verification_status !== 'rejected' && (
                          <button
                            onClick={() => handleRejectShop(shop.id, shop.shop_name)}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Offers Approval */}
        {activeTab === 'offers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4 pl-6">Offer Details</th>
                  <th className="p-4">Shop</th>
                  <th className="p-4">Original</th>
                  <th className="p-4">Offer Price</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Moderation Action</th>
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
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{offer.product_name}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-medium">{offer.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">{offer.shop?.shop_name || 'Store'}</td>
                    <td className="p-4 text-slate-400 line-through">₹{offer.original_price.toLocaleString('en-IN')}</td>
                    <td className="p-4 font-bold text-slate-900">₹{offer.offer_price.toLocaleString('en-IN')}</td>
                    <td className="p-4 font-bold text-emerald-600">{offer.discount_percentage}% OFF</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        offer.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : offer.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}>
                        {offer.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewOffer(offer)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        {offer.status !== 'approved' && (
                          <button
                            onClick={() => handleApproveOffer(offer.id, offer.product_name)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 shadow-2xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                        {offer.status !== 'rejected' && (
                          <button
                            onClick={() => handleRejectOffer(offer.id, offer.product_name)}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Citizen Reports */}
        {activeTab === 'reports' && (
          <div className="p-6">
            {reports.length > 0 ? (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-sm">{report.offer_title}</span>
                        <span className="text-xs text-slate-500">• {report.shop_name}</span>
                      </div>
                      <p className="text-xs text-rose-700 font-medium bg-rose-50 border border-rose-200/60 px-2.5 py-1 rounded-lg w-fit">
                        Reason: {report.reason}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemoveReportedOffer(report.id, report.offer_id)}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Fake Offer</span>
                      </button>
                      <button
                        onClick={() => handleDismissReport(report.id)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="font-bold text-slate-800 text-sm">No Pending Citizen Reports</p>
                <p className="text-xs">All Perinthalmanna listings are compliant and verified.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
