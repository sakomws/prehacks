# Stripe Payment Integration Setup

## Overview
The MyRoadmap platform now supports secure payments via Stripe for booking mentorship sessions.

## Backend Setup

### 1. Install Stripe
```bash
cd apps/myroadmap/backend
venv/bin/pip install stripe==8.0.0
```

### 2. Get Stripe API Keys
1. Sign up at https://stripe.com
2. Go to Developers > API keys
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)

### 3. Configure Environment Variables
Add to `apps/myroadmap/backend/.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 4. Run Database Migration
```bash
cd apps/myroadmap/backend
venv/bin/alembic upgrade head
```

### 5. Setup Stripe Webhook (Optional for local testing)
For production, you'll need to configure webhooks:
1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/webhook`
3. Select event: `checkout.session.completed`
4. Copy the webhook secret to your `.env` file

For local testing with Stripe CLI:
```bash
stripe listen --forward-to localhost:8002/api/payments/webhook
```

## Frontend Setup

No additional packages needed - the frontend uses Stripe Checkout (hosted payment page).

## How It Works

### 1. User Flow
1. User browses mentors at `/mentors`
2. Clicks "Book Session" on a mentor
3. Fills out booking form (title, description, date, duration)
4. Clicks "Book & Pay with Stripe"
5. Redirected to Stripe Checkout page
6. Completes payment
7. Redirected back to `/sessions?success=true`

### 2. Payment Flow
```
Frontend → POST /api/payments/create-checkout-session
         ← Returns Stripe checkout URL
         
User completes payment on Stripe

Stripe → POST /api/payments/webhook (checkout.session.completed)
      → Creates session in database
      → Updates mentor stats
```

### 3. Database Changes
New fields in `sessions` table:
- `payment_status`: 'pending', 'paid', 'refunded'
- `stripe_payment_id`: Stripe payment intent ID

## API Endpoints

### Create Checkout Session
```http
POST /api/payments/create-checkout-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "mentor_id": 1,
  "title": "System Design Review",
  "description": "Need help with distributed systems",
  "scheduled_at": "2024-01-20T14:00:00",
  "duration_minutes": 60
}
```

Response:
```json
{
  "checkout_url": "https://checkout.stripe.com/...",
  "session_id": "cs_test_..."
}
```

### Webhook Handler
```http
POST /api/payments/webhook
Stripe-Signature: <signature>

{
  "type": "checkout.session.completed",
  "data": { ... }
}
```

### Get Stripe Config
```http
GET /api/payments/config
```

Response:
```json
{
  "publishable_key": "pk_test_..."
}
```

## Testing

### Test Cards
Use Stripe test cards for testing:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

Any future expiry date and any 3-digit CVC.

### Test the Flow
1. Start backend: `cd apps/myroadmap/backend && venv/bin/uvicorn main:app --reload --port 8002`
2. Start frontend: `cd apps/myroadmap/frontend && npm run dev`
3. Visit: http://localhost:3002/mentors
4. Click on a mentor and book a session
5. Use test card `4242 4242 4242 4242`

## Security Notes

- Never commit your Stripe secret keys to git
- Use test keys for development
- Use live keys only in production
- Verify webhook signatures
- Use HTTPS in production

## Troubleshooting

### "No module named 'stripe'"
```bash
cd apps/myroadmap/backend
venv/bin/pip install stripe==8.0.0
```

### Webhook not receiving events
- Check webhook URL is correct
- Verify webhook secret in `.env`
- Use Stripe CLI for local testing

### Payment not creating session
- Check backend logs
- Verify webhook is configured
- Check database for session record
