-- ============================================================
-- Migration 002: Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_tracking enable row level security;
alter table public.cart_items enable row level security;
alter table public.reviews enable row level security;
alter table public.webhook_events enable row level security;
alter table public.mockup_tasks enable row level security;

-- Helper function to check admin role
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
$$;

-- ─────────────────────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────────────────────
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Admins can view all profiles" on public.profiles
  for select using (public.is_admin());

create policy "Admins can update all profiles" on public.profiles
  for update using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────────────────────
create policy "Anyone can view active categories" on public.categories
  for select using (is_active = true);

create policy "Admins can manage categories" on public.categories
  for all using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────────────────────
create policy "Anyone can view active products" on public.products
  for select using (is_active = true);

create policy "Admins can manage all products" on public.products
  for all using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- PRODUCT VARIANTS
-- ─────────────────────────────────────────────────────────────
create policy "Anyone can view variants of active products" on public.product_variants
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active = true
    )
  );

create policy "Admins can manage all variants" on public.product_variants
  for all using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- PRODUCT IMAGES
-- ─────────────────────────────────────────────────────────────
create policy "Anyone can view product images" on public.product_images
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active = true
    )
  );

create policy "Admins can manage product images" on public.product_images
  for all using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- ADDRESSES
-- ─────────────────────────────────────────────────────────────
create policy "Users can manage own addresses" on public.addresses
  for all using (auth.uid() = user_id);

create policy "Admins can view all addresses" on public.addresses
  for select using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────────────────────
create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "Admins can manage all orders" on public.orders
  for all using (public.is_admin());

-- Service role can insert orders (from edge functions)
create policy "Service role can insert orders" on public.orders
  for insert with check (true);

create policy "Service role can update orders" on public.orders
  for update using (true);

-- ─────────────────────────────────────────────────────────────
-- ORDER ITEMS
-- ─────────────────────────────────────────────────────────────
create policy "Users can view own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "Admins can view all order items" on public.order_items
  for all using (public.is_admin());

create policy "Service role can manage order items" on public.order_items
  for all with check (true);

-- ─────────────────────────────────────────────────────────────
-- ORDER TRACKING
-- ─────────────────────────────────────────────────────────────
create policy "Users can view own tracking" on public.order_tracking
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "Admins can manage all tracking" on public.order_tracking
  for all using (public.is_admin());

create policy "Service role can manage tracking" on public.order_tracking
  for all with check (true);

-- ─────────────────────────────────────────────────────────────
-- CART ITEMS
-- ─────────────────────────────────────────────────────────────
create policy "Users can manage own cart" on public.cart_items
  for all using (auth.uid() = user_id);

create policy "Guest cart by session" on public.cart_items
  for all using (user_id is null);

-- ─────────────────────────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────────────────────────
create policy "Anyone can view approved reviews" on public.reviews
  for select using (is_approved = true);

create policy "Users can create reviews" on public.reviews
  for insert with check (auth.uid() = user_id);

create policy "Users can update own reviews" on public.reviews
  for update using (auth.uid() = user_id);

create policy "Admins can manage all reviews" on public.reviews
  for all using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- WEBHOOK EVENTS (admin + service role only)
-- ─────────────────────────────────────────────────────────────
create policy "Admins can view webhook events" on public.webhook_events
  for select using (public.is_admin());

create policy "Service role can manage webhook events" on public.webhook_events
  for all with check (true);

-- ─────────────────────────────────────────────────────────────
-- MOCKUP TASKS
-- ─────────────────────────────────────────────────────────────
create policy "Admins can manage mockup tasks" on public.mockup_tasks
  for all using (public.is_admin());

create policy "Service role can manage mockup tasks" on public.mockup_tasks
  for all with check (true);
