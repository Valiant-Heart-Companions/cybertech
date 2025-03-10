import { createClient } from '@supabase/supabase-js';
import { parse, CastingContext } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Environment variables not found:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  throw new Error('Missing Supabase credentials in environment variables');
}

console.log('Using Supabase URL:', supabaseUrl);
console.log('Service role key length:', supabaseServiceKey.length);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Product {
  name: string;
  sku: string;
  current_price: number;
  list_price: number | null;
  discount_percentage: number | null;
  discount_label: string | null;
  product_url: string | null;
  image_url: string | null;
  specifications: any;
  all_specifications: any;
  images: any;
}

function parseJsonString(value: unknown): any {
  if (!value) return null;
  try {
    // Replace single quotes with double quotes for valid JSON
    const jsonString = String(value).replace(/'/g, '"');
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', value);
    return null;
  }
}

function areProductsEqual(existing: Product, newProduct: Product): boolean {
  return (
    existing.name === newProduct.name &&
    existing.current_price === newProduct.current_price &&
    existing.list_price === newProduct.list_price &&
    existing.discount_percentage === newProduct.discount_percentage &&
    existing.discount_label === newProduct.discount_label &&
    existing.product_url === newProduct.product_url &&
    existing.image_url === newProduct.image_url &&
    JSON.stringify(existing.specifications) === JSON.stringify(newProduct.specifications) &&
    JSON.stringify(existing.all_specifications) === JSON.stringify(newProduct.all_specifications) &&
    JSON.stringify(existing.images) === JSON.stringify(newProduct.images)
  );
}

async function importProducts() {
  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to Supabase');
    }

    // Read and parse CSV file
    const csvFilePath = path.join(process.cwd(), 'products', 'cecomsa_products_detailed.csv');
    console.log('Reading CSV file from:', csvFilePath);
    
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      cast: (value: unknown, context: CastingContext) => {
        const stringValue = String(value);
        // Convert numeric fields
        if (['current_price', 'list_price', 'discount_percentage'].includes(String(context.column))) {
          return value ? parseFloat(stringValue) : null;
        }
        // Parse JSON fields
        if (['specifications', 'all_specifications', 'images'].includes(String(context.column))) {
          return parseJsonString(value);
        }
        return value;
      }
    });

    console.log(`Found ${records.length} records in CSV`);

    // Transform records to match our schema
    const transformedRecords = records.map((record: any) => ({
      name: record.name,
      sku: record.sku,
      current_price: record.current_price,
      list_price: record.list_price,
      discount_percentage: record.discount_percentage,
      discount_label: record.discount_label,
      product_url: record.product_url,
      image_url: record.image_url,
      specifications: record.specifications,
      all_specifications: record.all_specifications,
      images: record.images
    }));

    // Process products in batches
    const batchSize = 100;
    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < transformedRecords.length; i += batchSize) {
      const batch = transformedRecords.slice(i, i + batchSize);
      
      // First, check which products already exist
      const { data: existingProducts, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .in('sku', batch.map((p: Product) => p.sku));

      if (fetchError) {
        console.error(`Error fetching existing products for batch ${i / batchSize + 1}:`, fetchError);
        continue;
      }

      // Create maps for easier lookup
      const existingMap = new Map(existingProducts?.map(p => [p.sku, p]) || []);
      const productsToInsert: Product[] = [];
      const productsToUpdate: Product[] = [];

      // Categorize products
      batch.forEach((product: Product) => {
        const existing = existingMap.get(product.sku);
        if (!existing) {
          productsToInsert.push(product);
        } else if (!areProductsEqual(existing, product)) {
          productsToUpdate.push(product);
        } else {
          skippedCount++;
        }
      });

      // Insert new products
      if (productsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('products')
          .insert(productsToInsert);

        if (insertError) {
          console.error(`Error inserting new products in batch ${i / batchSize + 1}:`, insertError);
        } else {
          insertedCount += productsToInsert.length;
        }
      }

      // Update changed products
      if (productsToUpdate.length > 0) {
        const { error: updateError } = await supabase
          .from('products')
          .upsert(productsToUpdate, {
            onConflict: 'sku',
            ignoreDuplicates: false
          });

        if (updateError) {
          console.error(`Error updating products in batch ${i / batchSize + 1}:`, updateError);
        } else {
          updatedCount += productsToUpdate.length;
        }
      }

      console.log(`Processed batch ${i / batchSize + 1}:`, {
        inserted: productsToInsert.length,
        updated: productsToUpdate.length,
        skipped: batch.length - productsToInsert.length - productsToUpdate.length
      });
    }

    console.log('Import completed:', {
      total: transformedRecords.length,
      inserted: insertedCount,
      updated: updatedCount,
      skipped: skippedCount
    });
  } catch (error) {
    console.error('Error importing products:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    process.exit(1);
  }
}

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Connection test failed:', error);
      throw error;
    }

    console.log('Connection test successful!');
    return true;
  } catch (error) {
    console.error('Connection test error:', error);
    return false;
  }
}

importProducts(); 