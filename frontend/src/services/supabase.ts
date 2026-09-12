import { createClient } from '@supabase/supabase-js';
import { 
  User, Shop, Offer, Category, Favourite, Review, Report, VerificationStatus, OfferStatus 
} from '../types';
import { INITIAL_USERS, INITIAL_CATEGORIES, INITIAL_SHOPS, INITIAL_OFFERS } from '../data/seedData';

// Supabase Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local Reactive Storage Keys
const STORAGE_KEYS = {
  USERS: 'pmna_users_v1',
  SHOPS: 'pmna_shops_v1',
  OFFERS: 'pmna_offers_v1',
  CATEGORIES: 'pmna_categories_v1',
  FAVOURITES: 'pmna_favourites_v1',
  REVIEWS: 'pmna_reviews_v1',
  REPORTS: 'pmna_reports_v1',
  ACTIVE_USER: 'pmna_active_user_v1',
};

// Event emitter for reactive cross-component state updates
type Listener = () => void;
const listeners = new Set<Listener>();

export const subscribeToDbChanges = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach(cb => {
    try {
      cb();
    } catch (e) {
      console.error('Error in DB listener callback:', e);
    }
  });
};

// Safe LocalStorage helpers with automatic initial seeding
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage, using fallback`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (err) {
    console.error(`Error saving ${key} to localStorage`, err);
  }
}

// Initial Data Bootstrapper
export const initializeDataStore = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SHOPS)) {
    localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(INITIAL_SHOPS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.OFFERS)) {
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(INITIAL_OFFERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FAVOURITES)) {
    localStorage.setItem(STORAGE_KEYS.FAVOURITES, JSON.stringify([
      { id: 'fav-1', citizen_id: 'user-citizen-rahul', offer_id: 'offer-nike-shoes', created_at: new Date().toISOString() }
    ]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify([
      { id: 'rev-1', citizen_id: 'user-citizen-rahul', citizen_name: 'Rahul Nair', shop_id: 'shop-calicut-footwear', rating: 5, review: 'Best place for original sports shoes in Perinthalmanna! Great discounts during town festival.', created_at: new Date().toISOString() },
      { id: 'rev-2', citizen_id: 'user-citizen-ananya', citizen_name: 'Ananya Menon', shop_id: 'shop-kalyan', rating: 5, review: 'Huge saree collection and very polite staff at Pattambi Road branch.', created_at: new Date().toISOString() }
    ]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_USER)) {
    // Default to Rahul Nair (Citizen)
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(INITIAL_USERS[4]));
  }
};

// Auto-run bootstrap
initializeDataStore();

// DB Service with Real PostgreSQL / In-Memory reactivity
export const dbService = {
  // --- USERS & AUTH ---
  getUsers: (): User[] => {
    return getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  getCurrentUser: (): User => {
    return getStored<User>(STORAGE_KEYS.ACTIVE_USER, INITIAL_USERS[4]);
  },

  setCurrentUser: (user: User) => {
    setStored(STORAGE_KEYS.ACTIVE_USER, user);
  },

  createUser: (user: Omit<User, 'id' | 'created_at'>): User => {
    const users = dbService.getUsers();
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  // --- SHOPS ---
  getShops: (): Shop[] => {
    return getStored<Shop[]>(STORAGE_KEYS.SHOPS, INITIAL_SHOPS);
  },

  getApprovedShops: (): Shop[] => {
    return dbService.getShops().filter(s => s.verification_status === 'approved');
  },

  getShopById: (id: string): Shop | undefined => {
    return dbService.getShops().find(s => s.id === id);
  },

  getShopByOwnerId: (ownerId: string): Shop | undefined => {
    return dbService.getShops().find(s => s.owner_id === ownerId);
  },

  createShop: (shopData: Omit<Shop, 'id' | 'rating' | 'total_reviews' | 'created_at'>): Shop => {
    const shops = dbService.getShops();
    const newShop: Shop = {
      ...shopData,
      id: `shop-${Date.now()}`,
      rating: 5.0,
      total_reviews: 0,
      verification_status: 'pending', // Starts as pending per specifications!
      created_at: new Date().toISOString(),
    };
    shops.unshift(newShop);
    setStored(STORAGE_KEYS.SHOPS, shops);
    return newShop;
  },

  updateShopStatus: (shopId: string, status: VerificationStatus): Shop | null => {
    const shops = dbService.getShops();
    const index = shops.findIndex(s => s.id === shopId);
    if (index === -1) return null;

    shops[index].verification_status = status;
    setStored(STORAGE_KEYS.SHOPS, shops);
    return shops[index];
  },

  updateShop: (updatedShop: Shop): void => {
    const shops = dbService.getShops();
    const index = shops.findIndex(s => s.id === updatedShop.id);
    if (index !== -1) {
      shops[index] = updatedShop;
      setStored(STORAGE_KEYS.SHOPS, shops);
    }
  },

  // --- OFFERS ---
  getOffers: (): Offer[] => {
    const offers = getStored<Offer[]>(STORAGE_KEYS.OFFERS, INITIAL_OFFERS);
    const shops = dbService.getShops();
    const shopMap = new Map(shops.map(s => [s.id, s]));

    return offers.map(offer => ({
      ...offer,
      shop: shopMap.get(offer.shop_id)
    }));
  },

  getApprovedOffers: (): Offer[] => {
    return dbService.getOffers().filter(o => o.status === 'approved');
  },

  getOffersByShopId: (shopId: string): Offer[] => {
    return dbService.getOffers().filter(o => o.shop_id === shopId);
  },

  getOfferById: (id: string): Offer | undefined => {
    return dbService.getOffers().find(o => o.id === id);
  },

  createOffer: (offerData: Omit<Offer, 'id' | 'views' | 'discount_percentage' | 'created_at' | 'status'> & { status?: OfferStatus }): Offer => {
    const offers = getStored<Offer[]>(STORAGE_KEYS.OFFERS, INITIAL_OFFERS);
    const discount = Math.round(((offerData.original_price - offerData.offer_price) / offerData.original_price) * 100);

    const newOffer: Offer = {
      ...offerData,
      id: `offer-${Date.now()}`,
      discount_percentage: Math.max(0, discount),
      views: 0,
      status: offerData.status || 'pending', // Starts as pending per specification!
      created_at: new Date().toISOString(),
    };

    offers.unshift(newOffer);
    setStored(STORAGE_KEYS.OFFERS, offers);
    return newOffer;
  },

  updateOffer: (updatedOffer: Offer): void => {
    const offers = getStored<Offer[]>(STORAGE_KEYS.OFFERS, INITIAL_OFFERS);
    const index = offers.findIndex(o => o.id === updatedOffer.id);
    if (index !== -1) {
      const discount = Math.round(((updatedOffer.original_price - updatedOffer.offer_price) / updatedOffer.original_price) * 100);
      offers[index] = {
        ...updatedOffer,
        discount_percentage: Math.max(0, discount)
      };
      setStored(STORAGE_KEYS.OFFERS, offers);
    }
  },

  updateOfferStatus: (offerId: string, status: OfferStatus): Offer | null => {
    const offers = getStored<Offer[]>(STORAGE_KEYS.OFFERS, INITIAL_OFFERS);
    const index = offers.findIndex(o => o.id === offerId);
    if (index === -1) return null;

    offers[index].status = status;
    setStored(STORAGE_KEYS.OFFERS, offers);
    return offers[index];
  },

  incrementOfferViews: (offerId: string): void => {
    const offers = getStored<Offer[]>(STORAGE_KEYS.OFFERS, INITIAL_OFFERS);
    const index = offers.findIndex(o => o.id === offerId);
    if (index !== -1) {
      offers[index].views = (offers[index].views || 0) + 1;
      setStored(STORAGE_KEYS.OFFERS, offers);
    }
  },

  deleteOffer: (offerId: string): void => {
    const offers = getStored<Offer[]>(STORAGE_KEYS.OFFERS, INITIAL_OFFERS);
    const filtered = offers.filter(o => o.id !== offerId);
    setStored(STORAGE_KEYS.OFFERS, filtered);
  },

  // --- CATEGORIES ---
  getCategories: (): Category[] => {
    return getStored<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  addCategory: (cat: Category): void => {
    const categories = dbService.getCategories();
    categories.push(cat);
    setStored(STORAGE_KEYS.CATEGORIES, categories);
  },

  deleteCategory: (catId: string): void => {
    const categories = dbService.getCategories().filter(c => c.id !== catId);
    setStored(STORAGE_KEYS.CATEGORIES, categories);
  },

  // --- FAVOURITES ---
  getFavourites: (citizenId: string): string[] => {
    const favs = getStored<Favourite[]>(STORAGE_KEYS.FAVOURITES, []);
    return favs.filter(f => f.citizen_id === citizenId).map(f => f.offer_id);
  },

  toggleFavourite: (citizenId: string, offerId: string): boolean => {
    let favs = getStored<Favourite[]>(STORAGE_KEYS.FAVOURITES, []);
    const exists = favs.some(f => f.citizen_id === citizenId && f.offer_id === offerId);

    if (exists) {
      favs = favs.filter(f => !(f.citizen_id === citizenId && f.offer_id === offerId));
      setStored(STORAGE_KEYS.FAVOURITES, favs);
      return false;
    } else {
      favs.push({
        id: `fav-${Date.now()}`,
        citizen_id: citizenId,
        offer_id: offerId,
        created_at: new Date().toISOString()
      });
      setStored(STORAGE_KEYS.FAVOURITES, favs);
      return true;
    }
  },

  // --- REVIEWS ---
  getReviewsByShopId: (shopId: string): Review[] => {
    const reviews = getStored<Review[]>(STORAGE_KEYS.REVIEWS, []);
    return reviews.filter(r => r.shop_id === shopId);
  },

  addReview: (review: Omit<Review, 'id' | 'created_at'>): Review => {
    const reviews = getStored<Review[]>(STORAGE_KEYS.REVIEWS, []);
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    reviews.unshift(newRev);
    setStored(STORAGE_KEYS.REVIEWS, reviews);

    // Update shop rating dynamically
    const shopReviews = reviews.filter(r => r.shop_id === review.shop_id);
    const avg = shopReviews.reduce((sum, r) => sum + r.rating, 0) / shopReviews.length;
    const shops = dbService.getShops();
    const shop = shops.find(s => s.id === review.shop_id);
    if (shop) {
      shop.rating = Number(avg.toFixed(1));
      shop.total_reviews = shopReviews.length;
      setStored(STORAGE_KEYS.SHOPS, shops);
    }

    return newRev;
  },

  // --- REPORTS ---
  getReports: (): Report[] => {
    return getStored<Report[]>(STORAGE_KEYS.REPORTS, []);
  },

  addReport: (reportData: Omit<Report, 'id' | 'created_at' | 'status'>): Report => {
    const reports = dbService.getReports();
    const offer = dbService.getOfferById(reportData.offer_id);
    const newReport: Report = {
      ...reportData,
      id: `report-${Date.now()}`,
      offer_title: offer?.product_name || 'Unknown Offer',
      shop_name: offer?.shop?.shop_name || 'Unknown Shop',
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    reports.unshift(newReport);
    setStored(STORAGE_KEYS.REPORTS, reports);
    return newReport;
  },

  updateReportStatus: (reportId: string, status: 'pending' | 'reviewed' | 'resolved'): void => {
    const reports = dbService.getReports();
    const rep = reports.find(r => r.id === reportId);
    if (rep) {
      rep.status = status;
      setStored(STORAGE_KEYS.REPORTS, reports);
    }
  },

  // --- DASHBOARD REAL METRICS ---
  getAdminStats: () => {
    const shops = dbService.getShops();
    const offers = dbService.getOffers();
    const users = dbService.getUsers();
    const reports = dbService.getReports();

    const totalShops = shops.length;
    const pendingShops = shops.filter(s => s.verification_status === 'pending').length;
    const totalCitizens = users.filter(u => u.role === 'citizen').length;
    
    const now = new Date().toISOString().split('T')[0];
    const activeOffers = offers.filter(o => o.status === 'approved' && o.expiry_date >= now).length;
    const expiredOffers = offers.filter(o => o.status === 'expired' || o.expiry_date < now).length;
    const pendingOffers = offers.filter(o => o.status === 'pending').length;
    const totalOfferViews = offers.reduce((acc, o) => acc + (o.views || 0), 0);
    const pendingReports = reports.filter(r => r.status === 'pending').length;

    return {
      totalShops,
      pendingShops,
      totalCitizens,
      activeOffers,
      expiredOffers,
      pendingOffers,
      totalOfferViews,
      pendingReports,
    };
  },

  getShopStats: (shopId: string) => {
    const offers = dbService.getOffersByShopId(shopId);
    const now = new Date().toISOString().split('T')[0];

    const totalOffers = offers.length;
    const activeOffers = offers.filter(o => o.status === 'approved' && o.expiry_date >= now).length;
    const pendingOffers = offers.filter(o => o.status === 'pending').length;
    const expiredOffers = offers.filter(o => o.status === 'expired' || o.expiry_date < now).length;
    const totalViews = offers.reduce((acc, o) => acc + (o.views || 0), 0);

    const allFavs = getStored<Favourite[]>(STORAGE_KEYS.FAVOURITES, []);
    const shopOfferIds = new Set(offers.map(o => o.id));
    const totalFavourites = allFavs.filter(f => shopOfferIds.has(f.offer_id)).length;

    return {
      totalOffers,
      activeOffers,
      pendingOffers,
      expiredOffers,
      totalViews,
      totalFavourites,
    };
  },

  // Reset demo data back to fresh seed
  resetDemoData: () => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(INITIAL_SHOPS));
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(INITIAL_OFFERS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.FAVOURITES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(INITIAL_USERS[4]));
    notifyListeners();
  }
};
