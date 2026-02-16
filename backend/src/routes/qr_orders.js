import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'

const router = express.Router()

const VALID_STATUS = ['pending', 'preparing', 'ready']

const getRestaurantIdForUser = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('restaurants')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)

  if (error) throw error
  return data?.[0]?.id || null
}

router.get('/', async (req, res) => {
  try {
    const restaurantId = await getRestaurantIdForUser(req.profile.id)
    if (!restaurantId) return res.json([])

    const { data, error } = await supabaseAdmin
      .from('qr_orders')
      .select('*, qr_order_items(*)')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data || [])
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    if (!VALID_STATUS.includes(status)) throw new Error('Invalid status')

    const restaurantId = await getRestaurantIdForUser(req.profile.id)
    const { data, error } = await supabaseAdmin
      .from('qr_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('restaurant_id', restaurantId)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
