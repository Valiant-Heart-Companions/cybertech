-- Add category column to products table
ALTER TABLE products
ADD COLUMN category TEXT;

-- Create an index on the category column for better query performance
CREATE INDEX idx_products_category ON products(category);

-- Update RLS policies to include category
DROP POLICY IF EXISTS "Public read access" ON products;
DROP POLICY IF EXISTS "Service role full access" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert" ON products;
DROP POLICY IF EXISTS "Authenticated users can update" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete" ON products;

-- Recreate policies with category included
CREATE POLICY "Public read access"
ON products FOR SELECT
TO public
USING (true);

CREATE POLICY "Service role full access"
ON products FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can insert"
ON products FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update"
ON products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete"
ON products FOR DELETE
TO authenticated
USING (true); 