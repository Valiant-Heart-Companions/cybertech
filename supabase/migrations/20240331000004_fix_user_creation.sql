-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user(UUID);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user(auth_user_id UUID)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- First create the user record and get the new user_id
    INSERT INTO public.users (auth_id, email, first_name, last_name, phone_number)
    SELECT 
        id,
        email,
        raw_user_meta_data->>'first_name',
        raw_user_meta_data->>'last_name',
        raw_user_meta_data->>'phone_number'
    FROM auth.users
    WHERE id = auth_user_id
    RETURNING id INTO new_user_id;

    -- Verify we got a valid user_id
    IF new_user_id IS NULL THEN
        RAISE EXCEPTION 'Failed to create user profile';
    END IF;

    -- Then create a default user role using the new user_id
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'staff');

    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions to the function
GRANT EXECUTE ON FUNCTION public.handle_new_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user(UUID) TO service_role;

-- Grant necessary table permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "User roles are viewable by admins" ON user_roles;
DROP POLICY IF EXISTS "User roles are manageable by admins" ON user_roles;

CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    USING (auth.uid() = auth_id);

CREATE POLICY "User roles are viewable by admins"
    ON user_roles FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN users u ON u.id = ur.user_id
        WHERE u.auth_id = auth.uid() AND ur.role = 'admin'
    ));

CREATE POLICY "User roles are manageable by admins"
    ON user_roles FOR ALL
    USING (EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN users u ON u.id = ur.user_id
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