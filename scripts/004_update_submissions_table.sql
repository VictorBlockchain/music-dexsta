-- Update submissions table to match frontend structure
-- This script aligns the database schema with the submission form fields

-- Add missing columns to submissions table
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS tiktok_name TEXT,
ADD COLUMN IF NOT EXISTS song_link TEXT,
ADD COLUMN IF NOT EXISTS featuring TEXT,
ADD COLUMN IF NOT EXISTS audio_file_url TEXT,
ADD COLUMN IF NOT EXISTS video_file_url TEXT,
ADD COLUMN IF NOT EXISTS nft_id TEXT;

-- Update the status check constraint to include more statuses
ALTER TABLE public.submissions 
DROP CONSTRAINT IF EXISTS submissions_status_check;

ALTER TABLE public.submissions 
ADD CONSTRAINT submissions_status_check 
CHECK (status IN ('pending', 'reviewed', 'skipped', 'approved', 'rejected'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_priority ON public.submissions(priority);

-- Add comments to document the new fields
COMMENT ON COLUMN public.submissions.tiktok_name IS 'TikTok username of the artist';
COMMENT ON COLUMN public.submissions.song_link IS 'External link to the song (YouTube, Spotify, etc.)';
COMMENT ON COLUMN public.submissions.featuring IS 'Other artists featured on the track';
COMMENT ON COLUMN public.submissions.audio_file_url IS 'URL to uploaded audio file (MP3)';
COMMENT ON COLUMN public.submissions.video_file_url IS 'URL to uploaded video file (MP4)';
COMMENT ON COLUMN public.submissions.nft_id IS 'Dexsta.fun NFT ID if music becomes an NFT';

-- Update the updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for submissions table
DROP TRIGGER IF EXISTS update_submissions_updated_at ON public.submissions;
CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
