-- 007_add_skip_price.sql
-- Quick script to add the skip_price column to the profiles table

-- Add skip price columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS skip_price_usd INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS skip_price_sei DECIMAL(10,2) DEFAULT 0;

-- Add comments for the new columns
COMMENT ON COLUMN public.profiles.skip_price_usd IS 'Price in USD for artists to skip the queue';
COMMENT ON COLUMN public.profiles.skip_price_sei IS 'Price in SEI cryptocurrency for artists to skip the queue';

-- Update the trigger function to include skip_price
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
    skip_price_usd,
    skip_price_sei,
    dexsta_profile,
    spotify_profile,
    soundcloud_profile,
    youtube_profile,
    reviewer_url
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
    COALESCE((NEW.raw_user_meta_data ->> 'skip_price_usd')::integer, 0),
    COALESCE((NEW.raw_user_meta_data ->> 'skip_price_sei')::decimal, 0),
    COALESCE(NEW.raw_user_meta_data ->> 'dexsta_profile', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'spotify_profile', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'soundcloud_profile', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'youtube_profile', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'reviewer_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

RAISE NOTICE 'skip_price_usd and skip_price_sei columns added to profiles table and trigger function updated.';
