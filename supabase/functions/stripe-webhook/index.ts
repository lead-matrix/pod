// Supabase Edge Function: stripe-webhook
// Handles Stripe events — on payment success, auto-submits order to Printful
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const PRINTFUL_API_TOKEN = Deno.env.get('PRINTFUL_API_TOKEN')!
const PRINTFUL_BASE = 'https://api.printful.com'

async function printfulRequest(path: string, method: string, body?: unknown) {
  const res = await fetch(`${PRINTFUL_BASE}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${PRINTFUL_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Printful API error ${res.status}: ${err}`)
  }
  return res.json()
}

async function submitOrderToPrintful(orderId: string) {
  // Fetch order + items
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single()

  if (!order) throw new Error(`Order ${orderId} not found`)
  if (order.printful_order_id) {
    console.log(`Order ${orderId} already submitted to Printful`)
    return
  }

  // Build Printful order payload
  const printfulOrder = {
    external_id: order.order_number,
    recipient: {
      name: order.shipping_name,
      address1: order.shipping_address1,
      address2: order.shipping_address2 || undefined,
      city: order.shipping_city,
      state_code: order.shipping_state || undefined,
      country_code: order.shipping_country,
      zip: order.shipping_zip,
      phone: order.shipping_phone || undefined,
      email: order.customer_email,
    },
    items: order.order_items.map((item: {
      printful_sync_variant_id: number
      printful_variant_id: number
      quantity: number
      unit_price: number
      product_name: string
    }) => ({
      sync_variant_id: item.printful_sync_variant_id,
      quantity: item.quantity,
      retail_price: String(item.unit_price),
      name: item.product_name,
    })),
    retail_costs: {
      subtotal: String(order.subtotal),
      shipping: String(order.shipping_cost),
      total: String(order.total),
    },
  }

  // Create order in Printful (draft first, then confirm)
  const createRes = await printfulRequest('/orders', 'POST', printfulOrder)
  const printfulOrderId = createRes.result.id

  // Confirm the order (triggers fulfillment)
  await printfulRequest(`/orders/${printfulOrderId}/confirm`, 'POST')

  // Update our order with Printful ID
  await supabaseAdmin
    .from('orders')
    .update({
      printful_order_id: printfulOrderId,
      printful_status: 'pending',
      status: 'processing',
      fulfilled_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  console.log(`Order ${orderId} submitted to Printful as order #${printfulOrderId}`)
}

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

  let event: Stripe.Event
  const rawBody = await req.arrayBuffer()

  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature!,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider()
    )
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return new Response(`Webhook Error: ${err}`, { status: 400 })
  }

  // Idempotency check
  const { data: existing } = await supabaseAdmin
    .from('webhook_events')
    .select('id')
    .eq('source', 'stripe')
    .eq('event_id', event.id)
    .single()

  if (existing) {
    console.log(`Skipping duplicate stripe event: ${event.id}`)
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Log the event
  await supabaseAdmin.from('webhook_events').insert({
    source: 'stripe',
    event_id: event.id,
    event_type: event.type,
    payload: event as unknown as Record<string, unknown>,
    status: 'processed',
  })

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Get the order
        const orderId = session.metadata?.order_id
        if (!orderId) break

        // Extract shipping address from Stripe session
        const shipping = session.shipping_details
        const shippingUpdates: Record<string, string> = {}
        if (shipping?.address) {
          shippingUpdates.shipping_address1 = shipping.address.line1 || ''
          shippingUpdates.shipping_address2 = shipping.address.line2 || ''
          shippingUpdates.shipping_city = shipping.address.city || ''
          shippingUpdates.shipping_state = shipping.address.state || ''
          shippingUpdates.shipping_country = shipping.address.country || 'US'
          shippingUpdates.shipping_zip = shipping.address.postal_code || ''
          shippingUpdates.shipping_name = shipping.name || ''
        }

        // Mark order as paid
        await supabaseAdmin
          .from('orders')
          .update({
            status: 'paid',
            stripe_payment_intent: session.payment_intent as string,
            paid_at: new Date().toISOString(),
            ...shippingUpdates,
          })
          .eq('id', orderId)

        // Auto-submit to Printful
        if (session.payment_status === 'paid') {
          await submitOrderToPrintful(orderId)
        }

        // Clear the customer's cart
        const userId = session.metadata?.user_id
        if (userId) {
          await supabaseAdmin.from('cart_items').delete().eq('user_id', userId)
        }
        break
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.order_id
        if (orderId) await submitOrderToPrintful(orderId)
        break
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.order_id
        if (orderId) {
          await supabaseAdmin
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', orderId)
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent as string
        if (paymentIntentId) {
          await supabaseAdmin
            .from('orders')
            .update({ status: 'refunded' })
            .eq('stripe_payment_intent', paymentIntentId)
        }
        break
      }
    }
  } catch (err) {
    console.error(`Error handling event ${event.type}:`, err)
    await supabaseAdmin
      .from('webhook_events')
      .update({ status: 'failed', error_message: String(err) })
      .eq('event_id', event.id)
      .eq('source', 'stripe')
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
