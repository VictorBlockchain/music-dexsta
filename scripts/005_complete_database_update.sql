-- Complete Database Update Script
-- This script updates the database to support all the new profile and settings features
-- Run this script to update an existing database with the new fields

-- ==============================================
-- 1. UPDATE PROFILES TABLE
-- ==============================================

-- Add new profile fields
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
ADD COLUMN IF NOT EXISTS free_skips INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS skip_price_usd INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS skip_price_sei DECIMAL(10,2) DEFAULT 0;

-- Add music platform links
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS dexsta_profile TEXT,
ADD COLUMN IF NOT EXISTS spotify_profile TEXT,
ADD COLUMN IF NOT EXISTS soundcloud_profile TEXT,
ADD COLUMN IF NOT EXISTS youtube_profile TEXT,
ADD COLUMN IF NOT EXISTS reviewer_url TEXT;

-- ==============================================
-- 2. UPDATE SUBMISSIONS TABLE
-- ==============================================

-- Add missing columns to submissions table
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS tiktok_name TEXT,
ADD COLUMN IF NOT EXISTS song_link TEXT,
ADD COLUMN IF NOT EXISTS featuring TEXT,
ADD COLUMN IF NOT EXISTS audio_file_url TEXT,
ADD COLUMN IF NOT EXISTS video_file_url TEXT,
ADD COLUMN IF NOT EXISTS nft_id TEXT,
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS queue_position INTEGER DEFAULT 0;

-- Update the status check constraint
ALTER TABLE public.submissions 
DROP CONSTRAINT IF EXISTS submissions_status_check;

ALTER TABLE public.submissions 
ADD CONSTRAINT submissions_status_check 
CHECK (status IN ('pending', 'reviewed', 'skipped', 'approved', 'rejected'));

-- ==============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ==============================================

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_is_reviewer ON public.profiles(is_reviewer);

