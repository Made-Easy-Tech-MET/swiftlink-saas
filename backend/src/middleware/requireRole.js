export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.profile?.role

    if (!role) {
      return res.status(403).json({ error: 'Forbidden: no role found' })
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' })
    }

    next()
  }
}
