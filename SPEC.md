# SwiftLink - Logistics & Delivery Management Platform

## Project Overview
- **Project Name**: SwiftLink
- **Type**: SaaS Web Application
- **Core Functionality**: A modern logistics and delivery management platform connecting restaurants and delivery drivers
- **Target Users**: Restaurant owners, Delivery drivers, Platform administrators

## Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS + JavaScript
- **Backend**: Node.js + Express
- **Database & Auth**: Supabase (PostgreSQL + built-in Auth)
- **Charts**: Recharts (for analytics)
- **Icons**: Lucide React
- **Routing**: React Router DOM v6

## UI/UX Specification

### Color Palette
- **Primary**: `#0EA5E9` (Sky Blue)
- **Primary Dark**: `#0284C7` (Darker Sky)
- **Secondary**: `#10B981` (Emerald Green)
- **Accent**: `#F59E0B` (Amber)
- **Danger**: `#EF4444` (Red)
- **Dark Background**: `#0F172A` (Slate 900)
- **Dark Surface**: `#1E293B` (Slate 800)
- **Dark Border**: `#334155` (Slate 700)
- **Light Background**: `#F8FAFC` (Slate 50)
- **Light Surface**: `#FFFFFF`
- **Light Border**: `#E2E8F0` (Slate 200)
- **Text Dark**: `#F1F5F9` (Slate 100)
- **Text Light**: `#1E293B` (Slate 800)
- **Text Muted**: `#94A3B8` (Slate 400)

### Typography
- **Font Family**: 'Inter', system-ui, sans-serif
- **Headings**: 
  - H1: 2.5rem (40px), font-weight: 700
  - H2: 2rem (32px), font-weight: 600
  - H3: 1.5rem (24px), font-weight: 600
  - H4: 1.25rem (20px), font-weight: 500
- **Body**: 1rem (16px), font-weight: 400
- **Small**: 0.875rem (14px), font-weight: 400

### Spacing System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Layout Structure

#### Main Application Layout
- **Sidebar**: 280px width (collapsible on mobile)
- **Main Content**: Fluid width
- **Header**: 64px height with user menu, notifications, language switcher

#### Admin Layout (/admin)
- Completely separate from user dashboards
- Full-width layout option
- Enhanced sidebar with admin-specific navigation

### Components

#### Sidebar Navigation
- Logo at top
- Navigation items with icons
- Active state: Primary background color
- Hover state: Slightly lighter background
- Collapsed state for mobile (hamburger menu)

