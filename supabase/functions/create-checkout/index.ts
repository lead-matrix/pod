// Supabase Edge Function: create-checkout
// Creates a Stripe Checkout Session and saves pending order in Supabase
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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CartItem {
  variant_id: string
  quantity: number
  product_name: string
  variant_size: string
  variant_color: string
  unit_price: number
  image_url: string
  printful_variant_id: number
  printful_sync_variant_id: number
  sku: string
}

interface CheckoutPayload {
  items: CartItem[]
  customer_email: string
  customer_name: string
  user_id?: string
  success_url: string
  cancel_url: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: CheckoutPayload = await req.json()
    const { items, customer_email, customer_name, user_id, success_url, cancel_url } = payload

    if (!items?.length) {
      return new Response(JSON.stringify({ error: 'No items in cart' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
    const shipping = subtotal >= 75 ? 0 : 5.99  // Free shipping over $75
    const total = subtotal + shipping

    // Create Stripe line items
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.product_name} — ${item.variant_size}${item.variant_color ? ` / ${item.variant_color}` : ''}`,
          images: item.image_url ? [item.image_url] : [],
          metadata: {
            variant_id: item.variant_id,
            printful_variant_id: String(item.printful_variant_id),
          },
        },
        unit_amount: Math.round(item.unit_price * 100),
      },
      quantity: item.quantity,
    }))

    // Add shipping as a line item if applicable
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Standard Shipping',
            images: [],
            metadata: {},
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      })
    }

    // Create a pending order in Supabase first
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user_id || null,
        customer_email,
        customer_name,
        shipping_name: customer_name,
        shipping_address1: '',  // Will be updated after Stripe checkout
        shipping_city: '',
        shipping_zip: '',
        shipping_country: 'US',
        status: 'pending',
        subtotal,
        shipping_cost: shipping,
        tax: 0,
        total,
        currency: 'usd',
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email,
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE'],
      },
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        user_id: user_id || '',
      },
      success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url,
      payment_intent_data: {
        metadata: {
          order_id: order.id,
          order_number: order.order_number,
        },
      },
    })

    // Store session ID in the order
    await supabaseAdmin
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id)

    // Store cart items as order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: null,   // resolved after payment
      variant_id: item.variant_id,
      product_name: item.product_name,
      variant_size: item.variant_size,
      variant_color: item.variant_color,
      sku: item.sku,
      image_url: item.image_url,
      printful_variant_id: item.printful_variant_id,
      printful_sync_variant_id: item.printful_sync_variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
    }))

    await supabaseAdmin.from('order_items').insert(orderItems)

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id, order_id: order.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('create-checkout error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
