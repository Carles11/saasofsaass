-- Add block_id to gallery_images for multi-gallery support
ALTER TABLE gallery_images
ADD COLUMN block_id UUID NOT NULL REFERENCES blocks(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_gallery_images_block_id ON gallery_images(block_id);