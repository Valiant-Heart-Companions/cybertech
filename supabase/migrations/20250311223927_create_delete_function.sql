-- Create function to delete product categories
CREATE OR REPLACE FUNCTION delete_product_categories(p_product_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM product_categories WHERE product_id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 