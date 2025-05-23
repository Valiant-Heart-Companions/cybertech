-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user(UUID);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user(auth_user_id UUID)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
    auth_user_exists BOOLEAN;
    auth_user_data RECORD;
    user_email TEXT;
    user_first_name TEXT;
    user_last_name TEXT;
    user_phone TEXT;
    retry_count INTEGER := 0;
    max_retries INTEGER := 3;
BEGIN
    -- Try to get the auth user data with retries
    WHILE retry_count < max_retries LOOP
        -- Check if auth user exists
        SELECT EXISTS (
            SELECT 1 
            FROM auth.users 
            WHERE id = auth_user_id
        ) INTO auth_user_exists;

        IF auth_user_exists THEN
            -- Get the auth user data
            SELECT * INTO auth_user_data
            FROM auth.users
            WHERE id = auth_user_id;

            -- Extract and validate required fields
            user_email := auth_user_data.email;
            IF user_email IS NULL OR user_email = '' THEN
                RAISE EXCEPTION 'Email is required for user profile creation';
            END IF;

            -- Extract optional fields with defaults
            user_first_name := COALESCE(auth_user_data.raw_user_meta_data->>'first_name', '');
            user_last_name := COALESCE(auth_user_data.raw_user_meta_data->>'last_name', '');
            user_phone := auth_user_data.raw_user_meta_data->>'phone_number';

            -- Log the data we're trying to insert
            RAISE NOTICE 'Attempting to create user profile with data: auth_id=%, email=%, first_name=%, last_name=%, phone_number=%',
                auth_user_id,
                user_email,
                user_first_name,
                user_last_name,
                user_phone;

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
                user_first_name,
                user_last_name,
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
        END IF;

        -- If we get here, the auth user doesn't exist yet
        retry_count := retry_count + 1;
        IF retry_count < max_retries THEN
            -- Wait for 1 second before retrying
            PERFORM pg_sleep(1);
        END IF;
    END LOOP;

    -- If we get here, we've exhausted all retries
    RAISE EXCEPTION 'Auth user with ID % does not exist after % retries', auth_user_id, max_retries;
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