-- Migration to add farm_name to users table
ALTER TABLE users ADD COLUMN farm_name TEXT;
