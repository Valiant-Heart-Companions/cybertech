-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cecomsa_id INTEGER,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    current_price DECIMAL(10,2),
    list_price DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    discount_label TEXT,
    product_url TEXT,
    image_url TEXT,
    specifications JSONB,
    all_specifications JSONB,
    images TEXT[],
    category TEXT,
    brand TEXT,
    model TEXT,
    color TEXT,
    material TEXT,
    dimension TEXT,
    weight TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_categories junction table
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, category_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_cecomsa_id ON products(cecomsa_id);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_is_primary ON product_categories(is_primary);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Products policies
CREATE POLICY "Products are viewable by everyone" 
    ON products FOR SELECT 
    USING (true);

CREATE POLICY "Products are insertable by authenticated users" 
    ON products FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Products are updatable by authenticated users" 
    ON products FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Products are deletable by authenticated users" 
    ON products FOR DELETE 
    USING (auth.role() = 'authenticated');

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" 
    ON categories FOR SELECT 
    USING (true);

CREATE POLICY "Categories are insertable by authenticated users" 
    ON categories FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Categories are updatable by authenticated users" 
    ON categories FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Categories are deletable by authenticated users" 
    ON categories FOR DELETE 
    USING (auth.role() = 'authenticated');

-- Product categories policies
CREATE POLICY "Product categories are viewable by everyone" 
    ON product_categories FOR SELECT 
    USING (true);

CREATE POLICY "Product categories are insertable by authenticated users" 
    ON product_categories FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Product categories are updatable by authenticated users" 
    ON product_categories FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Product categories are deletable by authenticated users" 
    ON product_categories FOR DELETE 
    USING (auth.role() = 'authenticated');

-- Function to disable product triggers
CREATE OR REPLACE FUNCTION disable_product_triggers()
RETURNS void AS $$
BEGIN
    ALTER TABLE products DISABLE TRIGGER product_category_insert;
    ALTER TABLE products DISABLE TRIGGER product_category_update;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enable product triggers
CREATE OR REPLACE FUNCTION enable_product_triggers()
RETURNS void AS $$
BEGIN
    ALTER TABLE products ENABLE TRIGGER product_category_insert;
    ALTER TABLE products ENABLE TRIGGER product_category_update;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process all product categories
CREATE OR REPLACE FUNCTION process_all_product_categories()
RETURNS void AS $$
DECLARE
    p RECORD;
    category_name TEXT;
    current_parent_id UUID;
    child_id UUID;
    category_parts TEXT[];
    current_part TEXT;
    current_path TEXT := '';
BEGIN
    -- First, clear existing product categories
    DELETE FROM product_categories;
    
    -- Iterate through all products with a category value
    FOR p IN SELECT id, category FROM products WHERE category IS NOT NULL AND category != '' LOOP
        -- Split the category path
        category_parts := string_to_array(p.category, '>');
        current_parent_id := NULL;
        current_path := '';
        
        -- Process each part of the category path
        FOR i IN 1..array_length(category_parts, 1) LOOP
            current_part := trim(category_parts[i]);
            
            -- Update the current path
            IF current_path = '' THEN
                current_path := current_part;
            ELSE
                current_path := current_path || ' > ' || current_part;
            END IF;
            
            -- Check if this category level already exists
            SELECT c.id INTO child_id 
            FROM categories c 
            WHERE c.name = current_part 
            AND (
                (current_parent_id IS NULL AND c.parent_id IS NULL) OR 
                (c.parent_id = current_parent_id)
            );
            
            -- If it doesn't exist, create it
            IF child_id IS NULL THEN
                INSERT INTO categories (name, slug, parent_id)
                VALUES (
                    current_part, 
                    lower(regexp_replace(current_part, '[^a-z0-9]', '-', 'g')), 
                    current_parent_id
                )
                RETURNING id INTO child_id;
            END IF;
            
            -- Link the product to this category
            INSERT INTO product_categories (product_id, category_id, is_primary)
            VALUES (p.id, child_id, i = array_length(category_parts, 1))
            ON CONFLICT (product_id, category_id) DO NOTHING;
            
            -- Update the parent_id for the next iteration
            current_parent_id := child_id;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update product categories on product changes
CREATE OR REPLACE FUNCTION update_product_categories()
RETURNS TRIGGER AS $$
DECLARE
    category_parts TEXT[];
    current_parent_id UUID;
    child_id UUID;
    current_part TEXT;
    current_path TEXT := '';
BEGIN
    -- If the category has changed
    IF NEW.category IS DISTINCT FROM OLD.category THEN
        -- Remove existing categories for this product
        DELETE FROM product_categories WHERE product_id = NEW.id;
        
        -- Only proceed if we have a new category
        IF NEW.category IS NOT NULL AND NEW.category != '' THEN
            -- Split the category path
            category_parts := string_to_array(NEW.category, '>');
            current_parent_id := NULL;
            
            -- Process each part of the category path
            FOR i IN 1..array_length(category_parts, 1) LOOP
                current_part := trim(category_parts[i]);
                
                -- Update the current path
                IF current_path = '' THEN
                    current_path := current_part;
                ELSE
                    current_path := current_path || ' > ' || current_part;
                END IF;
                
                -- Check if this category level already exists
                SELECT c.id INTO child_id 
                FROM categories c 
                WHERE c.name = current_part 
                AND (
                    (current_parent_id IS NULL AND c.parent_id IS NULL) OR 
                    (c.parent_id = current_parent_id)
                );
                
                -- If it doesn't exist, create it
                IF child_id IS NULL THEN
                    INSERT INTO categories (name, slug, parent_id)
                    VALUES (
                        current_part, 
                        lower(regexp_replace(current_part, '[^a-z0-9]', '-', 'g')), 
                        current_parent_id
                    )
                    RETURNING id INTO child_id;
                END IF;
                
                -- Link the product to this category
                INSERT INTO product_categories (product_id, category_id, is_primary)
                VALUES (NEW.id, child_id, i = array_length(category_parts, 1))
                ON CONFLICT (product_id, category_id) DO NOTHING;
                
                -- Update the parent_id for the next iteration
                current_parent_id := child_id;
            END LOOP;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for product category management
DROP TRIGGER IF EXISTS product_category_update ON products;
CREATE TRIGGER product_category_update
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_categories();

DROP TRIGGER IF EXISTS product_category_insert ON products;
CREATE TRIGGER product_category_insert
    AFTER INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_categories(); 