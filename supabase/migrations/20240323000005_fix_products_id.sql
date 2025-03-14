-- Drop existing primary key constraint
ALTER TABLE products DROP CONSTRAINT products_pkey;

-- Drop the id column since we'll use SKU as primary key
ALTER TABLE products DROP COLUMN id;

-- Make SKU the primary key
ALTER TABLE products ADD PRIMARY KEY (sku);

-- Drop the SERIAL sequence since we won't need it anymore
DROP SEQUENCE IF EXISTS products_id_seq; 