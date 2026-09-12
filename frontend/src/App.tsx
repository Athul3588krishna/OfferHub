import React, { useState, useEffect, useMemo } from 'react';
import { 
  Navbar 
} from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { DemoBar } from './components/common/DemoBar';
import { ToastProvider, useToast } from './components/common/Toast';
import { HeroSection } from './components/citizen/HeroSection';
import { CategoryBar } from './components/citizen/CategoryBar';
import { OfferCard } from './components/citizen/OfferCard';
import { OfferDetailModal } from './components/citizen/OfferDetailModal';
import { PerinthalmannaMap } from './components/citizen/PerinthalmannaMap';
import { ShopProfileModal } from './components/citizen/ShopProfileModal';
import { ReportModal } from './components/citizen/ReportModal';
import { AiDealModal } from './components/ai/AiDealModal';
import { AddOfferModal } from './components/shop/AddOfferModal';
import { ShopDashboard } from './components/shop/ShopDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { Offer, Shop, User, Category } from './types';
import { dbService, subscribeToDbChanges } from './services/supabase';
import { 
  Sparkles, Filter, Search, ArrowRight, ShieldCheck, 
  MapPin, Store, Heart, SlidersHorizontal, CheckCircle2 
} from 'lucide-react';

export const AppContent: React.FC = () => {
  const { showToast } = useToast();

  // Active user state
  const [currentUser, setCurrentUser] = useState<User>(() => dbService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('home');

  // Master Data
  const [categories, setCategories] = useState<Category[]>(() => dbService.getCategories());
  const [shops, setShops] = useState<Shop[]>(() => dbService.getShops());
  const [offers, setOffers] = useState<Offer[]>(() => dbService.getApprovedOffers());

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(35000);
  const [sortBy, setSortBy] = useState<'discount' | 'price-asc' | 'price-desc' | 'popular'>('discount');

  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddOfferModalOpen, setIsAddOfferModalOpen] = useState(false);
  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState<Offer | null>(null);
  const [selectedShopIdForProfile, setSelectedShopIdForProfile] = useState<string | null>(null);
  const [selectedOfferForReport, setSelectedOfferForReport] = useState<Offer | null>(null);

  // Sync with DB changes reactively
  const syncData = () => {
    setCategories(dbService.getCategories());
    setShops(dbService.getShops());
    setOffers(dbService.getApprovedOffers());
  };

  useEffect(() => {
    syncData();
    return subscribeToDbChanges(syncData);
  }, []);

  // Filtered offers computation
  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      // Category filter
      if (selectedCategory !== 'all' && offer.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Price filter
      if (offer.offer_price > maxPrice) {
        return false;
      }

      // Search keyword filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${offer.product_name} ${offer.description} ${offer.shop?.shop_name || ''} ${offer.category} ${offer.tags?.join(' ') || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'discount') return b.discount_percentage - a.discount_percentage;
      if (sortBy === 'price-asc') return a.offer_price - b.offer_price;
      if (sortBy === 'price-desc') return b.offer_price - a.offer_price;
      if (sortBy === 'popular') return (b.views || 0) - (a.views || 0);
      return 0;
    });
  }, [offers, selectedCategory, maxPrice, searchQuery, sortBy]);

  // Favourites offers
  const favouriteOffers = useMemo(() => {
    if (currentUser.role !== 'citizen') return [];
    const favIds = new Set(dbService.getFavourites(currentUser.id));
    return offers.filter(o => favIds.has(o.id));
  }, [offers, currentUser]);

  const handleSelectOffer = (offer: Offer) => {
    dbService.incrementOfferViews(offer.id);
    setSelectedOfferForDetail(offer);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAddOfferModal={() => setIsAddOfferModalOpen(true)}
        onLogout={() => {
          const defaultCitizen = dbService.getUsers().find(u => u.role === 'citizen') || dbService.getUsers()[0];
          dbService.setCurrentUser(defaultCitizen);
          setCurrentUser(defaultCitizen);
          setActiveTab('home');
          showToast('Signed out', 'Switched to guest citizen session.', 'info');
        }}
      />

      {/* Main Content Areas based on Active Tab or Role */}
      <main className="flex-1">
        {/* --- ADMIN DASHBOARD VIEW --- */}
        {currentUser.role === 'admin' || activeTab.startsWith('admin') ? (
          <AdminDashboard
            currentUser={currentUser}
            onViewOffer={handleSelectOffer}
          />
        ) : currentUser.role === 'shop' && (activeTab === 'shop-dashboard' || activeTab === 'shop-offers') ? (
          /* --- SHOP OWNER DASHBOARD VIEW --- */
          <ShopDashboard
            currentUser={currentUser}
            onOpenAddOffer={() => setIsAddOfferModalOpen(true)}
            onOpenProfile={() => {
              const shop = dbService.getShopByOwnerId(currentUser.id);
              if (shop) setSelectedShopIdForProfile(shop.id);
            }}
            onViewOffer={handleSelectOffer}
          />
        ) : activeTab === 'favourites' ? (
          /* --- CITIZEN FAVOURITES VIEW --- */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                  <span>My Saved Deals</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Offers you bookmarked for your next visit to Perinthalmanna shops.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                {favouriteOffers.length} Saved
              </span>
            </div>

            {favouriteOffers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {favouriteOffers.map(offer => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    currentUser={currentUser}
                    onViewDetails={handleSelectOffer}
                    onSelectShop={(id) => setSelectedShopIdForProfile(id)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
                <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No deals saved yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse deals in Perinthalmanna and click the heart icon to save them for later!
                </p>
                <button
                  onClick={() => setActiveTab('offers')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-700 transition-colors"
                >
                  Explore Deals
                </button>
              </div>
            )}
          </div>
        ) : activeTab === 'map' ? (
          /* --- DEDICATED TOWN MAP VIEW --- */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-emerald-600" />
                <span>Perinthalmanna Interactive Deals Map</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Explore local stores across Jubilee Junction, Ooty Road, Pattambi Road, and Bypass.
              </p>
            </div>

            <PerinthalmannaMap
              shops={shops.filter(s => s.verification_status === 'approved')}
              offers={offers}
              onSelectOffer={handleSelectOffer}
              onSelectShop={(id) => setSelectedShopIdForProfile(id)}
            />
          </div>
        ) : activeTab === 'shops' ? (
          /* --- SHOPS DIRECTORY VIEW --- */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Verified Local Shops in Perinthalmanna
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Authorized retail stores, fashion boutiques, dining outlets, and supermarkets.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {shops.filter(s => s.verification_status === 'approved').map(shop => {
                const shopOffersCount = offers.filter(o => o.shop_id === shop.id).length;
                return (
                  <div
                    key={shop.id}
                    onClick={() => setSelectedShopIdForProfile(shop.id)}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-400 cursor-pointer transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div className="relative aspect-16/9 bg-slate-100 overflow-hidden">
                      <img
                        src={shop.image_url}
                        alt={shop.shop_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-slate-900 font-bold text-xs shadow-xs">
                        {shop.category.toUpperCase()}
                      </div>
                      <div className="absolute bottom-3 left-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified Store</span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                          {shop.shop_name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{shop.address}</span>
                        </p>
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {shop.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          {shopOffersCount} Active {shopOffersCount === 1 ? 'Deal' : 'Deals'}
                        </span>
                        <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-700 flex items-center gap-1">
                          <span>View Store</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* --- CITIZEN LANDING / HOME & EXPLORE VIEW --- */
          <div className="space-y-12 sm:space-y-16">
            {/* Hero Section */}
            <HeroSection
              onSearch={(term) => {
                setSearchQuery(term);
                const el = document.getElementById('explore-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenAi={() => setIsAiModalOpen(true)}
              onSelectTrendingTag={(tag) => {
                setSearchQuery(tag);
                const el = document.getElementById('explore-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreDeals={() => {
                const el = document.getElementById('explore-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Category Carousel Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Popular Categories
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Shop by department across Perinthalmanna
                  </p>
                </div>
              </div>

              <CategoryBar
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(id) => {
                  setSelectedCategory(id);
                  const el = document.getElementById('explore-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </section>

            {/* AI Callout Banner: "Let AI Find Your Deal" per prompt */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative rounded-3xl bg-gradient-to-r from-indigo-950 via-purple-900 to-slate-950 text-white p-6 sm:p-10 shadow-2xl overflow-hidden border border-indigo-500/30">
                <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="space-y-3 max-w-xl text-center md:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Agentic AI Recommendation Engine</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                      🤖 Let AI Find Your Deal in Perinthalmanna
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Just state your budget and preferences. Our specialized multi-agent pipeline reads real store inventories, compares discounts, and selects the genuine #1 deal.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAiModalOpen(true)}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:scale-105 active:scale-95 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Ask PMNA AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* Main Offers Grid with Filters ("Today's Best Deals") */}
            <section id="explore-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>🔥 Today's Best Deals</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {filteredOffers.length} available
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Verified discounts from authentic shops in Perinthalmanna.
                  </p>
                </div>

                {/* Filter and Sort Controls */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-500 font-medium">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e: any) => setSortBy(e.target.value)}
                      className="py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden"
                    >
                      <option value="discount">Highest Discount %</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="popular">Most Popular</option>
                    </select>
                  </div>

                  {/* Clear filter chip if active */}
                  {(selectedCategory !== 'all' || searchQuery || maxPrice < 35000) && (
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                        setMaxPrice(35000);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Offers Grid */}
              {filteredOffers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredOffers.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      currentUser={currentUser}
                      onViewDetails={handleSelectOffer}
                      onSelectShop={(id) => setSelectedShopIdForProfile(id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
                  <Search className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">No matching offers found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try loosening your search terms or category filter to discover more Perinthalmanna deals.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                      setMaxPrice(35000);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                  >
                    View All Deals
                  </button>
                </div>
              )}
            </section>

            {/* Featured Local Shops in Perinthalmanna */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>🏪 Featured Local Shops</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Prominent authorized merchants across Perinthalmanna town
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('shops')}
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <span>View All Shops</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {shops.filter(s => s.verification_status === 'approved').slice(0, 3).map((shop) => (
                  <div
                    key={shop.id}
                    onClick={() => setSelectedShopIdForProfile(shop.id)}
                    className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-lg transition-all cursor-pointer flex items-center gap-4 group"
                  >
                    <img
                      src={shop.image_url}
                      alt={shop.shop_name}
                      className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        {shop.category}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-emerald-700">
                        {shop.shop_name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{shop.address.split(',')[0].trim()}</p>
                      <p className="text-[11px] font-semibold text-amber-600 mt-1">★ {shop.rating} rating</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Discover Deals Around Perinthalmanna (Interactive Map Preview) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>📍 Discover Deals Around Perinthalmanna</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Visual map of stores on Ooty Road, Jubilee Junction, Pattambi Road & Bypass
                </p>
              </div>

              <PerinthalmannaMap
                shops={shops.filter(s => s.verification_status === 'approved')}
                offers={offers}
                onSelectOffer={handleSelectOffer}
                onSelectShop={(id) => setSelectedShopIdForProfile(id)}
              />
            </section>

            {/* How It Works Section per prompt */}
            <section className="bg-white border-y border-slate-200 py-16">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900">How It Works</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Three simple steps to save on every local purchase.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-lg flex items-center justify-center mx-auto">
                      1
                    </div>
                    <h4 className="text-base font-bold text-slate-900">1. Search</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Tell us what you need or enter your budget in plain words.
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-lg flex items-center justify-center mx-auto">
                      2
                    </div>
                    <h4 className="text-base font-bold text-slate-900">2. AI Finds</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Our Agentic AI searches, scores, and compares real local offers.
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 font-black text-lg flex items-center justify-center mx-auto">
                      3
                    </div>
                    <h4 className="text-base font-bold text-slate-900">3. Save & Visit</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Choose the best deal, get map directions, and visit the verified shop.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenAi={() => setIsAiModalOpen(true)}
        onExploreDeals={() => {
          setActiveTab('home');
          setTimeout(() => {
            const el = document.getElementById('explore-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
      />

      {/* Hackathon Quick-Switcher Bar (Super convenient for live demo evaluation!) */}
      <DemoBar
        currentUser={currentUser}
        onSwitchUser={(user) => {
          setCurrentUser(user);
          if (user.role === 'admin') setActiveTab('admin-dashboard');
          else if (user.role === 'shop') setActiveTab('shop-dashboard');
          else setActiveTab('home');
        }}
        onOpenAi={() => setIsAiModalOpen(true)}
      />

      {/* Modals */}
      <AiDealModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSelectOffer={handleSelectOffer}
      />

      <AddOfferModal
        isOpen={isAddOfferModalOpen}
        onClose={() => setIsAddOfferModalOpen(false)}
        currentUser={currentUser}
        categories={categories}
        onOfferAdded={(newOffer) => {
          setOffers(dbService.getOffers());
        }}
      />

      <OfferDetailModal
        offer={selectedOfferForDetail}
        currentUser={currentUser}
        onClose={() => setSelectedOfferForDetail(null)}
        onOpenReportModal={(offer) => setSelectedOfferForReport(offer)}
        onSelectShop={(id) => setSelectedShopIdForProfile(id)}
      />

      <ShopProfileModal
        shopId={selectedShopIdForProfile}
        currentUser={currentUser}
        onClose={() => setSelectedShopIdForProfile(null)}
        onSelectOffer={handleSelectOffer}
      />

      <ReportModal
        offer={selectedOfferForReport}
        currentUser={currentUser}
        onClose={() => setSelectedOfferForReport(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        categories={categories}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'admin') setActiveTab('admin-dashboard');
          else if (user.role === 'shop') setActiveTab('shop-dashboard');
          else setActiveTab('home');
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
