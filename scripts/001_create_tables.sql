-- Create closet_items table for storing user's clothing items
CREATE TABLE IF NOT EXISTS public.closet_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('layer', 'top', 'bottom', 'shoes', 'accessories')),
  type TEXT NOT NULL,
  color TEXT[] NOT NULL DEFAULT '{}',
  fit TEXT NOT NULL DEFAULT 'Regular',
  condition TEXT[] NOT NULL DEFAULT '{}',
  temperature TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_settings table for storing user preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  units TEXT NOT NULL DEFAULT 'fahrenheit' CHECK (units IN ('fahrenheit', 'celsius')),
  style_preference TEXT[] NOT NULL DEFAULT '{}',
  color_preference TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create saved_outfits table for storing user's saved outfit combinations
CREATE TABLE IF NOT EXISTS public.saved_outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  layer_id UUID REFERENCES public.closet_items(id) ON DELETE SET NULL,
  top_id UUID REFERENCES public.closet_items(id) ON DELETE SET NULL,
  bottom_id UUID REFERENCES public.closet_items(id) ON DELETE SET NULL,
  shoes_id UUID REFERENCES public.closet_items(id) ON DELETE SET NULL,
  accessory_id UUID REFERENCES public.closet_items(id) ON DELETE SET NULL,
  score INTEGER NOT NULL DEFAULT 0,
  accuracy INTEGER NOT NULL DEFAULT 0,
  explanation TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.closet_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_outfits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for closet_items
CREATE POLICY "closet_items_select_own" ON public.closet_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "closet_items_insert_own" ON public.closet_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "closet_items_update_own" ON public.closet_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "closet_items_delete_own" ON public.closet_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_settings
CREATE POLICY "user_settings_select_own" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_settings_insert_own" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_settings_update_own" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_settings_delete_own" ON public.user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for saved_outfits
CREATE POLICY "saved_outfits_select_own" ON public.saved_outfits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "saved_outfits_insert_own" ON public.saved_outfits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_outfits_update_own" ON public.saved_outfits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "saved_outfits_delete_own" ON public.saved_outfits
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS closet_items_user_id_idx ON public.closet_items(user_id);
CREATE INDEX IF NOT EXISTS closet_items_category_idx ON public.closet_items(category);
CREATE INDEX IF NOT EXISTS user_settings_user_id_idx ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS saved_outfits_user_id_idx ON public.saved_outfits(user_id);
