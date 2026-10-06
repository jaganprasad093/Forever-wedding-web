-- ForeverVows Database Schema
-- Run this in your Supabase SQL Editor

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- TEMPLATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  thumbnail TEXT,
  description TEXT,
  component_key TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are publicly readable"
  ON public.templates FOR SELECT
  USING (active = TRUE);

-- =============================================
-- WEDDINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.weddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  template_id TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bride_name TEXT,
  groom_name TEXT,
  wedding_date DATE,
  wedding_time TEXT,
  venue_name TEXT,
  venue_address TEXT,
  venue_maps_url TEXT,
  story TEXT,
  theme JSONB DEFAULT '{}',
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own weddings"
  ON public.weddings FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Published weddings are publicly readable"
  ON public.weddings FOR SELECT
  USING (published = TRUE);

-- =============================================
-- EVENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  date DATE,
  time TEXT,
  venue TEXT,
  address TEXT,
  maps_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wedding owners can manage events"
  ON public.events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.weddings
      WHERE weddings.id = events.wedding_id
      AND weddings.user_id = auth.uid()
    )
  );

CREATE POLICY "Events of published weddings are readable"
  ON public.events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.weddings
      WHERE weddings.id = events.wedding_id
      AND weddings.published = TRUE
    )
  );

-- =============================================
-- GALLERY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  is_cover BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wedding owners can manage gallery"
  ON public.gallery FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.weddings
      WHERE weddings.id = gallery.wedding_id
      AND weddings.user_id = auth.uid()
    )
  );

CREATE POLICY "Gallery of published weddings is readable"
  ON public.gallery FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.weddings
      WHERE weddings.id = gallery.wedding_id
      AND weddings.published = TRUE
    )
  );

-- =============================================
-- MUSIC TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.music (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  artist TEXT,
  url TEXT NOT NULL,
  path TEXT,
  type TEXT DEFAULT 'upload' CHECK (type IN ('upload', 'preset')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.music ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wedding owners can manage music"
  ON public.music FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.weddings
      WHERE weddings.id = music.wedding_id
      AND weddings.user_id = auth.uid()
    )
  );

CREATE POLICY "Music of published weddings is readable"
  ON public.music FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.weddings
      WHERE weddings.id = music.wedding_id
      AND weddings.published = TRUE
    )
  );

-- =============================================
-- RSVPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  guest_name TEXT NOT NULL,
  phone TEXT,
  attending BOOLEAN NOT NULL,
  guest_count INTEGER DEFAULT 1,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Anyone can submit RSVP to published wedding
CREATE POLICY "Anyone can submit RSVP to published weddings"
  ON public.rsvps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.weddings
      WHERE weddings.id = rsvps.wedding_id
      AND weddings.published = TRUE
    )
  );

-- Wedding owners can view RSVPs
CREATE POLICY "Wedding owners can view RSVPs"
  ON public.rsvps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.weddings
      WHERE weddings.id = rsvps.wedding_id
      AND weddings.user_id = auth.uid()
    )
  );

-- =============================================
-- ANALYTICS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'music_play', 'rsvp')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics events for published weddings
CREATE POLICY "Anyone can log analytics for published weddings"
  ON public.analytics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.weddings
      WHERE weddings.id = analytics.wedding_id
      AND weddings.published = TRUE
    )
  );

-- Wedding owners can view their analytics
CREATE POLICY "Wedding owners can view their analytics"
  ON public.analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.weddings
      WHERE weddings.id = analytics.wedding_id
      AND weddings.user_id = auth.uid()
    )
  );

-- =============================================
-- HELPER FUNCTION: increment views
-- =============================================
CREATE OR REPLACE FUNCTION public.increment_views(wedding_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.weddings
  SET views = views + 1
  WHERE id = wedding_id AND published = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- STORAGE BUCKETS
-- =============================================
-- Run these in the Supabase Storage settings or SQL:

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('wedding-images', 'wedding-images', TRUE),
  ('wedding-music', 'wedding-music', TRUE),
  ('template-assets', 'template-assets', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for wedding-images
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'wedding-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can view wedding images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wedding-images');

CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'wedding-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for wedding-music
CREATE POLICY "Authenticated users can upload music"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'wedding-music'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can view wedding music"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wedding-music');

CREATE POLICY "Users can delete their own music"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'wedding-music'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- UPDATED_AT trigger
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_weddings_updated_at
  BEFORE UPDATE ON public.weddings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
