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
  return data?.[0]?.id || null
}

router.get('/me', async (req, res) => {
  try {
    const restaurantId = await getRestaurantIdForUser(req.profile)
    if (!restaurantId) return res.json(null)

    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.put('/me', async (req, res) => {
  try {
    const restaurantId = await getRestaurantIdForUser(req.profile)
    if (!restaurantId) throw new Error('Restaurant profile not found')

    const updates = { ...req.body }
    const { data, error } = await supabaseAdmin
      .from('restaurants')
      .update(updates)
      .eq('id', restaurantId)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
