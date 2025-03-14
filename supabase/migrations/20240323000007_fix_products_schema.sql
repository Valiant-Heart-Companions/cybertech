-- Drop existing table and all its dependencies
DROP TABLE IF EXISTS products CASCADE;

-- Create products table with new structure
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
CREATE INDEX products_sku_idx ON products(sku);
CREATE INDEX products_category_idx ON products(category);
CREATE INDEX products_brand_idx ON products(brand);

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