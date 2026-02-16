import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { billingOperations } from '../services/supabase'

const plans = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    subtitle: 'For starters',
    features: ['Basic dashboard', 'Up to 5 QR tables', 'Community support']
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$9.99',
    subtitle: 'For growing teams',
    features: ['Unlimited QR tables', 'Priority support', 'Advanced analytics'],
    highlighted: true
  },
  {
    key: 'ultimate',
    name: 'Ultimate',
    price: '$19.99',
    subtitle: 'For scale',
    features: ['All Pro features', 'Custom onboarding', 'Dedicated account manager']
  }
]

export default function Pricing() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {
    isAuthenticated,
    subscriptionPlan,
    role,
    getDashboardRoute,
    refreshSubscription
  } = useAuth()
  const [loadingPlan, setLoadingPlan] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [syncingCheckout, setSyncingCheckout] = useState(false)

  const checkoutStatus = searchParams.get('checkout')
  const checkoutSessionId = searchParams.get('session_id')
  const checkoutPlan = searchParams.get('plan')

  useEffect(() => {
    let isActive = true

    const syncCheckout = async () => {
      if (!isAuthenticated || checkoutStatus !== 'success' || !checkoutSessionId) return

      setSyncingCheckout(true)
      setError('')
      setInfo('Paiement confirme. Mise a jour de votre abonnement...')

      try {
        await billingOperations.confirmCheckoutSession(checkoutSessionId)
      } catch (confirmError) {
        // Webhook may still handle this; keep going with retries on /subscriptions/me.
      }

      const maxAttempts = 12
      const waitMs = 1000

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const result = await refreshSubscription()
        const currentPlan = result?.data?.plan
        const currentStatus = result?.data?.status

        if (
          result?.success &&
          currentStatus === 'active' &&
          (currentPlan === checkoutPlan || ['pro', 'ultimate'].includes(currentPlan))
        ) {
          if (!isActive) return
          setInfo('Paiement reussi. Redirection vers votre dashboard...')
          setTimeout(() => {
            navigate(getDashboardRoute(), { replace: true })
          }, 800)
          return
        }

        await new Promise((resolve) => setTimeout(resolve, waitMs))
      }

      if (!isActive) return
      setError("Paiement enregistre, mais la mise a jour du plan prend plus de temps. Recharge la page dans quelques secondes.")
    }

    syncCheckout().finally(() => {
      if (isActive) setSyncingCheckout(false)
    })

    return () => {
      isActive = false
    }
  }, [checkoutStatus, checkoutSessionId, checkoutPlan, isAuthenticated, refreshSubscription, navigate, getDashboardRoute])

  const handleChoosePlan = async (plan) => {
    setError('')

    if (plan === 'free') {
      navigate('/register')
      return
    }

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      setLoadingPlan(plan)
      const { data } = await billingOperations.createCheckoutSession(plan)
      if (!data?.url) {
        throw new Error('Stripe checkout session did not return a URL')
      }
      window.location.href = data.url
    } catch (e) {
      setError(e.message)
      setLoadingPlan('')
    }
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Choose Your Plan</h1>
          <p className="text-gray-500 mt-3">Restaurants and drivers can upgrade anytime.</p>
          {checkoutStatus === 'success' && (
            <p className="text-secondary mt-3">Payment successful. Your subscription is being updated.</p>
          )}
          {checkoutStatus === 'cancel' && (
            <p className="text-danger mt-3">Checkout canceled.</p>
          )}
          {error && (
            <p className="text-danger mt-3">{error}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`rounded-2xl border p-8 ${
                plan.highlighted
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-light-border dark:border-dark-border bg-white dark:bg-dark-surface'
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{plan.name}</h2>
                {plan.highlighted && <Sparkles size={18} className="text-primary" />}
              </div>
              <p className="mt-2 text-gray-500">{plan.subtitle}</p>
              <p className="mt-6 text-4xl font-bold text-gray-900 dark:text-white">
                {plan.price}
                <span className="text-base text-gray-500 font-normal">/mo</span>
              </p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Check size={16} className="text-secondary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleChoosePlan(plan.key)}
                disabled={syncingCheckout || loadingPlan === plan.key || subscriptionPlan === plan.key}
                className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-50 text-white py-3 font-medium"
              >
                {subscriptionPlan === plan.key
                  ? 'Current Plan'
                  : syncingCheckout
                    ? 'Syncing plan...'
                  : loadingPlan === plan.key
                    ? 'Redirecting...'
                    : plan.key === 'free'
                      ? 'Get Started'
                      : 'Upgrade with Stripe'}
              </button>
            </div>
          ))}
        </div>

        {(checkoutStatus === 'success' || info) && (
          <div className="mt-6 text-center">
            {info && <p className="text-secondary">{info}</p>}
            {role && !syncingCheckout && subscriptionPlan !== 'free' && (
              <button
                onClick={() => navigate(getDashboardRoute(), { replace: true })}
                className="mt-3 text-primary underline"
              >
                Go to dashboard
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
