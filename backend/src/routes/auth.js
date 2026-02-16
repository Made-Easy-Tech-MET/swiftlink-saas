import express from 'express'
import { supabase, supabaseAdmin } from '../config/supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

const getFirstRowByUser = async (table, userId) => {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)

  if (error) throw error
  return data?.[0] || null
}

const ensureRoleProfile = async (profile) => {
  if (!profile?.id || !profile?.role) return

  if (profile.role === 'restaurant') {
    const existing = await getFirstRowByUser('restaurants', profile.id)
    if (!existing) {
      const fallbackName = profile.full_name ? `${profile.full_name}'s Restaurant` : 'My Restaurant'
      const { error: insertError } = await supabaseAdmin
        .from('restaurants')
        .insert({
          user_id: profile.id,
          name: fallbackName,
          address: 'Address to be completed',
          phone: profile.phone || null
        })
      if (insertError) throw insertError
    }
  }

  if (profile.role === 'driver') {
    const existing = await getFirstRowByUser('drivers', profile.id)
    if (!existing) {
      const { error: insertError } = await supabaseAdmin
        .from('drivers')
        .insert({
          user_id: profile.id,
          is_available: false
        })
      if (insertError) throw insertError
    }
  }
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, phone, role } = req.body
    const allowedRoles = ['restaurant', 'driver']
    const safeRole = allowedRoles.includes(role) ? role : 'restaurant'

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) throw authError

    // Create user profile
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name,
        phone,
        role: safeRole
      })
      .select()
      .single()

    if (userError) throw userError

    await ensureRoleProfile(userData)

    res.status(201).json({ user: userData })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) throw authError

    // Get user profile
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (userError) throw userError

    await ensureRoleProfile(userData)

    res.json({ user: userData, session: authData.session })
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
})

// Logout
router.post('/logout', async (req, res) => {
  // Supabase JWT is stateless: logout is handled client-side by clearing the session.
  res.json({ message: 'Logged out successfully' })
})

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    await ensureRoleProfile(req.profile)
    res.json({ user: req.profile })
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
})

router.post('/ensure-role-profile', authenticate, async (req, res) => {
  try {
    await ensureRoleProfile(req.profile)
    res.json({ message: 'Role profile ensured' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