-- Submissions table indexes
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_reviewer_id ON public.submissions(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_submissions_queue_position ON public.submissions(reviewer_id, queue_position);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_priority ON public.submissions(priority);

-- ==============================================
-- 4. UPDATE TRIGGER FUNCTIONS
-- ==============================================

-- Update the new user trigger function
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_submissions_updated_at ON public.submissions;
CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================
-- 5. QUEUE MANAGEMENT FUNCTIONS
-- ==============================================

-- Create function to automatically assign queue positions for new submissions
CREATE OR REPLACE FUNCTION public.assign_queue_position()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only assign position if it's not already set and reviewer_id exists
  IF NEW.queue_position IS NULL OR NEW.queue_position = 0 THEN
    -- Get the next position for this reviewer
    SELECT COALESCE(MAX(queue_position), 0) + 1
    INTO NEW.queue_position
    FROM public.submissions
    WHERE reviewer_id = NEW.reviewer_id
    AND status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign queue positions
DROP TRIGGER IF EXISTS assign_queue_position_trigger ON public.submissions;
CREATE TRIGGER assign_queue_position_trigger
  BEFORE INSERT ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_queue_position();

-- Create function to reorder queue positions
CREATE OR REPLACE FUNCTION public.reorder_queue_positions(
  p_reviewer_id UUID,
  p_submission_id UUID,
  p_new_position INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_position INTEGER;
BEGIN
  -- Get current position of the submission
  SELECT queue_position INTO current_position
  FROM public.submissions
  WHERE id = p_submission_id AND reviewer_id = p_reviewer_id;
  
  IF current_position IS NULL THEN
    RAISE EXCEPTION 'Submission not found or not owned by reviewer';
  END IF;
  
  -- If moving up (lower position number)
  IF p_new_position < current_position THEN
    -- Shift other submissions down
    UPDATE public.submissions
    SET queue_position = queue_position + 1
    WHERE reviewer_id = p_reviewer_id
    AND queue_position >= p_new_position
    AND queue_position < current_position
    AND status = 'pending';
  -- If moving down (higher position number)
  ELSIF p_new_position > current_position THEN
    -- Shift other submissions up
    UPDATE public.submissions
    SET queue_position = queue_position - 1
    WHERE reviewer_id = p_reviewer_id
    AND queue_position > current_position
    AND queue_position <= p_new_position
    AND status = 'pending';
  END IF;
  
  -- Update the submission's position
  UPDATE public.submissions
  SET queue_position = p_new_position
  WHERE id = p_submission_id AND reviewer_id = p_reviewer_id;
END;
$$;

-- ==============================================
-- 6. ADD DOCUMENTATION COMMENTS
-- ==============================================

-- Profile fields documentation
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
COMMENT ON COLUMN public.profiles.skip_price_usd IS 'Price in USD for artists to skip the queue';
COMMENT ON COLUMN public.profiles.skip_price_sei IS 'Price in SEI cryptocurrency for artists to skip the queue';
COMMENT ON COLUMN public.profiles.dexsta_profile IS 'Dexsta.fun profile URL';
COMMENT ON COLUMN public.profiles.spotify_profile IS 'Spotify profile URL';
COMMENT ON COLUMN public.profiles.soundcloud_profile IS 'SoundCloud profile URL';
COMMENT ON COLUMN public.profiles.youtube_profile IS 'YouTube channel URL';
COMMENT ON COLUMN public.profiles.reviewer_url IS 'Reviewer URL handle for music.dexsta.fun';

-- Submission fields documentation
COMMENT ON COLUMN public.submissions.tiktok_name IS 'TikTok username of the artist';
COMMENT ON COLUMN public.submissions.song_link IS 'External link to the song (YouTube, Spotify, etc.)';
COMMENT ON COLUMN public.submissions.featuring IS 'Other artists featured on the track';
COMMENT ON COLUMN public.submissions.audio_file_url IS 'URL to uploaded audio file (MP3)';
COMMENT ON COLUMN public.submissions.video_file_url IS 'URL to uploaded video file (MP4)';
COMMENT ON COLUMN public.submissions.nft_id IS 'Dexsta.fun NFT ID if music becomes an NFT';
COMMENT ON COLUMN public.submissions.reviewer_id IS 'ID of the reviewer who will review this submission';
COMMENT ON COLUMN public.submissions.queue_position IS 'Position in reviewer queue (lower numbers = higher priority)';

-- ==============================================
-- 7. UPDATE RLS POLICIES FOR SUBMISSIONS
-- ==============================================

-- Remove existing restrictive policies
DROP POLICY IF EXISTS "submissions_select_own" ON public.submissions;
DROP POLICY IF EXISTS "submissions_insert_own" ON public.submissions;
DROP POLICY IF EXISTS "submissions_update_own" ON public.submissions;
DROP POLICY IF EXISTS "submissions_delete_own" ON public.submissions;

-- Create new policies that allow both scenarios:
-- 1. Users can see their own submissions
-- 2. Reviewers can see submissions assigned to them

-- Policy for SELECT: Users can see their own submissions OR submissions they're reviewing
CREATE POLICY "submissions_select_own_or_reviewing" ON public.submissions 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.uid() = reviewer_id
);

-- Policy for INSERT: Users can only insert their own submissions
CREATE POLICY "submissions_insert_own" ON public.submissions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE: Users can update their own submissions OR reviewers can update submissions they're reviewing
CREATE POLICY "submissions_update_own_or_reviewing" ON public.submissions 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  auth.uid() = reviewer_id
);

-- Policy for DELETE: Users can delete their own submissions OR reviewers can delete submissions they're reviewing
CREATE POLICY "submissions_delete_own_or_reviewing" ON public.submissions 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  auth.uid() = reviewer_id
);

-- ==============================================
-- 8. VERIFICATION QUERIES
-- ==============================================

-- Verify the updates were successful
DO $$
BEGIN
    -- Check if all new profile columns exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'artist_name'
    ) THEN
        RAISE EXCEPTION 'Failed to add artist_name column to profiles table';
    END IF;
    
    -- Check if all new submission columns exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'submissions' 
        AND column_name = 'tiktok_name'
    ) THEN
        RAISE EXCEPTION 'Failed to add tiktok_name column to submissions table';
    END IF;
    
    RAISE NOTICE 'Database update completed successfully!';
END $$;
