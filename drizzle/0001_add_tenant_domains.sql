-- Migration: Add tenant_domains table for multi-domain support
-- NOTE: This is a legacy manual migration. The Drizzle-generated
-- 0001_tiny_living_tribunal.sql already creates the same table with
-- the same schema. Do NOT run this file against a fresh database.
-- The INSERT below is DEPRECATED — platform subdomains are derived
-- from tenants.slug, never stored in tenant_domains.
CREATE TABLE tenant_domains (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    domain text NOT NULL UNIQUE
);
-- DEPRECATED: INSERT INTO tenant_domains (tenant_id, domain) VALUES ('b3f26528-6814-4b1e-88d0-71e9fb34581b', 'agora.localhost');
