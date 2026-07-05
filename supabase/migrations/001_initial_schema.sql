-- ============================================================
-- Migration 001: Initial Schema
-- POD Store — ThreadDrop
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ─────────────────────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  email         text not null,
  full_name     text,
  avatar_url    text,
  role          text not null default 'customer' check (role in ('admin', 'customer')),
  phone         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────────────────────
create table public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  slug        text not null unique,
  description text,
  image_url   text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

insert into public.categories (name, slug, sort_order) values
  ('T-Shirts', 't-shirts', 1),
  ('Hoodies', 'hoodies', 2),
  ('Sweatshirts', 'sweatshirts', 3),
  ('Hats', 'hats', 4),
  ('Accessories', 'accessories', 5),
  ('Bags', 'bags', 6);

-- ─────────────────────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────────────────────
create table public.products (
  id                      uuid primary key default uuid_generate_v4(),
  name                    text not null,
  slug                    text not null unique,
  description             text,
  category_id             uuid references public.categories(id) on delete set null,

  -- Printful sync
  printful_sync_product_id  bigint unique,
  printful_catalog_id       int,         -- base catalog product id
  printful_store_id         text,

  -- Design file (stored in Supabase Storage)
  design_file_url         text,
  design_file_path        text,         -- storage path

  -- Display
  thumbnail_url           text,         -- primary product image
  is_active               boolean not null default false,  -- draft until mockups ready
  is_featured             boolean not null default false,
  tags                    text[] default '{}',

  -- SEO
  seo_title               text,
  seo_description         text,

  -- Pricing (base — variants override)
  base_price              numeric(10,2),

  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index on public.products(category_id);
create index on public.products(is_active);
create index on public.products(is_featured);
create index on public.products using gin(tags);
create index on public.products using gin(to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'')));

