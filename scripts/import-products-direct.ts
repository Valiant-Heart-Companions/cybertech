import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
console.log(`Loading environment variables from: ${envPath}`);
dotenv.config({ path: envPath });

// Supabase setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableTriggers() {
  console.log('Disabling product category triggers...');
  const { error } = await supabase.rpc('disable_product_triggers');
  if (error) {
    console.error('Error disabling triggers:', error);
    throw error;
  }
}

async function enableTriggers() {
  console.log('Re-enabling product category triggers...');
  const { error } = await supabase.rpc('enable_product_triggers');
  if (error) {
    console.error('Error enabling triggers:', error);
    throw error;
  }
}

async function processCategories() {
  console.log('Processing product categories...');
  const { error } = await supabase.rpc('process_all_product_categories');
  if (error) {
    console.error('Error processing categories:', error);
    throw error;
  }
}

function generateSKU(product: any): string {
  // If product has a valid SKU, use it
  if (product.sku && typeof product.sku === 'string' && product.sku.trim() !== '') {
    return product.sku.trim();
  }
  
  // Otherwise, generate a SKU from the product URL
  if (product.product_url) {
    // Extract the last part of the URL and clean it
    const urlParts = product.product_url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart && lastPart.trim() !== '') {
      return lastPart.trim();
    }
  }
  
  // If all else fails, generate a SKU from the name and ID
  const cleanName = product.name
    ? product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    : 'unknown';
  return `${cleanName}-${product.id}`;
}

async function importProducts() {
  // Read the JSON file
  const filePath = path.join(process.cwd(), 'products', 'cecomsa_products.json');
  console.log(`Reading products from ${filePath}`);
  
  let products: any[];
  try {
    const jsonData = fs.readFileSync(filePath, 'utf8');
    products = JSON.parse(jsonData);
    console.log(`Found ${products.length} products to import`);
  } catch (error) {
    console.error('Error reading products file:', error);
    process.exit(1);
  }
  
  try {
    // Step 1: Disable triggers
    await disableTriggers();
    
    // Step 2: Import products in batches
    const BATCH_SIZE = 50; // Increased batch size since we disabled triggers
    let processed = 0;
    let succeeded = 0;
    let failed = 0;
    
    console.log(`Processing products in batches of ${BATCH_SIZE}...`);
    
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      console.log(`\nProcessing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(products.length / BATCH_SIZE)}...`);
      
      // Map products to the correct structure
      const productsToInsert = batch.map(product => ({
        cecomsa_id: product.id,
        sku: generateSKU(product),
        name: product.name,
        description: null,
        current_price: product.current_price,
        list_price: product.list_price,
        discount_percentage: product.discount_percentage,
        discount_label: product.discount_label,
        product_url: product.product_url,
        image_url: product.image_url,
        specifications: product.specifications,
        all_specifications: product.all_specifications,
        images: product.images,
        category: product.category,
        brand: product.all_specifications?.MARCA || null,
        model: product.all_specifications?.MODELO || null,
        color: product.all_specifications?.COLOR || null,
        material: product.all_specifications?.MATERIAL || null,
        dimension: product.all_specifications?.DIMENSIÓN || null,
        weight: null
      }));
      
      const { error: batchError } = await supabase
        .from('products')
        .upsert(productsToInsert, {
          onConflict: 'sku',
          ignoreDuplicates: false
        });
      
      if (batchError) {
        console.log('Batch insert failed, trying individual inserts...');
        console.log('Batch error:', JSON.stringify(batchError));
        
        for (const product of productsToInsert) {
          try {
            const { error: insertError } = await supabase
              .from('products')
              .upsert(product, {
                onConflict: 'sku',
                ignoreDuplicates: false
              });
            
            if (insertError) {
              console.log(`Failed to insert product ${product.sku}:`, JSON.stringify(insertError));
              failed++;
            } else {
              succeeded++;
            }
          } catch (error) {
            console.error(`Error processing product ${product.sku}:`, error);
            failed++;
          }
        }
      } else {
        succeeded += productsToInsert.length;
      }
      
      processed += batch.length;
      console.log(`Progress: ${processed}/${products.length} (${Math.round(processed/products.length*100)}%)`);
    }
    
    // Step 3: Process categories
    await processCategories();
    
    // Step 4: Re-enable triggers
    await enableTriggers();
    
    console.log('\nImport summary:');
    console.log(`Total products: ${products.length}`);
    console.log(`Successfully imported: ${succeeded}`);
    console.log(`Failed: ${failed}`);
    
  } catch (error) {
    console.error('Error during import process:', error);
    // Make sure to re-enable triggers even if there's an error
    try {
      await enableTriggers();
    } catch (triggerError) {
      console.error('Error re-enabling triggers:', triggerError);
    }
    process.exit(1);
  }
}

// Run the import
console.log('Starting product import...');
importProducts()
  .then(() => console.log('Import completed'))
  .catch(error => {
    console.error('Unhandled error during import:', error);
    process.exit(1);
  }); 