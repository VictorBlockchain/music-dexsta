-- Fix queue positions - assign positions to existing submissions and ensure triggers work

-- First, let's assign queue positions to existing submissions that have queue_position = 0
DO $$
DECLARE
    reviewer_record RECORD;
    position_counter INTEGER;
BEGIN
    -- Loop through each reviewer
    FOR reviewer_record IN 
        SELECT DISTINCT reviewer_id 
        FROM submissions 
        WHERE reviewer_id IS NOT NULL 
        AND status = 'pending'
    LOOP
        position_counter := 1;
        
        -- Assign positions to submissions for this reviewer ordered by created_at
        UPDATE submissions 
        SET queue_position = position_counter
        FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
            FROM submissions 
            WHERE reviewer_id = reviewer_record.reviewer_id 
            AND status = 'pending'
            AND queue_position = 0
        ) ranked
        WHERE submissions.id = ranked.id
        AND submissions.reviewer_id = reviewer_record.reviewer_id;
        
        RAISE NOTICE 'Assigned positions for reviewer %', reviewer_record.reviewer_id;
    END LOOP;
END $$;

-- Ensure the assign_queue_position function exists and works
CREATE OR REPLACE FUNCTION public.assign_queue_position()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only assign position if it's not already set and reviewer_id exists
  IF (NEW.queue_position IS NULL OR NEW.queue_position = 0) AND NEW.reviewer_id IS NOT NULL THEN
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

-- Drop and recreate the trigger to ensure it's working
DROP TRIGGER IF EXISTS assign_queue_position_trigger ON public.submissions;
CREATE TRIGGER assign_queue_position_trigger
  BEFORE INSERT ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_queue_position();

-- Ensure the reorder function exists
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
  
  RAISE NOTICE 'Moved submission % from position % to position %', p_submission_id, current_position, p_new_position;
END;
$$;

-- Verify the functions and trigger exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'assign_queue_position'
    ) THEN
        RAISE EXCEPTION 'assign_queue_position function not found';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'reorder_queue_positions'
    ) THEN
        RAISE EXCEPTION 'reorder_queue_positions function not found';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'assign_queue_position_trigger'
    ) THEN
        RAISE EXCEPTION 'assign_queue_position_trigger not found';
    END IF;
    
    RAISE NOTICE 'All queue management functions and triggers are properly set up!';
END $$;
