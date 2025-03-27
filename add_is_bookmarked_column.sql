-- Add is_bookmarked column to video_progress table
ALTER TABLE video_progress ADD COLUMN is_bookmarked BOOLEAN NOT NULL DEFAULT FALSE; 