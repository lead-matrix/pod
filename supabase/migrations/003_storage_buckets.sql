-- ============================================================
-- Migration 003: Storage Buckets & Policies
-- ============================================================

-- Create storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'product-images',
    'product-images',
    true,
    10485760,  -- 10MB
    array['image/jpeg','image/png','image/webp','image/gif']
  ),
  (
    'design-files',
    'design-files',
    false,
    52428800,  -- 50MB
    array['image/jpeg','image/png','image/webp','image/svg+xml','application/pdf']
  );

-- ─────────────────────────────────────────────────────────────
-- Storage Policies: product-images (public bucket)
-- ─────────────────────────────────────────────────────────────
create policy "Public read product images" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "Admins can upload product images" on storage.objects
  for insert with check (
    bucket_id = 'product-images' and public.is_admin()
  );

create policy "Admins can update product images" on storage.objects
  for update using (
    bucket_id = 'product-images' and public.is_admin()
  );

create policy "Admins can delete product images" on storage.objects
  for delete using (
    bucket_id = 'product-images' and public.is_admin()
  );

-- ─────────────────────────────────────────────────────────────
-- Storage Policies: design-files (private bucket)
-- ─────────────────────────────────────────────────────────────
create policy "Admins can access design files" on storage.objects
  for all using (
    bucket_id = 'design-files' and public.is_admin()
  );
