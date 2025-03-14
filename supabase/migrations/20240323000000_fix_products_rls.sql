-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to insert products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON products;

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to products
CREATE POLICY "Allow public read access to products"
ON products
FOR SELECT
TO public
USING (true);

-- Create policy to allow service role full access
CREATE POLICY "Allow service role full access"
ON products
TO service_role
USING (true)
WITH CHECK (true);

-- Create policy to allow authenticated users to insert products
CREATE POLICY "Allow authenticated users to insert products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to update products
CREATE POLICY "Allow authenticated users to update products"
ON products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy to allow authenticated users to delete products
CREATE POLICY "Allow authenticated users to delete products"
ON products
FOR DELETE
TO authenticated
USING (true); 