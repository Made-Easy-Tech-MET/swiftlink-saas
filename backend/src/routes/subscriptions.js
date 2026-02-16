import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'

const router = express.Router()
const PLAN_PRICE = { free: 0, pro: 9.99, ultimate: 19.99 }
const VALID_PLANS = ['free', 'pro', 'ultimate']
const VALID_STATUSES = ['active', 'expired', 'blocked']

const isAdmin = (req) => req.profile?.role === 'admin'

const addGracePeriod = (endDate) => {
  const value = new Date(endDate)
  value.setDate(value.getDate() + 3)
  return value.toISOString().slice(0, 10)
}

const computeStatus = (subscription) => {
  if (!subscription) return 'expired'
  if (subscription.status === 'blocked') return 'blocked'

  const today = new Date().toISOString().slice(0, 10)
  if (subscription.end_date >= today) return 'active'
  if (subscription.grace_period_end && subscription.grace_period_end >= today) return 'expired'
  return 'blocked'
}

router.post('/refresh-statuses', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' })

  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')

    if (error) throw error

    const updates = await Promise.all(
      (data || []).map(async (sub) => {
        const nextStatus = computeStatus(sub)
        if (nextStatus === sub.status) return null
        const { data: updated } = await supabaseAdmin
          .from('subscriptions')
          .update({ status: nextStatus })
          .eq('id', sub.id)
          .select()
          .single()
        return updated
      })
    )

    res.json({ updated: updates.filter(Boolean) })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/me', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.profile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error

    if (!data) {
      return res.json({
        user_id: req.profile.id,
        role: req.profile.role,
        plan: 'free',
        status: 'active',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date().toISOString().slice(0, 10),
        grace_period_end: new Date().toISOString().slice(0, 10),
        monthly_price: 0
      })
    }

    const nextStatus = computeStatus(data)
    if (nextStatus !== data.status) {
      const { data: updated } = await supabaseAdmin
        .from('subscriptions')
        .update({ status: nextStatus })
        .eq('id', data.id)
        .select()
        .single()
      return res.json(updated)
    }

    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' })

  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*, user:users(id, full_name, email, role)')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data || [])
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' })

  try {
    const { user_id, role, plan = 'free', start_date, end_date } = req.body
    if (!user_id || !role) throw new Error('user_id and role are required')
    if (!VALID_PLANS.includes(plan)) throw new Error('Invalid plan')

    const safeStartDate = start_date || new Date().toISOString().slice(0, 10)
    const safeEndDate = end_date || safeStartDate

    const payload = {
      user_id,
      role,
      plan,
      status: 'active',
      start_date: safeStartDate,
      end_date: safeEndDate,
      grace_period_end: addGracePeriod(safeEndDate),
      monthly_price: PLAN_PRICE[plan] ?? 0
    }

    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.put('/:id', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' })

  try {
    const { id } = req.params
    const updates = { ...req.body }

    if (updates.plan && !VALID_PLANS.includes(updates.plan)) {
      throw new Error('Invalid plan')
    }
    if (updates.status && !VALID_STATUSES.includes(updates.status)) {
      throw new Error('Invalid status')
    }
    if (updates.plan && updates.monthly_price == null) {
      updates.monthly_price = PLAN_PRICE[updates.plan] ?? 0
    }
    if (updates.end_date && !updates.grace_period_end) {
      updates.grace_period_end = addGracePeriod(updates.end_date)
    }

    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.put('/:id/block', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' })
  try {
    const { id } = req.params
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'blocked' })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.put('/:id/unblock', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' })
  try {
    const { id } = req.params
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'active' })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
