# SwiftLink - Logistics & Delivery Management Platform

A modern SaaS web application for logistics and delivery management, connecting restaurants and delivery drivers.

## 🚀 Features

- **Role-Based Access Control**: Admin, Restaurant, and Driver roles
- **Authentication**: Email/password authentication via Supabase
- **Admin Dashboard**: User management, order tracking, subscription management, analytics with charts
- **Restaurant Dashboard**: Order management, delivery tracking, earnings view
- **Driver Dashboard**: Available deliveries, delivery status updates, earnings
- **Dark/Light Mode**: Toggle between themes
- **Multilingual Support**: English and French language switcher
- **Responsive Design**: Mobile-first approach

## 🛠 Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Charts**: Recharts

## 📁 Project Structure

```
swiftlink/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── services/      # API and service functions
│   │   └── App.jsx        # Main application component
│   └── ...
├── backend/               # Express backend API
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   └── index.js       # Main server file
│   └── ...
├── supabase/              # Database schema
│   └── schema.sql         # PostgreSQL schema
└── README.md
```

## 🔧 Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone the Repository

```
bash
git clone <repository-url>
cd SwiftLink
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and execute the contents of `supabase/schema.sql`
4. Get your Supabase URL and keys from Project Settings > API

### 3. Frontend Setup

```
bash
cd frontend
cp .env.example .env
# Edit .env with your Supabase credentials

npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Backend Setup (Optional)

```
bash
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials

npm install
npm run dev
```

The backend will be available at `http://localhost:3000`

## 🔐 Environment Variables

### Frontend (.env)

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Backend (.env)

```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
PORT=3000
```

## 📱 Routes

- `/login` - Login page
- `/register` - Registration page
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/orders` - Order management
- `/admin/subscriptions` - Subscription management
- `/admin/analytics` - Analytics dashboard
- `/restaurant/dashboard` - Restaurant dashboard
- `/restaurant/orders` - Restaurant orders
- `/driver/dashboard` - Driver dashboard
- `/driver/deliveries` - Driver deliveries

## 🎨 Color Scheme

- **Primary**: Sky Blue (#0EA5E9)
- **Secondary**: Emerald (#10B981)
- **Accent**: Amber (#F59E0B)
- **Danger**: Red (#EF4444)

## 📄 License

MIT License
