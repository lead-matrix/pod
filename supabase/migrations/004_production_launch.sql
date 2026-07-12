-- ============================================================
-- Migration 004: Schema improvements for production launch
-- - Make printful_variant_id nullable (demo products don't have it)
-- - Add unique constraint on product_variants.sku
-- - Ensure categories slug has unique constraint (should already exist)
-- - Add handle_new_user update for existing users
-- ============================================================

-- Allow demo/manual products without Printful sync
ALTER TABLE public.product_variants
  ALTER COLUMN printful_variant_id DROP NOT NULL;

-- Add unique constraint on sku for idempotent seeding
ALTER TABLE public.product_variants
  ADD CONSTRAINT product_variants_sku_key UNIQUE (sku);

-- Update existing og@lmtrx.us profile to admin role if it exists
UPDATE public.profiles
  SET role = 'admin'
  WHERE lower(email) = 'og@lmtrx.us';

-- Re-create the trigger function with admin promotion
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    CASE WHEN lower(NEW.email) = 'og@lmtrx.us' THEN 'admin' ELSE 'customer' END
  )
  ON CONFLICT (id) DO UPDATE
    SET email      = EXCLUDED.email,
        full_name  = COALESCE(EXCLUDED.full_name, profiles.full_name),
        role       = CASE WHEN lower(EXCLUDED.email) = 'og@lmtrx.us' THEN 'admin' ELSE profiles.role END;
  RETURN NEW;
END;
$$;
