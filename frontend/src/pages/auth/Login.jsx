import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useTheme } from '../../context/ThemeContext'

const translations = {
  en: {
    welcome: 'Welcome back',
    subtitle: 'Sign in to your account to continue',
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    signIn: 'Sign In',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    social: 'Social login',
    comingSoon: 'Coming soon',
    panelTitle: 'Streamline Your Delivery Operations',
    panelText: 'Connect restaurants with delivery drivers seamlessly. Manage orders, track deliveries, and grow your business.',
    failed: 'Failed to sign in'
  },
  fr: {
    welcome: 'Bon retour',
    subtitle: 'Connectez-vous pour continuer',
    email: 'Email',
    emailPlaceholder: 'Entrez votre email',
    password: 'Mot de passe',
    passwordPlaceholder: 'Entrez votre mot de passe',
    signIn: 'Se connecter',
    noAccount: "Pas encore de compte ?",
    signUp: "S'inscrire",
    social: 'Connexion sociale',
    comingSoon: 'Tres bientot',
    panelTitle: 'Optimisez vos operations de livraison',
    panelText: 'Connectez restaurants et livreurs. Gerees les commandes et developpez votre activite.',
    failed: 'Connexion impossible'
  }
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signIn, getDashboardRoute, isAuthenticated, role, loading: authLoading } = useAuth()
  const { language } = useTheme()
  const navigate = useNavigate()
  const t = translations[language] || translations.en

  useEffect(() => {
    if (!authLoading && isAuthenticated && role) {
      navigate(getDashboardRoute(), { replace: true })
    }
  }, [authLoading, isAuthenticated, role, getDashboardRoute, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn(email, password)
    
    if (result.success) {
      navigate(result.dashboardRoute || getDashboardRoute(), { replace: true })
    } else {
      setError(result.error || t.failed)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/swiftlink_logos_png/logo-icon.png" 
                alt="SwiftLink" 
                className="w-12 h-12 rounded-xl"
              />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">SwiftLink</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t.welcome}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            {t.subtitle}
          </p>

          {error && (
            <div className="mb-4 p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Input
                label={t.email}
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Input
                label={t.password}
                type={showPassword ? 'text' : 'password'}
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              {t.signIn}
            </Button>
          </form>

          <p className="mt-8 text-center text-gray-500 dark:text-gray-400">
            {t.noAccount}{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              {t.signUp}
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Image/Pattern */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-primary-dark items-center justify-center p-12">
        <div className="max-w-lg text-center text-white">
          <div className="inline-flex items-center justify-center bg-white/95 rounded-2xl p-4 shadow-lg mb-6">
            <img
              src="/swiftlink_logos_png/logo-icon.png"
              alt="SwiftLink"
              className="w-16 h-16 rounded-xl"
            />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            {t.panelTitle}
          </h2>
          <p className="text-white/80 text-lg">
            {t.panelText}
          </p>
          <div className="mt-8">
            <p className="text-sm text-white/70 mb-3">{t.social}</p>
            <div className="inline-block relative group">
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white border border-white/30 cursor-not-allowed grayscale opacity-70"
                aria-label="Google sign-in coming soon"
              >
                <svg viewBox="0 0 48 48" className="w-6 h-6" aria-hidden="true">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.244 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.963 3.037l5.657-5.657C34.046 6.053 29.278 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.963 3.037l5.657-5.657C34.046 6.053 29.278 4 24 4c-7.682 0-14.347 4.337-17.694 10.691z"/>
                  <path fill="#4CAF50" d="M24 44c5.176 0 9.86-1.977 13.409-5.191l-6.19-5.238C29.142 35.091 26.715 36 24 36c-5.223 0-9.62-3.318-11.283-7.946l-6.522 5.025C9.5 39.556 16.227 44 24 44z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.052 12.052 0 0 1-4.085 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                </svg>
              </button>
              <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {t.comingSoon}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
