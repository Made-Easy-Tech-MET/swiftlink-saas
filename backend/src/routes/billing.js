import express from 'express'
import Stripe from 'stripe'
import { supabaseAdmin } from '../config/supabase.js'

const router = express.Router()

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null

const PLAN_PRICE_IDS = {
  pro: process.env.STRIPE_PRICE_PRO || '',
  ultimate: process.env.STRIPE_PRICE_ULTIMATE || ''
}

const PLAN_PRICES = {
  free: 0,
  pro: 9.99,
  ultimate: 19.99
}

const ensureStripeConfigured = () => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Missing STRIPE_SECRET_KEY.')
  }
}

const statusFromStripeSubscription = (status) => {
  if (status === 'active' || status === 'trialing') return 'active'
  if (status === 'past_due' || status === 'unpaid') return 'expired'
  return 'blocked'
}

const addDays = (dateString, days) => {
  const value = new Date(dateString)
  value.setDate(value.getDate() + days)
  return value.toISOString().slice(0, 10)
}

const upsertSubscriptionFromCheckout = async (checkoutSession) => {
  const metadata = checkoutSession.metadata || {}
  const userId = metadata.user_id
  const role = metadata.role
  const plan = metadata.plan

  if (!userId || !role || !plan) {
    throw new Error('Missing checkout metadata for subscription sync')
  }

  let stripeSubscription = null
  if (checkoutSession.subscription) {
    stripeSubscription = await stripe.subscriptions.retrieve(checkoutSession.subscription)
  }

  const startDate = stripeSubscription
    ? new Date(stripeSubscription.current_period_start * 1000).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)
  const endDate = stripeSubscription
    ? new Date(stripeSubscription.current_period_end * 1000).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)
  const gracePeriodEnd = addDays(endDate, 3)
  const status = stripeSubscription
    ? statusFromStripeSubscription(stripeSubscription.status)
    : 'active'

  const payload = {
    user_id: userId,
    role,
    plan,
    status,
    start_date: startDate,
    end_date: endDate,
    grace_period_end: gracePeriodEnd,
    monthly_price: PLAN_PRICES[plan] ?? 0,
    stripe_customer_id: checkoutSession.customer?.toString() || null,
    stripe_subscription_id: checkoutSession.subscription?.toString() || null
  }

  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('role', role)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing?.id) {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update(payload)
      .eq('id', existing.id)
    if (error) throw error
  } else {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .insert(payload)
    if (error) throw error
  }
}

router.post('/checkout', async (req, res) => {
  try {
    ensureStripeConfigured()

    const { plan } = req.body
    const role = req.profile?.role

    if (!['restaurant', 'driver'].includes(role)) {
      return res.status(403).json({ error: 'Only restaurant/driver accounts can subscribe' })
    }
    if (!['pro', 'ultimate'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid paid plan' })
    }

    const price = PLAN_PRICE_IDS[plan]
    if (!price) {
      return res.status(500).json({ error: `Missing Stripe price id for plan "${plan}"` })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price, quantity: 1 }],
      success_url: `${frontendUrl}/pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${frontendUrl}/pricing?checkout=cancel`,
      customer_email: req.profile?.email || undefined,
      allow_promotion_codes: true,
      metadata: {
        user_id: req.profile.id,
        role,
        plan
      }
    })

    res.json({ url: session.url })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/confirm', async (req, res) => {
  try {
    ensureStripeConfigured()

    const sessionId = req.query.session_id
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing session_id' })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    })

    if (!session || session.mode !== 'subscription') {
      return res.status(400).json({ error: 'Invalid checkout session' })
    }

    const metadataUserId = session.metadata?.user_id
    if (!metadataUserId || metadataUserId !== req.profile.id) {
      return res.status(403).json({ error: 'Session does not belong to this user' })
    }

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: `Payment not completed (status: ${session.payment_status})` })
    }

    await upsertSubscriptionFromCheckout(session)
    res.json({ success: true })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/portal', async (req, res) => {
  try {
    ensureStripeConfigured()

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', req.profile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!subscription?.stripe_customer_id) {
      return res.status(400).json({ error: 'No Stripe customer found for this account' })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${frontendUrl}/pricing`
    })

    res.json({ url: session.url })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export const stripeWebhookHandler = async (req, res) => {
  try {
    ensureStripeConfigured()
    if (!stripeWebhookSecret) {
      return res.status(500).json({ error: 'Missing STRIPE_WEBHOOK_SECRET' })
    }

    const signature = req.headers['stripe-signature']
    if (!signature) {
      return res.status(400).send('Missing stripe-signature header')
    }

    const event = stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret)

    if (event.type === 'checkout.session.completed') {
      await upsertSubscriptionFromCheckout(event.data.object)
    }

    res.json({ received: true })
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`)
  }
}

export default router
