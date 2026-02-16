-- Fix duplicate role profiles and enforce one restaurant/driver profile per user
-- Run once in Supabase SQL Editor

BEGIN;

-- 1) Deduplicate restaurants by user_id (keep oldest profile)
WITH ranked AS (
  SELECT id, user_id, created_at,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC, id ASC) AS rn,
         FIRST_VALUE(id) OVER (PARTITION BY user_id ORDER BY created_at ASC, id ASC) AS keep_id
  FROM public.restaurants
  WHERE user_id IS NOT NULL
), dupes AS (
  SELECT id AS drop_id, keep_id
  FROM ranked
  WHERE rn > 1
)
UPDATE public.restaurant_tables rt
SET restaurant_id = d.keep_id
FROM dupes d
WHERE rt.restaurant_id = d.drop_id;

WITH ranked AS (
  SELECT id, user_id, created_at,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC, id ASC) AS rn,
         FIRST_VALUE(id) OVER (PARTITION BY user_id ORDER BY created_at ASC, id ASC) AS keep_id
  FROM public.restaurants
  WHERE user_id IS NOT NULL
), dupes AS (
  SELECT id AS drop_id, keep_id
  FROM ranked
  WHERE rn > 1
)
UPDATE public.qr_orders q
SET restaurant_id = d.keep_id
FROM dupes d
WHERE q.restaurant_id = d.drop_id;

WITH ranked AS (
  SELECT id, user_id, created_at,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC, id ASC) AS rn,
         FIRST_VALUE(id) OVER (PARTITION BY user_id ORDER BY created_at ASC, id ASC) AS keep_id
  FROM public.restaurants
  WHERE user_id IS NOT NULL
), dupes AS (
  SELECT id AS drop_id, keep_id
  FROM ranked
  WHERE rn > 1
)
UPDATE public.orders o
SET restaurant_id = d.keep_id
FROM dupes d
WHERE o.restaurant_id = d.drop_id;

WITH ranked AS (
  SELECT id, user_id, created_at,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC, id ASC) AS rn,
         FIRST_VALUE(id) OVER (PARTITION BY user_id ORDER BY created_at ASC, id ASC) AS keep_id
  FROM public.restaurants
  WHERE user_id IS NOT NULL
), dupes AS (
  SELECT id AS drop_id
  FROM ranked
  WHERE rn > 1
)
DELETE FROM public.restaurants r
USING dupes d
WHERE r.id = d.drop_id;

-- 2) Deduplicate drivers by user_id (keep oldest profile)
WITH ranked AS (
  SELECT id, user_id, created_at,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC, id ASC) AS rn,
         FIRST_VALUE(id) OVER (PARTITION BY user_id ORDER BY created_at ASC, id ASC) AS keep_id
  FROM public.drivers
  WHERE user_id IS NOT NULL
), dupes AS (
  SELECT id AS drop_id, keep_id
  FROM ranked
  WHERE rn > 1
)
UPDATE public.deliveries d0
SET driver_id = d.keep_id
FROM dupes d
WHERE d0.driver_id = d.drop_id;

WITH ranked AS (
  SELECT id, user_id, created_at,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC, id ASC) AS rn,
         FIRST_VALUE(id) OVER (PARTITION BY user_id ORDER BY created_at ASC, id ASC) AS keep_id
  FROM public.drivers
  WHERE user_id IS NOT NULL
), dupes AS (
  SELECT id AS drop_id
  FROM ranked
  WHERE rn > 1
)
DELETE FROM public.drivers d0
USING dupes d
WHERE d0.id = d.drop_id;

-- 3) Enforce uniqueness for future inserts
CREATE UNIQUE INDEX IF NOT EXISTS uq_restaurants_user_id ON public.restaurants(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_drivers_user_id ON public.drivers(user_id) WHERE user_id IS NOT NULL;

COMMIT;
