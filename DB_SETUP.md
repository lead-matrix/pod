# Database Setup Guide — Supabase Schema & Policies

This guide provides steps to configure the Supabase database, run the initial schema structure, set Row Level Security (RLS), and seed the initial drops.

---

## 1. Automated Deployment via Supabase CLI

If you have the Supabase CLI installed, you can apply all migrations in `supabase/migrations/` directly:

```bash
# Link CLI to your hosted Supabase project
supabase link --project-ref your-project-id

# Push all local migrations to the remote database
supabase db push
```

---

## 2. Manual Deployment via SQL Editor

If you prefer to configure manually, go to the **SQL Editor** on your Supabase dashboard and run the migrations in order:

### A. Run Migration 01: Core Schema
Copy and execute the content from [001_initial_schema.sql](file:///f:/GIT/POD/supabase/migrations/001_initial_schema.sql). This SQL script creates:
1. `profiles` — User profile details, flags for admins.
2. `categories` — Product categories (Hoodies, Tees, Caps, etc.).
3. `products` — General print-on-demand products linked to Printful.
4. `product_variants` — Product variant records (size, color, price, stock).
5. `product_images` — Image URLs per variant.
6. `orders` — Client orders records.
7. `order_items` — Itemized order lines.
8. Triggers to auto-create user profiles upon auth signup.

### B. Run Migration 02: Row Level Security (RLS)
Copy and execute the content from [002_rls_policies.sql](file:///f:/GIT/POD/supabase/migrations/002_rls_policies.sql). This SQL script applies security rules:
- **Profiles**: Users can read and write only their own profiles.
- **Products & Categories**: Anyone can read active products. Only admins can write/delete.
- **Orders & Items**: Users can read and write only their own orders. Admins can read all orders.

### C. Run Migration 03: Storage Buckets
Copy and execute the content from [003_storage_buckets.sql](file:///f:/GIT/POD/supabase/migrations/003_storage_buckets.sql). This SQL script creates storage buckets for:
- `designs` — Holds the print design source files.
- `mockups` — Holds generated mockups.
- `avatars` — Holds user profile pictures.

---

## 3. Seed Initial Demo Drops

Once the tables are created, execute this script in the SQL Editor to seed the 5 categories and 9 streetwear products into the remote database:

```sql
-- Insert Categories
INSERT INTO categories (id, name, slug, description) VALUES
('cat-hoodies', 'Hoodies', 'hoodies', 'Heavyweight oversized hoodies'),
('cat-tees', 'Tees', 'tees', 'Boxy organic cotton tees'),
('cat-caps', 'Caps', 'caps', 'Structured streetwear caps'),
('cat-techwear', 'Techwear', 'techwear', 'Technical tactical streetwear'),
('cat-capsule', 'Capsule Drops', 'capsule-drops', 'Limited edition exclusive capsules')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  slug = EXCLUDED.slug, 
  description = EXCLUDED.description;

-- Insert Products
INSERT INTO products (id, name, slug, description, category_id, base_price, is_active, is_featured, tags) VALUES
('prod-cyber-hoodie', 'Cyberpunk Tech Hoodie', 'cyberpunk-tech-hoodie', 'Premium 480gsm heavyweight fleece hoodie. Custom cybernetic grid print, glowing hot-pink circuitboard typography, kangaroo pocket with hidden zip.', 'cat-hoodies', 69.00, true, true, ARRAY['cyberpunk', 'hoodie', 'neon', 'featured']),
('prod-y2k-tee', 'Y2K Liquid Chrome Tee', 'y2k-liquid-chrome-tee', '240gsm 100% organic cotton box-fit tee. Liquid chrome tribal heart print with matte-gloss contrast overlay. Ribbed crew neck, double-stitched sleeve hems.', 'cat-tees', 39.00, true, true, ARRAY['y2k', 'tee', 'chrome', 'featured']),
('prod-sculpture-cap', 'Vaporwave Sculpture Cap', 'vaporwave-sculpture-cap', '6-panel structured streetwear cap with flat brim and snap closure. Front embroidered vaporwave marble statue logo with pastel gradient threads.', 'cat-caps', 29.00, true, true, ARRAY['cap', 'vaporwave', 'featured']),
('prod-techwear-vest', 'Techwear Alpha Vest', 'techwear-alpha-vest', 'Military-grade techwear tactical vest. Minimalist geometric vector panel branding, 6 utility pockets, D-ring hardware, water-resistant shell.', 'cat-techwear', 89.00, true, true, ARRAY['techwear', 'vest', 'tactical', 'featured']),
('prod-neon-crewneck', 'Neo-Tokyo Crewneck', 'neo-tokyo-crewneck', 'Relaxed fit 380gsm fleece crewneck sweatshirt. Distressed Tokyo skyline silkscreen print with neon orange and violet accent fade.', 'cat-hoodies', 55.00, true, false, ARRAY['crewneck', 'neon', 'neo-tokyo']),
('prod-glitch-tee', 'Glitch Static Oversized Tee', 'glitch-static-oversized-tee', 'Ultra-oversized 260gsm cotton jersey tee. Full-back glitch static scan-line graphic with corrupted barcode branding down the left sleeve.', 'cat-tees', 44.00, true, false, ARRAY['glitch', 'tee', 'oversized']),
('prod-acid-trucker', 'Acid Wash Trucker Cap', 'acid-wash-trucker-cap', 'Vintage-washed mesh trucker cap with pre-curved brim. Front panel acid-washed canvas with embossed brand glyph.', 'cat-caps', 34.00, true, false, ARRAY['cap', 'acid', 'trucker']),
('prod-obsidian-varsity', 'Obsidian Varsity Jacket', 'obsidian-varsity-jacket', 'Premium bomber-collar varsity jacket. Obsidian black satin shell with contrast white leather sleeves. Embroidered back graphic of neon samurai crest.', 'cat-capsule', 149.00, true, true, ARRAY['varsity', 'capsule', 'exclusive', 'limited', 'featured']),
('prod-chrome-longsleeve', 'Chrome Grid Long Sleeve', 'chrome-grid-long-sleeve', 'Heavyweight 300gsm cotton long sleeve tee. All-over chrome grid print with holographic centre chest logo. Garment-dyed in volcanic black.', 'cat-capsule', 59.00, true, true, ARRAY['longsleeve', 'capsule', 'chrome', 'featured'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  base_price = EXCLUDED.base_price,
  is_active = EXCLUDED.is_active,
  is_featured = EXCLUDED.is_featured,
  tags = EXCLUDED.tags;

-- Insert Product Variants (Example variant sizes)
INSERT INTO product_variants (id, product_id, size, color, color_hex, sku, retail_price, compare_at_price, in_stock, stock_level) VALUES
('var-cyb-h-m', 'prod-cyber-hoodie', 'M', 'Pitch Black', '#080808', 'CYB-HD-M', 69.00, 89.00, true, 25),
('var-cyb-h-l', 'prod-cyber-hoodie', 'L', 'Pitch Black', '#080808', 'CYB-HD-L', 69.00, 89.00, true, 18),
('var-y2k-m', 'prod-y2k-tee', 'M', 'Acid Gray', '#242526', 'Y2K-GRY-M', 39.00, 49.00, true, 30),
('var-y2k-l', 'prod-y2k-tee', 'L', 'Acid Gray', '#242526', 'Y2K-GRY-L', 39.00, 49.00, true, 42),
('var-cap-blk', 'prod-sculpture-cap', 'One Size', 'Pitch Black', '#080808', 'VAP-CAP-BLK', 29.00, 35.00, true, 50),
('var-vest-m', 'prod-techwear-vest', 'M', 'Acid Gray', '#242526', 'TW-VEST-M', 89.00, 109.00, true, 8),
('var-neo-l', 'prod-neon-crewneck', 'L', 'Pitch Black', '#080808', 'NEO-CRW-L', 55.00, 69.00, true, 17),
('var-glt-m', 'prod-glitch-tee', 'M', 'Pitch Black', '#080808', 'GLT-BLK-M', 44.00, 55.00, true, 35),
('var-acid-cap', 'prod-acid-trucker', 'One Size', 'Acid Gray', '#242526', 'ACD-TRK', 34.00, 40.00, true, 45),
('var-vars-l', 'prod-obsidian-varsity', 'L', 'Pitch Black', '#080808', 'OBS-VAR-L', 149.00, 199.00, true, 4),
('var-cls-m', 'prod-chrome-longsleeve', 'M', 'Pitch Black', '#080808', 'CHR-LS-M', 59.00, 75.00, true, 7)
ON CONFLICT (id) DO NOTHING;
```

---

## 4. Grant Admin Permissions manually

To turn a registered profile into an administrator, execute this SQL statement replacing with the email address of the account:

```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'admin@yourdomain.com';
```
This grants access to the `/admin` path for creating products, synchronizing catalogs, and managing customer orders.
