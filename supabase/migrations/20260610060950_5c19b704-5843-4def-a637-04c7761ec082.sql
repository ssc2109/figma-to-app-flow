
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS business_type text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'PEN',
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'es-PE',
  ADD COLUMN IF NOT EXISTS open_time text,
  ADD COLUMN IF NOT EXISTS close_time text,
  ADD COLUMN IF NOT EXISTS daily_goal numeric NOT NULL DEFAULT 1500,
  ADD COLUMN IF NOT EXISTS notifications_enabled boolean NOT NULL DEFAULT true;
