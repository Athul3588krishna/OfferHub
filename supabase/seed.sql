-- =========================================================
-- PMNA Deals: Seed Data for Perinthalmanna
-- Real shops, landmarks, coordinates, and offers
-- =========================================================

-- 1. Insert Categories
INSERT INTO public.categories (id, name, icon, description) VALUES
('fashion', 'Fashion & Apparel', 'Shirt', 'Trending ethnic wear, casuals, branded clothing & bridal collections'),
('electronics', 'Electronics & Appliances', 'Tv', 'Smart TVs, sound systems, home appliances & gadgets'),
('mobiles', 'Mobiles & Accessories', 'Smartphone', '5G smartphones, chargers, smartwatches & cases'),
('footwear', 'Footwear', 'Footprints', 'Sports shoes, leather sandals, formal wear & sneakers'),
('food', 'Food & Dining', 'UtensilsCrossed', 'Authentic Malabar biryani, shawarma, cafes & bakery treats'),
('grocery', 'Supermarket & Grocery', 'ShoppingBag', 'Daily essentials, fresh organic fruits, vegetables & provisions'),
('beauty', 'Beauty & Personal Care', 'Sparkles', 'Skincare, haircare, perfumes & grooming kits'),
('restaurants', 'Restaurants & Cafes', 'Coffee', 'Dine-in deals, combo meals, coffee & dessert spots'),
('home', 'Home & Furniture', 'Home', 'Sofas, dining tables, decor & mattresses'),
('sports', 'Sports & Fitness', 'Trophy', 'Gym wear, cricket bats, football boots & supplements'),
('other', 'Other Services', 'Tag', 'Stationery, gifts, books & specialized repair services')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Users (Admin, Shop Owners, Citizens)
INSERT INTO public.users (id, name, email, phone, role) VALUES
('11111111-1111-1111-1111-111111111111', 'Admin Perinthalmanna', 'admin@pmnadeals.in', '+91 94470 12345', 'admin'),
('22222222-2222-2222-2222-222222222221', 'Shamsudheen K.', 'oxygen.pmna@gmail.com', '+91 98471 22334', 'shop'),
('22222222-2222-2222-2222-222222222222', 'Praveen Kalyan', 'kalyan.pmna@gmail.com', '+91 98472 33445', 'shop'),
('22222222-2222-2222-2222-222222222223', 'Mujeeb Rahman', 'calicutfootwear.pmna@gmail.com', '+91 98473 44556', 'shop'),
('22222222-2222-2222-2222-222222222224', 'Chef Rasheed', 'albaikexpress.pmna@gmail.com', '+91 98474 55667', 'shop'),
('22222222-2222-2222-2222-222222222225', 'Vinod Grand', 'grandhyper.pmna@gmail.com', '+91 98475 66778', 'shop'),
('33333333-3333-3333-3333-333333333331', 'Rahul Nair', 'rahul.perinthalmanna@gmail.com', '+91 97451 11223', 'citizen'),
('33333333-3333-3333-3333-333333333332', 'Ananya Menon', 'ananya.m@gmail.com', '+91 97452 22334', 'citizen')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Verified Perinthalmanna Shops
INSERT INTO public.shops (id, owner_id, shop_name, owner_name, phone, email, category, address, landmark, latitude, longitude, description, image_url, rating, total_reviews, verification_status) VALUES
('44444444-4444-4444-4444-444444444441', '22222222-2222-2222-2222-222222222221', 'Oxygen Digital Shop', 'Shamsudheen K.', '+91 98471 22334', 'oxygen.pmna@gmail.com', 'mobiles', 'Ooty Road, Near Bus Stand, Perinthalmanna', 'Opposite Municipal Bus Stand', 10.9765, 76.2250, 'Premier digital showroom for latest laptops, 5G smartphones, smart accessories and Apple products in Malappuram district.', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80', 4.9, 128, 'approved'),
('44444444-4444-4444-4444-444444444442', '22222222-2222-2222-2222-222222222222', 'Kalyan Silks Perinthalmanna', 'Praveen Kalyan', '+91 98472 33445', 'kalyan.pmna@gmail.com', 'fashion', 'Pattambi Road, Perinthalmanna', 'Near KSRTC Depot', 10.9740, 76.2235, 'South India’s finest wedding saree destination, partywear, kids wear, and festive men’s traditional collections.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80', 4.8, 94, 'approved'),
('44444444-4444-4444-4444-444444444443', '22222222-2222-2222-2222-222222222223', 'Calicut Footwear Hub', 'Mujeeb Rahman', '+91 98473 44556', 'calicutfootwear.pmna@gmail.com', 'footwear', 'Jubilee Junction, Calicut Road, Perinthalmanna', 'Beside Jubilee Mission Hospital Road', 10.9782, 76.2271, 'Authentic multi-brand footwear store stocking Nike, Puma, Adidas, Woodland, and premium ethnic leather shoes.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', 4.7, 86, 'approved'),
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222224', 'Al-Baik Express & Arabian Grills', 'Chef Rasheed', '+91 98474 55667', 'albaikexpress.pmna@gmail.com', 'food', 'Bypass Road, Near Poly Junction, Perinthalmanna', 'Near Metro Medical Centre', 10.9795, 76.2210, 'Famous for crispy broast chicken, authentic Lebanese Shawarma, Kuzhimanthi, and refreshing fresh mocktails.', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80', 4.8, 142, 'approved'),
('44444444-4444-4444-4444-444444444445', '22222222-2222-2222-2222-222222222225', 'Grand Hypermarket PMNA', 'Vinod Grand', '+91 98475 66778', 'grandhyper.pmna@gmail.com', 'grocery', 'Court Road, Perinthalmanna', 'Adjacent to Town Police Station', 10.9730, 76.2268, 'All-in-one departmental hypermarket for fresh Malabar groceries, imported snacks, kitchenware, and daily essentials.', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80', 4.6, 76, 'approved')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Verified Active Offers
INSERT INTO public.offers (id, shop_id, product_name, category, description, original_price, offer_price, image_url, start_date, expiry_date, stock_status, terms, tags, views, status) VALUES
('55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444443', 'Nike Air Max Men Running Shoes', 'footwear', 'Breathable lightweight mesh running shoes with responsive Zoom Air cushioning. Perfect for daily jogging, gym workouts and casual streetwear.', 4999.00, 2499.00, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '10 days', '12 Pairs Left', 'Offer valid only for in-store walk-ins at Jubilee Junction branch while stocks last.', ARRAY['Nike', 'Sports Shoes', 'Footwear', 'Running', 'Discount'], 245, 'approved'),
('55555555-5555-5555-5555-555555555552', '44444444-4444-4444-4444-444444444441', 'OnePlus Nord CE4 5G (8GB/128GB)', 'mobiles', 'Snapdragon 7 Gen 3, 100W SUPERVOOC fast charging, 50MP Sony LYT-600 OIS camera. Free tempered glass and protective back cover included.', 24999.00, 19499.00, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '7 days', '8 Units in Stock', 'Includes 1 Year official manufacturer warranty and zero-cost EMI options.', ARRAY['5G Phone', 'OnePlus', 'Mobile', 'Camera', 'Offer'], 430, 'approved'),
('55555555-5555-5555-5555-555555555553', '44444444-4444-4444-4444-444444444442', 'Kanchipuram Silk Festive Saree', 'fashion', 'Hand-woven pure zari border silk saree with traditional peacock and floral motifs. Ideal for weddings, receptions and family celebrations.', 7999.00, 4499.00, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '14 days', 'Limited Edition', 'Complimentary matching unstitched blouse piece included.', ARRAY['Silk Saree', 'Ethnic Wear', 'Wedding', 'Kalyan Silks', 'Fashion'], 312, 'approved'),
('55555555-5555-5555-5555-555555555554', '44444444-4444-4444-4444-444444444444', 'Family Feast Combo: 4 Broast + Fries + Dip', 'food', '4-Piece signature golden crispy fried chicken broast, jumbo peri-peri french fries, garlic mayo dip and 500ml fresh lime pitcher.', 799.00, 499.00, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '5 days', 'Available Daily 4 PM - 11 PM', 'Dine-in and takeaway only. One voucher per table.', ARRAY['Broast', 'Fast Food', 'Dinner Combo', 'Al-Baik', 'Discounts'], 520, 'approved'),
('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444441', 'Sony WH-1000XM5 Wireless ANC Headphones', 'electronics', 'Industry-leading Active Noise Canceling with 8 microphones, 30-hour battery life, and crystal-clear hands-free calling.', 34990.00, 26990.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '12 days', '5 Pieces Available', 'Comes with hard travel case and auxiliary cable.', ARRAY['Sony', 'Noise Cancelling', 'Bluetooth Headphones', 'Audio'], 190, 'approved'),
('55555555-5555-5555-5555-555555555556', '44444444-4444-4444-4444-444444444445', 'Organic Cold-Pressed Coconut Oil (2 Litres)', 'grocery', 'Pure wooden cold-pressed Virgin Kerala Coconut oil extracted from fresh sun-dried copra. Zero chemicals and preservative-free.', 850.00, 599.00, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80', CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE + INTERVAL '20 days', 'Fresh Batch 50 Bottles', 'Maximum 2 units per customer.', ARRAY['Coconut Oil', 'Organic Grocery', 'Cooking Oil', 'Grand Hypermarket'], 160, 'approved'),
('55555555-5555-5555-5555-555555555557', '44444444-4444-4444-4444-444444444443', 'Puma Rebound Unisex Casual High-Tops', 'footwear', 'Retro basketball-inspired high top sneakers with plush cushioned collar and durable rubber traction sole.', 3999.00, 1999.00, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '8 days', 'Sizes 6 to 10 UK', '100% genuine Puma product with brand box.', ARRAY['Puma', 'Sneakers', 'Casual Shoes', 'Under 2000', 'Footwear'], 380, 'approved')
ON CONFLICT (id) DO NOTHING;
