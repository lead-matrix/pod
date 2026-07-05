import { supabase } from '../lib/supabase'
import { generateSlug } from '../lib/utils'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  sort_order: number
  is_primary: boolean
  color: string | null
}

export interface ProductVariant {
  id: string
  product_id: string
  printful_sync_variant_id: number | null
  printful_variant_id: number
  size: string
  color: string | null
  color_hex: string | null
  sku: string | null
  retail_price: number
  compare_at_price: number | null
  in_stock: boolean
  stock_level: number | null
  image_url: string | null
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  category_id: string | null
  printful_sync_product_id: number | null
  printful_catalog_id: number | null
  printful_store_id: string | null
  design_file_url: string | null
  design_file_path: string | null
  thumbnail_url: string | null
  is_active: boolean
  is_featured: boolean
  tags: string[]
  seo_title: string | null
  seo_description: string | null
  base_price: number | null
  created_at: string
  updated_at: string
  category?: Category
  product_variants?: ProductVariant[]
  product_images?: ProductImage[]
}

// ─── Pagination ────────────────────────────────────────────────
export interface PaginationOptions {
  page?: number   // 1-based
  pageSize?: number
}

// ─── High-Fashion Streetwear Demo Datasets ───────────────────
export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-hoodies',    name: 'Hoodies',      slug: 'hoodies',      description: 'Heavyweight oversized hoodies',       image_url: null },
  { id: 'cat-tees',       name: 'Tees',          slug: 'tees',          description: 'Boxy organic cotton tees',             image_url: null },
  { id: 'cat-caps',       name: 'Caps',          slug: 'caps',          description: 'Structured streetwear caps',           image_url: null },
  { id: 'cat-techwear',   name: 'Techwear',      slug: 'techwear',      description: 'Technical tactical streetwear',        image_url: null },
  { id: 'cat-capsule',    name: 'Capsule Drops', slug: 'capsule-drops', description: 'Limited edition exclusive capsules',   image_url: null },
]

