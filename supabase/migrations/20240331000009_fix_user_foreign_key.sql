-- First, drop all tables that depend on users and user_roles
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.carts CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.promotion_usage CASCADE;
DROP TABLE IF EXISTS public.promotions CASCADE;
DROP TABLE IF EXISTS public.inventory_transactions CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Recreate users table with correct structure
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_business_customer BOOLEAN DEFAULT FALSE
);

-- Recreate user_roles table with correct reference
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Recreate the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user(
    auth_user_id UUID,
    user_email TEXT,
    user_first_name TEXT,
    user_last_name TEXT,
    user_phone TEXT
)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- First create the user record and get the new user_id
    INSERT INTO public.users (
        auth_id,
        email,
        first_name,
        last_name,
        phone_number,
        is_business_customer
    )
    VALUES (
        auth_user_id,
        user_email,
        COALESCE(user_first_name, ''),
        COALESCE(user_last_name, ''),
        user_phone,
        false
    )
    RETURNING id INTO new_user_id;

    -- Verify we got a valid user_id
    IF new_user_id IS NULL THEN
        RAISE EXCEPTION 'Failed to create user profile - INSERT did not return an ID';
    END IF;

    -- Log the successful user creation
    RAISE NOTICE 'Successfully created user profile with ID: %', new_user_id;

    -- Then create a default user role using the new user_id
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'staff');

    -- Log the successful role creation
    RAISE NOTICE 'Successfully created user role for user ID: %', new_user_id;

    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user(UUID, TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own data"
    ON public.users FOR SELECT
    USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own data"
    ON public.users FOR UPDATE
    USING (auth.uid() = auth_id);

CREATE POLICY "User roles are viewable by admins"
    ON public.user_roles FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.users u ON u.id = ur.user_id
        WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
    ));

CREATE POLICY "User roles are manageable by admins"
    ON public.user_roles FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.users u ON u.id = ur.user_id
        WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
    ));

-- Verify the function exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_proc 
        WHERE proname = 'handle_new_user'
    ) THEN
        RAISE EXCEPTION 'Failed to create handle_new_user function';
    END IF;
END $$; 