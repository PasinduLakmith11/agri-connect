-- ============================================
-- Agri-Connect Database Schema for Supabase
-- ============================================
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor (left sidebar)
-- 3. Click "+ New Query"
-- 4. Copy and paste this ENTIRE script
-- 5. Click "Run" or press Ctrl+Enter
-- 
-- This will create all tables, enums, and indexes
-- ============================================

-- Create Enums
DO $$ BEGIN
 CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'in_transit', 'delivered', 'completed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."product_status" AS ENUM('available', 'sold', 'reserved');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."route_status" AS ENUM('planned', 'in_progress', 'completed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."sms_direction" AS ENUM('incoming', 'outgoing');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."sms_status" AS ENUM('sent', 'delivered', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('farmer', 'buyer', 'logistics', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create Users Table
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" NOT NULL,
	"full_name" text NOT NULL,
	"location_lat" real,
	"location_lng" real,
	"address" text,
	"bio" text,
	"farm_name" text,
	"profile_image" text,
	"verified" integer DEFAULT 0,
	"rating" real DEFAULT 0,
	"rating_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);

-- Create Products Table
CREATE TABLE IF NOT EXISTS "products" (
	"id" text PRIMARY KEY NOT NULL,
	"farmer_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"quantity" real NOT NULL,
	"unit" text NOT NULL,
	"base_price" real NOT NULL,
	"current_price" real NOT NULL,
	"harvest_date" text,
	"expiry_date" text,
	"location_lat" real,
	"location_lng" real,
	"address" text,
	"images" text,
	"description" text,
	"status" "product_status" DEFAULT 'available',
	"is_deleted" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"buyer_id" text NOT NULL,
	"quantity" real NOT NULL,
	"unit_price" real NOT NULL,
	"total_price" real NOT NULL,
	"status" "order_status" DEFAULT 'pending',
	"payment_method" text DEFAULT 'cod',
	"payment_status" text DEFAULT 'pending',
	"delivery_address" text,
	"delivery_lat" real,
	"delivery_lng" real,
	"delivery_date" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

-- Create Routes Table
CREATE TABLE IF NOT EXISTS "routes" (
	"id" text PRIMARY KEY NOT NULL,
	"logistics_id" text NOT NULL,
	"route_date" text NOT NULL,
	"status" "route_status" DEFAULT 'planned',
	"total_distance" real,
	"estimated_duration" integer,
	"waypoints" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);

-- Create Route Orders Junction Table
CREATE TABLE IF NOT EXISTS "route_orders" (
	"route_id" text NOT NULL,
	"order_id" text NOT NULL,
	"sequence_number" integer,
	CONSTRAINT "route_orders_route_id_order_id_pk" PRIMARY KEY("route_id","order_id")
);

-- Create Notifications Table
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"related_id" text,
	"is_read" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);

-- Create Price History Table
CREATE TABLE IF NOT EXISTS "price_history" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"old_price" real NOT NULL,
	"new_price" real NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now()
);

-- Create SMS Logs Table
CREATE TABLE IF NOT EXISTS "sms_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"phone" text NOT NULL,
	"message" text NOT NULL,
	"direction" "sms_direction",
	"status" "sms_status",
	"created_at" timestamp with time zone DEFAULT now()
);

-- Add Foreign Key Constraints
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_farmer_id_users_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "routes" ADD CONSTRAINT "routes_logistics_id_users_id_fk" FOREIGN KEY ("logistics_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "route_orders" ADD CONSTRAINT "route_orders_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "route_orders" ADD CONSTRAINT "route_orders_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "price_history" ADD CONSTRAINT "price_history_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "sms_logs" ADD CONSTRAINT "sms_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create Indexes
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" USING btree ("email");
CREATE INDEX IF NOT EXISTS "idx_products_farmer" ON "products" USING btree ("farmer_id");
CREATE INDEX IF NOT EXISTS "idx_products_status" ON "products" USING btree ("status");
CREATE INDEX IF NOT EXISTS "idx_orders_buyer" ON "orders" USING btree ("buyer_id");
CREATE INDEX IF NOT EXISTS "idx_orders_product" ON "orders" USING btree ("product_id");
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "orders" USING btree ("status");
CREATE INDEX IF NOT EXISTS "idx_notifications_user_unread" ON "notifications" USING btree ("user_id","is_read");

-- Success Message
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📊 Tables created: users, products, orders, routes, route_orders, notifications, price_history, sms_logs';
    RAISE NOTICE '🔗 All foreign keys and indexes configured';
END $$;
