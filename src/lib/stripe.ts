import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

  if (!publishableKey) {
    console.warn('Stripe publishable key is missing from environment variables.')
  }

  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey || 'placeholder')
  }

  return stripePromise
}
