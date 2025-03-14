# Cybertech Import Scripts

This directory contains scripts for managing product imports and database operations.

## Main Scripts

### `import-products-direct.ts`

The primary script for importing products from Cecomsa. This script handles:
- Product data import with proper SKU generation
- Category hierarchy creation
- Product-category relationships

Usage:
```bash
npx tsx scripts/import-products-direct.ts
```

Features:
- Batch processing (50 products at a time)
- Automatic SKU generation from product data
- Temporary disabling of triggers during import
- Proper category hierarchy management
- Error handling and reporting

### `setup-database.ts`

Used for initial database setup and configuration.

Usage:
```bash
npx tsx scripts/setup-database.ts
```

## Import Process

The import process follows these steps:

1. **Preparation**:
   - Disables category-related triggers temporarily
   - Reads products from JSON file
   - Validates input data

2. **Product Import**:
   - Processes products in batches of 50
   - Generates SKUs using the following strategy:
     1. Uses existing SKU if valid
     2. Falls back to product URL slug
     3. Generates from product name and ID as last resort
   - Handles duplicates using upsert on SKU

3. **Category Processing**:
   - Processes category hierarchies after product import
   - Creates missing categories
   - Establishes parent-child relationships
   - Links products to appropriate categories

4. **Cleanup**:
   - Re-enables triggers
   - Reports import statistics

## Error Handling

The script handles several types of errors:
- Missing or invalid SKUs
- Duplicate products
- Category hierarchy issues
- Database connection problems

All errors are logged with relevant details for troubleshooting.

## Regular Import Process

For periodic imports to update inventory:

1. Ensure you have the latest product data JSON file in the `products` directory
2. Run the import script:
   ```bash
   npx tsx scripts/import-products-direct.ts
   ```
3. Check the console output for any errors or warnings
4. Verify the import results in the database

## Database Schema

The import process works with the following tables:
- `products`: Main product information
- `categories`: Category hierarchy
- `product_categories`: Product-category relationships

See `supabase/migrations/20240329000000_consolidated_schema.sql` for complete schema details.

## Troubleshooting

Common issues and solutions:

1. **Duplicate SKUs**:
   - The script uses upsert, so duplicates will update existing records
   - Check the SKU generation logic if you see unexpected updates

2. **Category Issues**:
   - Category processing happens after product import
   - Check the category string format (should use '>' as separator)
   - Verify category hierarchy in the database

3. **Performance Issues**:
   - The script uses batch processing to optimize performance
   - Adjust the `BATCH_SIZE` constant if needed
   - Monitor database load during import

## Development

When modifying the import process:

1. Always test with a small dataset first
2. Maintain the trigger disable/enable pattern
3. Keep the SKU generation logic consistent
4. Update this documentation with any changes 