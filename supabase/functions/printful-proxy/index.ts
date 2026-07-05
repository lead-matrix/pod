// Supabase Edge Function: printful-proxy
// Proxies requests to Printful API securely, verifying Supabase Admin role for sensitive routes
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const PRINTFUL_API_TOKEN = Deno.env.get('PRINTFUL_API_TOKEN')!
const PRINTFUL_BASE = 'https://api.printful.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

async function isAdmin(authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return false

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('authorization')
    const url = new URL(req.url)
    const targetPath = url.pathname.replace('/printful-proxy', '')
    const targetUrl = `${PRINTFUL_BASE}${targetPath}${url.search}`

    // List of paths that require Admin verification
    const requiresAdmin = !targetPath.startsWith('/shipping') && !targetPath.startsWith('/countries')

    if (requiresAdmin) {
      const authorized = await isAdmin(authHeader)
      if (!authorized) {
        return new Response(JSON.stringify({ error: 'Unauthorized. Admin access required.' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    const requestHeaders = new Headers()
    requestHeaders.set('Authorization', `Bearer ${PRINTFUL_API_TOKEN}`)
    requestHeaders.set('Content-Type', 'application/json')

    const requestBody = req.method !== 'GET' && req.method !== 'HEAD'
      ? await req.text()
      : undefined

    const printfulResponse = await fetch(targetUrl, {
      method: req.method,
      headers: requestHeaders,
      body: requestBody,
    })

    const responseText = await printfulResponse.text()
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = responseText
    }

    return new Response(JSON.stringify(responseData), {
      status: printfulResponse.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Printful proxy error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal proxy error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
