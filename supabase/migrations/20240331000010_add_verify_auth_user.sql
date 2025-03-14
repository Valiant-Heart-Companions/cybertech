-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.verify_auth_user(UUID);

-- Create the function to verify auth user existence
CREATE OR REPLACE FUNCTION public.verify_auth_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if the user exists in auth.users
    RETURN EXISTS (
        SELECT 1
        FROM auth.users
        WHERE id = user_id
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.verify_auth_user(UUID) TO authenticated;

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