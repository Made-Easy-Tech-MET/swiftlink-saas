import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'

const router = express.Router()

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { full_name, phone, is_active } = req.body

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ full_name, phone, is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
