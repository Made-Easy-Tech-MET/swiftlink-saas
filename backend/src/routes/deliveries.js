import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'

const router = express.Router()

// Get all deliveries
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('deliveries')
      .select(`
        *,
        order:orders(order_number, delivery_address),
        driver:drivers(user_id)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Format the response
    const formattedData = data.map(delivery => ({
      ...delivery,
      order_number: delivery.order?.order_number,
      delivery_address: delivery.order?.delivery_address
    }))
    
    res.json(formattedData)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get delivery by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabaseAdmin
      .from('deliveries')
      .select(`
        *,
        order:orders(*),
        driver:drivers(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

// Create delivery
router.post('/', async (req, res) => {
  try {
    const { order_id, driver_id } = req.body

    const { data, error } = await supabaseAdmin
      .from('deliveries')
      .insert({
        order_id,
        driver_id,
        status: 'assigned'
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update delivery
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { driver_id, current_latitude, current_longitude, notes } = req.body

    const { data, error } = await supabaseAdmin
      .from('deliveries')
      .update({ driver_id, current_latitude, current_longitude, notes })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update delivery status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const updates = { status }
    if (status === 'picked_up') {
      updates.pickup_time = new Date().toISOString()
    } else if (status === 'delivered') {
      updates.delivery_time = new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('deliveries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    
    // Update driver stats if delivered
    if (status === 'delivered') {
      const delivery = await supabaseAdmin
        .from('deliveries')
        .select('driver_id')
        .eq('id', id)
        .single()
      
      if (delivery.data?.driver_id) {
        const { data: driverData } = await supabaseAdmin
          .from('drivers')
          .select('total_deliveries')
          .eq('id', delivery.data.driver_id)
          .single()

        const nextTotalDeliveries = (driverData?.total_deliveries || 0) + 1

        await supabaseAdmin
          .from('drivers')
          .update({ total_deliveries: nextTotalDeliveries })
          .eq('id', delivery.data.driver_id)
      }
    }

    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete delivery
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabaseAdmin
      .from('deliveries')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.json({ message: 'Delivery deleted successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
