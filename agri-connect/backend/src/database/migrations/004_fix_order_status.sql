-- Disable foreign key checks temporarily
PRAGMA foreign_keys=OFF;

-- Create new table with updated status constraint and all columns
CREATE TABLE orders_new (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    buyer_id TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'in_transit', 'delivered', 'completed', 'cancelled')),
    delivery_address TEXT,
    delivery_lat REAL,
    delivery_lng REAL,
    delivery_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    payment_method TEXT DEFAULT 'cod',
    payment_status TEXT DEFAULT 'pending',
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id)
);

-- Copy data from old table
INSERT INTO orders_new (
    id, product_id, buyer_id, quantity, unit_price, total_price, status,
    delivery_address, delivery_lat, delivery_lng, delivery_date, created_at, updated_at,
    payment_method, payment_status
) SELECT 
    id, product_id, buyer_id, quantity, unit_price, total_price, status,
    delivery_address, delivery_lat, delivery_lng, delivery_date, created_at, updated_at,
    payment_method, payment_status
FROM orders;

-- Drop old table
DROP TABLE orders;

-- Rename new table
ALTER TABLE orders_new RENAME TO orders;

-- Re-enable foreign key checks
PRAGMA foreign_keys=ON;

-- Re-create indexes
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
