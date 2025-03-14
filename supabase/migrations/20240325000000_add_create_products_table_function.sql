-- Create function to update timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create the products table if it doesn't exist or has issues
CREATE OR REPLACE FUNCTION create_products_table_if_needed()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Drop existing table if it exists
  DROP TABLE IF EXISTS products CASCADE;

  -- Create products table with new structure
  CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cecomsa_id TEXT,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    current_price DECIMAL(10,2) NOT NULL,
    list_price DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    discount_label TEXT,
    product_url TEXT,
    image_url TEXT,
    specifications JSONB,
    all_specifications JSONB,
    images JSONB,
    category TEXT,
    brand TEXT,
    model TEXT,
    color TEXT,
    material TEXT,
    dimension TEXT,
    weight TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
  );

  -- Create indexes for better performance
  CREATE INDEX IF NOT EXISTS products_sku_idx ON products(sku);
  CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
  CREATE INDEX IF NOT EXISTS products_brand_idx ON products(brand);
  CREATE INDEX IF NOT EXISTS products_cecomsa_id_idx ON products(cecomsa_id);

  -- Create trigger to automatically update updated_at
  DROP TRIGGER IF EXISTS update_products_updated_at ON products;
  CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  -- Enable Row Level Security
  ALTER TABLE products ENABLE ROW LEVEL SECURITY;

  -- Create policy to allow public read access to products
  DROP POLICY IF EXISTS "Allow public read access to products" ON products;
  CREATE POLICY "Allow public read access to products"
  ON products
  FOR SELECT
  TO public
  USING (true);

  -- Create policy to allow service role full access
  DROP POLICY IF EXISTS "Allow service role full access" ON products;
  CREATE POLICY "Allow service role full access"
  ON products
  TO service_role
  USING (true)
  WITH CHECK (true);

  -- Create policy to allow authenticated users to insert products
  DROP POLICY IF EXISTS "Allow authenticated users to insert products" ON products;
  CREATE POLICY "Allow authenticated users to insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

  -- Create policy to allow authenticated users to update products
  DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;
  CREATE POLICY "Allow authenticated users to update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

  -- Create policy to allow authenticated users to delete products
  DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON products;
  CREATE POLICY "Allow authenticated users to delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

  RAISE NOTICE 'Products table created or recreated successfully';
END;
$$; 