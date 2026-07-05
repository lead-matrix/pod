# ThreadDrop — Automated Print-on-Demand SaaS Storefront

A full-stack, production-ready print-on-demand streetwear storefront featuring a Shopify-style admin control panel. Built with **React + TypeScript + Vite + Tailwind CSS + Supabase + Printful API + Stripe Checkout**.

## Architecture & Integration Flow

### 1. Product Drops Design & Publishing
- **Step 1:** Upload print file (high-res PNG, JPG, SVG, PDF) to the private `design-files` Supabase storage bucket.
- **Step 2:** Select print base catalog items (tees, hoodies, caps, bags) from the Printful API.
- **Step 3:** Set sizes, colors, retail pricing margins.
- **Step 4:** Trigger the Printful Mockup Generator task asynchronously, then map generated previews to product image catalog.
- **Step 5:** Save drop details to Supabase database, and push sync configurations to Printful.

### 2. Customer Checkout & Production Automation
- **Step 1:** Customer adds product variants to their bag and clicks "Checkout".
- **Step 2:** Deno serverless Edge Function `/functions/create-checkout` generates a Stripe checkout session mapping items and details.
- **Step 3:** Redirected customer pays on the premium Stripe Hosted Checkout page.
- **Step 4:** Stripe triggers secure `checkout.session.completed` webhook event.
- **Step 5:** Supabase Edge Function `/functions/stripe-webhook` verifies signature, records order as paid, and pushes order items to the Printful orders API (confirming the order for instant production).
- **Step 6:** Printful fulfills and ships order. Upon dispatching, Printful triggers a webhook event updating the tracking timeline in the customer's account dashboard.

---

## Getting Started

### 1. Environment Variables Setup (`.env`)
Create a `.env` file at the root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_APP_URL=http://localhost:5173
```

Set server-side environment variables in your Supabase Dashboard under **Settings -> Edge Functions**:
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PRINTFUL_API_TOKEN=your-printful-api-token
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_URL=https://your-project.supabase.co
```

### 2. Database Schema Setup
Execute the sql files inside the `supabase/migrations` folder sequentially in your Supabase SQL editor:
1. `001_initial_schema.sql` (Creates profiles, products, variants, orders tables)
2. `002_rls_policies.sql` (Applies security policies guarding data access)
3. `003_storage_buckets.sql` (Configures media and private file storage targets)

### 3. Deploy Webhooks
Link your local repository to vercel and set webhook routing:
- Stripe webhook url target: `https://your-project.supabase.co/functions/v1/stripe-webhook`
- Printful webhook url target: `https://your-project.supabase.co/functions/v1/printful-webhook`
