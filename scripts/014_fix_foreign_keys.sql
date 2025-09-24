-- Fix foreign key relationships between submissions and profiles tables
-- This script ensures proper foreign key constraints exist

-- First, let's check what foreign keys currently exist
-- (This is for reference - we'll create the proper ones below)

-- Drop existing foreign key constraints if they exist with wrong names
DO $$ 
BEGIN
    -- Drop any existing foreign key constraints on submissions table
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%submissions%user%' 
        AND table_name = 'submissions'
    ) THEN
        ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_user_id_fkey;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%submissions%reviewer%' 
        AND table_name = 'submissions'
    ) THEN
        ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_reviewer_id_fkey;
    END IF;
END $$;

-- Add proper foreign key constraints
-- Foreign key for user_id (the person who submitted)
ALTER TABLE submissions 
ADD CONSTRAINT submissions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Foreign key for reviewer_id (the reviewer assigned to this submission)
ALTER TABLE submissions 
ADD CONSTRAINT submissions_reviewer_id_fkey 
FOREIGN KEY (reviewer_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_reviewer_id ON submissions(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_queue_position ON submissions(queue_position);

-- Verify the constraints were created
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='submissions';
