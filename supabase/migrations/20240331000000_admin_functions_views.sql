-- Admin Functions and Views for common operations

-- View: orders with customer and item details
CREATE OR REPLACE VIEW admin_orders_view AS
SELECT 
    o.id AS order_id,
    o.created_at,
    o.updated_at,
    o.status,
    o.total_amount,
    o.shipping_amount,
    o.tax_amount,
    o.discount_amount,
    o.payment_method,
    o.notes,
    auth.users.email AS customer_email,
    auth.users.id AS customer_id,
    (
        SELECT json_agg(
            json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'product_name', p.name,
                'quantity', oi.quantity,
                'price', oi.price_at_purchase,
                'total', oi.total_item_price
            )
        )
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = o.id
    ) AS items,
    (
        SELECT row_to_json(a)
        FROM addresses a
        WHERE a.id = o.shipping_address_id
    ) AS shipping_address,
    (
        SELECT row_to_json(a)
        FROM addresses a
        WHERE a.id = o.billing_address_id
    ) AS billing_address
FROM 
    orders o
LEFT JOIN 
    auth.users ON auth.users.id = o.user_id;

-- View: customer details with order summary
CREATE OR REPLACE VIEW admin_customers_view AS
SELECT 
    auth.users.id AS user_id,
    auth.users.email,
    auth.users.created_at,
    auth.users.last_sign_in_at,
    (
        SELECT COUNT(*)
        FROM orders
        WHERE orders.user_id = auth.users.id
    ) AS order_count,
    (
        SELECT COALESCE(SUM(total_amount), 0)
        FROM orders
        WHERE orders.user_id = auth.users.id
    ) AS total_spent,
    (
        SELECT COUNT(*)
        FROM orders
        WHERE orders.user_id = auth.users.id
        AND orders.status = 'completed'
    ) AS completed_orders,
    (
        SELECT json_agg(
            json_build_object(
                'id', a.id,
                'name', a.name,
                'address_line1', a.address_line1,
                'city', a.city,
                'state', a.state,
                'country', a.country,
                'phone', a.phone,
                'is_default_shipping', a.is_default_shipping,
                'is_default_billing', a.is_default_billing
            )
        )
        FROM addresses a
        WHERE a.user_id = auth.users.id
    ) AS addresses,
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.users.id
        AND user_roles.role IN ('admin', 'staff')
    ) AS is_staff
FROM 
    auth.users;

-- View: inventory status with transactions
CREATE OR REPLACE VIEW admin_inventory_view AS
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.sku,
    p.current_price,
    (
        SELECT COALESCE(SUM(quantity), 0)
        FROM inventory_transactions
        WHERE product_id = p.id
        AND type = 'purchase'
    ) - (
        SELECT COALESCE(SUM(quantity), 0)
        FROM inventory_transactions
        WHERE product_id = p.id
        AND type = 'sale'
    ) + (
        SELECT COALESCE(SUM(quantity), 0)
        FROM inventory_transactions
        WHERE product_id = p.id
        AND type = 'adjustment'
    ) + (
        SELECT COALESCE(SUM(quantity), 0)
        FROM inventory_transactions
        WHERE product_id = p.id
        AND type = 'return'
    ) AS current_stock,
    (
        SELECT COUNT(*)
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE oi.product_id = p.id
        AND o.created_at >= NOW() - INTERVAL '30 days'
    ) AS orders_last_30_days,
    p.updated_at AS last_updated
FROM 
    products p;

-- View: promotions with usage summary
CREATE OR REPLACE VIEW admin_promotions_view AS
SELECT
    p.id,
    p.code,
    p.description,
    p.discount_type,
    p.discount_value,
    p.minimum_purchase,
    p.starts_at,
    p.ends_at,
    p.usage_limit,
    p.times_used,
    p.is_active,
    (
        SELECT COUNT(*)
        FROM promotion_usage pu
        WHERE pu.promotion_id = p.id
    ) AS actual_usage_count,
    (
        SELECT COALESCE(SUM(pu.discount_amount), 0)
        FROM promotion_usage pu
        WHERE pu.promotion_id = p.id
    ) AS total_discount_given,
    p.created_at,
    p.updated_at,
    (
        SELECT auth.users.email
        FROM auth.users
        WHERE auth.users.id = p.created_by
    ) AS created_by_email
FROM 
    promotions p;

