import { useState, useEffect } from 'react'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card'
import { orderOperations, subscriptionOperations, userOperations } from '../../services/supabase'

const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [analyticsData, setAnalyticsData] = useState({
    revenueData: [],
    ordersData: [],
    userGrowth: [],
    subscriptionDistribution: []
  })

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const { data: orders } = await orderOperations.getAll()
      const { data: subscriptions } = await subscriptionOperations.getAll()
      const { data: users } = await userOperations.getAll()

      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const recentDates = []
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        recentDates.push(d.toISOString().slice(0, 10))
      }

      const revenueMap = {}
      const ordersMap = {}
      const usersMap = {}

      ;(orders || []).forEach((order) => {
        const key = new Date(order.created_at).toISOString().slice(0, 10)
        if (recentDates.includes(key)) {
          ordersMap[key] = (ordersMap[key] || 0) + 1
        }
        const monthKey = key.slice(0, 7)
        revenueMap[monthKey] = (revenueMap[monthKey] || 0) + Number(order.total || 0)
      })

      ;(users || []).forEach((user) => {
        const key = new Date(user.created_at).toISOString().slice(0, 10)
        if (recentDates.includes(key)) {
          usersMap[key] = (usersMap[key] || 0) + 1
        }
      })

      const revenueData = Object.entries(revenueMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, revenue]) => ({ date: month, revenue }))

      const ordersData = recentDates.map((date) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        orders: ordersMap[date] || 0
      }))

      const userGrowth = recentDates.map((date) => {
        const dailyUsers = (users || []).filter((u) => new Date(u.created_at).toISOString().slice(0, 10) === date)
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: usersMap[date] || 0,
          restaurants: dailyUsers.filter((u) => u.role === 'restaurant').length,
          drivers: dailyUsers.filter((u) => u.role === 'driver').length
        }
      })

      const subscriptionData = [
        { name: 'Free', value: subscriptions?.filter((s) => s.plan === 'free').length || 0 },
        { name: 'Pro', value: subscriptions?.filter((s) => s.plan === 'pro').length || 0 },
        { name: 'Ultimate', value: subscriptions?.filter((s) => s.plan === 'ultimate').length || 0 }
      ]

      setAnalyticsData({
        revenueData,
        ordersData,
        userGrowth,
        subscriptionDistribution: subscriptionData
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics Dashboard
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === '7d' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === '30d' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === '90d' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F1F5F9'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0EA5E9" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Orders Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Orders Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.ordersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F1F5F9'
                  }}
                />
                <Bar dataKey="orders" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1E293B', 
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F1F5F9'
                    }}
                  />
                  <Line type="monotone" dataKey="users" stroke="#8B5CF6" strokeWidth={2} />
                  <Line type="monotone" dataKey="restaurants" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="drivers" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.subscriptionDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.subscriptionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1E293B', 
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F1F5F9'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
