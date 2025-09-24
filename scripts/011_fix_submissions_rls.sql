-- Fix submissions RLS policies to allow reviewers to see their queue
-- This allows users to see their own submissions AND reviewers to see submissions assigned to them

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

-- Verify policies were created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'submissions' 
        AND policyname = 'submissions_select_own_or_reviewing'
    ) THEN
        RAISE EXCEPTION 'Failed to create submissions SELECT policy';
    END IF;
    
    RAISE NOTICE 'Submissions RLS policies updated successfully!';
END $$;
