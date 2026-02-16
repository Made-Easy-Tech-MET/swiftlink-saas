import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Loader from './Loader'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading, isBlocked, isRestaurantProfileComplete } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <Loader size="large" />
      </div>
    )
  }

  if (!user) {
    // Redirect to login but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // User doesn't have the required role, redirect to their dashboard
    switch (role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />
      case 'restaurant':
        return <Navigate to="/restaurant/dashboard" replace />
      case 'driver':
        return <Navigate to="/driver/dashboard" replace />
      default:
        return <Navigate to="/login" replace />
    }
  }

  if (isBlocked && role !== 'admin') {
    return <Navigate to="/pricing" state={{ from: location, blocked: true }} replace />
  }

  return children
}
