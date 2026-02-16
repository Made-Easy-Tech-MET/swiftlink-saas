import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'
import ordersRoutes from './routes/orders.js'
import deliveriesRoutes from './routes/deliveries.js'
import subscriptionsRoutes from './routes/subscriptions.js'
import analyticsRoutes from './routes/analytics.js'
import restaurantTablesRoutes from './routes/restaurant_tables.js'
import menuItemsRoutes from './routes/menu_items.js'
import restaurantsRoutes from './routes/restaurants.js'
import qrOrdersRoutes from './routes/qr_orders.js'
import publicRoutes from './routes/public.js'
import billingRoutes, { stripeWebhookHandler } from './routes/billing.js'
import { authenticate } from './middleware/auth.js'
import { requireRole } from './middleware/requireRole.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler)
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SwiftLink API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/users', authenticate, requireRole('admin'), usersRoutes)
app.use('/api/orders', authenticate, requireRole('admin'), ordersRoutes)
app.use('/api/deliveries', authenticate, requireRole('admin'), deliveriesRoutes)
app.use('/api/subscriptions', authenticate, subscriptionsRoutes)
app.use('/api/analytics', authenticate, requireRole('admin'), analyticsRoutes)
app.use('/api/restaurant-tables', authenticate, requireRole('restaurant'), restaurantTablesRoutes)
app.use('/api/menu-items', authenticate, requireRole('restaurant'), menuItemsRoutes)
app.use('/api/restaurant-profile', authenticate, requireRole('restaurant'), restaurantsRoutes)
app.use('/api/qr-orders', authenticate, requireRole('restaurant'), qrOrdersRoutes)
app.use('/api/billing', authenticate, billingRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
