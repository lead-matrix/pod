-- =====================================================
-- SEED: ThreadDrop Production Data
-- Safe to run multiple times (upsert-based)
-- =====================================================

-- Update categories (slug-based upsert since name+slug must be unique)
INSERT INTO public.categories (name, slug, description, sort_order, is_active)
VALUES
  ('Hoodies',       'hoodies',       'Heavyweight oversized hoodies',             1, true),
  ('Tees',          'tees',          'Boxy organic cotton tees',                  2, true),
  ('Caps',          'caps',          'Structured streetwear caps',                3, true),
  ('Techwear',      'techwear',      'Technical tactical streetwear',             4, true),
  ('Capsule Drops', 'capsule-drops', 'Limited edition exclusive capsules',        5, true)
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order  = EXCLUDED.sort_order,
  is_active   = EXCLUDED.is_active;

-- Insert products (slug-based upsert)
INSERT INTO public.products (name, slug, description, category_id, base_price, is_active, is_featured, tags)
SELECT
  p.name, p.slug, p.description,
  c.id AS category_id,
  p.base_price, p.is_active, p.is_featured, p.tags
FROM (VALUES
  ('Cyberpunk Tech Hoodie',    'cyberpunk-tech-hoodie',    'Premium 480gsm heavyweight fleece hoodie. Custom cybernetic grid print, glowing hot-pink circuitboard typography.',       'hoodies',       69.00, true, true,  ARRAY['cyberpunk','hoodie','neon','featured']),
  ('Y2K Liquid Chrome Tee',   'y2k-liquid-chrome-tee',    '240gsm 100% organic cotton box-fit tee. Liquid chrome tribal heart print with matte-gloss contrast overlay.',            'tees',          39.00, true, true,  ARRAY['y2k','tee','chrome','featured']),
  ('Vaporwave Sculpture Cap',  'vaporwave-sculpture-cap',  '6-panel structured streetwear cap with flat brim and snap closure. Embroidered vaporwave marble statue logo.',           'caps',          29.00, true, true,  ARRAY['cap','vaporwave','featured']),
  ('Techwear Alpha Vest',      'techwear-alpha-vest',      'Military-grade techwear tactical vest. 6 utility pockets, D-ring hardware, water-resistant shell.',                      'techwear',      89.00, true, true,  ARRAY['techwear','vest','tactical','featured']),
  ('Neo-Tokyo Crewneck',       'neo-tokyo-crewneck',       'Relaxed fit 380gsm fleece crewneck. Distressed Tokyo skyline silkscreen with neon orange and violet fade.',              'hoodies',       55.00, true, false, ARRAY['crewneck','neon','neo-tokyo']),
  ('Glitch Static Oversized Tee', 'glitch-static-oversized-tee', 'Ultra-oversized 260gsm jersey tee. Full-back glitch static scan-line graphic with corrupted barcode branding.', 'tees',          44.00, true, false, ARRAY['glitch','tee','oversized']),
  ('Acid Wash Trucker Cap',    'acid-wash-trucker-cap',    'Vintage-washed mesh trucker cap. Front panel acid-washed canvas with embossed brand glyph.',                            'caps',          34.00, true, false, ARRAY['cap','acid','trucker']),
  ('Obsidian Varsity Jacket',  'obsidian-varsity-jacket',  'Premium bomber-collar varsity jacket. Obsidian satin shell with white leather sleeves. Embroidered neon samurai crest.','capsule-drops', 149.00,true, true,  ARRAY['varsity','capsule','exclusive','limited','featured']),
  ('Chrome Grid Long Sleeve',  'chrome-grid-long-sleeve',  'Heavyweight 300gsm long sleeve tee. All-over chrome grid print with holographic centre chest logo.',                    'capsule-drops', 59.00, true, true,  ARRAY['longsleeve','capsule','chrome','featured'])
) AS p(name, slug, description, category_slug, base_price, is_active, is_featured, tags)
JOIN public.categories c ON c.slug = p.category_slug
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  base_price  = EXCLUDED.base_price,
  is_active   = EXCLUDED.is_active,
  is_featured = EXCLUDED.is_featured,
  tags        = EXCLUDED.tags;

-- Insert variants (sku-based upsert)
INSERT INTO public.product_variants (product_id, size, color, color_hex, sku, retail_price, compare_at_price, in_stock, stock_level)
SELECT
  pr.id,
  v.size, v.color, v.color_hex, v.sku,
  v.retail_price, v.compare_at_price, v.in_stock, v.stock_level
FROM (VALUES
  ('cyberpunk-tech-hoodie',    'M',        'Pitch Black', '#080808', 'CYB-HD-M',   69.00,  89.00, true, 25),
  ('cyberpunk-tech-hoodie',    'L',        'Pitch Black', '#080808', 'CYB-HD-L',   69.00,  89.00, true, 18),
  ('y2k-liquid-chrome-tee',    'M',        'Acid Gray',   '#242526', 'Y2K-GRY-M',  39.00,  49.00, true, 30),
  ('y2k-liquid-chrome-tee',    'L',        'Acid Gray',   '#242526', 'Y2K-GRY-L',  39.00,  49.00, true, 42),
  ('vaporwave-sculpture-cap',  'One Size', 'Pitch Black', '#080808', 'VAP-CAP-BLK',29.00,  35.00, true, 50),
  ('techwear-alpha-vest',      'M',        'Acid Gray',   '#242526', 'TW-VEST-M',  89.00, 109.00, true, 8),
  ('neo-tokyo-crewneck',       'L',        'Pitch Black', '#080808', 'NEO-CRW-L',  55.00,  69.00, true, 17),
  ('glitch-static-oversized-tee','M',      'Pitch Black', '#080808', 'GLT-BLK-M',  44.00,  55.00, true, 35),
  ('acid-wash-trucker-cap',    'One Size', 'Acid Gray',   '#242526', 'ACD-TRK',    34.00,  40.00, true, 45),
  ('obsidian-varsity-jacket',  'L',        'Pitch Black', '#080808', 'OBS-VAR-L', 149.00, 199.00, true, 4),
  ('chrome-grid-long-sleeve',  'M',        'Pitch Black', '#080808', 'CHR-LS-M',   59.00,  75.00, true, 7)
) AS v(product_slug, size, color, color_hex, sku, retail_price, compare_at_price, in_stock, stock_level)
JOIN public.products pr ON pr.slug = v.product_slug
ON CONFLICT (sku) DO UPDATE SET
  size              = EXCLUDED.size,
  color             = EXCLUDED.color,
  color_hex         = EXCLUDED.color_hex,
  retail_price      = EXCLUDED.retail_price,
  compare_at_price  = EXCLUDED.compare_at_price,
  in_stock          = EXCLUDED.in_stock,
  stock_level       = EXCLUDED.stock_level;
