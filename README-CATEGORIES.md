# Hierarchical Category System

This document explains how to set up and use the hierarchical category system in the Cybertech shop.

## Overview

The new category system allows:

- Products to belong to multiple categories
- Categories to have a hierarchical structure (e.g., Electronics > Computers > Laptops)
- Automatic breadcrumb navigation based on the category hierarchy
- Filtering products by any level in the category hierarchy

## Database Structure

The system uses the following database tables:

1. `categories` - Stores category information with parent-child relationships
2. `product_categories` - Junction table linking products to categories

### Categories Table

- `id` - Primary key
- `name` - Category name
- `slug` - URL-friendly version of the name
- `parent_id` - Reference to parent category (nullable)
- `description` - Optional category description
- `image_url` - Optional category image

### Product Categories Table

- `id` - Primary key
- `product_id` - Reference to product
- `category_id` - Reference to category
- `is_primary` - Boolean indicating if this is the primary category for the product

## Setup Instructions

To set up the category system, follow these steps:

1. **Run the database migration** to create the necessary tables and functions:

```bash
npx supabase migration up
```

2. **Create test categories** with a hierarchical structure:

```bash
npm run create-categories
```

3. **Assign products to categories** based on their existing category field:

```bash
npm run assign-categories
```

Alternatively, you can run both scripts in sequence:

```bash
npm run setup-categories
```

## Adding New Categories

You can add new categories in two ways:

1. **Manually via the database**:
   - Insert directly into the `categories` table
   - Set `parent_id` to the ID of the parent category

2. **Through product updates**:
   - Update a product's `category` field with a hierarchical path (e.g., "Electronics > Computers > Laptops")
   - The trigger will automatically create any missing categories

## Assigning Products to Categories

You can assign products to categories in two ways:

1. **Update the product's category field**:
   - Set the `category` field with a hierarchical path
   - The trigger will automatically update the `product_categories` table

2. **Manually insert into product_categories**:
   - Insert records directly into the `product_categories` table
   - Set `is_primary` to `true` for the main category

## User Interface

The UI has been updated to:

- Display a hierarchical category sidebar
- Show breadcrumb navigation for the current category
- Filter products by category at any level
- Allow searching within categories

## Troubleshooting

- If categories aren't showing up, check the `categories` table to ensure they exist
- If products aren't appearing in categories, check the `product_categories` table for proper associations
- The migration includes triggers that should keep everything in sync, but manual fixes may be needed for edge cases 