# SwiftLink - Implementation TODO List

## Phase 1: Database Schema Updates
- [ ] Update subscriptions table with new fields (user_id, role, grace_period_end)
- [ ] Add new enum values for plan (free/pro/ultimate) and status (active/expired/blocked)
- [ ] Create restaurant_tables table for QR system
- [ ] Create qr_orders table
- [ ] Create qr_order_items table

## Phase 2: Backend Routes Updates
- [ ] Update backend/src/routes/subscriptions.js with user subscription endpoints
- [ ] Create backend/src/routes/restaurant_tables.js
- [ ] Create backend/src/routes/qr_orders.js
- [ ] Update backend/src/index.js with new routes

## Phase 3: Frontend Services
- [ ] Update frontend/src/services/supabase.js with new operations
- [ ] Add user subscription operations
- [ ] Add restaurant_tables operations
- [ ] Add qr_orders operations

## Phase 4: Pricing Page
- [ ] Create frontend/src/pages/Pricing.jsx with 3 pricing cards
- [ ] Add pricing route to App.jsx
- [ ] Add pricing link to navigation

## Phase 5: QR Ordering System
- [ ] Create frontend/src/pages/restaurant/Tables.jsx - QR table management
- [ ] Create frontend/src/pages/restaurant/QROrders.jsx - Kitchen dashboard
- [ ] Create frontend/src/pages/Menu.jsx - Public menu page
- [ ] Add QR routes to App.jsx
- [ ] Add QR menu link to restaurant sidebar

## Phase 6: Admin Dashboard Updates
- [ ] Update frontend/src/pages/admin/Subscriptions.jsx with block/unblock functionality
- [ ] Add MRR and plan distribution charts
- [ ] Add subscription status management

## Phase 7: Dashboard Upgrade Banners
- [ ] Add upgrade banner to RestaurantDashboard.jsx
- [ ] Add upgrade banner to DriverDashboard.jsx
- [ ] Add subscription status check in AuthContext

## Phase 8: Testing & Verification
- [ ] Test all new features
- [ ] Verify database connections
- [ ] Verify routing works correctly
