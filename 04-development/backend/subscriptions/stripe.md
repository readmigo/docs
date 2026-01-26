# Stripe Integration

## Overview

Stripe handles web-based subscriptions through Checkout Sessions for purchases and Customer Portal for subscription management.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Web Application                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │ Subscription    │  │ Checkout        │  │ Customer        │          │
│  │ Page            │──│ Redirect        │──│ Portal          │          │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘          │
│           │                    │                    │                    │
└───────────┼────────────────────┼────────────────────┼────────────────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                              Backend API                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        Stripe Service                                │  │
│  │  - createCheckoutSession()     - handleCheckoutCompleted()          │  │
│  │  - createPortalSession()       - handleSubscriptionUpdated()        │  │
│  │  - verifyPurchase()            - handleSubscriptionDeleted()        │  │
│  │  - cancelSubscription()        - handleInvoicePaid()                │  │
│  │  - refundSubscription()        - handleInvoicePaymentFailed()       │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │     Stripe API        │
                        └───────────────────────┘
```

## Checkout Flow

```
┌─────────────────┐
│  User Clicks    │
│  "Subscribe"    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frontend calls │
│  /stripe/       │
│  create-checkout│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend creates│
│  Checkout       │
│  Session        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Return Session │
│  URL to         │
│  Frontend       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Redirect User  │
│  to Stripe      │
│  Checkout       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│        Payment Successful?          │
├─────────────────┬───────────────────┤
│      YES        │        NO         │
│                 │                   │
▼                 ▼                   │
┌─────────────┐  ┌─────────────┐      │
│ Redirect to │  │ Redirect to │      │
│ Success URL │  │ Cancel URL  │      │
└──────┬──────┘  └─────────────┘      │
       │                              │
       ▼                              │
┌─────────────────┐                   │
│  Stripe sends   │                   │
│  Webhook        │                   │
│  (async)        │                   │
└────────┬────────┘                   │
         │                            │
         ▼                            │
┌─────────────────┐                   │
│  Backend        │                   │
│  processes      │                   │
│  webhook        │                   │
└────────┬────────┘                   │
         │                            │
         ▼                            │
┌─────────────────┐                   │
│  Update DB      │                   │
│  Activate       │                   │
│  Subscription   │                   │
└─────────────────┘                   │
```

## Customer Portal Flow

```
┌─────────────────┐
│  User Clicks    │
│  "Manage        │
│  Subscription"  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frontend calls │
│  /stripe/       │
│  create-portal  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend creates│
│  Portal Session │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Return Portal  │
│  URL            │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Redirect to    │
│  Stripe Portal  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│     User Actions in Portal          │
├─────────────────────────────────────┤
│  - Update payment method            │
│  - Change plan                      │
│  - Cancel subscription              │
│  - View billing history             │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Stripe sends   │
│  Webhooks for   │
│  any changes    │
└─────────────────┘
```

## Webhook Events

| Event | Description | Action |
|-------|-------------|--------|
| `checkout.session.completed` | Checkout completed successfully | Activate subscription |
| `customer.subscription.created` | New subscription created | Create subscription record |
| `customer.subscription.updated` | Subscription modified | Update subscription details |
| `customer.subscription.deleted` | Subscription cancelled | Mark as expired |
| `customer.subscription.resumed` | Subscription resumed | Reactivate subscription |
| `customer.subscription.trial_will_end` | Trial ending soon | Send notification |
| `invoice.paid` | Payment successful | Create order record |
| `invoice.payment_failed` | Payment failed | Set grace period |
| `invoice.upcoming` | Invoice coming soon | Send notification |

## Webhook Processing Flow

```
┌─────────────────┐
│  Stripe Server  │
│  sends Webhook  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  /webhooks/     │
│  stripe         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Verify         │
│  Signature      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│        Signature Valid?             │
├─────────────────┬───────────────────┤
│      YES        │        NO         │
│                 │                   │
▼                 ▼                   │
┌─────────────┐  ┌─────────────┐      │
│ Parse Event │  │ Return 400  │      │
│ Type        │  │ Bad Request │      │
└──────┬──────┘  └─────────────┘      │
       │                              │
       ▼                              │
