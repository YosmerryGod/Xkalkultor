-- [ADDED] Xkalkultor PostgreSQL schema.
-- All statements are idempotent so this migration can be run more than once.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- [ADDED] User accounts. Passwords are stored as secure hashes, never plaintext.
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(80) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL DEFAULT '',
  store_name VARCHAR(150) NOT NULL DEFAULT '',
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- [ADDED] Google identity used to link verified Google accounts to existing users.
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_sub
  ON users(google_sub)
  WHERE google_sub IS NOT NULL;

-- [ADDED] Hashed opaque session tokens; raw tokens are never stored.
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- [ADDED] User calculator preferences and marketplace configuration.
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  calculator_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  appearance JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- [ADDED] Saved menu items shown in the calculator.
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(180) NOT NULL,
  net_price NUMERIC(14, 2) NOT NULL CHECK (net_price > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_user_id ON menu_items(user_id);

-- [ADDED] Calculation history, including the original inputs and price breakdown.
CREATE TABLE IF NOT EXISTS calculation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  menu_name VARCHAR(180) NOT NULL DEFAULT 'Item Tanpa Nama',
  net_price NUMERIC(14, 2) NOT NULL CHECK (net_price >= 0),
  final_price NUMERIC(14, 2) NOT NULL CHECK (final_price >= 0),
  marketplace VARCHAR(40) NOT NULL,
  marketplace_name VARCHAR(80) NOT NULL DEFAULT '',
  has_coret BOOLEAN NOT NULL DEFAULT FALSE,
  coret_discount_percent NUMERIC(7, 3),
  raw_inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calculation_history_user_date
  ON calculation_history(user_id, calculated_at DESC);

-- [ADDED] User-created marketplace promotions and promo packages.
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(180) NOT NULL,
  marketplace VARCHAR(40) NOT NULL DEFAULT 'all',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  is_package BOOLEAN NOT NULL DEFAULT FALSE,
  promo_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotions_user_marketplace
  ON promotions(user_id, marketplace);

-- [ADDED] Global home content managed by administrators.
CREATE TABLE IF NOT EXISTS home_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('banner', 'promo')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_home_content_type_order
  ON home_content(content_type, sort_order);

-- [ADDED] Full frontend state snapshot, scoped to the authenticated account.
-- This keeps existing calculator/history structures available for normalized reporting.
CREATE TABLE IF NOT EXISTS user_app_data (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- [ADDED] Shared home-page content controlled by admin accounts.
CREATE TABLE IF NOT EXISTS global_app_data (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
