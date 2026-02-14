-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- UUID as text in SQLite
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('farmer', 'buyer', 'logistics', 'admin')),
    full_name TEXT NOT NULL,
    location_lat REAL,
    location_lng REAL,
    address TEXT,
    verified INTEGER DEFAULT 0, -- Boolean as 0/1
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    farmer_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    base_price REAL NOT NULL,
    current_price REAL NOT NULL,
    harvest_date TEXT,
    expiry_date TEXT,
    location_lat REAL,
    location_lng REAL,
    images TEXT, -- JSON string of image paths
    description TEXT,
    status TEXT DEFAULT 'available' CHECK(status IN ('available', 'sold', 'reserved')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    buyer_id TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled')),
    delivery_address TEXT,
    delivery_lat REAL,
    delivery_lng REAL,
    delivery_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id)
);

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
    id TEXT PRIMARY KEY,
    logistics_id TEXT NOT NULL,
    route_date TEXT NOT NULL,
    status TEXT DEFAULT 'planned' CHECK(status IN ('planned', 'in_progress', 'completed')),
    total_distance REAL,
    estimated_duration INTEGER,
    waypoints TEXT, -- JSON string of coordinates
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (logistics_id) REFERENCES users(id)
);

-- Route_Orders junction table
CREATE TABLE IF NOT EXISTS route_orders (
    route_id TEXT NOT NULL,
    order_id TEXT NOT NULL,
    sequence_number INTEGER,
    PRIMARY KEY (route_id, order_id),
    FOREIGN KEY (route_id) REFERENCES routes(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Price_History table
CREATE TABLE IF NOT EXISTS price_history (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    old_price REAL NOT NULL,
    new_price REAL NOT NULL,
    recorded_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- SMS_Logs table
CREATE TABLE IF NOT EXISTS sms_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    direction TEXT CHECK(direction IN ('incoming', 'outgoing')),
    status TEXT CHECK(status IN ('sent', 'delivered', 'failed')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_farmer ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id);
