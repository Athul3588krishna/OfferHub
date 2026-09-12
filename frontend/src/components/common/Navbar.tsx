import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Heart, Bell, Menu, X, Store, 
  MapPin, LogOut, ChevronDown, CheckCircle2, 
  PlusCircle, LayoutDashboard
} from 'lucide-react';
import { User } from '../../types';
import { dbService, subscribeToDbChanges } from '../../services/supabase';

interface NavbarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAiModal: () => void;
  onOpenAuthModal: () => void;
  onOpenAddOfferModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAiModal,
  onOpenAuthModal,
  onOpenAddOfferModal,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [favouritesCount, setFavouritesCount] = useState(0);
  const [pendingAdminCount, setPendingAdminCount] = useState(0);

  useEffect(() => {
    const updateCounts = () => {
      if (currentUser.role === 'citizen') {
        const favs = dbService.getFavourites(currentUser.id);
        setFavouritesCount(favs.length);
      } else if (currentUser.role === 'admin') {
        const stats = dbService.getAdminStats();
        setPendingAdminCount(stats.pendingShops + stats.pendingOffers + stats.pendingReports);
      }
    };

    updateCounts();
    return subscribeToDbChanges(updateCounts);
  }, [currentUser]);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                  PMNA <span className="text-emerald-600">Deals</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Perinthalmanna
                  </span>
                </span>
                <p className="text-[10px] text-slate-500 font-medium -mt-1 hidden sm:block">
                  Agentic AI Local Offers Platform
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links based on Active Role */}
            <nav className="hidden lg:flex items-center gap-1">
              {currentUser.role === 'admin' ? (
                <>
                  <button
                    onClick={() => setActiveTab('admin-dashboard')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'admin-dashboard'
                        ? 'bg-amber-100 text-amber-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab('admin-shops')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative ${
                      activeTab === 'admin-shops'
                        ? 'bg-amber-100 text-amber-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Shops
                  </button>
                  <button
                    onClick={() => setActiveTab('admin-offers')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'admin-offers'
                        ? 'bg-amber-100 text-amber-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Offers
                  </button>
                  <button
                    onClick={() => setActiveTab('admin-reports')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'admin-reports'
                        ? 'bg-amber-100 text-amber-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Reports
                  </button>
                  <button
                    onClick={() => setActiveTab('admin-citizens')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'admin-citizens'
                        ? 'bg-amber-100 text-amber-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Citizens
                  </button>
                </>
              ) : currentUser.role === 'shop' ? (
                <>
                  <button
                    onClick={() => setActiveTab('shop-dashboard')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'shop-dashboard'
                        ? 'bg-indigo-100 text-indigo-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Shop Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab('shop-offers')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'shop-offers'
                        ? 'bg-indigo-100 text-indigo-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    My Offers
                  </button>
                  <button
                    onClick={() => setActiveTab('shop-profile')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'shop-profile'
                        ? 'bg-indigo-100 text-indigo-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Store Profile
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('home')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'home'
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => setActiveTab('offers')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'offers'
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Explore Deals
                  </button>
                  <button
                    onClick={() => setActiveTab('shops')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'shops'
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Local Shops
                  </button>
                  <button
                    onClick={() => setActiveTab('map')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                      activeTab === 'map'
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Town Map
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {/* AI Assistant Button */}
            <button
              onClick={onOpenAiModal}
              className="relative inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Ask PMNA AI</span>
            </button>

            {/* Shop Owner Action: Add Offer */}
            {currentUser.role === 'shop' && (
              <button
                onClick={onOpenAddOfferModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publish Offer</span>
              </button>
            )}

            {/* Citizen Action: Favourites */}
            {currentUser.role === 'citizen' && (
              <button
                onClick={() => setActiveTab('favourites')}
                className={`relative p-2 rounded-xl border transition-colors ${
                  activeTab === 'favourites'
                    ? 'bg-rose-50 border-rose-300 text-rose-600'
                    : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="Saved Favourites"
              >
                <Heart className="w-5 h-5" />
                {favouritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {favouritesCount}
                  </span>
                )}
              </button>
            )}

            {/* Admin Notifications Badge */}
            {currentUser.role === 'admin' && pendingAdminCount > 0 && (
              <button
                onClick={() => setActiveTab('admin-dashboard')}
                className="relative p-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-800"
                title={`${pendingAdminCount} items pending approval`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {pendingAdminCount}
                </span>
              </button>
            )}

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-300"
                />
                <div className="text-left hidden xl:block pr-1">
                  <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] font-medium text-slate-500 capitalize">
                    {currentUser.role}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-slate-200 p-2 z-50 text-sm animate-in fade-in slide-in-from-top-2"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="font-semibold text-slate-800">{currentUser.name}</p>
                    <p className="text-xs text-slate-500">{currentUser.email}</p>
                    <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      Role: {currentUser.role}
                    </span>
                  </div>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => setActiveTab('admin-dashboard')}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4 text-amber-600" />
                      <span>Admin Overview</span>
                    </button>
                  )}

                  {currentUser.role === 'shop' && (
                    <>
                      <button
                        onClick={() => setActiveTab('shop-dashboard')}
                        className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                        <span>Shop Dashboard</span>
                      </button>
                      <button
                        onClick={onOpenAddOfferModal}
                        className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                      >
                        <PlusCircle className="w-4 h-4 text-emerald-600" />
                        <span>Add New Offer</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={onOpenAuthModal}
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                  >
                    <Store className="w-4 h-4 text-slate-500" />
                    <span>Register New Shop</span>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200/80 space-y-1 animate-in slide-in-from-top">
            {currentUser.role === 'admin' ? (
              <>
                <button
                  onClick={() => { setActiveTab('admin-dashboard'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { setActiveTab('admin-shops'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Shops Approval Queue
                </button>
                <button
                  onClick={() => { setActiveTab('admin-offers'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Offers Approval Queue
                </button>
                <button
                  onClick={() => { setActiveTab('admin-reports'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Customer Reports
                </button>
              </>
            ) : currentUser.role === 'shop' ? (
              <>
                <button
                  onClick={() => { setActiveTab('shop-dashboard'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Shop Dashboard
                </button>
                <button
                  onClick={() => { setActiveTab('shop-offers'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  My Offers
                </button>
                <button
                  onClick={() => { onOpenAddOfferModal(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 rounded-lg text-emerald-600 font-semibold hover:bg-emerald-50"
                >
                  + Add New Offer
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Home
                </button>
                <button
                  onClick={() => { setActiveTab('offers'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Explore Deals
                </button>
                <button
                  onClick={() => { setActiveTab('shops'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Local Shops
                </button>
                <button
                  onClick={() => { setActiveTab('map'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Perinthalmanna Town Map
                </button>
                <button
                  onClick={() => { setActiveTab('favourites'); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  My Saved Deals
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
