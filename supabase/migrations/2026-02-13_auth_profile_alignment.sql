-- Migration: align public.users with Supabase Auth profile model
-- Run this in Supabase SQL Editor on an existing database.

BEGIN;

-- 1) Remove legacy password storage from profile table
ALTER TABLE public.users
  DROP COLUMN IF EXISTS password_hash;

-- 2) Ensure user IDs come from auth.users (not generated locally)
ALTER TABLE public.users
  ALTER COLUMN id DROP DEFAULT;

-- 3) Add FK users.id -> auth.users.id if not already present.
-- This migration aborts if orphan profile rows exist.
DO $$
DECLARE
  orphan_count integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_id_auth_users_fkey'
  ) THEN
    SELECT COUNT(*) INTO orphan_count
    FROM public.users u
    WHERE NOT EXISTS (
      SELECT 1
      FROM auth.users a
      WHERE a.id = u.id
    );

    IF orphan_count > 0 THEN
      RAISE EXCEPTION
        'Migration blocked: % orphan rows in public.users without matching auth.users. Resolve them first, then rerun.',
        orphan_count;
    END IF;

    ALTER TABLE public.users
      ADD CONSTRAINT users_id_auth_users_fkey
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4) Allow authenticated users to create their own profile row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON public.users
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

COMMIT;
