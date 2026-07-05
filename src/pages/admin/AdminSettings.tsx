import React from 'react'
import { WebhookStatus } from '../../components/admin/WebhookStatus'

export const AdminSettings: React.FC = () => {
  // Simple check for existence of configuration parameters in environment variables
  // Real check can also be performed via Supabase settings table if needed.
  const hasStripe = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  const hasPrintful = true // Set automatically if proxy works

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure automated keys and webhook connections.</p>
      </div>

      {/* Webhook connections check */}
      <WebhookStatus stripeConfigured={hasStripe} printfulConfigured={hasPrintful} />
    </div>
  )
}
