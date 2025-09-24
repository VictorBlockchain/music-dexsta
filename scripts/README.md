# Database Migration Scripts

This directory contains SQL scripts to set up and update the database schema for the music-dexsta application.

## Script Overview

### 001_create_tables.sql
- Creates the initial database structure
- Sets up profiles, submissions, and reviews tables
- Configures Row Level Security (RLS) policies
- **Run this first** for a new database

### 002_create_profile_trigger.sql
- Creates trigger to auto-create user profiles on signup
- **Run this after** 001_create_tables.sql

### 003_add_profile_settings.sql
- Adds new profile fields for user settings
- Includes artist name, TikTok handle, bio, profile image
- Adds reviewer mode fields
- Adds skip line payment fields (CashApp, Apple Pay, SEI, Free Skips)
- Adds music platform links (Dexsta, Spotify, SoundCloud, YouTube)

### 004_update_submissions_table.sql
- Updates submissions table with new fields
- Adds TikTok name, song link, featuring, audio/video file URLs
- Updates status constraints
- Adds performance indexes

### 005_complete_database_update.sql
- **Comprehensive update script** that combines all changes
- Safe to run on existing databases
- Includes verification checks
- **Recommended for updating existing databases**

## Migration Instructions

### For New Database:
```sql
-- Run in order:
1. 001_create_tables.sql
2. 002_create_profile_trigger.sql
```

### For Existing Database:
```sql
-- Run this single script:
005_complete_database_update.sql
```

## New Database Fields

### Profiles Table Additions:
- `artist_name` - User's stage name
- `tiktok_handle` - TikTok username
- `bio` - User biography
- `profile_image_url` - Profile picture URL
- `is_reviewer` - Reviewer mode flag
- `reviewer_name` - Reviewer display name
- `cashapp` - CashApp handle for payments
- `apple_pay` - Apple Pay information
- `sei_wallet` - SEI cryptocurrency wallet
- `free_skips` - Number of free skips offered
- `dexsta_profile` - Dexsta.fun profile URL
- `spotify_profile` - Spotify profile URL
- `soundcloud_profile` - SoundCloud profile URL
- `youtube_profile` - YouTube channel URL

### Submissions Table Additions:
- `tiktok_name` - Artist's TikTok handle
- `song_link` - External song link
- `featuring` - Featured artists
- `audio_file_url` - Uploaded MP3 file URL
- `video_file_url` - Uploaded MP4 file URL
- `nft_id` - Dexsta.fun NFT ID

## Running the Scripts

### Via Supabase Dashboard:
1. Go to SQL Editor
2. Copy and paste the script content
3. Click "Run"

### Via psql:
```bash
psql -h your-host -U your-user -d your-database -f 005_complete_database_update.sql
```

### Via Supabase CLI:
```bash
supabase db reset
# Then run the scripts in order
```

## Verification

The `005_complete_database_update.sql` script includes verification checks that will:
- Confirm all new columns were added successfully
- Raise an error if any migration step failed
- Display a success message when complete

## Rollback

If you need to rollback changes, you can drop the new columns:

```sql
-- Remove new profile columns
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS artist_name,
DROP COLUMN IF EXISTS tiktok_handle,
DROP COLUMN IF EXISTS bio,
DROP COLUMN IF EXISTS profile_image_url,
DROP COLUMN IF EXISTS is_reviewer,
DROP COLUMN IF EXISTS reviewer_name,
DROP COLUMN IF EXISTS cashapp,
DROP COLUMN IF EXISTS apple_pay,
DROP COLUMN IF EXISTS sei_wallet,
DROP COLUMN IF EXISTS free_skips,
DROP COLUMN IF EXISTS dexsta_profile,
DROP COLUMN IF EXISTS spotify_profile,
DROP COLUMN IF EXISTS soundcloud_profile,
DROP COLUMN IF EXISTS youtube_profile;

-- Remove new submission columns
ALTER TABLE public.submissions 
DROP COLUMN IF EXISTS tiktok_name,
DROP COLUMN IF EXISTS song_link,
DROP COLUMN IF EXISTS featuring,
DROP COLUMN IF EXISTS audio_file_url,
DROP COLUMN IF EXISTS video_file_url,
DROP COLUMN IF EXISTS nft_id;
```
