import { NavLink, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Truck, 
  Users, 
  ShoppingCart, 
  CreditCard, 
  BarChart3,
  QrCode,
  UtensilsCrossed,
  Settings,
  LogOut,
  X
} from 'lucide-react'

const adminLinks = [
  { path: '/admin/dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { path: '/admin/users', icon: Users, key: 'users' },
  { path: '/admin/orders', icon: ShoppingCart, key: 'orders' },
  { path: '/admin/subscriptions', icon: CreditCard, key: 'subscriptions' },
  { path: '/admin/analytics', icon: BarChart3, key: 'analytics' },
]

const restaurantLinks = [
  { path: '/restaurant/dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { path: '/restaurant/orders', icon: ShoppingBag, key: 'orders' },
  { path: '/restaurant/tables', icon: QrCode, key: 'qrTables' },
  { path: '/restaurant/qr-orders', icon: UtensilsCrossed, key: 'kitchenQr' },
  { path: '/restaurant/menu', icon: ShoppingBag, key: 'menu' },
  { path: '/pricing', icon: CreditCard, key: 'pricing' },
  { path: '/restaurant/settings', icon: Settings, key: 'settings' },
]

const driverLinks = [
  { path: '/driver/dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { path: '/driver/deliveries', icon: Truck, key: 'deliveries' },
  { path: '/pricing', icon: CreditCard, key: 'pricing' },
  { path: '/driver/settings', icon: Settings, key: 'settings' },
]

const labels = {
  en: {
    dashboard: 'Dashboard',
    users: 'Users',
    orders: 'Orders',
    subscriptions: 'Subscriptions',
    analytics: 'Analytics',
    qrTables: 'QR Tables',
    kitchenQr: 'Kitchen QR',
    menu: 'Menu',
    pricing: 'Pricing',
    settings: 'Settings',
    deliveries: 'Deliveries',
    signOut: 'Sign Out'
  },
  fr: {
    dashboard: 'Tableau de bord',
    users: 'Utilisateurs',
    orders: 'Commandes',
    subscriptions: 'Abonnements',
    analytics: 'Analytiques',
    qrTables: 'Tables QR',
    kitchenQr: 'Cuisine QR',
    menu: 'Menu',
    pricing: 'Tarifs',
    settings: 'Parametres',
    deliveries: 'Livraisons',
    signOut: 'Se deconnecter'
  }
}

export default function Sidebar({ isOpen, onClose }) {
  const { role, signOut } = useAuth()
  const { language } = useTheme()
  const location = useLocation()
  const t = labels[language] || labels.en

  const getLinks = () => {
    switch (role) {
      case 'admin':
        return adminLinks
      case 'restaurant':
        return restaurantLinks
      case 'driver':
        return driverLinks
      default:
        return []
    }
  }

  const links = getLinks()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 
        bg-light-surface dark:bg-dark-surface 
        border-r border-light-border dark:border-dark-border
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
            <Link to="/" onClick={onClose} className="flex items-center gap-3">
              <img 
                src="/swiftlink_logos_png/logo-icon.png" 
                alt="SwiftLink" 
                className="w-10 h-10 rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">SwiftLink</span>
            </Link>
            <button 
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.path
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm sm:text-base
                    transition-colors duration-200
                    ${isActive 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{t[link.key] || link.key}</span>
                </NavLink>
              )
            })}
          </nav>

          <div className="p-4 border-t border-light-border dark:border-dark-border">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-danger hover:bg-danger/10 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">{t.signOut}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

