import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
console.log('Loading environment variables from:', envPath);

if (!fs.existsSync(envPath)) {
  console.error('Error: .env.local file not found at:', envPath);
  process.exit(1);
}

dotenv.config({ path: envPath });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error && error.code === 'PGRST204') {
      // Table doesn't exist
      return false;
    }

    // If we get here, the table exists
    return true;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

async function setupDatabase() {
  try {
    console.log('Checking database tables...');

    // Check if categories table exists
    const categoriesExists = await checkTableExists('categories');
    if (!categoriesExists) {
      console.log('Categories table does not exist. Please create it using the Supabase dashboard or CLI with this SQL:');
      console.log(`
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id),
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
      `);
      process.exit(1);
    }

    // Check if product_categories table exists
    const productCategoriesExists = await checkTableExists('product_categories');
    if (!productCategoriesExists) {
      console.log('Product_categories table does not exist. Please create it using the Supabase dashboard or CLI with this SQL:');
      console.log(`
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, category_id)
);

CREATE INDEX idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON product_categories(category_id);
CREATE INDEX idx_product_categories_is_primary ON product_categories(is_primary);
      `);
      process.exit(1);
    }

    console.log('All required tables exist!');
  } catch (error) {
    console.error('Unexpected error during database setup:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase(); 