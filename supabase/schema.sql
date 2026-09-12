-- =========================================================
-- PMNA Deals: Supabase Database Schema
-- Hojathon Series 1 - Agentic AI Hackathon 2026
-- Perinthalmanna Local Offers Platform
-- =========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'citizen', 'shop')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SHOPS TABLE
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    shop_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    category VARCHAR(50) REFERENCES public.categories(id) ON DELETE SET NULL,
    address TEXT NOT NULL,
    landmark VARCHAR(255),
    latitude NUMERIC(10, 7) NOT NULL DEFAULT 10.9760,
    longitude NUMERIC(10, 7) NOT NULL DEFAULT 76.2254,
    description TEXT,
    image_url TEXT,
    rating NUMERIC(2, 1) DEFAULT 4.8,
    total_reviews INTEGER DEFAULT 0,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. OFFERS TABLE
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    original_price NUMERIC(10, 2) NOT NULL CHECK (original_price > 0),
    offer_price NUMERIC(10, 2) NOT NULL CHECK (offer_price >= 0),
    discount_percentage INTEGER GENERATED ALWAYS AS (ROUND(((original_price - offer_price) / original_price) * 100)) STORED,
    image_url TEXT NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE NOT NULL,
    stock_status VARCHAR(50) DEFAULT 'In Stock',
    terms TEXT,
    tags TEXT[],
    views INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. FAVOURITES TABLE
CREATE TABLE IF NOT EXISTS public.favourites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(citizen_id, offer_id)
);

-- 7. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. INDEXES FOR HIGH-PERFORMANCE SEARCH & QUERIES
CREATE INDEX IF NOT EXISTS idx_offers_status_category ON public.offers(status, category);
CREATE INDEX IF NOT EXISTS idx_offers_shop_id ON public.offers(shop_id);
CREATE INDEX IF NOT EXISTS idx_offers_offer_price ON public.offers(offer_price);
CREATE INDEX IF NOT EXISTS idx_shops_status ON public.shops(verification_status);
CREATE INDEX IF NOT EXISTS idx_favourites_citizen ON public.favourites(citizen_id);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Public can read approved shops and approved offers
CREATE POLICY "Public can view approved shops" ON public.shops FOR SELECT USING (verification_status = 'approved');
CREATE POLICY "Public can view approved offers" ON public.offers FOR SELECT USING (status = 'approved');
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can view reviews" ON public.reviews FOR SELECT USING (true);

-- Authenticated Users can create/read their own favourites
CREATE POLICY "Citizens can manage their own favourites" ON public.favourites FOR ALL USING (auth.uid() = citizen_id);

-- Shop Owners can manage their own offers
CREATE POLICY "Shop owners can manage their own offers" ON public.offers FOR ALL USING (
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = offers.shop_id AND shops.owner_id = auth.uid())
);
