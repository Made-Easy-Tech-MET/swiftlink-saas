import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Truck, 
  DollarSign, 
  TrendingUp,
  Clock,
  Star,
  MapPin
} from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card'
import { useAuth } from '../../context/AuthContext'
import { deliveryOperations, driverOperations } from '../../services/supabase'
import Button from '../../components/common/Button'

export default function DriverDashboard() {
  const { user, subscriptionPlan, subscriptionStatus } = useAuth()
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    totalEarnings: 0,
    completedToday: 0,
    rating: 0,
    isAvailable: false
  })
  const [recentDeliveries, setRecentDeliveries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch deliveries
      const { data: deliveries } = await deliveryOperations.getAll()
      
      // Filter for driver's deliveries
      const driverDeliveries = deliveries || []
      
      const completedDeliveries = driverDeliveries.filter(d => d.status === 'delivered')
      const totalEarnings = completedDeliveries.length * 5 // Mock: $5 per delivery

      // Get today's completed deliveries
      const today = new Date().toDateString()
      const completedToday = completedDeliveries.filter(d => 
        new Date(d.delivery_time).toDateString() === today
      ).length

      setStats({
        totalDeliveries: completedDeliveries.length,
        totalEarnings,
        completedToday,
        rating: 4.8, // Mock rating
        isAvailable: true // Mock availability
      })

      setRecentDeliveries(driverDeliveries.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAvailability = async () => {
    try {
      // Toggle driver availability
      setStats(prev => ({ ...prev, isAvailable: !prev.isAvailable }))
    } catch (error) {
      console.error('Error toggling availability:', error)
    }
  }

  const statCards = [
    {
      title: 'Total Deliveries',
      value: stats.totalDeliveries,
      icon: Truck,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Earnings',
      value: `$${stats.totalEarnings}`,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Today',
      value: stats.completedToday,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Rating',
      value: stats.rating,
      icon: Star,
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Driver Dashboard
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back! Here's your delivery summary.
          </p>
        </div>
        
        {/* Availability Toggle */}
        <button
          onClick={handleToggleAvailability}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors
            ${stats.isAvailable 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-gray-200 dark:bg-dark-border text-gray-700 dark:text-gray-300'
            }
          `}
        >
          <div className={`w-3 h-3 rounded-full ${stats.isAvailable ? 'bg-white' : 'bg-gray-400'}`} />
          {stats.isAvailable ? 'Online' : 'Offline'}
        </button>
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
                    ? 'Renew or upgrade to unlock delivery features.'
                    : 'Upgrade to Pro or Ultimate for full platform access.'}
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

      {/* Current Location */}
      <Card>
        <CardHeader>
          <CardTitle>Current Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {stats.isAvailable ? 'Ready for deliveries' : 'Not available'}
              </p>
              <p className="text-sm text-gray-500">
                {stats.isAvailable ? 'You are visible to nearby restaurants' : 'Turn on to receive delivery requests'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          {recentDeliveries.length > 0 ? (
            <div className="space-y-4">
              {recentDeliveries.map((delivery) => (
                <div 
                  key={delivery.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Order #{delivery.order_number}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(delivery.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      $5.00
                    </p>
                    <span className={`
                      text-xs px-2 py-1 rounded-full
                      ${delivery.status === 'delivered' ? 'bg-green-100 text-green-700' : ''}
                      ${delivery.status === 'in_transit' ? 'bg-blue-100 text-blue-700' : ''}
                      ${delivery.status === 'assigned' ? 'bg-yellow-100 text-yellow-700' : ''}
                    `}>
                      {delivery.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No deliveries yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
