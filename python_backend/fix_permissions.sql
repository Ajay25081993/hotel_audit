-- Run these commands in pgAdmin Query Tool or psql as the postgres superuser
-- This fixes 'permission denied for table users' by granting full privileges
-- to the hotelaudit user on the hotel_audit database.

-- 1. Grant connect privilege on the database
GRANT CONNECT ON DATABASE hotel_audit TO hotelaudit;

-- 2. Connect to the hotel_audit database and grant schema usage
\c hotel_audit;
GRANT USAGE ON SCHEMA public TO hotelaudit;

-- 3. Grant all privileges on all existing tables in the public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hotelaudit;

-- 4. Grant all privileges on all sequences (needed for auto-increment IDs)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hotelaudit;

-- 5. Set default privileges so future tables created by hotelaudit are accessible
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hotelaudit;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hotelaudit;

