# Environment Setup Guide — ThreadDrop Showroom

This guide describes how to configure the local development and production environment variables for the Vite SPA client and Supabase Edge Functions.

---

## 1. Local Development Variables (`.env`)

In the project root, create a file named `.env`. This file holds the public configuration values starting with `VITE_` which are loaded into the React application by Vite.

```ini
# Supabase Configuration
# Go to Supabase Dashboard > Project Settings > API to retrieve these
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (Public Publishable Key)
# Go to Stripe Dashboard > Developers > API keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...

# Local Dev server or Production deployment URL
VITE_APP_URL=http://localhost:5173
```

---

## 2. Server-Side Variables (Supabase Edge Functions)

Server-side keys are secret and **must never** be prefix with `VITE_` or stored in files uploaded to Vercel/frontend hosts. They are configured inside Supabase to run Edge Functions.

### Setting Secrets in Supabase
Run the following commands using the Supabase CLI in your terminal, or go to **Supabase Dashboard > Project Settings > Edge Functions** to input these keys manually:

```bash
# Set Printful integration tokens
supabase secrets set PRINTFUL_API_TOKEN="your-printful-token"
supabase secrets set PRINTFUL_STORE_ID="your-printful-store-id"

# Set Stripe Payment tokens
supabase secrets set STRIPE_SECRET_KEY="sk_test_..."
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_..."

# Set Email tokens (if using Resend)
supabase secrets set RESEND_API_KEY="re_..."
supabase secrets set FROM_EMAIL="orders@yourdomain.com"
```

---

## 3. Printful & Stripe Secrets Guide

### A. Printful Setup
1. Log in to your **Printful Dashboard**.
2. Go to **Settings > API > Access Tokens**.
3. Create a new developer token with read/write access. Use this for `PRINTFUL_API_TOKEN`.
4. Go to **Stores** in your Printful dashboard, click on the active store, and copy the store ID from the URL or settings. Use this for `PRINTFUL_STORE_ID`.

### B. Stripe Setup
1. Log in to your **Stripe Dashboard**.
2. Enable "Test Mode" at the top right.
3. Retrieve the **Publishable Key** (`pk_test_...`) and **Secret Key** (`sk_test_...`).
4. Set up a Webhook pointing to your Supabase Edge Function:
   - Endpoint URL: `https://your-project-id.supabase.co/functions/v1/stripe-webhook`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy the signing secret (`whsec_...`) and use it for `STRIPE_WEBHOOK_SECRET`.

---

## 4. Verification Check

To test if the environment setup is loaded correctly, run:
```bash
npm run dev
```
Open the console inside your browser. If there are no initialization warnings regarding missing environment variables or API keys, your local environment is correctly configured!
