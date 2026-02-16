import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, subscriptionOperations, authOperations, restaurantProfileOperations } from '../services/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState(null)
  const [restaurantProfile, setRestaurantProfile] = useState(null)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setRole(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const getDashboardRouteByRole = (userRole) => {
    switch (userRole) {
      case 'admin':
        return '/admin/dashboard'
      case 'restaurant':
        return '/restaurant/dashboard'
      case 'driver':
        return '/driver/dashboard'
      default:
        return '/login'
    }
  }

  const getUserProfileById = async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      return null
    }

    return data
  }

  const fetchUserProfile = async (userId) => {
    try {
      const data = await getUserProfileById(userId)
      if (!data) throw new Error('User profile not found')

      setUser(data)
      setRole(data.role)
      try {
        await authOperations.ensureRoleProfile()
      } catch (e) {
        // Ignore profile bootstrap errors to avoid blocking auth flow
      }
      if (data.role === 'restaurant') {
        try {
          const { data: restaurantData } = await restaurantProfileOperations.getMe()
          setRestaurantProfile(restaurantData || null)
        } catch (e) {
          setRestaurantProfile(null)
        }
      } else {
        setRestaurantProfile(null)
      }
      if (data.role === 'restaurant' || data.role === 'driver') {
        try {
          const { data: subscriptionData } = await subscriptionOperations.getMe()
          setSubscription(subscriptionData || null)
        } catch (subscriptionError) {
          setSubscription(null)
        }
      } else {
        setSubscription(null)
      }
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUser(null)
      setRole(null)
      setSubscription(null)
      return null
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, fullName, userRole, phone = null) => {
    try {
      const normalizedRole = ['restaurant', 'driver'].includes(userRole) ? userRole : 'restaurant'
      const normalizedPhone = phone?.trim() || null

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: normalizedRole,
            phone: normalizedPhone
          }
        }
      })

      if (error) throw error

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase.from('users').upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          phone: normalizedPhone,
          role: normalizedRole
        }, {
          onConflict: 'id'
        })

        if (profileError) throw profileError

        setUser({
          id: data.user.id,
          email,
          full_name: fullName,
          phone: normalizedPhone,
          role: normalizedRole
        })
      setRole(normalizedRole)
      try {
        await authOperations.ensureRoleProfile()
      } catch (e) {
        // Ignore profile bootstrap errors to avoid blocking signup
      }
      if (normalizedRole === 'restaurant') {
        try {
          const { data: restaurantData } = await restaurantProfileOperations.getMe()
          setRestaurantProfile(restaurantData || null)
        } catch (e) {
          setRestaurantProfile(null)
        }
      } else {
        setRestaurantProfile(null)
      }
        setSubscription({
          user_id: data.user.id,
          role: normalizedRole,
          plan: 'free',
          status: 'active'
        })
      }

      return {
        success: true,
        data,
        dashboardRoute: getDashboardRouteByRole(normalizedRole)
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      if (!data?.user?.id) throw new Error('User session is invalid')

      let profile = null
      for (let attempt = 0; attempt < 6; attempt++) {
        profile = await getUserProfileById(data.user.id)
        if (profile) break
        await new Promise((resolve) => setTimeout(resolve, 250))
      }

      if (!profile) {
        throw new Error('User profile not found. Please contact support or try again.')
      }

      setUser(profile)
      setRole(profile.role)
      try {
        await authOperations.ensureRoleProfile()
      } catch (e) {
        // Ignore profile bootstrap errors to avoid blocking signin
      }
      if (profile.role === 'restaurant') {
        try {
          const { data: restaurantData } = await restaurantProfileOperations.getMe()
          setRestaurantProfile(restaurantData || null)
        } catch (e) {
          setRestaurantProfile(null)
        }
      } else {
        setRestaurantProfile(null)
      }
      if (profile.role === 'restaurant' || profile.role === 'driver') {
        try {
          const { data: subscriptionData } = await subscriptionOperations.getMe()
          setSubscription(subscriptionData || null)
        } catch (subscriptionError) {
          setSubscription(null)
        }
      } else {
        setSubscription(null)
      }
      setLoading(false)

      return {
        success: true,
        data,
        dashboardRoute: getDashboardRouteByRole(profile.role)
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setRole(null)
      setSubscription(null)
      setRestaurantProfile(null)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const getDashboardRoute = () => {
    return getDashboardRouteByRole(role)
  }

  const updateProfile = async (updates) => {
    try {
      if (!user?.id) {
        throw new Error('No authenticated user')
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setUser(data)
      setRole(data.role)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const refreshSubscription = async () => {
    if (!user?.id || !role || !['restaurant', 'driver'].includes(role)) {
      setSubscription(null)
      return { success: true, data: null }
    }

    try {
      const { data } = await subscriptionOperations.getMe()
      setSubscription(data || null)
      return { success: true, data: data || null }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const refreshRestaurantProfile = async () => {
    if (!user?.id || role !== 'restaurant') {
      setRestaurantProfile(null)
      return { success: true, data: null }
    }

    try {
      const { data } = await restaurantProfileOperations.getMe()
      setRestaurantProfile(data || null)
      return { success: true, data: data || null }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const isRestaurantProfileComplete = !!(
    restaurantProfile?.name &&
    restaurantProfile?.address &&
    restaurantProfile?.logo_url
  )

  const value = {
    user,
    role,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    getDashboardRoute,
    isAuthenticated: !!user,
    subscription,
    subscriptionPlan: subscription?.plan || 'free',
    subscriptionStatus: subscription?.status || 'active',
    isBlocked: subscription?.status === 'blocked',
    refreshSubscription,
    restaurantProfile,
    refreshRestaurantProfile,
    isRestaurantProfileComplete
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
