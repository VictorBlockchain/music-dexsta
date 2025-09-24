-- Add reviewer_id column to submissions table
-- This column links submissions to the reviewer's profile

-- Add reviewer_id column to submissions table
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES public.profiles(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_submissions_reviewer_id ON public.submissions(reviewer_id);

-- Add comment for documentation
COMMENT ON COLUMN public.submissions.reviewer_id IS 'ID of the reviewer who will review this submission';

-- Verify the column was added
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'submissions' 
        AND column_name = 'reviewer_id'
    ) THEN
        RAISE EXCEPTION 'Failed to add reviewer_id column to submissions table';
    END IF;
    
    RAISE NOTICE 'reviewer_id column added successfully to submissions table!';
END $$;
