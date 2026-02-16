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

router.get('/', async (req, res) => {
  try {
    const restaurantId = await getRestaurantIdForUser(req.profile)
    if (!restaurantId) return res.json([])

    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: true })

    if (error) throw error
    res.json(data || [])
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const restaurantId = await getRestaurantIdForUser(req.profile)
    if (!restaurantId) throw new Error('Restaurant profile not found')

    const { name, description, category, price, image_url, is_available } = req.body
    if (!name) throw new Error('name is required')

    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .insert({
        restaurant_id: restaurantId,
        name,
        description: description || null,
        category: category || null,
        price: Number(price) || 0,
        image_url: image_url || null,
        is_available: is_available !== false
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const restaurantId = await getRestaurantIdForUser(req.profile)
    if (!restaurantId) throw new Error('Restaurant profile not found')

    const updates = { ...req.body }
    if (updates.price != null) updates.price = Number(updates.price) || 0

    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .update(updates)
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

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const restaurantId = await getRestaurantIdForUser(req.profile)
    if (!restaurantId) throw new Error('Restaurant profile not found')

    const { error } = await supabaseAdmin
      .from('menu_items')
      .delete()
      .eq('id', id)
      .eq('restaurant_id', restaurantId)

    if (error) throw error
    res.json({ message: 'Item removed' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
