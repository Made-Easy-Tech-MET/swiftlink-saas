import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  ShoppingBag, 
  DollarSign, 
  TrendingUp,
  Clock,
  ArrowRight,
  Users
} from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card'
import { useAuth } from '../../context/AuthContext'
import { orderOperations } from '../../services/supabase'
import Button from '../../components/common/Button'

export default function RestaurantDashboard() {
  const { user, subscriptionPlan, subscriptionStatus, subscription } = useAuth()
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    subscription: null
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [subscription])

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const { data: orders } = await orderOperations.getAll()
      
      // Filter for restaurant orders (in real app, filter by restaurant_id)
      const restaurantOrders = orders || []
      
      const pendingOrders = restaurantOrders.filter(o => o.status === 'pending')
      const completedOrders = restaurantOrders.filter(o => o.status === 'delivered')
      const totalRevenue = restaurantOrders.reduce((acc, o) => acc + (o.total || 0), 0)

      setStats({
        totalOrders: restaurantOrders.length,
        totalRevenue,
        pendingOrders: pendingOrders.length,
        completedOrders: completedOrders.length,
        subscription: subscription || null
      })

      setRecentOrders(restaurantOrders.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Completed',
      value: stats.completedOrders,
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Restaurant Dashboard
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your restaurant.
          </p>
        </div>
      </div>

      {(subscriptionPlan === 'free' || subscriptionStatus === 'blocked') && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {subscriptionStatus === 'blocked'
                    ? 'Your subscription is blocked'
                    : 'You are currently on the Free plan'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {subscriptionStatus === 'blocked'
                    ? 'Renew or upgrade to restore dashboard features.'
                    : 'Upgrade to Pro or Ultimate for unlimited QR tables and better analytics.'}
                </p>
              </div>
              <Link to="/pricing">
                <Button variant="primary">Upgrade</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

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
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stat.value}
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

      {/* Subscription Status */}
      {stats.subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {stats.subscription.plan} Plan
                </p>
                <p className="text-sm text-gray-500">
                  ${stats.subscription.monthly_price}/month
                </p>
              </div>
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${stats.subscription.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
              `}>
                {stats.subscription.status}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link 
            to="/restaurant/orders" 
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
                      ${order.status === 'preparing' ? 'bg-blue-100 text-blue-700' : ''}
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
