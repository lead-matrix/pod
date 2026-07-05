// Supabase Edge Function: printful-webhook
// Handles Printful events: order_updated, package_shipped, order_canceled
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const payload = await req.json()
    const { type, data, created } = payload

    if (!type || !data) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const eventId = `${type}_${created}_${data.order?.id || data.shipment?.id || 'event'}`

    // Idempotency check
    const { data: existing } = await supabaseAdmin
      .from('webhook_events')
      .select('id')
      .eq('source', 'printful')
      .eq('event_id', eventId)
      .single()

    if (existing) {
      console.log(`Skipping duplicate printful event: ${eventId}`)
      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Log the event
    await supabaseAdmin.from('webhook_events').insert({
      source: 'printful',
      event_id: eventId,
      event_type: type,
      payload: payload as unknown as Record<string, unknown>,
      status: 'processed',
    })

    const printfulOrderId = data.order?.id || data.shipment?.order?.id
    if (!printfulOrderId) {
      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Find the corresponding order in our DB
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('printful_order_id', printfulOrderId)
      .single()

    if (!order) {
      console.log(`Order with Printful ID ${printfulOrderId} not found in database. Skipping.`)
      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    switch (type) {
      case 'package_shipped': {
        const shipment = data.shipment
        const carrier = shipment.carrier
        const trackingNumber = shipment.tracking_number
        const trackingUrl = shipment.tracking_url

        // Insert into order_tracking
        await supabaseAdmin.from('order_tracking').insert({
          order_id: order.id,
          carrier,
          tracking_number: trackingNumber,
          tracking_url: trackingUrl,
          shipped_at: new Date().toISOString(),
          status: 'shipped',
        })

        // Update order status
        await supabaseAdmin
          .from('orders')
          .update({
            status: 'shipped',
            printful_status: 'shipped',
            shipped_at: new Date().toISOString(),
          })
          .eq('id', order.id)
        break
      }

      case 'order_failed': {
        await supabaseAdmin
          .from('orders')
          .update({
            printful_status: 'failed',
            internal_notes: `Printful fulfillment failed: ${data.reason || 'Unknown reason'}`,
          })
          .eq('id', order.id)
        break
      }

      case 'order_canceled': {
        await supabaseAdmin
          .from('orders')
          .update({
            status: 'cancelled',
            printful_status: 'canceled',
            internal_notes: 'Cancelled via Printful webhook.',
          })
          .eq('id', order.id)
        break
      }

      case 'order_updated': {
        const printfulStatus = data.order?.status
        let ourStatus = order.status

        if (printfulStatus === 'fulfilled') {
          ourStatus = 'fulfilled'
        }

        await supabaseAdmin
          .from('orders')
          .update({
            printful_status: printfulStatus,
            status: ourStatus,
            fulfilled_at: printfulStatus === 'fulfilled' ? new Date().toISOString() : undefined,
          })
          .eq('id', order.id)
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Printful webhook error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
