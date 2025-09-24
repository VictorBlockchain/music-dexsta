-- Add queue management fields to submissions table
-- This allows reviewers to reorder submissions in their queue

-- Add queue position field
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS queue_position INTEGER DEFAULT 0;

-- Add index for queue ordering
CREATE INDEX IF NOT EXISTS idx_submissions_queue_position ON public.submissions(reviewer_id, queue_position);

-- Add comment for documentation
COMMENT ON COLUMN public.submissions.queue_position IS 'Position in reviewer queue (lower numbers = higher priority)';

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

-- Verify the column was added
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'submissions' 
        AND column_name = 'queue_position'
    ) THEN
        RAISE EXCEPTION 'Failed to add queue_position column to submissions table';
    END IF;
    
    RAISE NOTICE 'Queue management functionality added successfully!';
END $$;
