-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.verify_auth_user(UUID);

-- Create the function to verify auth user existence
CREATE OR REPLACE FUNCTION public.verify_auth_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    -- Log the attempt
    RAISE NOTICE 'Verifying auth user with ID: %', user_id;
    
    -- Check if the user exists in auth.users
    SELECT EXISTS (
        SELECT 1
        FROM auth.users
        WHERE id = user_id
    ) INTO user_exists;
    
    -- Log the result
    RAISE NOTICE 'User exists: %', user_exists;
    
    RETURN user_exists;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.verify_auth_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_auth_user(UUID) TO service_role;

-- Grant necessary schema permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;

-- Verify the function exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_proc
        WHERE proname = 'verify_auth_user'
    ) THEN
        RAISE EXCEPTION 'Function verify_auth_user was not created successfully';
    END IF;
END $$; 