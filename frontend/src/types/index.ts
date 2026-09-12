export type UserRole = 'admin' | 'citizen' | 'shop';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface Shop {
  id: string;
  owner_id: string;
  shop_name: string;
  owner_name: string;
  phone: string;
  email: string;
  category: string;
  address: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  description: string;
  image_url: string;
  rating: number;
  total_reviews: number;
  verification_status: VerificationStatus;
  created_at: string;
}

export type OfferStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface Offer {
  id: string;
  shop_id: string;
  product_name: string;
  category: string;
  description: string;
  original_price: number;
  offer_price: number;
  discount_percentage: number;
  image_url: string;
  start_date: string;
  expiry_date: string;
  stock_status?: string;
  terms?: string;
  tags?: string[];
  views: number;
  status: OfferStatus;
  created_at: string;
  shop?: Shop;
}

export interface Favourite {
  id: string;
  citizen_id: string;
  offer_id: string;
  created_at: string;
}

export interface Review {
  id: string;
  citizen_id: string;
  citizen_name?: string;
  shop_id: string;
  rating: number;
  review: string;
  created_at: string;
}

export interface Report {
  id: string;
  citizen_id: string;
  offer_id: string;
  offer_title?: string;
  shop_name?: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'offer' | 'approval' | 'system';
  created_at: string;
  read: boolean;
  link_url?: string;
}

// AI Multi-Agent Types
export interface AIIntent {
  raw_query: string;
  category: string | null;
  budget_max: number | null;
  product_keywords: string[];
  preferences: string[];
  location_hint: string | null;
}

export interface ComparisonMetrics {
  budget_fitness: number; // 0 - 100
  discount_depth: number;  // 0 - 100
  shop_credibility: number; // 0 - 100
  proximity_score: number; // 0 - 100
  overall_score: number;   // 0 - 100
}

export interface ScoredOffer {
  offer: Offer;
  metrics: ComparisonMetrics;
  rationale_points: string[];
}

export interface AIDealRecommendation {
  intent: AIIntent;
  best_deal: Offer;
  best_deal_metrics: ComparisonMetrics;
  why_this_deal: string[];
  alternatives: {
    offer: Offer;
    reason: string;
    metrics: ComparisonMetrics;
  }[];
  summary: string;
}

export interface AgentProgressStep {
  id: number;
  agentName: string;
  title: string;
  description: string;
  status: 'waiting' | 'in-progress' | 'completed';
}
