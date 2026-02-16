import { supabaseAdmin } from '../config/supabase.js'

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.slice('Bearer '.length).trim()
    if (!token) {
      return res.status(401).json({ error: 'Missing access token' })
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !authData?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      return res.status(401).json({ error: 'User profile not found' })
    }

    req.user = authData.user
    req.profile = profile
    next()
  } catch (error) {
    next(error)
  }
}
