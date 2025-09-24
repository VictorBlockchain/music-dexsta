-- Fix Row Level Security for profiles table to allow public read access
-- This allows the reviewers list to show all profiles, not just the current user's

-- Drop existing RLS policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;

-- Create new policies that allow public read access
CREATE POLICY "Enable read access for all users" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Enable update for users based on user_id" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled on the table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
