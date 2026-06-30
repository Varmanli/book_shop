-- Migration: dynamic_shipping_settings
-- Seeds the `settings` table with default shipping values so the system works
-- immediately after deploy without an admin needing to save settings first.
-- The admin panel can override these values at any time.

INSERT INTO settings (id, key, value, updated_at)
VALUES
  (gen_random_uuid(), 'shippingCost',         '350000'::jsonb, now()),
  (gen_random_uuid(), 'freeShippingThreshold', 'null'::jsonb,   now())
ON CONFLICT (key) DO NOTHING;
