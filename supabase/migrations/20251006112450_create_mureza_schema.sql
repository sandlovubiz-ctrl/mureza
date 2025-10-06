/*
  # Mureza Music Studio Database Schema

  ## Overview
  This migration creates the complete database structure for the Mureza Music Studio platform,
  including user profiles, token management, music generations, and billing transactions.

  ## Tables Created

  1. **profiles**
     - Extends Supabase auth.users with additional user data
     - Stores token balance, preferences, and profile information
     - One-to-one relationship with auth.users

  2. **generations**
     - Stores all music generation records (metadata only, no audio files)
     - Tracks prompt, model, duration, tokens used, and status
     - Links to user via user_id

  3. **token_transactions**
     - Records all token purchases and usage
     - Tracks transaction type (purchase/usage), amount, and billing details
     - Links to user and generation (if applicable)

  4. **token_packages**
     - Defines available token packages for purchase
     - Stores package name, token amount, price, and status

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data
  - Public read access for token packages
  - Secure policies for all CRUD operations

  ## Important Notes
  - Audio files are NOT stored in the database
  - Generations table stores metadata only
  - Token balance is managed through transactions and cached in profiles
  - All timestamps use timestamptz for timezone awareness
*/

-- Create enum types
CREATE TYPE generation_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE generation_model AS ENUM ('V3_5', 'V4', 'V4_5');
CREATE TYPE transaction_type AS ENUM ('purchase', 'usage', 'refund');

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  token_balance integer DEFAULT 0 NOT NULL CHECK (token_balance >= 0),
  total_tokens_purchased integer DEFAULT 0 NOT NULL,
  total_tokens_used integer DEFAULT 0 NOT NULL,
  default_model generation_model DEFAULT 'V3_5',
  auto_download boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Generations table
CREATE TABLE IF NOT EXISTS generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  title text,
  model generation_model NOT NULL,
  duration_seconds integer NOT NULL CHECK (duration_seconds > 0),
  status generation_status DEFAULT 'pending' NOT NULL,
  tokens_used integer NOT NULL CHECK (tokens_used > 0),
  error_message text,
  created_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz
);

-- Token transactions table
CREATE TABLE IF NOT EXISTS token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  generation_id uuid REFERENCES generations(id) ON DELETE SET NULL,
  transaction_type transaction_type NOT NULL,
  token_amount integer NOT NULL,
  price_usd numeric(10, 2),
  stripe_payment_id text,
  stripe_session_id text,
  package_name text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Token packages table
CREATE TABLE IF NOT EXISTS token_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  token_amount integer NOT NULL CHECK (token_amount > 0),
  price_usd numeric(10, 2) NOT NULL CHECK (price_usd > 0),
  is_active boolean DEFAULT true NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON token_transactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_packages ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Generations RLS policies
CREATE POLICY "Users can view own generations"
  ON generations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations"
  ON generations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations"
  ON generations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Token transactions RLS policies
CREATE POLICY "Users can view own transactions"
  ON token_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON token_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Token packages RLS policies (public read access)
CREATE POLICY "Anyone can view active packages"
  ON token_packages FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default token packages
INSERT INTO token_packages (name, description, token_amount, price_usd, display_order) VALUES
  ('Starter', 'Perfect for trying out Mureza', 100, 9.99, 1),
  ('Pro', 'For regular music creators', 500, 39.99, 2),
  ('Enterprise', 'For power users and studios', 2000, 129.99, 3)
ON CONFLICT DO NOTHING;