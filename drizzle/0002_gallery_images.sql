-- Gallery Images Table
CREATE TABLE IF NOT EXISTS gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    s3_key TEXT NOT NULL UNIQUE,
    "order" INTEGER NOT NULL DEFAULT 0,
    meta JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gallery_images_tenant_id ON gallery_images(tenant_id);

-- Gallery Image I18n Table
CREATE TABLE IF NOT EXISTS gallery_image_i18n (
    image_id UUID NOT NULL REFERENCES gallery_images(id) ON DELETE CASCADE,
    lang TEXT NOT NULL,
    alt TEXT NOT NULL,
    caption TEXT NOT NULL,
    PRIMARY KEY (image_id, lang)
);