export const MOCK_PRODUCTS: Product[] = [
  // ── DROP 01 ──────────────────────────────────────────────────
  {
    id: 'prod-cyber-hoodie',
    name: 'Cyberpunk Tech Hoodie',
    slug: 'cyberpunk-tech-hoodie',
    description: 'Premium 480gsm heavyweight fleece hoodie. Custom cybernetic grid print, glowing hot-pink circuitboard typography, kangaroo pocket with hidden zip. Oversized boxy fit — drop shoulders, brushed interior for supreme warmth.',
    category_id: 'cat-hoodies',
    printful_sync_product_id: 101, printful_catalog_id: 201, printful_store_id: 'store-1',
    design_file_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    design_file_path: 'cyberpunk.png',
    thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    is_active: true, is_featured: true,
    tags: ['cyberpunk', 'hoodie', 'neon', 'featured'],
    seo_title: 'Cyberpunk Tech Hoodie | ThreadDrop',
    seo_description: 'Futuristic oversized heavyweight hoodie with cyberpunk circuit print.',
    base_price: 69,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'cat-hoodies', name: 'Hoodies', slug: 'hoodies', description: null, image_url: null },
    product_variants: [
      { id: 'var-cyb-h-s',  product_id: 'prod-cyber-hoodie', printful_sync_variant_id: null, printful_variant_id: 4001, size: 'S',   color: 'Pitch Black', color_hex: '#080808', sku: 'CYB-HD-S',  retail_price: 69, compare_at_price: 89, in_stock: true,  stock_level: 12, image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80' },
      { id: 'var-cyb-h-m',  product_id: 'prod-cyber-hoodie', printful_sync_variant_id: null, printful_variant_id: 4002, size: 'M',   color: 'Pitch Black', color_hex: '#080808', sku: 'CYB-HD-M',  retail_price: 69, compare_at_price: 89, in_stock: true,  stock_level: 25, image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80' },
      { id: 'var-cyb-h-l',  product_id: 'prod-cyber-hoodie', printful_sync_variant_id: null, printful_variant_id: 4003, size: 'L',   color: 'Pitch Black', color_hex: '#080808', sku: 'CYB-HD-L',  retail_price: 69, compare_at_price: 89, in_stock: true,  stock_level: 18, image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80' },
      { id: 'var-cyb-h-xl', product_id: 'prod-cyber-hoodie', printful_sync_variant_id: null, printful_variant_id: 4004, size: 'XL',  color: 'Pitch Black', color_hex: '#080808', sku: 'CYB-HD-XL', retail_price: 69, compare_at_price: 89, in_stock: false, stock_level: 0,  image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80' },
    ],
    product_images: [
      { id: 'img-cyb-h1', product_id: 'prod-cyber-hoodie', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80', alt_text: 'Cyberpunk Hoodie Front', sort_order: 1, is_primary: true,  color: 'Pitch Black' },
      { id: 'img-cyb-h2', product_id: 'prod-cyber-hoodie', url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80', alt_text: 'Cyberpunk Hoodie Worn', sort_order: 2, is_primary: false, color: 'Pitch Black' },
    ]
  },

  // ── DROP 02 ──────────────────────────────────────────────────
  {
    id: 'prod-y2k-tee',
    name: 'Y2K Liquid Chrome Tee',
    slug: 'y2k-liquid-chrome-tee',
    description: '240gsm 100% organic cotton box-fit tee. Liquid chrome tribal heart print with matte-gloss contrast overlay. Ribbed crew neck, double-stitched sleeve hems. Preshrunk for true-to-size fit.',
    category_id: 'cat-tees',
    printful_sync_product_id: 102, printful_catalog_id: 202, printful_store_id: 'store-1',
    design_file_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80',
    design_file_path: 'y2k.png',
    thumbnail_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80',
    is_active: true, is_featured: true,
    tags: ['y2k', 'tee', 'chrome', 'featured'],
    seo_title: 'Y2K Liquid Chrome Tee | ThreadDrop',
    seo_description: 'Box fit heavyweight Y2K-inspired chrome tribal tee.',
    base_price: 39,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'cat-tees', name: 'Tees', slug: 'tees', description: null, image_url: null },
    product_variants: [
      { id: 'var-y2k-s',  product_id: 'prod-y2k-tee', printful_sync_variant_id: null, printful_variant_id: 4010, size: 'S',   color: 'Acid Gray',     color_hex: '#242526', sku: 'Y2K-GRY-S',  retail_price: 39, compare_at_price: 49, in_stock: true, stock_level: 20, image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80' },
      { id: 'var-y2k-m',  product_id: 'prod-y2k-tee', printful_sync_variant_id: null, printful_variant_id: 4011, size: 'M',   color: 'Acid Gray',     color_hex: '#242526', sku: 'Y2K-GRY-M',  retail_price: 39, compare_at_price: 49, in_stock: true, stock_level: 30, image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80' },
      { id: 'var-y2k-l',  product_id: 'prod-y2k-tee', printful_sync_variant_id: null, printful_variant_id: 4012, size: 'L',   color: 'Acid Gray',     color_hex: '#242526', sku: 'Y2K-GRY-L',  retail_price: 39, compare_at_price: 49, in_stock: true, stock_level: 42, image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80' },
      { id: 'var-y2k-wm', product_id: 'prod-y2k-tee', printful_sync_variant_id: null, printful_variant_id: 4013, size: 'M',   color: 'Eggshell White', color_hex: '#f4f4f0', sku: 'Y2K-WHT-M',  retail_price: 39, compare_at_price: 49, in_stock: true, stock_level: 15, image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80' },
    ],
    product_images: [
      { id: 'img-y2k-1', product_id: 'prod-y2k-tee', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80', alt_text: 'Y2K Tee Design',  sort_order: 1, is_primary: true,  color: 'Acid Gray' },
      { id: 'img-y2k-2', product_id: 'prod-y2k-tee', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80', alt_text: 'Y2K Tee Worn',    sort_order: 2, is_primary: false, color: 'Acid Gray' },
    ]
  },

  // ── DROP 03 ──────────────────────────────────────────────────
  {
    id: 'prod-sculpture-cap',
    name: 'Vaporwave Sculpture Cap',
    slug: 'vaporwave-sculpture-cap',
    description: '6-panel structured streetwear cap with flat brim and snap closure. Front embroidered vaporwave marble statue logo with pastel gradient threads. 100% brushed cotton with moisture-wicking sweat band.',
    category_id: 'cat-caps',
    printful_sync_product_id: 103, printful_catalog_id: 203, printful_store_id: 'store-1',
    design_file_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    design_file_path: 'vaporcap.png',
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    is_active: true, is_featured: true,
    tags: ['cap', 'vaporwave', 'featured'],
    seo_title: 'Vaporwave Sculpture Cap | ThreadDrop',
    seo_description: 'Structured streetwear cap with embroidered marble statue vaporwave logo.',
    base_price: 29,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'cat-caps', name: 'Caps', slug: 'caps', description: null, image_url: null },
    product_variants: [
      { id: 'var-cap-blk', product_id: 'prod-sculpture-cap', printful_sync_variant_id: null, printful_variant_id: 4020, size: 'One Size', color: 'Pitch Black',    color_hex: '#080808', sku: 'VAP-CAP-BLK', retail_price: 29, compare_at_price: 35, in_stock: true, stock_level: 50, image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80' },
      { id: 'var-cap-wht', product_id: 'prod-sculpture-cap', printful_sync_variant_id: null, printful_variant_id: 4021, size: 'One Size', color: 'Eggshell White', color_hex: '#f4f4f0', sku: 'VAP-CAP-WHT', retail_price: 29, compare_at_price: 35, in_stock: true, stock_level: 30, image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80' },
    ],
    product_images: [
      { id: 'img-cap-1', product_id: 'prod-sculpture-cap', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80', alt_text: 'Sculpture Cap Design', sort_order: 1, is_primary: true,  color: 'Pitch Black' },
      { id: 'img-cap-2', product_id: 'prod-sculpture-cap', url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80', alt_text: 'Cap Worn Side View',   sort_order: 2, is_primary: false, color: 'Pitch Black' },
    ]
  },

  // ── DROP 04 ──────────────────────────────────────────────────
  {
    id: 'prod-techwear-vest',
    name: 'Techwear Alpha Vest',
    slug: 'techwear-alpha-vest',
    description: 'Military-grade techwear tactical vest. Minimalist geometric vector panel branding, 6 utility pockets, D-ring hardware, reinforced YKK zips. Water-resistant shell. The urban utility centrepiece.',
    category_id: 'cat-techwear',
    printful_sync_product_id: 104, printful_catalog_id: 204, printful_store_id: 'store-1',
    design_file_url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&auto=format&fit=crop&q=80',
    design_file_path: 'techwear.png',
    thumbnail_url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&auto=format&fit=crop&q=80',
    is_active: true, is_featured: true,
    tags: ['techwear', 'vest', 'tactical', 'featured'],
    seo_title: 'Techwear Alpha Vest | ThreadDrop',
    seo_description: 'Military-inspired tactical techwear utility vest.',
    base_price: 89,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'cat-techwear', name: 'Techwear', slug: 'techwear', description: null, image_url: null },
    product_variants: [
      { id: 'var-vest-m',  product_id: 'prod-techwear-vest', printful_sync_variant_id: null, printful_variant_id: 4030, size: 'M',  color: 'Acid Gray',   color_hex: '#242526', sku: 'TW-VEST-M',  retail_price: 89, compare_at_price: 109, in_stock: true, stock_level: 8,  image_url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&auto=format&fit=crop&q=80' },
      { id: 'var-vest-l',  product_id: 'prod-techwear-vest', printful_sync_variant_id: null, printful_variant_id: 4031, size: 'L',  color: 'Acid Gray',   color_hex: '#242526', sku: 'TW-VEST-L',  retail_price: 89, compare_at_price: 109, in_stock: true, stock_level: 5,  image_url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&auto=format&fit=crop&q=80' },
      { id: 'var-vest-xl', product_id: 'prod-techwear-vest', printful_sync_variant_id: null, printful_variant_id: 4032, size: 'XL', color: 'Pitch Black', color_hex: '#080808', sku: 'TW-VEST-XL', retail_price: 89, compare_at_price: 109, in_stock: true, stock_level: 3,  image_url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&auto=format&fit=crop&q=80' },
    ],
    product_images: [
      { id: 'img-vest-1', product_id: 'prod-techwear-vest', url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=800&auto=format&fit=crop&q=80', alt_text: 'Techwear Vest', sort_order: 1, is_primary: true, color: 'Acid Gray' },
    ]
  },

  // ── DROP 05 ──────────────────────────────────────────────────
  {
    id: 'prod-neon-crewneck',
    name: 'Neo-Tokyo Crewneck',
    slug: 'neo-tokyo-crewneck',
    description: 'Relaxed fit 380gsm fleece crewneck sweatshirt. Distressed Tokyo skyline silkscreen print with neon orange and violet accent fade. Ribbed cuffs and hem, no-fade dye, enzyme-washed finish.',
    category_id: 'cat-hoodies',
    printful_sync_product_id: 105, printful_catalog_id: 205, printful_store_id: 'store-1',
    design_file_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    design_file_path: 'neotokyo.png',
    thumbnail_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    is_active: true, is_featured: false,
    tags: ['crewneck', 'neon', 'neo-tokyo'],
    seo_title: 'Neo-Tokyo Crewneck | ThreadDrop',
    seo_description: 'Relaxed fleece crewneck with distressed Tokyo skyline print.',
    base_price: 55,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'cat-hoodies', name: 'Hoodies', slug: 'hoodies', description: null, image_url: null },
    product_variants: [
      { id: 'var-neo-m',  product_id: 'prod-neon-crewneck', printful_sync_variant_id: null, printful_variant_id: 4040, size: 'M',  color: 'Pitch Black', color_hex: '#080808', sku: 'NEO-CRW-M',  retail_price: 55, compare_at_price: 69, in_stock: true, stock_level: 22, image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80' },
      { id: 'var-neo-l',  product_id: 'prod-neon-crewneck', printful_sync_variant_id: null, printful_variant_id: 4041, size: 'L',  color: 'Pitch Black', color_hex: '#080808', sku: 'NEO-CRW-L',  retail_price: 55, compare_at_price: 69, in_stock: true, stock_level: 17, image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80' },
      { id: 'var-neo-xl', product_id: 'prod-neon-crewneck', printful_sync_variant_id: null, printful_variant_id: 4042, size: 'XL', color: 'Pitch Black', color_hex: '#080808', sku: 'NEO-CRW-XL', retail_price: 55, compare_at_price: 69, in_stock: true, stock_level: 9,  image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80' },
    ],
    product_images: [
      { id: 'img-neo-1', product_id: 'prod-neon-crewneck', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80', alt_text: 'Crewneck Design',    sort_order: 1, is_primary: true,  color: 'Pitch Black' },
      { id: 'img-neo-2', product_id: 'prod-neon-crewneck', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80', alt_text: 'Crewneck Side View', sort_order: 2, is_primary: false, color: 'Pitch Black' },
    ]
  },

  // ── DROP 06 ──────────────────────────────────────────────────
  {
    id: 'prod-glitch-tee',
    name: 'Glitch Static Oversized Tee',
    slug: 'glitch-static-oversized-tee',
    description: 'Ultra-oversized 260gsm cotton jersey tee. Full-back glitch static scan-line graphic with corrupted barcode branding down the left sleeve. Dropped shoulder, raw cut hem.',
    category_id: 'cat-tees',
    printful_sync_product_id: 106, printful_catalog_id: 206, printful_store_id: 'store-1',
    design_file_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80',
    design_file_path: 'glitch.png',
    thumbnail_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80',
    is_active: true, is_featured: false,
    tags: ['glitch', 'tee', 'oversized'],
    seo_title: 'Glitch Static Oversized Tee | ThreadDrop',
    seo_description: 'Oversized glitch static graphic tee with barcode sleeve branding.',
    base_price: 44,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'cat-tees', name: 'Tees', slug: 'tees', description: null, image_url: null },
    product_variants: [
      { id: 'var-glt-m',  product_id: 'prod-glitch-tee', printful_sync_variant_id: null, printful_variant_id: 4050, size: 'M',   color: 'Pitch Black',    color_hex: '#080808', sku: 'GLT-BLK-M',  retail_price: 44, compare_at_price: 55, in_stock: true,  stock_level: 35, image_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80' },
      { id: 'var-glt-l',  product_id: 'prod-glitch-tee', printful_sync_variant_id: null, printful_variant_id: 4051, size: 'L',   color: 'Pitch Black',    color_hex: '#080808', sku: 'GLT-BLK-L',  retail_price: 44, compare_at_price: 55, in_stock: true,  stock_level: 28, image_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80' },
      { id: 'var-glt-wm', product_id: 'prod-glitch-tee', printful_sync_variant_id: null, printful_variant_id: 4052, size: 'M',   color: 'Eggshell White', color_hex: '#f4f4f0', sku: 'GLT-WHT-M',  retail_price: 44, compare_at_price: 55, in_stock: false, stock_level: 0,  image_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80' },
    ],
    product_images: [
      { id: 'img-glt-1', product_id: 'prod-glitch-tee', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80', alt_text: 'Glitch Tee Flat Lay', sort_order: 1, is_primary: true, color: 'Pitch Black' },
    ]
  },

  // ── DROP 07 ──────────────────────────────────────────────────
  {
    id: 'prod-acid-trucker',
    name: 'Acid Wash Trucker Cap',
    slug: 'acid-wash-trucker-cap',
    description: 'Vintage-washed mesh trucker cap with pre-curved brim. Front panel acid-washed canvas with embossed brand glyph. Snap closure, breathable mesh back. Unisex one-size.',
    category_id: 'cat-caps',
    printful_sync_product_id: 107, printful_catalog_id: 207, printful_store_id: 'store-1',
    design_file_url: 'https://images.unsplash.com/photo-1618005198143-e528346d9a59?w=600&auto=format&fit=crop&q=80',
    design_file_path: 'acid-cap.png',
    thumbnail_url: 'https://images.unsplash.com/photo-1618005198143-e528346d9a59?w=600&auto=format&fit=crop&q=80',
    is_active: true, is_featured: false,
    tags: ['cap', 'acid', 'trucker'],
    seo_title: 'Acid Wash Trucker Cap | ThreadDrop',
    seo_description: 'Vintage-washed mesh trucker cap with embossed brand glyph.',
    base_price: 34,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'cat-caps', name: 'Caps', slug: 'caps', description: null, image_url: null },
    product_variants: [
      { id: 'var-acid-cap', product_id: 'prod-acid-trucker', printful_sync_variant_id: null, printful_variant_id: 4060, size: 'One Size', color: 'Acid Gray', color_hex: '#242526', sku: 'ACD-TRK', retail_price: 34, compare_at_price: 40, in_stock: true, stock_level: 45, image_url: 'https://images.unsplash.com/photo-1618005198143-e528346d9a59?w=600&auto=format&fit=crop&q=80' },
    ],
    product_images: [
      { id: 'img-acid-cap-1', product_id: 'prod-acid-trucker', url: 'https://images.unsplash.com/photo-1618005198143-e528346d9a59?w=800&auto=format&fit=crop&q=80', alt_text: 'Acid Wash Trucker Cap', sort_order: 1, is_primary: true, color: 'Acid Gray' },
    ]
  },

  // ── DROP 08 — Capsule Exclusive ──────────────────────────────
  {
    id: 'prod-obsidian-varsity',
    name: 'Obsidian Varsity Jacket',
    slug: 'obsidian-varsity-jacket',
    description: '★ CAPSULE EXCLUSIVE — 50 pieces only. ★ Premium bomber-collar varsity jacket. Obsidian black satin shell with contrast white leather sleeves. Embroidered back graphic of neon samurai crest. Snap buttons, ribbed cuffs and hem.',
    category_id: 'cat-capsule',
    printful_sync_product_id: 108, printful_catalog_id: 208, printful_store_id: 'store-1',
    design_file_url: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&auto=format&fit=crop&q=80',
    design_file_path: 'varsity.png',
    thumbnail_url: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&auto=format&fit=crop&q=80',
    is_active: true, is_featured: true,
    tags: ['varsity', 'capsule', 'exclusive', 'limited', 'featured'],
    seo_title: 'Obsidian Varsity Jacket — Capsule Drop | ThreadDrop',
    seo_description: 'Limited 50-piece capsule varsity jacket. Satin shell, leather sleeves, samurai crest embroidery.',
    base_price: 149,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'cat-capsule', name: 'Capsule Drops', slug: 'capsule-drops', description: null, image_url: null },
    product_variants: [
      { id: 'var-vars-m',  product_id: 'prod-obsidian-varsity', printful_sync_variant_id: null, printful_variant_id: 4070, size: 'M',  color: 'Pitch Black', color_hex: '#080808', sku: 'OBS-VAR-M',  retail_price: 149, compare_at_price: 199, in_stock: true, stock_level: 6, image_url: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&auto=format&fit=crop&q=80' },
      { id: 'var-vars-l',  product_id: 'prod-obsidian-varsity', printful_sync_variant_id: null, printful_variant_id: 4071, size: 'L',  color: 'Pitch Black', color_hex: '#080808', sku: 'OBS-VAR-L',  retail_price: 149, compare_at_price: 199, in_stock: true, stock_level: 4, image_url: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&auto=format&fit=crop&q=80' },
      { id: 'var-vars-xl', product_id: 'prod-obsidian-varsity', printful_sync_variant_id: null, printful_variant_id: 4072, size: 'XL', color: 'Pitch Black', color_hex: '#080808', sku: 'OBS-VAR-XL', retail_price: 149, compare_at_price: 199, in_stock: true, stock_level: 2, image_url: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&auto=format&fit=crop&q=80' },
    ],
    product_images: [
      { id: 'img-vars-1', product_id: 'prod-obsidian-varsity', url: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&auto=format&fit=crop&q=80', alt_text: 'Varsity Jacket Front', sort_order: 1, is_primary: true, color: 'Pitch Black' },
    ]
  },

  // ── DROP 09 — Capsule Exclusive ──────────────────────────────
  {
    id: 'prod-chrome-longsleeve',
    name: 'Chrome Grid Long Sleeve',
    slug: 'chrome-grid-long-sleeve',
    description: '★ CAPSULE — Final restock. ★ Heavyweight 300gsm cotton long sleeve tee. All-over chrome grid print with holographic centre chest logo. Garment-dyed in volcanic black with colour fade to dark navy at hem.',
    category_id: 'cat-capsule',
    printful_sync_product_id: 109, printful_catalog_id: 209, printful_store_id: 'store-1',
    design_file_url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&auto=format&fit=crop&q=80',
    design_file_path: 'chrome-ls.png',
    thumbnail_url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&auto=format&fit=crop&q=80',
    is_active: true, is_featured: true,
    tags: ['longsleeve', 'capsule', 'chrome', 'featured'],
    seo_title: 'Chrome Grid Long Sleeve — Capsule | ThreadDrop',
    seo_description: 'All-over chrome grid long sleeve with holographic logo. Capsule restock.',
    base_price: 59,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updated_at: new Date().toISOString(),
    category: { id: 'cat-capsule', name: 'Capsule Drops', slug: 'capsule-drops', description: null, image_url: null },
    product_variants: [
      { id: 'var-cls-m',  product_id: 'prod-chrome-longsleeve', printful_sync_variant_id: null, printful_variant_id: 4080, size: 'M',  color: 'Pitch Black', color_hex: '#080808', sku: 'CHR-LS-M',  retail_price: 59, compare_at_price: 75, in_stock: true,  stock_level: 7, image_url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&auto=format&fit=crop&q=80' },
      { id: 'var-cls-l',  product_id: 'prod-chrome-longsleeve', printful_sync_variant_id: null, printful_variant_id: 4081, size: 'L',  color: 'Pitch Black', color_hex: '#080808', sku: 'CHR-LS-L',  retail_price: 59, compare_at_price: 75, in_stock: true,  stock_level: 5, image_url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&auto=format&fit=crop&q=80' },
      { id: 'var-cls-xl', product_id: 'prod-chrome-longsleeve', printful_sync_variant_id: null, printful_variant_id: 4082, size: 'XL', color: 'Pitch Black', color_hex: '#080808', sku: 'CHR-LS-XL', retail_price: 59, compare_at_price: 75, in_stock: false, stock_level: 0, image_url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&auto=format&fit=crop&q=80' },
    ],
    product_images: [
      { id: 'img-cls-1', product_id: 'prod-chrome-longsleeve', url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=800&auto=format&fit=crop&q=80', alt_text: 'Chrome Grid Long Sleeve', sort_order: 1, is_primary: true, color: 'Pitch Black' },
    ]
  },
]

export const productsApi = {
  getCategories: async (): Promise<Category[]> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error || !data || data.length === 0) {
        return MOCK_CATEGORIES
      }
      return data as Category[]
    } catch (e) {
      return MOCK_CATEGORIES
    }
  },

  // FIX #1: Eliminate N+1 – resolve category via a nested filter instead of
  // a separate round-trip; also accepts stable primitives for the query key.
  getProducts: async (options?: {
    categorySlug?: string
    featuredOnly?: boolean
    search?: string
    page?: number
    pageSize?: number
  }): Promise<Product[]> => {
    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? 24
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    try {
      let query = supabase
        .from('products')
        .select('*, category:categories!inner(*)')
        .eq('is_active', true)
        .range(from, to)
        .order('created_at', { ascending: false })

      if (options?.featuredOnly) {
        query = query.eq('is_featured', true)
      }

      // FIX: Filter by category slug directly via the join – no extra query
      if (options?.categorySlug) {
        query = query.eq('categories.slug', options.categorySlug)
      }

      if (options?.search) {
        query = query.ilike('name', `%${options.search}%`)
      }

      const { data, error } = await query
      if (error || !data || data.length === 0) {
        let list = [...MOCK_PRODUCTS]
        if (options?.featuredOnly) {
          list = list.filter(p => p.is_featured)
        }
        if (options?.categorySlug) {
          list = list.filter(p => p.category?.slug === options.categorySlug)
        }
        if (options?.search) {
          list = list.filter(p => p.name.toLowerCase().includes(options.search!.toLowerCase()))
        }
        return list
      }
      return data as Product[]
    } catch (e) {
      let list = [...MOCK_PRODUCTS]
      if (options?.featuredOnly) {
        list = list.filter(p => p.is_featured)
      }
      if (options?.categorySlug) {
        list = list.filter(p => p.category?.slug === options.categorySlug)
      }
      if (options?.search) {
        list = list.filter(p => p.name.toLowerCase().includes(options.search!.toLowerCase()))
      }
      return list
    }
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*), product_variants(*), product_images(*)')
        .eq('slug', slug)
        .single()

      if (error || !data) {
        const match = MOCK_PRODUCTS.find(p => p.slug === slug)
        if (match) return match
        throw new Error('Product not found')
      }
      return data as Product
    } catch (e) {
      const match = MOCK_PRODUCTS.find(p => p.slug === slug)
      if (match) return match
      throw new Error('Product not found')
    }
  },

  // FIX #7: Pagination for admin list
  getAdminProducts: async (options?: PaginationOptions): Promise<Product[]> => {
    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? 50
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error
    return data as Product[]
  },

  getAdminProductById: async (id: string): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*), product_images(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Product
  },

  createProduct: async (
    product: Omit<Product, 'id' | 'slug' | 'created_at' | 'updated_at'>,
    variants: Array<Omit<ProductVariant, 'id' | 'product_id'>>,
    images: Array<Omit<ProductImage, 'id' | 'product_id'>>
  ): Promise<Product> => {
    const slug = generateSlug(product.name)

    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert({ ...product, slug })
      .select()
      .single()

    if (productError) throw productError

    // FIX #8: Batch inserts instead of sequential loops
    if (variants.length > 0) {
      const variantPayload = variants.map((v) => ({ ...v, product_id: newProduct.id }))
      const { error: variantError } = await supabase.from('product_variants').insert(variantPayload)
      if (variantError) throw variantError
    }

    if (images.length > 0) {
      const imagePayload = images.map((img) => ({ ...img, product_id: newProduct.id }))
      const { error: imageError } = await supabase.from('product_images').insert(imagePayload)
      if (imageError) throw imageError
    }

    return newProduct as Product
  },

  // FIX #8: Replace sequential loops with batch UPSERT operations
  updateProduct: async (
    id: string,
    product: Partial<Product>,
    variants?: Array<Partial<ProductVariant> & { id?: string }>,
    images?: Array<Partial<ProductImage> & { id?: string }>
  ): Promise<void> => {
    const { error: productError } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)

    if (productError) throw productError

    if (variants && variants.length > 0) {
      const toUpdate = variants.filter((v) => v.id)
      const toInsert = variants.filter((v) => !v.id)

      // Batch upsert existing variants
      if (toUpdate.length > 0) {
        const { error } = await supabase
          .from('product_variants')
          .upsert(toUpdate.map((v) => ({ ...v, product_id: id })), { onConflict: 'id' })
        if (error) throw error
      }

      // Batch insert new variants
      if (toInsert.length > 0) {
        const { error } = await supabase
          .from('product_variants')
          .insert(toInsert.map((v) => ({ ...v, product_id: id })))
        if (error) throw error
      }
    }

    if (images && images.length > 0) {
      const toUpdate = images.filter((img) => img.id)
      const toInsert = images.filter((img) => !img.id)

      // Batch upsert existing images
      if (toUpdate.length > 0) {
        const { error } = await supabase
          .from('product_images')
          .upsert(toUpdate.map((img) => ({ ...img, product_id: id })), { onConflict: 'id' })
        if (error) throw error
      }

      // Batch insert new images
      if (toInsert.length > 0) {
        const { error } = await supabase
          .from('product_images')
          .insert(toInsert.map((img) => ({ ...img, product_id: id })))
        if (error) throw error
      }
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  },
}
