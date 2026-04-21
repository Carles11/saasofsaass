-- Migration: Add tenant_domains table for multi-domain support
CREATE TABLE tenant_domains (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    domain text NOT NULL UNIQUE
);
-- Optional: Seed with existing tenants (example for 'agora')
INSERT INTO tenant_domains (tenant_id, domain) VALUES ('b3f26528-6814-4b1e-88d0-71e9fb34581b', 'agora.localhost');
