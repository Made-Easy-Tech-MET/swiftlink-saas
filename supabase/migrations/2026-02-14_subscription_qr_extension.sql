-- Extend SwiftLink with SaaS subscriptions + QR ordering (non-destructive migration)

BEGIN;

-- Add enum values used by the new subscription model
DO $$
BEGIN
  BEGIN
    ALTER TYPE subscription_plan ADD VALUE 'free';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER TYPE subscription_plan ADD VALUE 'pro';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER TYPE subscription_plan ADD VALUE 'ultimate';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER TYPE subscription_status ADD VALUE 'blocked';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS role user_role,
  ADD COLUMN IF NOT EXISTS grace_period_end date,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_role ON public.subscriptions(role);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);

CREATE TABLE IF NOT EXISTS public.restaurant_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_number integer NOT NULL,
  table_name varchar(120),
  qr_code_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, table_number)
);

CREATE TABLE IF NOT EXISTS public.qr_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_id uuid REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
  table_number integer NOT NULL,
  customer_name varchar(140),
  customer_phone varchar(30),
  status varchar(30) NOT NULL DEFAULT 'pending',
  notes text,
  subtotal numeric(10, 2) NOT NULL DEFAULT 0,
  total numeric(10, 2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.qr_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_order_id uuid NOT NULL REFERENCES public.qr_orders(id) ON DELETE CASCADE,
  item_name varchar(140) NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric(10, 2) NOT NULL DEFAULT 0,
  total_price numeric(10, 2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restaurant_tables_restaurant_id ON public.restaurant_tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_qr_orders_restaurant_id ON public.qr_orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_qr_orders_status ON public.qr_orders(status);
CREATE INDEX IF NOT EXISTS idx_qr_order_items_qr_order_id ON public.qr_order_items(qr_order_id);

COMMIT;
