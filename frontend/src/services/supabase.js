import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in frontend/.env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const parseApiResponse = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  const rawText = await response.text()
  const shortened = rawText.slice(0, 120).replace(/\s+/g, ' ').trim()
  throw new Error(
    `API returned non-JSON response (${response.status}) from ${response.url}. Check VITE_API_URL. Response starts with: ${shortened}`
  )
}

const fetchWithTimeout = async (url, options = {}, timeoutMs = 15000) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`API request timed out after ${Math.round(timeoutMs / 1000)}s`)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

const authedRequest = async (path, options = {}) => {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData?.session?.access_token
  if (!token) throw new Error('No authenticated session found')

  const response = await fetchWithTimeout(`${apiBase}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  const payload = await parseApiResponse(response)
  if (!response.ok) {
    throw new Error(payload.error || 'Request failed')
  }
  return payload
}

const publicRequest = async (path, options = {}) => {
  const response = await fetchWithTimeout(`${apiBase}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  const payload = await parseApiResponse(response)
  if (!response.ok) {
    throw new Error(payload.error || 'Request failed')
  }
  return payload
}

export const tables = {
  users: 'users',
  restaurants: 'restaurants',
  drivers: 'drivers',
  orders: 'orders',
  deliveries: 'deliveries',
  payments: 'payments',
  subscriptions: 'subscriptions',
  restaurant_tables: 'restaurant_tables',
  qr_orders: 'qr_orders',
  qr_order_items: 'qr_order_items'
}

export const userOperations = {
  getById: async (id) => {
    try {
      const data = await authedRequest(`/users/${id}`)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },
  update: async (id, updates) => {
    try {
      const data = await authedRequest(`/users/${id}`, { method: 'PUT', body: updates })
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },
  getAll: async () => {
    try {
      const data = await authedRequest('/users')
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },
  getByRole: async (role) => {
    try {
      const all = await authedRequest('/users')
      const data = (all || []).filter((user) => user.role === role)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

export const restaurantOperations = {
  getByUserId: async (userId) => {
    const { data, error } = await supabase.from(tables.restaurants).select('*').eq('user_id', userId).single()
    return { data, error }
  },
  getAll: async () => {
    const { data, error } = await supabase.from(tables.restaurants).select('*').order('created_at', { ascending: false })
    return { data, error }
  },
  create: async (restaurant) => {
    const { data, error } = await supabase.from(tables.restaurants).insert(restaurant).select().single()
    return { data, error }
  },
  update: async (id, updates) => {
    const { data, error } = await supabase.from(tables.restaurants).update(updates).eq('id', id).select().single()
    return { data, error }
  }
}

export const restaurantProfileOperations = {
  getMe: async () => {
    const data = await authedRequest('/restaurant-profile/me')
    return { data, error: null }
  },
  updateMe: async (updates) => {
    const data = await authedRequest('/restaurant-profile/me', { method: 'PUT', body: updates })
    return { data, error: null }
  }
}

export const driverOperations = {
  getByUserId: async (userId) => {
    const { data, error } = await supabase.from(tables.drivers).select('*').eq('user_id', userId).single()
    return { data, error }
  },
  getAll: async () => {
    const { data, error } = await supabase.from(tables.drivers).select('*').order('created_at', { ascending: false })
    return { data, error }
  },
  getAvailable: async () => {
    const { data, error } = await supabase.from(tables.drivers).select('*').eq('is_available', true).order('rating', { ascending: false })
    return { data, error }
  },
  create: async (driver) => {
    const { data, error } = await supabase.from(tables.drivers).insert(driver).select().single()
    return { data, error }
  },
  update: async (id, updates) => {
    const { data, error } = await supabase.from(tables.drivers).update(updates).eq('id', id).select().single()
    return { data, error }
  }
}

export const orderOperations = {
  getById: async (id) => {
    const { data, error } = await supabase.from(tables.orders).select('*').eq('id', id).single()
    return { data, error }
  },
  getByRestaurant: async (restaurantId) => {
    const { data, error } = await supabase.from(tables.orders).select('*').eq('restaurant_id', restaurantId).order('created_at', { ascending: false })
    return { data, error }
  },
  getAll: async () => {
    const { data, error } = await supabase.from(tables.orders).select('*').order('created_at', { ascending: false })
    return { data, error }
  },
  create: async (order) => {
    const { data, error } = await supabase.from(tables.orders).insert(order).select().single()
    return { data, error }
  },
  update: async (id, updates) => {
    const { data, error } = await supabase.from(tables.orders).update(updates).eq('id', id).select().single()
    return { data, error }
  },
  updateStatus: async (id, status) => {
    const { data, error } = await supabase.from(tables.orders).update({ status, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    return { data, error }
  }
}

export const deliveryOperations = {
  getByOrder: async (orderId) => {
    const { data, error } = await supabase.from(tables.deliveries).select('*').eq('order_id', orderId).single()
    return { data, error }
  },
  getByDriver: async (driverId) => {
    const { data, error } = await supabase.from(tables.deliveries).select('*').eq('driver_id', driverId).order('created_at', { ascending: false })
    return { data, error }
  },
  getAll: async () => {
    const { data, error } = await supabase.from(tables.deliveries).select('*').order('created_at', { ascending: false })
    return { data, error }
  },
  create: async (delivery) => {
    const { data, error } = await supabase.from(tables.deliveries).insert(delivery).select().single()
    return { data, error }
  },
  update: async (id, updates) => {
    const { data, error } = await supabase.from(tables.deliveries).update(updates).eq('id', id).select().single()
    return { data, error }
  },
  updateStatus: async (id, status) => {
    const updates = { status, updated_at: new Date().toISOString() }
    if (status === 'delivered') updates.delivery_time = new Date().toISOString()
    const { data, error } = await supabase.from(tables.deliveries).update(updates).eq('id', id).select().single()
    return { data, error }
  }
}

export const subscriptionOperations = {
  getMe: async () => {
    const data = await authedRequest('/subscriptions/me')
    return { data, error: null }
  },
  getAll: async () => {
    const data = await authedRequest('/subscriptions')
    return { data, error: null }
  },
  refreshStatuses: async () => {
    const data = await authedRequest('/subscriptions/refresh-statuses', { method: 'POST' })
    return { data, error: null }
  },
  create: async (subscription) => {
    const data = await authedRequest('/subscriptions', { method: 'POST', body: subscription })
    return { data, error: null }
  },
  update: async (id, updates) => {
    const data = await authedRequest(`/subscriptions/${id}`, { method: 'PUT', body: updates })
    return { data, error: null }
  },
  block: async (id) => {
    const data = await authedRequest(`/subscriptions/${id}/block`, { method: 'PUT' })
    return { data, error: null }
  },
  unblock: async (id) => {
    const data = await authedRequest(`/subscriptions/${id}/unblock`, { method: 'PUT' })
    return { data, error: null }
  }
}

export const restaurantTableOperations = {
  getAll: async () => {
    const data = await authedRequest('/restaurant-tables')
    return { data, error: null }
  },
  create: async (payload) => {
    const data = await authedRequest('/restaurant-tables', { method: 'POST', body: payload })
    return { data, error: null }
  },
  remove: async (id) => {
    const data = await authedRequest(`/restaurant-tables/${id}`, { method: 'DELETE' })
    return { data, error: null }
  }
}

export const qrOrderOperations = {
  getKitchenOrders: async () => {
    const data = await authedRequest('/qr-orders')
    return { data, error: null }
  },
  updateStatus: async (id, status) => {
    const data = await authedRequest(`/qr-orders/${id}/status`, { method: 'PUT', body: { status } })
    return { data, error: null }
  }
}

export const publicMenuOperations = {
  getMenu: async (restaurantId, tableNumber) => {
    const data = await publicRequest(`/public/menu/${restaurantId}/${tableNumber}`)
    return { data, error: null }
  },
  createOrder: async (restaurantId, tableNumber, payload) => {
    const data = await publicRequest(`/public/menu/${restaurantId}/${tableNumber}/orders`, {
      method: 'POST',
      body: payload
    })
    return { data, error: null }
  }
}

export const billingOperations = {
  createCheckoutSession: async (plan) => {
    const data = await authedRequest('/billing/checkout', {
      method: 'POST',
      body: { plan }
    })
    return { data, error: null }
  },
  createPortalSession: async () => {
    const data = await authedRequest('/billing/portal', {
      method: 'POST'
    })
    return { data, error: null }
  },
  confirmCheckoutSession: async (sessionId) => {
    const encoded = encodeURIComponent(sessionId)
    const data = await authedRequest(`/billing/confirm?session_id=${encoded}`)
    return { data, error: null }
  }
}

export const authOperations = {
  ensureRoleProfile: async () => {
    const data = await authedRequest('/auth/ensure-role-profile', {
      method: 'POST'
    })
    return { data, error: null }
  }
}

export const menuItemOperations = {
  getAll: async () => {
    const data = await authedRequest('/menu-items')
    return { data, error: null }
  },
  create: async (payload) => {
    const data = await authedRequest('/menu-items', { method: 'POST', body: payload })
    return { data, error: null }
  },
  update: async (id, updates) => {
    const data = await authedRequest(`/menu-items/${id}`, { method: 'PUT', body: updates })
    return { data, error: null }
  },
  remove: async (id) => {
    const data = await authedRequest(`/menu-items/${id}`, { method: 'DELETE' })
    return { data, error: null }
  }
}

export const storageOperations = {
  uploadRestaurantLogo: async (userId, file) => {
    const filePath = `${userId}/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage.from('restaurant-logos').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })
    if (error) throw error
    const { data: publicUrl } = supabase.storage.from('restaurant-logos').getPublicUrl(data.path)
    return publicUrl.publicUrl
  },
  uploadMenuImage: async (userId, file) => {
    const filePath = `${userId}/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage.from('menu-images').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })
    if (error) throw error
    const { data: publicUrl } = supabase.storage.from('menu-images').getPublicUrl(data.path)
    return publicUrl.publicUrl
  }
}
