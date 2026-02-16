import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'

const router = express.Router()

const getRestaurantIdForUser = async (profile) => {
  const userId = profile?.id
  if (!userId) return null

  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)

  if (error) throw error
  if (data?.[0]?.id) return data[0].id

  const fallbackName = profile.full_name ? `${profile.full_name}'s Restaurant` : 'My Restaurant'
  const { data: created, error: insertError } = await supabaseAdmin
    .from('restaurants')
    .insert({
      user_id: userId,
      name: fallbackName,
      address: 'Address to be completed',
      phone: profile.phone || null
    })
    .select('id')
    .single()

  if (insertError) throw insertError
  return created?.id || null
}

const getRestaurantPlan = async (userId) => {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .eq('role', 'restaurant')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return { plan: 'free', status: 'active' }
  return data
}

router.get('/', async (req, res) => {
  try {
    const restaurantId = await getRestaurantIdForUser(req.profile)
    if (!restaurantId) return res.json([])

    const { data, error } = await supabaseAdmin
      .from('restaurant_tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('table_number', { ascending: true })

    if (error) throw error
    res.json(data || [])
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { table_number, table_name } = req.body
    if (!table_number) throw new Error('table_number is required')

    const restaurantId = await getRestaurantIdForUser(req.profile)
    if (!restaurantId) throw new Error('Restaurant profile not found')

    const currentPlan = await getRestaurantPlan(req.profile.id)
    if (currentPlan.status === 'blocked') {
      return res.status(403).json({ error: 'Blocked subscription. Upgrade or renew required.' })
    }

    const { count } = await supabaseAdmin
      .from('restaurant_tables')
      .select('*', { head: true, count: 'exact' })
      .eq('restaurant_id', restaurantId)

    if (currentPlan.plan === 'free' && (count || 0) >= 5) {
      return res.status(403).json({ error: 'Free plan is limited to 5 tables.' })
    }

    const { data, error } = await supabaseAdmin
      .from('restaurant_tables')
      .insert({
        restaurant_id: restaurantId,
        table_number,
        table_name: table_name || `Table ${table_number}`
      })
      .select()
      .single()

    if (error) throw error

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const qrUrl = `${baseUrl}/menu/${restaurantId}/${table_number}`
    await supabaseAdmin
      .from('restaurant_tables')
      .update({ qr_code_url: qrUrl })
      .eq('id', data.id)

    res.status(201).json({ ...data, qr_code_url: qrUrl })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const restaurantId = await getRestaurantIdForUser(req.profile)

    const { error } = await supabaseAdmin
      .from('restaurant_tables')
      .delete()
      .eq('id', id)
      .eq('restaurant_id', restaurantId)

    if (error) throw error
    res.json({ message: 'Table removed' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
