-- Fix permissions for "users" table
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Grant usage on public schema to postgres user (should be default, but verify)
GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- 2. Grant all privileges on all tables in public schema to postgres
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- 3. Explicitly disable RLS on users table (to debug first)
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;

-- 4. If you want RLS enabled, ensure there is a policy for postgres/service_role
-- (Uncomment below if you re-enable RLS)
/*
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON "users" FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON "users" FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users based on email" ON "users" FOR UPDATE USING (auth.uid() = id);
*/

-- 5. Verify the table exists and has data (optional)
SELECT count(*) FROM "users";
