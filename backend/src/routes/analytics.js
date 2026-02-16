import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'

const router = express.Router()

// Get revenue analytics
router.get('/revenue', async (req, res) => {
  try {
    const { period = '30' } = req.query
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))
    
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('total, created_at')
      .gte('created_at', startDate.toISOString())
      .eq('status', 'delivered')

    if (error) throw error
    
    // Group by date
    const revenueByDate = {}
    data.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0]
      revenueByDate[date] = (revenueByDate[date] || 0) + parseFloat(order.total)
    })
    
    const result = Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue
    })).sort((a, b) => a.date.localeCompare(b.date))
    
    res.json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get orders analytics
router.get('/orders', async (req, res) => {
  try {
    const { period = '30' } = req.query
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))
    
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('id, created_at, status')
      .gte('created_at', startDate.toISOString())

    if (error) throw error
    
    // Group by date and status
    const ordersByDate = {}
    data.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0]
      if (!ordersByDate[date]) {
        ordersByDate[date] = { total: 0, delivered: 0, pending: 0, cancelled: 0 }
      }
      ordersByDate[date].total++
      if (order.status === 'delivered') ordersByDate[date].delivered++
      if (order.status === 'pending') ordersByDate[date].pending++
      if (order.status === 'cancelled') ordersByDate[date].cancelled++
    })
    
    const result = Object.entries(ordersByDate).map(([date, stats]) => ({
      date,
      ...stats
    })).sort((a, b) => a.date.localeCompare(b.date))
    
    res.json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get user analytics
router.get('/users', async (req, res) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('role, created_at')

    if (error) throw error
    
    // Count by role
    const byRole = { admin: 0, restaurant: 0, driver: 0 }
    users.forEach(user => {
      if (byRole[user.role] !== undefined) {
        byRole[user.role]++
      }
    })
    
    // Group by month
    const usersByMonth = {}
    users.forEach(user => {
      const month = new Date(user.created_at).toISOString().slice(0, 7)
      usersByMonth[month] = (usersByMonth[month] || 0) + 1
    })
    
    const monthlyGrowth = Object.entries(usersByMonth).map(([month, count]) => ({
      month,
      count
    })).sort((a, b) => a.month.localeCompare(b.month))
    
    res.json({
      byRole,
      total: users.length,
      monthlyGrowth
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get growth metrics
router.get('/growth', async (req, res) => {
  try {
    const { period = '12' } = req.query
    
    // Get all orders and users
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('created_at, total')
    
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('created_at')
    
    // Calculate monthly growth
    const ordersByMonth = {}
    const revenueByMonth = {}
    const usersByMonth = {}
    
    orders.forEach(order => {
      const month = new Date(order.created_at).toISOString().slice(0, 7)
      ordersByMonth[month] = (ordersByMonth[month] || 0) + 1
      revenueByMonth[month] = (revenueByMonth[month] || 0) + parseFloat(order.total || 0)
    })
    
    users.forEach(user => {
      const month = new Date(user.created_at).toISOString().slice(0, 7)
      usersByMonth[month] = (usersByMonth[month] || 0) + 1
    })
    
    // Get last N months
    const months = []
    for (let i = parseInt(period) - 1; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      months.push(d.toISOString().slice(0, 7))
    }
    
    const result = months.map(month => ({
      month,
      orders: ordersByMonth[month] || 0,
      revenue: revenueByMonth[month] || 0,
      users: usersByMonth[month] || 0
    }))
    
    res.json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get dashboard summary
router.get('/summary', async (req, res) => {
  try {
    // Get total users
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    // Get total orders
    const { count: totalOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
    
    // Get total revenue
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('total')
      .eq('status', 'delivered')
    
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0)
    
    // Get active subscriptions
    const { count: activeSubscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
    
    // Get today's orders
    const today = new Date().toISOString().split('T')[0]
    const { count: todayOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today)
    
    // Get active drivers
    const { count: activeDrivers } = await supabaseAdmin
      .from('drivers')
      .select('*', { count: 'exact', head: true })
      .eq('is_available', true)
    
    res.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      activeSubscriptions,
      todayOrders,
      activeDrivers
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