#### Cards
- Border radius: 12px
- Shadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1)`
- Padding: 24px
- Hover: Slight elevation increase

#### Buttons
- **Primary**: Sky blue background, white text
- **Secondary**: White background, sky blue border
- **Danger**: Red background, white text
- Border radius: 8px
- Padding: 12px 24px
- Transition: All 200ms ease

#### Form Inputs
- Border radius: 8px
- Border: 1px solid border color
- Focus: Primary color border with ring
- Padding: 12px 16px

#### Data Tables
- Striped rows
- Hover state
- Sortable columns
- Pagination

#### Charts
- Area charts for revenue
- Bar charts for orders
- Line charts for growth metrics
- Consistent color scheme with primary palette

## Database Schema (PostgreSQL)

### Tables

#### 1. users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(255) | NOT NULL |
| phone | VARCHAR(20) | |
| role | ENUM('admin', 'restaurant', 'driver') | NOT NULL |
| avatar_url | TEXT | |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

#### 2. restaurants
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| user_id | UUID | FOREIGN KEY -> users(id) |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| address | TEXT | NOT NULL |
| phone | VARCHAR(20) | |
| logo_url | TEXT | |
| cover_image_url | TEXT | |
| cuisine_type | VARCHAR(100) | |
| is_open | BOOLEAN | DEFAULT true |
| rating | DECIMAL(3,2) | DEFAULT 0 |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

#### 3. drivers
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| user_id | UUID | FOREIGN KEY -> users(id) |
| license_number | VARCHAR(50) | |
| vehicle_type | VARCHAR(50) | |
| vehicle_number | VARCHAR(50) | |
| is_available | BOOLEAN | DEFAULT false |
| current_latitude | DECIMAL(10,8) | |
| current_longitude | DECIMAL(11,8) | |
| rating | DECIMAL(3,2) | DEFAULT 0 |
| total_deliveries | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

#### 4. orders
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| order_number | VARCHAR(50) | UNIQUE, NOT NULL |
| restaurant_id | UUID | FOREIGN KEY -> restaurants(id) |
| customer_id | UUID | FOREIGN KEY -> users(id) |
| status | ENUM('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled') | DEFAULT 'pending' |
| subtotal | DECIMAL(10,2) | NOT NULL |
| delivery_fee | DECIMAL(10,2) | DEFAULT 0 |
| total | DECIMAL(10,2) | NOT NULL |
| delivery_address | TEXT | NOT NULL |
| delivery_notes | TEXT | |
| estimated_delivery_time | TIMESTAMP | |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

#### 5. deliveries
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| order_id | UUID | FOREIGN KEY -> orders(id) |
| driver_id | UUID | FOREIGN KEY -> drivers(id) |
| status | ENUM('assigned', 'picked_up', 'in_transit', 'delivered', 'failed') | DEFAULT 'assigned' |
| pickup_time | TIMESTAMP | |
| delivery_time | TIMESTAMP | |
| current_latitude | DECIMAL(10,8) | |
| current_longitude | DECIMAL(11,8) | |
| notes | TEXT | |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

#### 6. payments
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| order_id | UUID | FOREIGN KEY -> orders(id) |
| amount | DECIMAL(10,2) | NOT NULL |
| payment_method | ENUM('card', 'cash', 'wallet') | NOT NULL |
| status | ENUM('pending', 'completed', 'failed', 'refunded') | DEFAULT 'pending' |
| transaction_id | VARCHAR(255) | |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

#### 7. subscriptions
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| restaurant_id | UUID | FOREIGN KEY -> restaurants(id) |
| plan | ENUM('basic', 'professional', 'enterprise') | NOT NULL |
| status | ENUM('active', 'cancelled', 'expired') | DEFAULT 'active' |
| start_date | DATE | NOT NULL |
| end_date | DATE | NOT NULL |
| monthly_price | DECIMAL(10,2) | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

### Indexes
- users(email, role)
- restaurants(user_id)
- drivers(user_id)
- orders(restaurant_id, customer_id, status)
- deliveries(order_id, driver_id, status)
- payments(order_id, status)
- subscriptions(restaurant_id, status)

### Row Level Security (RLS)
- Users can only read/update their own data
- Admins can read all data
- Restaurants can only access their own orders
- Drivers can only access assigned deliveries

## Functionality Specification

### Authentication Flow
1. **Registration**: Email/password with role selection
2. **Login**: Email/password
3. **Redirect**: After successful login, redirect to role-based dashboard
   - Admin -> /admin/dashboard
   - Restaurant -> /restaurant/dashboard
   - Driver -> /driver/dashboard
4. **Protected Routes**: All dashboards require authentication

### Role-Based Features

#### Admin Features (/admin)
- Dashboard with analytics
- User management (view, activate/deactivate)
- Order overview (all orders)
- Subscription management
- Revenue analytics
- Daily/weekly/monthly reports

#### Restaurant Features (/restaurant)
- Dashboard with order stats
- Menu management
- Order management (accept, reject, mark ready)
- Delivery tracking
- Earnings view
- Subscription management

#### Driver Features (/driver)
- Dashboard with delivery stats
- Available deliveries list
- Accept/decline deliveries
- Delivery tracking (update status)
- Earnings view
- Profile management

### Global Features
- **Language Switcher**: English / French toggle in settings
- **Dark/Light Mode**: Toggle in header
- **Sidebar Navigation**: Role-based menu items
- **Notifications**: Real-time order updates
- **Responsive Design**: Mobile-first approach

## API Endpoints (Backend)

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### Users
- GET /api/users
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id

### Restaurants
- GET /api/restaurants
- GET /api/restaurants/:id
- POST /api/restaurants
- PUT /api/restaurants/:id
- DELETE /api/restaurants/:id

### Drivers
- GET /api/drivers
- GET /api/drivers/:id
- POST /api/drivers
- PUT /api/drivers/:id
- PUT /api/drivers/:id/availability

### Orders
- GET /api/orders
- GET /api/orders/:id
- POST /api/orders
- PUT /api/orders/:id
- PUT /api/orders/:id/status

### Deliveries
- GET /api/deliveries
- GET /api/deliveries/:id
- POST /api/deliveries
- PUT /api/deliveries/:id
- PUT /api/deliveries/:id/status

### Payments
- GET /api/payments
- GET /api/payments/:id
- POST /api/payments

### Subscriptions
- GET /api/subscriptions
- GET /api/subscriptions/:id
- POST /api/subscriptions
- PUT /api/subscriptions/:id

### Analytics (Admin)
- GET /api/analytics/revenue
- GET /api/analytics/orders
- GET /api/analytics/users
- GET /api/analytics/growth

## Project Structure

```
swiftlink/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   └── Loader.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   └── Layout.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── RegisterForm.jsx
│   │   │   └── dashboard/
│   │   │       ├── StatsCard.jsx
│   │   │       ├── Chart.jsx
│   │   │       └── OrderList.jsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── Users.jsx
│   │   │   │   ├── Orders.jsx
│   │   │   │   ├── Subscriptions.jsx
│   │   │   │   └── Analytics.jsx
│   │   │   ├── restaurant/
│   │   │   │   ├── RestaurantDashboard.jsx
│   │   │   │   ├── Orders.jsx
│   │   │   │   └── Menu.jsx
│   │   │   ├── driver/
│   │   │   │   ├── DriverDashboard.jsx
│   │   │   │   └── Deliveries.jsx
│   │   │   └── settings/
│   │   │       └── Settings.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   └── fr.json
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── restaurantController.js
│   │   │   ├── driverController.js
│   │   │   ├── orderController.js
│   │   │   ├── deliveryController.js
│   │   │   ├── paymentController.js
│   │   │   ├── subscriptionController.js
│   │   │   └── analyticsController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── restaurants.js
│   │   │   ├── drivers.js
│   │   │   ├── orders.js
│   │   │   ├── deliveries.js
│   │   │   ├── payments.js
│   │   │   ├── subscriptions.js
│   │   │   └── analytics.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── roleCheck.js
│   │   ├── services/
│   │   │   └── supabaseService.js
│   │   └── index.js
│   ├── package.json
│   └── .env.example
│
├── supabase/
│   └── schema.sql
│
└── README.md
```

## Acceptance Criteria

### Authentication
- [ ] Users can register with email/password
- [ ] Users can login with email/password
- [ ] After login, users are redirected to their role-based dashboard
- [ ] Protected routes prevent unauthorized access

### Admin Panel
- [ ] Admin can view all users
- [ ] Admin can view all orders
- [ ] Admin can view analytics with charts
- [ ] Admin can manage subscriptions

### Restaurant Dashboard
- [ ] Restaurant can view their orders
- [ ] Restaurant can update order status
- [ ] Restaurant can view earnings

### Driver Dashboard
- [ ] Driver can view available deliveries
- [ ] Driver can accept/decline deliveries
- [ ] Driver can update delivery status

### Global Features
- [ ] Language can be switched between English and French
- [ ] Dark/Light mode toggle works
- [ ] Sidebar navigation is responsive
- [ ] All pages are mobile-responsive

### Database
- [ ] All tables are created with proper constraints
- [ ] Foreign keys are established
- [ ] Indexes are created for performance
- [ ] RLS policies are configured
