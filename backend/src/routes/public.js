import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'

const router = express.Router()

router.get('/menu/:restaurantId/:tableNumber', async (req, res) => {
  try {
    const { restaurantId, tableNumber } = req.params
    const { data: restaurant, error } = await supabaseAdmin
      .from('restaurants')
      .select('id, name, description')
      .eq('id', restaurantId)
      .single()

    if (error) throw error

    const { data: menuItems, error: menuError } = await supabaseAdmin
      .from('menu_items')
      .select('id, name, description, category, price, image_url')
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true)
      .order('created_at', { ascending: true })

    if (menuError) throw menuError

    res.json({
      restaurant,
      tableNumber: Number(tableNumber),
      menu: menuItems || []
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/menu/:restaurantId/:tableNumber/orders', async (req, res) => {
  try {
    const { restaurantId, tableNumber } = req.params
    const { customer_name, customer_phone, notes, items = [] } = req.body

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('At least one item is required')
    }

    const subtotal = items.reduce((acc, item) => {
      const qty = Number(item.quantity) || 1
      const price = Number(item.unit_price) || 0
      return acc + qty * price
    }, 0)

    const { data: tableData } = await supabaseAdmin
      .from('restaurant_tables')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('table_number', Number(tableNumber))
      .maybeSingle()

    const { data: order, error: orderError } = await supabaseAdmin
      .from('qr_orders')
      .insert({
        restaurant_id: restaurantId,
        table_id: tableData?.id || null,
        table_number: Number(tableNumber),
        customer_name,
        customer_phone,
        status: 'pending',
        notes: notes || null,
        subtotal,
        total: subtotal
      })
      .select()
      .single()

    if (orderError) throw orderError

    const payload = items.map((item) => {
      const quantity = Number(item.quantity) || 1
      const unitPrice = Number(item.unit_price) || 0
      return {
        qr_order_id: order.id,
        item_name: item.item_name || item.name || 'Unnamed item',
        quantity,
        unit_price: unitPrice,
        total_price: quantity * unitPrice
      }
    })

    const { error: itemsError } = await supabaseAdmin
      .from('qr_order_items')
      .insert(payload)

    if (itemsError) throw itemsError

    res.status(201).json({ orderId: order.id, status: order.status })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
