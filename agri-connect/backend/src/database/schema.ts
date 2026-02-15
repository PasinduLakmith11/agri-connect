import { pgTable, text, real, timestamp, integer, pgEnum, index, primaryKey } from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['farmer', 'buyer', 'logistics', 'admin']);
export const productStatusEnum = pgEnum('product_status', ['available', 'sold', 'reserved']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'in_transit', 'delivered', 'completed', 'cancelled']);
export const routeStatusEnum = pgEnum('route_status', ['planned', 'in_progress', 'completed']);
export const smsStatusEnum = pgEnum('sms_status', ['sent', 'delivered', 'failed']);
export const smsDirectionEnum = pgEnum('sms_direction', ['incoming', 'outgoing']);

// Users Table
export const users = pgTable('users', {
    id: text('id').primaryKey(),
    email: text('email').unique().notNull(),
    phone: text('phone').unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    role: userRoleEnum('role').notNull(),
    fullName: text('full_name').notNull(),
    locationLat: real('location_lat'),
    locationLng: real('location_lng'),
    address: text('address'),
    bio: text('bio'),
    farmName: text('farm_name'),
    profileImage: text('profile_image'),
    verified: integer('verified').default(0),
    rating: real('rating').default(0),
    ratingCount: integer('rating_count').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
    return {
        emailIdx: index('idx_users_email').on(table.email),
    }
});

// Products Table
export const products = pgTable('products', {
    id: text('id').primaryKey(),
    farmerId: text('farmer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    category: text('category'),
    quantity: real('quantity').notNull(),
    unit: text('unit').notNull(),
    basePrice: real('base_price').notNull(),
    currentPrice: real('current_price').notNull(),
    harvestDate: text('harvest_date'),
    expiryDate: text('expiry_date'),
    locationLat: real('location_lat'),
    locationLng: real('location_lng'),
    address: text('address'),
    images: text('images'), // JSON string
    description: text('description'),
    status: productStatusEnum('status').default('available'),
    isDeleted: integer('is_deleted').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
    return {
        farmerIdx: index('idx_products_farmer').on(table.farmerId),
        statusIdx: index('idx_products_status').on(table.status),
    }
});

// Orders Table
export const orders = pgTable('orders', {
    id: text('id').primaryKey(),
    productId: text('product_id').notNull().references(() => products.id),
    buyerId: text('buyer_id').notNull().references(() => users.id),
    quantity: real('quantity').notNull(),
    unitPrice: real('unit_price').notNull(),
    totalPrice: real('total_price').notNull(),
    status: orderStatusEnum('status').default('pending'),
    paymentMethod: text('payment_method').default('cod'),
    paymentStatus: text('payment_status').default('pending'),
    deliveryAddress: text('delivery_address'),
    deliveryLat: real('delivery_lat'),
    deliveryLng: real('delivery_lng'),
    deliveryDate: text('delivery_date'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
    return {
        buyerIdx: index('idx_orders_buyer').on(table.buyerId),
        productIdx: index('idx_orders_product').on(table.productId),
        statusIdx: index('idx_orders_status').on(table.status),
    }
});

// Routes Table
export const routes = pgTable('routes', {
    id: text('id').primaryKey(),
    logisticsId: text('logistics_id').notNull().references(() => users.id),
    routeDate: text('route_date').notNull(),
    status: routeStatusEnum('status').default('planned'),
    totalDistance: real('total_distance'),
    estimatedDuration: integer('estimated_duration'),
    waypoints: text('waypoints'), // JSON string
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Route_Orders Junction Table
export const routeOrders = pgTable('route_orders', {
    routeId: text('route_id').notNull().references(() => routes.id),
    orderId: text('order_id').notNull().references(() => orders.id),
    sequenceNumber: integer('sequence_number'),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.routeId, table.orderId] }),
    }
});

// Notifications Table
export const notifications = pgTable('notifications', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    message: text('message').notNull(),
    type: text('type').notNull(),
    relatedId: text('related_id'),
    isRead: integer('is_read').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
    return {
        unreadIdx: index('idx_notifications_user_unread').on(table.userId, table.isRead),
    }
});

// Price_History Table
export const priceHistory = pgTable('price_history', {
    id: text('id').primaryKey(),
    productId: text('product_id').notNull().references(() => products.id),
    oldPrice: real('old_price').notNull(),
    newPrice: real('new_price').notNull(),
    recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow(),
});

// SMS_Logs Table
export const smsLogs = pgTable('sms_logs', {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id),
    phone: text('phone').notNull(),
    message: text('message').notNull(),
    direction: smsDirectionEnum('direction'),
    status: smsStatusEnum('status'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
