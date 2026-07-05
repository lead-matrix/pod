import React from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'

interface WebhookStatusProps {
  stripeConfigured: boolean
  printfulConfigured: boolean
}

export const WebhookStatus: React.FC<WebhookStatusProps> = ({
  stripeConfigured,
  printfulConfigured,
}) => {
  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Automations & Webhooks</h3>

      <div className="space-y-3">
        {/* Stripe */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">Stripe Payment Webhook</span>
            <span className="text-xs text-gray-500 mt-0.5">Listens for checkout.session.completed</span>
          </div>
          {stripeConfigured ? (
            <span className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
              <XCircle className="h-4 w-4" />
              Missing Key
            </span>
          )}
        </div>

        {/* Printful */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">Printful Fulfillment Webhook</span>
            <span className="text-xs text-gray-500 mt-0.5">Listens for package_shipped & stock_updates</span>
          </div>
          {printfulConfigured ? (
            <span className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
              <XCircle className="h-4 w-4" />
              Missing Key
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
