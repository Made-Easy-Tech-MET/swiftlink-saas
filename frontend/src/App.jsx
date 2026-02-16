import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Landing from './pages/Landing'
import Pricing from './pages/Pricing'
import Menu from './pages/Menu'
import InfoPage from './pages/InfoPage'
import MenuItems from './pages/restaurant/MenuItems'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/Users'
import AdminOrders from './pages/admin/Orders'
import AdminSubscriptions from './pages/admin/Subscriptions'
import AdminAnalytics from './pages/admin/Analytics'
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard'
import RestaurantOrders from './pages/restaurant/Orders'
import RestaurantTables from './pages/restaurant/Tables'
import RestaurantQROrders from './pages/restaurant/QROrders'
import RestaurantOnboarding from './pages/restaurant/RestaurantOnboarding'
import DriverDashboard from './pages/driver/DriverDashboard'
import DriverDeliveries from './pages/driver/Deliveries'
import Settings from './pages/settings/Settings'
import Layout from './components/layout/Layout'
import AdminLayout from './components/layout/AdminLayout'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/menu/:restaurantId/:tableNumber" element={<Menu />} />

            <Route
              path="/about"
              element={<InfoPage title="About SwiftLink" description="SwiftLink is a SaaS platform that helps restaurants, drivers, and operators manage delivery workflows with real-time visibility and reliable operations." />}
            />
            <Route
              path="/careers"
              element={<InfoPage title="Careers" description="We are building the future of delivery operations. Our hiring team reviews product, engineering, and operations profiles all year round." />}
            />
            <Route
              path="/docs"
              element={<InfoPage title="Documentation" description="Product and API documentation are being consolidated. A complete knowledge base with setup guides and integration references is coming soon." />}
            />
            <Route
              path="/status"
              element={<InfoPage title="System Status" description="All core services are operational. Public status history and incident updates will be published on this page." />}
            />
            <Route
              path="/privacy"
              element={<InfoPage title="Privacy Policy" description="SwiftLink only processes data required to provide account access, order operations, delivery tracking, and billing. We do not sell customer personal data." />}
            />
            <Route
              path="/terms"
              element={<InfoPage title="Terms of Service" description="By using SwiftLink, you agree to platform usage rules, subscription terms, and acceptable use standards that protect all customers and partners." />}
            />
            <Route
              path="/contact"
              element={<InfoPage title="Contact" description="For support and partnership requests, contact support@swiftlink.com. Response time is usually within one business day." />}
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>

            <Route
              path="/restaurant"
              element={
                <ProtectedRoute allowedRoles={['restaurant']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/restaurant/dashboard" replace />} />
              <Route path="dashboard" element={<RestaurantDashboard />} />
              <Route path="orders" element={<RestaurantOrders />} />
              <Route path="tables" element={<RestaurantTables />} />
              <Route path="menu" element={<MenuItems />} />
              <Route path="onboarding" element={<RestaurantOnboarding />} />
              <Route path="qr-orders" element={<RestaurantQROrders />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route
              path="/driver"
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/driver/dashboard" replace />} />
              <Route path="dashboard" element={<DriverDashboard />} />
              <Route path="deliveries" element={<DriverDeliveries />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="/" element={<Landing />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