-- View: audit logs with user info
CREATE OR REPLACE VIEW admin_audit_logs_view AS
SELECT
    a.id,
    a.action,
    a.entity_type,
    a.entity_id,
    a.old_data,
    a.new_data,
    a.ip_address,
    a.user_agent,
    a.created_at,
    auth.users.email AS user_email,
    (
        SELECT user_roles.role
        FROM user_roles
        WHERE user_roles.user_id = a.user_id
        LIMIT 1
    ) AS user_role
FROM
    audit_logs a
JOIN
    auth.users ON auth.users.id = a.user_id;

-- Function: add inventory stock
CREATE OR REPLACE FUNCTION admin_add_inventory_stock(
    p_product_id UUID,
    p_quantity INTEGER,
    p_notes TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_transaction_id UUID;
BEGIN
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity must be greater than zero';
    END IF;

    INSERT INTO inventory_transactions (
        product_id,
        type,
        quantity,
        notes,
        created_by
    ) VALUES (
        p_product_id,
        'purchase',
        p_quantity,
        p_notes,
        auth.uid()
    ) RETURNING id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$;

-- Function: adjust inventory stock
CREATE OR REPLACE FUNCTION admin_adjust_inventory_stock(
    p_product_id UUID,
    p_adjustment INTEGER,
    p_notes TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_transaction_id UUID;
BEGIN
    INSERT INTO inventory_transactions (
        product_id,
        type,
        quantity,
        notes,
        created_by
    ) VALUES (
        p_product_id,
        'adjustment',
        p_adjustment,
        p_notes,
        auth.uid()
    ) RETURNING id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$;

-- Function: update order status
CREATE OR REPLACE FUNCTION admin_update_order_status(
    p_order_id UUID,
    p_status TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_status TEXT;
BEGIN
    -- Validate status
    IF p_status NOT IN ('pending', 'processing', 'completed', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid order status: %', p_status;
    END IF;

    -- Get old status for audit
    SELECT status INTO v_old_status FROM orders WHERE id = p_order_id;

    -- Update the order
    UPDATE orders
    SET 
        status = p_status,
        updated_at = NOW()
    WHERE id = p_order_id;

    -- Update inventory if needed
    IF v_old_status != 'completed' AND p_status = 'completed' THEN
        -- Order is now completed, subtract from inventory
        INSERT INTO inventory_transactions (
            product_id,
            type,
            quantity,
            reference_id,
            notes,
            created_by
        )
        SELECT 
            oi.product_id,
            'sale',
            oi.quantity,
            p_order_id,
            'Order completed: ' || p_order_id::text,
            auth.uid()
        FROM order_items oi
        WHERE oi.order_id = p_order_id;
    ELSIF v_old_status = 'completed' AND p_status != 'completed' THEN
        -- Order is no longer completed, add back to inventory
        INSERT INTO inventory_transactions (
            product_id,
            type,
            quantity,
            reference_id,
            notes,
            created_by
        )
        SELECT 
            oi.product_id,
            'return',
            oi.quantity,
            p_order_id,
            'Order status changed from completed to ' || p_status,
            auth.uid()
        FROM order_items oi
        WHERE oi.order_id = p_order_id;
    END IF;

    RETURN FOUND;
END;
$$;

-- Function: create promotion
CREATE OR REPLACE FUNCTION admin_create_promotion(
    p_code TEXT,
    p_description TEXT,
    p_discount_type TEXT,
    p_discount_value DECIMAL,
    p_minimum_purchase DECIMAL DEFAULT NULL,
    p_starts_at TIMESTAMPTZ DEFAULT NOW(),
    p_ends_at TIMESTAMPTZ DEFAULT NULL,
    p_usage_limit INTEGER DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_promotion_id UUID;
BEGIN
    -- Validate discount type
    IF p_discount_type NOT IN ('percentage', 'fixed_amount') THEN
        RAISE EXCEPTION 'Invalid discount type: %', p_discount_type;
    END IF;

    -- For percentage discounts, validate the value is between 0 and 100
    IF p_discount_type = 'percentage' AND (p_discount_value <= 0 OR p_discount_value > 100) THEN
        RAISE EXCEPTION 'Percentage discount must be between 0 and 100';
    END IF;

    -- For fixed amount discounts, validate the value is greater than 0
    IF p_discount_type = 'fixed_amount' AND p_discount_value <= 0 THEN
        RAISE EXCEPTION 'Fixed amount discount must be greater than 0';
    END IF;

    -- Insert the promotion
    INSERT INTO promotions (
        code,
        description,
        discount_type,
        discount_value,
        minimum_purchase,
        starts_at,
        ends_at,
        usage_limit,
        created_by
    ) VALUES (
        UPPER(p_code),
        p_description,
        p_discount_type,
        p_discount_value,
        p_minimum_purchase,
        p_starts_at,
        p_ends_at,
        p_usage_limit,
        auth.uid()
    ) RETURNING id INTO v_promotion_id;

    RETURN v_promotion_id;
END;
$$;

-- Function: add user role
CREATE OR REPLACE FUNCTION admin_add_user_role(
    p_user_id UUID,
    p_role TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validate role
    IF p_role NOT IN ('admin', 'manager', 'staff') THEN
        RAISE EXCEPTION 'Invalid role: %', p_role;
    END IF;

    -- Check if the user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'User does not exist';
    END IF;

    -- Insert or update the user role
    INSERT INTO user_roles (user_id, role)
    VALUES (p_user_id, p_role)
    ON CONFLICT (user_id)
    DO UPDATE SET role = p_role, updated_at = NOW();

    RETURN true;
END;
$$;

-- Function: get order summary stats
CREATE OR REPLACE FUNCTION admin_get_order_stats(
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS TABLE (
    total_orders BIGINT,
    total_revenue DECIMAL,
    average_order_value DECIMAL,
    completed_orders BIGINT,
    cancelled_orders BIGINT,
    pending_orders BIGINT,
    processing_orders BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT AS total_orders,
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        CASE 
            WHEN COUNT(*) > 0 THEN COALESCE(SUM(total_amount), 0) / COUNT(*)
            ELSE 0
        END AS average_order_value,
        COUNT(*) FILTER (WHERE status = 'completed')::BIGINT AS completed_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled')::BIGINT AS cancelled_orders,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT AS pending_orders,
        COUNT(*) FILTER (WHERE status = 'processing')::BIGINT AS processing_orders
    FROM
        orders
    WHERE
        created_at BETWEEN p_start_date AND p_end_date;
END;
$$;

-- Function: get top selling products
CREATE OR REPLACE FUNCTION admin_get_top_products(
    p_limit INTEGER DEFAULT 10,
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    sku TEXT,
    units_sold BIGINT,
    revenue DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id AS product_id,
        p.name AS product_name,
        p.sku,
        SUM(oi.quantity)::BIGINT AS units_sold,
        SUM(oi.total_item_price) AS revenue
    FROM
        order_items oi
    JOIN
        orders o ON o.id = oi.order_id
    JOIN
        products p ON p.id = oi.product_id
    WHERE
        o.created_at BETWEEN p_start_date AND p_end_date
    GROUP BY
        p.id, p.name, p.sku
    ORDER BY
        units_sold DESC
    LIMIT p_limit;
END;
$$;

-- Add RLS policies for the new views
ALTER VIEW admin_orders_view OWNER TO postgres;
ALTER VIEW admin_customers_view OWNER TO postgres;
ALTER VIEW admin_inventory_view OWNER TO postgres;
ALTER VIEW admin_promotions_view OWNER TO postgres;
ALTER VIEW admin_audit_logs_view OWNER TO postgres;

GRANT SELECT ON admin_orders_view TO authenticated;
GRANT SELECT ON admin_customers_view TO authenticated;
GRANT SELECT ON admin_inventory_view TO authenticated;
GRANT SELECT ON admin_promotions_view TO authenticated;
GRANT SELECT ON admin_audit_logs_view TO authenticated;

-- Create RLS policies for the new functions
REVOKE EXECUTE ON FUNCTION admin_add_inventory_stock FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION admin_adjust_inventory_stock FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION admin_update_order_status FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION admin_create_promotion FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION admin_add_user_role FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION admin_get_order_stats FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION admin_get_top_products FROM PUBLIC;

GRANT EXECUTE ON FUNCTION admin_add_inventory_stock TO authenticated;
GRANT EXECUTE ON FUNCTION admin_adjust_inventory_stock TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_order_status TO authenticated;
GRANT EXECUTE ON FUNCTION admin_create_promotion TO authenticated;
GRANT EXECUTE ON FUNCTION admin_add_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_order_stats TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_top_products TO authenticated; 