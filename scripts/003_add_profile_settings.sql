-- Add additional profile fields for user settings
-- This script adds the new fields we added to the settings panel

-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS artist_name TEXT,
ADD COLUMN IF NOT EXISTS tiktok_handle TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS is_reviewer BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reviewer_name TEXT;

-- Add skip line payments fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cashapp TEXT,
ADD COLUMN IF NOT EXISTS apple_pay TEXT,
ADD COLUMN IF NOT EXISTS sei_wallet TEXT,
ADD COLUMN IF NOT EXISTS free_skips INTEGER DEFAULT 0;

-- Add music platform links
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS dexsta_profile TEXT,
ADD COLUMN IF NOT EXISTS spotify_profile TEXT,
ADD COLUMN IF NOT EXISTS soundcloud_profile TEXT,
ADD COLUMN IF NOT EXISTS youtube_profile TEXT;

-- Update the trigger function to handle new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username, 
    email,
    artist_name,
    tiktok_handle,
    bio,
    profile_image_url,
    is_reviewer,
    reviewer_name,
    cashapp,
    apple_pay,
    sei_wallet,
    free_skips,
    dexsta_profile,
    spotify_profile,
    soundcloud_profile,
    youtube_profile
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'user_' || substring(NEW.id::text, 1, 8)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'artist_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'tiktok_handle', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'bio', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'profile_image_url', NULL),
    COALESCE((NEW.raw_user_meta_data ->> 'is_reviewer')::boolean, FALSE),
    COALESCE(NEW.raw_user_meta_data ->> 'reviewer_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'cashapp', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'apple_pay', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'sei_wallet', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'free_skips')::integer, 0),
    COALESCE(NEW.raw_user_meta_data ->> 'dexsta_profile', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'spotify_profile', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'soundcloud_profile', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'youtube_profile', '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Add additional columns to submissions table for the new fields
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS tiktok_name TEXT,
ADD COLUMN IF NOT EXISTS song_link TEXT,
ADD COLUMN IF NOT EXISTS featuring TEXT,
ADD COLUMN IF NOT EXISTS audio_file_url TEXT,
ADD COLUMN IF NOT EXISTS video_file_url TEXT;

-- Create an index on the reviewer flag for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_reviewer ON public.profiles(is_reviewer);

-- Create an index on submission status for better performance
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);

-- Add a comment to document the new fields
COMMENT ON COLUMN public.profiles.artist_name IS 'User''s artist/stage name';
COMMENT ON COLUMN public.profiles.tiktok_handle IS 'User''s TikTok username/handle';
COMMENT ON COLUMN public.profiles.bio IS 'User''s biography/description';
COMMENT ON COLUMN public.profiles.profile_image_url IS 'URL to user''s profile image';
COMMENT ON COLUMN public.profiles.is_reviewer IS 'Whether user has reviewer privileges';
COMMENT ON COLUMN public.profiles.reviewer_name IS 'Display name for reviewer mode';
COMMENT ON COLUMN public.profiles.cashapp IS 'CashApp handle for skip line payments';
COMMENT ON COLUMN public.profiles.apple_pay IS 'Apple Pay information for skip line payments';
COMMENT ON COLUMN public.profiles.sei_wallet IS 'SEI cryptocurrency wallet address';
COMMENT ON COLUMN public.profiles.free_skips IS 'Number of free skips reviewer is offering';
COMMENT ON COLUMN public.profiles.dexsta_profile IS 'Dexsta.fun profile URL';
COMMENT ON COLUMN public.profiles.spotify_profile IS 'Spotify profile URL';
COMMENT ON COLUMN public.profiles.soundcloud_profile IS 'SoundCloud profile URL';
COMMENT ON COLUMN public.profiles.youtube_profile IS 'YouTube channel URL';
