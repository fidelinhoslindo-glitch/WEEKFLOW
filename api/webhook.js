import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Vercel serverless: disable body parsing so we get the raw body for signature verification
export const config = { api: { bodyParser: false } }

async function buffer(readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase env vars for webhook')
    return res.status(500).json({ error: 'Server config error' })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const sig = req.headers['stripe-signature']
  const buf = await buffer(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  // ── checkout.session.completed ────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { userId, plan, billing } = session.metadata || {}

    if (userId && plan) {
      const days = billing === 'yearly' ? 365 : 30
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

      await supabase
        .from('profiles')
        .update({
          plan,
          plan_billing: billing === 'pix' ? 'monthly' : (billing || 'monthly'),
          plan_expires_at: expiresAt,
          stripe_customer_id: session.customer || null,
        })
        .eq('id', userId)
    }
  }

  // ── customer.subscription.updated ─────────────────────────────────────────
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object
    const { userId, plan } = subscription.metadata || {}

    if (userId && subscription.status === 'active') {
      const periodEnd = new Date(subscription.current_period_end * 1000).toISOString()
      await supabase
        .from('profiles')
        .update({ plan, plan_expires_at: periodEnd })
        .eq('id', userId)
    }
  }

  // ── customer.subscription.deleted ─────────────────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    const userId = subscription.metadata?.userId

    if (userId) {
      await supabase
        .from('profiles')
        .update({ plan: 'Free', plan_expires_at: null, stripe_customer_id: null })
        .eq('id', userId)
    }
  }

  res.status(200).json({ received: true })
}