-- ─────────────────────────────────────────────────────────────
-- PRODUCT VARIANTS (Size/Color combos)
-- ─────────────────────────────────────────────────────────────
create table public.product_variants (
  id                        uuid primary key default uuid_generate_v4(),
  product_id                uuid not null references public.products(id) on delete cascade,

  -- Printful
  printful_sync_variant_id  bigint unique,
  printful_variant_id       bigint not null,  -- catalog variant id
  printful_product_id       bigint,

  -- Display
  size                      text not null,
  color                     text,
  color_hex                 text,
  sku                       text,

  -- Pricing
  retail_price              numeric(10,2) not null,
  compare_at_price          numeric(10,2),

  -- Inventory
  in_stock                  boolean not null default true,
  stock_level               int,

  -- Variant image (color swatch / mockup)
  image_url                 text,

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index on public.product_variants(product_id);
create index on public.product_variants(in_stock);

-- ─────────────────────────────────────────────────────────────
-- PRODUCT IMAGES (gallery / mockups)
-- ─────────────────────────────────────────────────────────────
create table public.product_images (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  url         text not null,
  alt_text    text,
  sort_order  int not null default 0,
  is_primary  boolean not null default false,
  color       text,     -- associated color variant
  source      text default 'mockup' check (source in ('mockup','upload','printful')),
  created_at  timestamptz not null default now()
);

create index on public.product_images(product_id);
create index on public.product_images(is_primary);

-- ─────────────────────────────────────────────────────────────
-- ADDRESSES
-- ─────────────────────────────────────────────────────────────
create table public.addresses (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references public.profiles(id) on delete cascade,
  name          text not null,
  address1      text not null,
  address2      text,
  city          text not null,
  state_code    text,
  country_code  text not null default 'US',
  zip           text not null,
  phone         text,
  is_default    boolean not null default false,
  created_at    timestamptz not null default now()
);

create index on public.addresses(user_id);

-- ─────────────────────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────────────────────
create table public.orders (
  id                    uuid primary key default uuid_generate_v4(),
  order_number          text not null unique default 'TD-' || upper(substring(uuid_generate_v4()::text, 1, 8)),
  user_id               uuid references public.profiles(id) on delete set null,

  -- Customer info (snapshot at order time)
  customer_email        text not null,
  customer_name         text not null,

  -- Shipping address (snapshot)
  shipping_name         text not null,
  shipping_address1     text not null,
  shipping_address2     text,
  shipping_city         text not null,
  shipping_state        text,
  shipping_country      text not null default 'US',
  shipping_zip          text not null,
  shipping_phone        text,

  -- Status
  status                text not null default 'pending'
                          check (status in ('pending','paid','processing','fulfilled','shipped','delivered','cancelled','refunded')),

  -- Payment
  stripe_session_id     text unique,
  stripe_payment_intent text,
  subtotal              numeric(10,2) not null,
  shipping_cost         numeric(10,2) not null default 0,
  tax                   numeric(10,2) not null default 0,
  total                 numeric(10,2) not null,
  currency              text not null default 'usd',

  -- Printful
  printful_order_id     bigint unique,
  printful_status       text,

  -- Notes
  customer_notes        text,
  internal_notes        text,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  paid_at               timestamptz,
  fulfilled_at          timestamptz,
  shipped_at            timestamptz
);

create index on public.orders(user_id);
create index on public.orders(status);
create index on public.orders(stripe_session_id);
create index on public.orders(printful_order_id);
create index on public.orders(created_at desc);

-- ─────────────────────────────────────────────────────────────
-- ORDER ITEMS
-- ─────────────────────────────────────────────────────────────
create table public.order_items (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  product_id      uuid references public.products(id) on delete set null,
  variant_id      uuid references public.product_variants(id) on delete set null,

  -- Snapshots at order time
  product_name    text not null,
  variant_size    text not null,
  variant_color   text,
  sku             text,
  image_url       text,

  -- Printful
  printful_variant_id   bigint not null,
  printful_sync_variant_id bigint,

  quantity        int not null default 1 check (quantity > 0),
  unit_price      numeric(10,2) not null,
  total_price     numeric(10,2) not null,

  created_at      timestamptz not null default now()
);

create index on public.order_items(order_id);

-- ─────────────────────────────────────────────────────────────
-- ORDER TRACKING
-- ─────────────────────────────────────────────────────────────
create table public.order_tracking (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  carrier         text,
  tracking_number text,
  tracking_url    text,
  estimated_delivery_min  date,
  estimated_delivery_max  date,
  shipped_at      timestamptz,
  delivered_at    timestamptz,
  status          text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index on public.order_tracking(order_id);

-- ─────────────────────────────────────────────────────────────
-- CART ITEMS (persistent — supports guest via session_id)
-- ─────────────────────────────────────────────────────────────
create table public.cart_items (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references public.profiles(id) on delete cascade,
  session_id      text,   -- for guest carts
  variant_id      uuid not null references public.product_variants(id) on delete cascade,
  quantity        int not null default 1 check (quantity > 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- A user can only have one cart entry per variant
  unique(user_id, variant_id),
  unique(session_id, variant_id)
);

create index on public.cart_items(user_id);
create index on public.cart_items(session_id);

-- ─────────────────────────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────────────────────────
create table public.reviews (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  order_id    uuid references public.orders(id) on delete set null,
  rating      int not null check (rating between 1 and 5),
  title       text,
  body        text,
  is_verified boolean not null default false,
  is_approved boolean not null default false,
  created_at  timestamptz not null default now(),

  unique(product_id, user_id)
);

create index on public.reviews(product_id);
create index on public.reviews(is_approved);

-- ─────────────────────────────────────────────────────────────
-- WEBHOOK EVENTS (Idempotency log)
-- ─────────────────────────────────────────────────────────────
create table public.webhook_events (
  id            uuid primary key default uuid_generate_v4(),
  source        text not null check (source in ('stripe','printful')),
  event_id      text not null,
  event_type    text not null,
  payload       jsonb,
  processed_at  timestamptz not null default now(),
  status        text not null default 'processed' check (status in ('processed','failed','skipped')),
  error_message text,

  unique(source, event_id)
);

create index on public.webhook_events(source, event_id);
create index on public.webhook_events(processed_at desc);

-- ─────────────────────────────────────────────────────────────
-- MOCKUP TASKS (async Printful mockup generation tracking)
-- ─────────────────────────────────────────────────────────────
create table public.mockup_tasks (
  id              uuid primary key default uuid_generate_v4(),
  product_id      uuid not null references public.products(id) on delete cascade,
  printful_task_id text not null unique,
  status          text not null default 'pending' check (status in ('pending','completed','failed')),
  result_urls     jsonb default '[]',
  created_at      timestamptz not null default now(),
  completed_at    timestamptz
);

create index on public.mockup_tasks(product_id);
create index on public.mockup_tasks(status);

-- ─────────────────────────────────────────────────────────────
-- Update timestamp trigger
-- ─────────────────────────────────────────────────────────────
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at();
create trigger trg_products_updated_at before update on public.products
  for each row execute procedure public.update_updated_at();
create trigger trg_variants_updated_at before update on public.product_variants
  for each row execute procedure public.update_updated_at();
create trigger trg_orders_updated_at before update on public.orders
  for each row execute procedure public.update_updated_at();
create trigger trg_cart_updated_at before update on public.cart_items
  for each row execute procedure public.update_updated_at();
create trigger trg_tracking_updated_at before update on public.order_tracking
  for each row execute procedure public.update_updated_at();
