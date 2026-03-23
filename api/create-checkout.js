import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { priceId, plan, billing, userEmail, userId } = req.body

  if (!priceId) {
    return res.status(400).json({ error: 'Missing priceId' })
  }

  const isPix = billing === 'pix'

  try {
    const sessionConfig = {
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail || undefined,
      success_url: `${process.env.VITE_APP_URL || 'https://weekflow.space'}?checkout=success&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL || 'https://weekflow.space'}?checkout=canceled`,
      metadata: { userId: userId || '', plan: plan || '', billing: billing || '' },
      locale: 'pt-BR',
    }

    if (isPix) {
      // PIX — one-time payment (not subscription)
      sessionConfig.mode = 'payment'
      sessionConfig.payment_method_types = ['pix']
      sessionConfig.payment_intent_data = {
        metadata: { userId: userId || '', plan: plan || '', billing: 'pix' },
      }
    } else {
      // Card — recurring subscription
      sessionConfig.mode = 'subscription'
      sessionConfig.payment_method_types = ['card']
      sessionConfig.subscription_data = {
        metadata: { userId: userId || '', plan: plan || '', billing: billing || '' },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)
    res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error.message)
    res.status(500).json({ error: error.message })
  }
}
