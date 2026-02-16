import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card'
import { userOperations, orderOperations, subscriptionOperations } from '../../services/supabase'

const translations = {
  en: {
    dashboard: 'Dashboard',
    totalUsers: 'Total Users',
    totalOrders: 'Total Orders',
    totalRevenue: 'Total Revenue',
    activeUsers: 'Active Users',
    restaurants: 'Restaurants',
    drivers: 'Drivers',
    recentOrders: 'Recent Orders',
    viewAll: 'View All',
    pendingOrders: 'Pending Orders',
    completedOrders: 'Completed Orders',
    revenue: 'Revenue'
  },
  fr: {
    dashboard: 'Tableau de bord',
    totalUsers: 'Total utilisateurs',
    totalOrders: 'Total commandes',
    totalRevenue: 'Revenu total',
    activeUsers: 'Utilisateurs actifs',
    restaurants: 'Restaurants',
    drivers: 'Livreurs',
    recentOrders: 'Commandes récentes',
    viewAll: 'Voir tout',
    pendingOrders: 'Commandes en attente',
    completedOrders: 'Commandes livrées',
    revenue: 'Revenu'
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    restaurants: 0,
    drivers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    blockedSubscriptions: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch users
      const { data: users } = await userOperations.getAll()
      
      // Fetch orders
      const { data: orders } = await orderOperations.getAll()
      
      // Fetch subscriptions
      const { data: subscriptions } = await subscriptionOperations.getAll()

      const totalRevenue = subscriptions
        ?.filter(s => s.status === 'active')
        ?.reduce((acc, s) => acc + (s.monthly_price || 0), 0) || 0

      const restaurants = users?.filter(u => u.role === 'restaurant').length || 0
      const drivers = users?.filter(u => u.role === 'driver').length || 0
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0
      const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0
      const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0
      const expiredSubscriptions = subscriptions?.filter(s => s.status === 'expired').length || 0
      const blockedSubscriptions = subscriptions?.filter(s => s.status === 'blocked').length || 0

      setStats({
        totalUsers: users?.length || 0,
        totalOrders: orders?.length || 0,
        totalRevenue,
        activeUsers: users?.filter(u => u.is_active).length || 0,
        restaurants,
        drivers,
        pendingOrders,
        completedOrders,
        activeSubscriptions,
        expiredSubscriptions,
        blockedSubscriptions
      })

      setRecentOrders(orders?.slice(0, 5) || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'totalUsers',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'totalOrders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      change: '+8%'
    },
    {
      title: 'totalRevenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+23%'
    },
    {
      title: 'activeUsers',
      value: stats.activeUsers,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+5%'
    }
  ]

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {translations.en[stat.title]}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-secondary mt-1">
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Restaurants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.restaurants}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Active restaurants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.drivers}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Active drivers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Pending</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {stats.pendingOrders}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Completed</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {stats.completedOrders}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Active</span>
                <span className="font-medium text-gray-900 dark:text-white">{stats.activeSubscriptions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Expired</span>
                <span className="font-medium text-gray-900 dark:text-white">{stats.expiredSubscriptions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Blocked</span>
                <span className="font-medium text-gray-900 dark:text-white">{stats.blockedSubscriptions}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link 
            to="/admin/orders" 
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View All <ArrowRight size={16} />
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div 
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.order_number}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${order.total}
                    </p>
                    <span className={`
                      text-xs px-2 py-1 rounded-full
                      ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : ''}
                      ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${order.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No orders yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
