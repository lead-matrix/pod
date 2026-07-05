import React from 'react'
import { BookOpen, AlertCircle, Terminal, HelpCircle, CheckCircle, Flame } from 'lucide-react'

export const AdminGuide: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-brand-400" />
          Operations Guide
        </h1>
        <p className="text-gray-400 text-sm mt-1">A-to-Z playbook for managing and growing your ThreadDrop Print-on-Demand store.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Urgent Quickstart Card */}
        <div className="glass-card p-6 border-brand-500/20 bg-brand-500/5 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <Flame className="h-5 w-5 text-brand-400 animate-pulse" />
            <h2>$100K in 21 Days Launch Checklist</h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Verify that all Vercel environment variables from `.env.demo` are populated in Vercel settings.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Set up Stripe Webhooks pointing to your Supabase `/functions/v1/stripe-webhook` endpoint.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Link a credit card or fund the balance in your **Printful Wallet** to enable auto-fulfillment processing.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Design your first exclusive DROP 001 collection (3-5 products max) and upload mockups.</span>
            </li>
          </ul>
        </div>

        {/* 1. Fulfillment Loop */}
        <div className="glass-card p-6 space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-brand-400 font-mono text-base">01.</span>
            How the Automated Fulfillment Works
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            ThreadDrop uses an event-driven direct bridge to print-on-demand fulfillment. The checkout cycle follows this chain:
          </p>
          <div className="rounded-xl bg-surface-950 p-4 border border-white/[0.04] space-y-3 font-mono text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-brand-400 font-bold">1. Customer checkout:</span>
              <span>Stripe checkout session created via `/create-checkout`.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-400 font-bold">2. Webhook triggers:</span>
              <span>Stripe confirms payment → fires `checkout.session.completed`.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-400 font-bold">3. Printful bridge:</span>
              <span>Supabase edge function maps variant IDs and submits orders to Printful API.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-400 font-bold">4. Shipment Alert:</span>
              <span>Printful fulfills → fires tracking webhook → updates dashboard timeline.</span>
            </div>
          </div>
        </div>

        {/* 2. Troubleshooting */}
        <div className="glass-card p-6 space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-brand-400 font-mono text-base">02.</span>
            Handling Failed Orders & Discrepancies
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            If a checkout payment fails to post to Printful (e.g. invalid shipping address or missing print files), the order will stay as <span className="text-amber-400 font-semibold">paid</span> in your database.
          </p>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2 text-sm text-gray-300">
            <p>
              1. Navigate to the **Orders** tab and select the failed order.
            </p>
            <p>
              2. Inspect the shipping information or notes for address validation problems.
            </p>
            <p>
              3. Click the <span className="text-brand-400 font-semibold">Resubmit Order</span> button at the top of the order details. This pushes the order details back to Printful directly.
            </p>
          </div>
        </div>

        {/* 3. CLI Commands */}
        <div className="glass-card p-6 space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-brand-400 font-mono text-base">03.</span>
            Database Migrations & CLI Guide
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            To apply new tables or change Row Level Security rules, use the Supabase CLI in your project directory:
          </p>
          <div className="rounded-xl bg-surface-950 p-4 border border-white/[0.04] space-y-2 text-xs font-mono text-emerald-400 overflow-x-auto">
            <div># Start local Supabase container</div>
            <div>supabase start</div>
            <div className="mt-2"># Generate types based on schema</div>
            <div>supabase gen types typescript --local &gt; src/types/database.types.ts</div>
            <div className="mt-2"># Deploy Edge functions to live cloud dashboard</div>
            <div>supabase functions deploy create-checkout --project-ref your-ref-id</div>
          </div>
        </div>

        {/* FAQ */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold border-b border-white/[0.06] pb-3">
            <HelpCircle className="h-5 w-5 text-brand-400" />
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="text-white font-semibold">Q: Can I change product mockups after creation?</h4>
              <p className="text-gray-400 mt-1">Yes. You can edit mockups from the product panel or upload custom product images to your Supabase media library and map them to variants.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold">Q: Does this platform support worldwide shipping rates?</h4>
              <p className="text-gray-400 mt-1">Yes. The shipping rate calculation edge function queries Printful shipping quotes dynamically during the checkout session build, providing real-time local carrier shipping quotes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
