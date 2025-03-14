-- Temporarily disable RLS for products table
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable full access for service role" ON products; 