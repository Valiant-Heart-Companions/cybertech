-- Drop existing tables and constraints
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table as the primary table
CREATE TABLE users (
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

-- Create user_roles table with reference to users
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- First create the user record
    INSERT INTO public.users (auth_id, email, first_name, last_name, phone_number)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        new.raw_user_meta_data->>'phone_number'
    )
    RETURNING id INTO new_user_id;

    -- Then create a default user role (if needed)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'staff');

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    USING (auth.uid() = auth_id);

-- User roles policies
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