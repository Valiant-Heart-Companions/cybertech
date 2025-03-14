-- Drop existing table and all its dependencies
DROP TABLE IF EXISTS products CASCADE;

-- Drop all existing triggers and functions
DO $$ 
DECLARE
    trigger_name text;
BEGIN
    FOR trigger_name IN 
        SELECT t.trigger_name 
        FROM information_schema.triggers t
        WHERE t.event_object_table = 'products'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON products', trigger_name);
    END LOOP;
END $$;

-- Drop existing function if it exists (with CASCADE to handle dependencies)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create products table with new structure
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    list_price DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    discount_label TEXT,
    product_url TEXT,
    image_url TEXT,
    specifications JSONB,
    all_specifications JSONB,
    images JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on SKU for faster lookups
CREATE INDEX products_sku_idx ON products(sku);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to products
CREATE POLICY "Allow public read access to products"
ON products
FOR SELECT
TO public
USING (true);

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