┌─────────────────┐                   │
│  Route to       │                   │
│  Handler by     │                   │
│  Event Type     │                   │
└────────┬────────┘                   │
         │                            │
         ▼                            │
┌─────────────────┐                   │
│  Process Event  │                   │
│  Update DB      │                   │
│  Log Event      │                   │
└────────┬────────┘                   │
         │                            │
         ▼                            │
┌─────────────────┐                   │
│  Return 200 OK  │                   │
└─────────────────┘                   │
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/subscriptions/stripe/create-checkout` | POST | Create checkout session |
| `/subscriptions/stripe/create-portal` | POST | Create customer portal session |
| `/subscriptions/stripe/status` | GET | Get subscription status |
| `/webhooks/stripe` | POST | Stripe webhook endpoint |

## Stripe Dashboard Setup

### Step 1: Create Products

| Product | Description |
|---------|-------------|
| Readmigo Pro | Pro tier subscription |
| Readmigo Premium | Premium tier subscription |

### Step 2: Create Prices

| Product | Billing | Price ID Variable |
|---------|---------|-------------------|
| Pro Monthly | Monthly recurring | `STRIPE_PRO_MONTHLY_PRICE_ID` |
| Pro Yearly | Yearly recurring | `STRIPE_PRO_YEARLY_PRICE_ID` |
| Premium Monthly | Monthly recurring | `STRIPE_PREMIUM_MONTHLY_PRICE_ID` |
| Premium Yearly | Yearly recurring | `STRIPE_PREMIUM_YEARLY_PRICE_ID` |

### Step 3: Configure Webhook

| Setting | Value |
|---------|-------|
| Endpoint URL | `https://api.readmigo.app/webhooks/stripe` |
| Events to send | See webhook events table above |
| Signing secret | Store in `STRIPE_WEBHOOK_SECRET` |

### Step 4: Customer Portal Configuration

| Setting | Recommendation |
|---------|----------------|
| Allow customers to update payment methods | Yes |
| Allow customers to update subscriptions | Yes |
| Allow customers to cancel subscriptions | Yes |
| Cancellation mode | At end of billing period |

## Database Fields

| Field | Type | Description |
|-------|------|-------------|
| stripeCustomerId | String | Stripe customer ID |
| stripeSubscriptionId | String | Stripe subscription ID |
| stripePaymentMethodId | String | Default payment method |
| stripePriceId | String | Current price ID |
| stripeCurrentPeriodEnd | DateTime | Current period end date |

## Subscription Status Mapping

| Stripe Status | App Status |
|---------------|------------|
| `active` | ACTIVE |
| `trialing` | ACTIVE (isTrialing=true) |
| `past_due` | GRACE_PERIOD |
| `canceled` | EXPIRED |
| `incomplete` | PENDING |
| `incomplete_expired` | EXPIRED |
| `unpaid` | GRACE_PERIOD |

## Error Handling

| Error Type | Cause | Resolution |
|------------|-------|------------|
| Invalid signature | Wrong webhook secret | Verify STRIPE_WEBHOOK_SECRET |
| Customer not found | No stripeCustomerId | Create customer first |
| Invalid price | Wrong price ID | Check Stripe dashboard |
| Card declined | Payment failed | Customer updates payment |
| Subscription not found | Invalid subscription ID | Verify subscription exists |

## Testing

### Test Mode

| Setting | Test Value |
|---------|------------|
| API Keys | Use `sk_test_*` keys |
| Webhook endpoint | Use Stripe CLI for local testing |
| Test cards | `4242424242424242` (success) |

### Test Card Numbers

| Card Number | Scenario |
|-------------|----------|
| `4242424242424242` | Successful payment |
| `4000000000000341` | Attaching card fails |
| `4000000000009995` | Payment declined |
| `4000000000000002` | Card declined |

### Webhook Testing with Stripe CLI

| Command | Purpose |
|---------|---------|
| `stripe listen --forward-to localhost:3000/webhooks/stripe` | Forward events to local |
| `stripe trigger checkout.session.completed` | Trigger test event |
