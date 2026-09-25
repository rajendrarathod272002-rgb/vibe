-- ========================================================
-- VYBE SQL Schema: Categories, Types, Products & Auctions
-- Brand Tagline: "Crafted Beyond Ordinary"
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xvgzbauxaqfkqfqslker/sql
-- ========================================================

-- 1. Ensure categories table has all required columns (Level 1: Brand Lines)
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    theme_color VARCHAR(20) DEFAULT '#8A2BE2',
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to categories if table already existed
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- 2. Create types table (Level 2: Sub-categories inside each top category)
CREATE TABLE IF NOT EXISTS public.types (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES public.categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, slug)
);

-- 3. Update products table with category_id, type_id and auction columns (Level 3: Products)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category_id INT REFERENCES public.categories(id),
ADD COLUMN IF NOT EXISTS type_id INT REFERENCES public.types(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS sale_type TEXT DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS auction_end_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS starting_bid NUMERIC,
ADD COLUMN IF NOT EXISTS current_bid NUMERIC,
ADD COLUMN IF NOT EXISTS highest_bidder_name TEXT,
ADD COLUMN IF NOT EXISTS highest_bidder_phone TEXT;

-- 4. Create bids table
CREATE TABLE IF NOT EXISTS public.bids (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    bidder_name TEXT NOT NULL,
    bidder_phone TEXT NOT NULL,
    bid_amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Seed default 3 Top Categories (Brand Lines)
INSERT INTO public.categories (id, name, slug, theme_color, logo_url, is_active, sort_order)
VALUES 
    (1, 'VYBE Everyday', 'everyday', '#FF8C00', '/assets/images/everyday_logo.jpg', true, 1),
    (2, 'VYBE Studio', 'studio', '#00BFFF', '/assets/images/studio_logo.jpg', true, 2),
    (3, 'VYBE Signature', 'signature', '#8A2BE2', '/assets/images/signature_logo.jpg', true, 3)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name,
    theme_color = EXCLUDED.theme_color,
    logo_url = EXCLUDED.logo_url,
    is_active = true,
    sort_order = EXCLUDED.sort_order;

-- 6. Seed default Types under each Category with rectangular image URLs
-- Under Everyday
INSERT INTO public.types (category_id, name, slug, image_url, sort_order, is_active) VALUES
((SELECT id FROM public.categories WHERE slug='everyday'), 'Men Fashion', 'men-fashion', 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400', 1, true),
((SELECT id FROM public.categories WHERE slug='everyday'), 'Women', 'women', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400', 2, true),
((SELECT id FROM public.categories WHERE slug='everyday'), 'Kids', 'kids', 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400', 3, true),
((SELECT id FROM public.categories WHERE slug='everyday'), 'Casual Wear', 'casual-wear', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400', 4, true)
ON CONFLICT (category_id, slug) DO UPDATE SET image_url = EXCLUDED.image_url, name = EXCLUDED.name;

-- Under Studio
INSERT INTO public.types (category_id, name, slug, image_url, sort_order, is_active) VALUES
((SELECT id FROM public.categories WHERE slug='studio'), 'Formal Shirts', 'formal-shirts', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', 1, true),
((SELECT id FROM public.categories WHERE slug='studio'), 'Blazers', 'blazers', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400', 2, true),
((SELECT id FROM public.categories WHERE slug='studio'), 'Party Wear', 'party-wear', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400', 3, true),
((SELECT id FROM public.categories WHERE slug='studio'), 'Footwear', 'footwear', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400', 4, true)
ON CONFLICT (category_id, slug) DO UPDATE SET image_url = EXCLUDED.image_url, name = EXCLUDED.name;

-- Under Signature
INSERT INTO public.types (category_id, name, slug, image_url, sort_order, is_active) VALUES
((SELECT id FROM public.categories WHERE slug='signature'), 'Premium Suits', 'premium-suits', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', 1, true),
((SELECT id FROM public.categories WHERE slug='signature'), 'Watches', 'watches', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400', 2, true),
((SELECT id FROM public.categories WHERE slug='signature'), 'Jewelry', 'jewelry', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400', 3, true),
((SELECT id FROM public.categories WHERE slug='signature'), 'Accessories', 'accessories', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400', 4, true)
ON CONFLICT (category_id, slug) DO UPDATE SET image_url = EXCLUDED.image_url, name = EXCLUDED.name;

-- 7. Enable Row Level Security (RLS) policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- categories policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Allow public read categories') THEN
        CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Allow public all categories') THEN
        CREATE POLICY "Allow public all categories" ON public.categories FOR ALL USING (true);
    END IF;

    -- types policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'types' AND policyname = 'Allow public read types') THEN
        CREATE POLICY "Allow public read types" ON public.types FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'types' AND policyname = 'Allow public all types') THEN
        CREATE POLICY "Allow public all types" ON public.types FOR ALL USING (true);
    END IF;

    -- products policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Allow public read products') THEN
        CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Allow public all products') THEN
        CREATE POLICY "Allow public all products" ON public.products FOR ALL USING (true);
    END IF;

    -- bids policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bids' AND policyname = 'Allow public read access to bids') THEN
        CREATE POLICY "Allow public read access to bids" ON public.bids FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bids' AND policyname = 'Allow public insert to bids') THEN
        CREATE POLICY "Allow public insert to bids" ON public.bids FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- 8. Enable Realtime Publications for live updates
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.types;
    EXCEPTION WHEN duplicate_object THEN END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
    EXCEPTION WHEN duplicate_object THEN END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
    EXCEPTION WHEN duplicate_object THEN END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    EXCEPTION WHEN duplicate_object THEN END;
END $$;
