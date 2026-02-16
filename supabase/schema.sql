-- SwiftLink Database Schema
-- PostgreSQL Database for SwiftLink Logistics & Delivery Management Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'restaurant', 'driver');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled');
CREATE TYPE delivery_status AS ENUM ('assigned', 'picked_up', 'in_transit', 'delivered', 'failed');
CREATE TYPE payment_method AS ENUM ('card', 'cash', 'wallet');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'ultimate');
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'blocked');
CREATE TYPE qr_order_status AS ENUM ('pending', 'preparing', 'ready', 'completed', 'cancelled');

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'restaurant',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurants Table
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    logo_url TEXT,
    cover_image_url TEXT,
    cuisine_type VARCHAR(100),
    is_open BOOLEAN DEFAULT true,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drivers Table
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(50),
    vehicle_type VARCHAR(50),
    vehicle_number VARCHAR(50),
    is_available BOOLEAN DEFAULT false,
    current_latitude DECIMAL(10,8),
    current_longitude DECIMAL(11,8),
    rating DECIMAL(3,2) DEFAULT 0,
    total_deliveries INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status order_status DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_notes TEXT,
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deliveries Table
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    status delivery_status DEFAULT 'assigned',
    pickup_time TIMESTAMP WITH TIME ZONE,
    delivery_time TIMESTAMP WITH TIME ZONE,
    current_latitude DECIMAL(10,8),
    current_longitude DECIMAL(11,8),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method payment_method NOT NULL,
    status payment_status DEFAULT 'pending',
    transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions Table (Updated with user_id, role, grace_period_end)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'restaurant',
    plan subscription_plan NOT NULL DEFAULT 'free',
    status subscription_status DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    grace_period_end DATE,
    monthly_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurant Tables for QR Ordering System
CREATE TABLE restaurant_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number VARCHAR(20) NOT NULL,
    table_name VARCHAR(100),
    qr_code VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QR Orders Table
CREATE TABLE qr_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    status qr_order_status DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QR Order Items Table
CREATE TABLE qr_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_order_id UUID REFERENCES qr_orders(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_restaurants_user_id ON restaurants(user_id);
CREATE INDEX idx_drivers_user_id ON drivers(user_id);
CREATE INDEX idx_drivers_availability ON drivers(is_available);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_subscriptions_restaurant_id ON subscriptions(restaurant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_restaurant_tables_restaurant_id ON restaurant_tables(restaurant_id);
CREATE INDEX idx_qr_orders_restaurant_id ON qr_orders(restaurant_id);
CREATE INDEX idx_qr_orders_table_id ON qr_orders(table_id);
CREATE INDEX idx_qr_orders_status ON qr_orders(status);
CREATE INDEX idx_qr_order_items_order_id ON qr_order_items(qr_order_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
    ON users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Restaurants policies
CREATE POLICY "Restaurants can view their own data"
    ON restaurants FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'restaurant'
        )
    );

CREATE POLICY "Admins can view all restaurants"
    ON restaurants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Drivers policies
CREATE POLICY "Drivers can view their own data"
    ON drivers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'driver'
        )
    );

CREATE POLICY "Admins can view all drivers"
    ON drivers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Orders policies
CREATE POLICY "Restaurants can view their own orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Customers can view their own orders"
    ON orders FOR SELECT
    USING (customer_id = auth.uid());

CREATE POLICY "Drivers can view assigned orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM deliveries
            WHERE order_id = orders.id
            AND driver_id IN (
                SELECT id FROM drivers WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Deliveries policies
CREATE POLICY "Drivers can view their own deliveries"
    ON deliveries FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM drivers
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all deliveries"
    ON deliveries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Payments policies
CREATE POLICY "Users can view their own payments"
    ON payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE id = payments.order_id
            AND (customer_id = auth.uid() OR restaurant_id IN (
                SELECT id FROM restaurants WHERE user_id = auth.uid()
            ))
        )
    );

CREATE POLICY "Admins can view all payments"
    ON payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Subscriptions policies
CREATE POLICY "Restaurants can view their own subscriptions"
    ON subscriptions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM restaurants
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all subscriptions"
    ON subscriptions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Insert a default admin user (password: admin123)
-- Note: In production, use proper password hashing
INSERT INTO users (email, password_hash, full_name, role)
VALUES ('admin@swiftlink.com', '$2a$10$example_hash_admin', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Create a function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    order_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO order_count FROM orders;
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((order_count + 1)::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order number generation
CREATE TRIGGER generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();
