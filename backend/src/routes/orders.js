import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'

const router = express.Router()

// Get all orders
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        restaurant:restaurants(name),
        customer:users!orders_customer_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Format the response
    const formattedData = data.map(order => ({
      ...order,
      restaurant_name: order.restaurant?.name,
      customer_name: order.customer?.full_name
    }))
    
    res.json(formattedData)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        restaurant:restaurants(name),
        customer:users!orders_customer_id_fkey(full_name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

// Create order
router.post('/', async (req, res) => {
  try {
    const { restaurant_id, customer_id, subtotal, delivery_fee, total, delivery_address, delivery_notes } = req.body

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert({
        restaurant_id,
        customer_id,
        subtotal,
        delivery_fee,
        total,
        delivery_address,
        delivery_notes,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update order
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { status, subtotal, delivery_fee, total, delivery_address, delivery_notes } = req.body

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status, subtotal, delivery_fee, total, delivery_address, delivery_notes })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.json({ message: 'Order deleted successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
