-- 006_setup_storage.sql
-- This script sets up Supabase storage buckets for file uploads

-- Create the uploads bucket for profile images and other files
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the uploads bucket
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Allow public access to view uploaded files
CREATE POLICY "Allow public access to view files" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'uploads');

-- Allow users to update their own files
CREATE POLICY "Allow users to update their own files" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete their own files" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Verification
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'uploads') THEN
        RAISE NOTICE 'Storage bucket "uploads" created successfully.';
    ELSE
        RAISE WARNING 'Storage bucket "uploads" not found.';
    END IF;
END $$;

RAISE NOTICE 'Storage setup script completed.';
