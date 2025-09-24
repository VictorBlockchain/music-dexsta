-- Create the reorder_queue_positions function for queue management
-- This function handles moving submissions up/down in the queue

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

-- Verify the function was created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'reorder_queue_positions'
    ) THEN
        RAISE EXCEPTION 'Failed to create reorder_queue_positions function';
    END IF;
    
    RAISE NOTICE 'reorder_queue_positions function created successfully!';
END $$;
