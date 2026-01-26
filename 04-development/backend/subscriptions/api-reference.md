# Subscription API Reference

## Overview

All subscription endpoints require authentication via JWT token in the `Authorization` header.

## Base URL

```
Production: https://api.readmigo.app
Staging: https://api-staging.readmigo.app
```

## Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/subscriptions/status` | GET | Yes | Get subscription status |
| `/subscriptions/trial/eligibility` | GET | Yes | Check trial eligibility |
| `/subscriptions/trial/status` | GET | Yes | Get trial status |
| `/subscriptions/trial/start` | POST | Yes | Start free trial |
| `/subscriptions/google/verify` | POST | Yes | Verify Google purchase |
| `/subscriptions/google/restore` | POST | Yes | Restore Google purchases |
| `/subscriptions/google/acknowledge` | POST | Yes | Acknowledge Google purchase |
| `/subscriptions/stripe/create-checkout` | POST | Yes | Create Stripe checkout |
| `/subscriptions/stripe/create-portal` | POST | Yes | Create customer portal |
| `/subscriptions/stripe/status` | GET | Yes | Get Stripe status |
| `/webhooks/google-play` | POST | No | Google RTDN webhook |
| `/webhooks/stripe` | POST | No | Stripe webhook |

---

## General Endpoints

### Get Subscription Status

Returns the current user's subscription information.

| Property | Value |
|----------|-------|
| Endpoint | `/subscriptions/status` |
| Method | GET |
| Auth | Required |

**Response Fields**

| Field | Type | Description |
|-------|------|-------------|
| id | string | Subscription ID |
| userId | string | User ID |
| planType | string | FREE, PRO, or PREMIUM |
| status | string | ACTIVE, CANCELLED, EXPIRED, GRACE_PERIOD |
| source | string | NONE, APPLE_IAP, GOOGLE_PLAY, STRIPE |
| expiresAt | string | ISO 8601 expiry date |
| autoRenewing | boolean | Auto-renewal status |
| isTrialing | boolean | Whether in trial period |

---

## Trial Endpoints

### Check Trial Eligibility

| Property | Value |
|----------|-------|
| Endpoint | `/subscriptions/trial/eligibility` |
| Method | GET |
| Auth | Required |

**Response Fields**

| Field | Type | Description |
|-------|------|-------------|
| eligible | boolean | Whether user can start trial |
| reason | string | Reason if not eligible |
| trialDays | number | Number of trial days |
| productId | string | Product ID for trial |

### Get Trial Status

| Property | Value |
|----------|-------|
| Endpoint | `/subscriptions/trial/status` |
| Method | GET |
| Auth | Required |

**Response Fields**

| Field | Type | Description |
|-------|------|-------------|
| isTrialing | boolean | Currently in trial |
| trialStartedAt | string | Trial start date |
| trialEndsAt | string | Trial end date |
| daysRemaining | number | Days left in trial |

### Start Trial

| Property | Value |
|----------|-------|
| Endpoint | `/subscriptions/trial/start` |
| Method | POST |
| Auth | Required |

**Request Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| productId | string | Yes | Product ID to trial |

---

## Google Play Endpoints

### Verify Google Purchase

Verifies a purchase with Google Play and activates subscription.

| Property | Value |
|----------|-------|
| Endpoint | `/subscriptions/google/verify` |
| Method | POST |
| Auth | Required |

**Request Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| purchaseToken | string | Yes | Purchase token from Play Store |
| productId | string | Yes | Product ID purchased |
| orderId | string | No | Order ID |
| packageName | string | Yes | App package name |

**Response Fields**

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Verification result |
| planType | string | Activated plan type |
| expiresAt | string | Subscription expiry |
| originalTransactionId | string | Transaction reference |
| error | string | Error message if failed |

### Restore Google Purchases

Restores previous purchases from Play Store.

| Property | Value |
|----------|-------|
| Endpoint | `/subscriptions/google/restore` |
| Method | POST |
| Auth | Required |

**Request Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| purchases | array | Yes | Array of purchase objects |
| purchases[].purchaseToken | string | Yes | Purchase token |
| purchases[].productId | string | Yes | Product ID |

**Response Fields**

Same as subscription status response.

### Acknowledge Google Purchase

Acknowledges a purchase (called after verification).

| Property | Value |
|----------|-------|
| Endpoint | `/subscriptions/google/acknowledge` |
| Method | POST |
| Auth | Required |

**Request Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| purchaseToken | string | Yes | Purchase token |
| productId | string | Yes | Product ID |

**Response Fields**

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Acknowledgment result |
| message | string | Status message |

---

## Stripe Endpoints

### Create Checkout Session

Creates a Stripe Checkout session for subscription purchase.

| Property | Value |
|----------|-------|
| Endpoint | `/subscriptions/stripe/create-checkout` |
| Method | POST |
| Auth | Required |

**Request Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| priceId | string | Yes | Stripe price ID |
| successUrl | string | Yes | Redirect URL on success |
| cancelUrl | string | Yes | Redirect URL on cancel |
| metadata | object | No | Additional metadata |

**Response Fields**

| Field | Type | Description |
|-------|------|-------------|
| sessionId | string | Checkout session ID |
| url | string | Checkout URL to redirect to |

### Create Portal Session

Creates a Stripe Customer Portal session.

| Property | Value |
|----------|-------|
| Endpoint | `/subscriptions/stripe/create-portal` |
| Method | POST |
| Auth | Required |

**Request Fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| returnUrl | string | Yes | URL to return to after portal |

**Response Fields**

| Field | Type | Description |
|-------|------|-------------|
| url | string | Portal URL to redirect to |

### Get Stripe Status

| Property | Value |
|----------|-------|
| Endpoint | `/subscriptions/stripe/status` |
| Method | GET |
| Auth | Required |

**Response Fields**

Same as subscription status response.

---

## Webhook Endpoints

### Google Play Webhook (RTDN)

Receives Real-time Developer Notifications from Google Play.

| Property | Value |
|----------|-------|
| Endpoint | `/webhooks/google-play` |
| Method | POST |
| Auth | Not required (uses Pub/Sub auth) |

**Request Format**

| Field | Type | Description |
|-------|------|-------------|
| message.data | string | Base64 encoded notification |
| message.messageId | string | Pub/Sub message ID |
| subscription | string | Pub/Sub subscription name |

**Response**

| Status | Description |
|--------|-------------|
| 200 | Successfully processed |
| 400 | Invalid notification |

### Stripe Webhook

Receives webhook events from Stripe.

| Property | Value |
|----------|-------|
| Endpoint | `/webhooks/stripe` |
| Method | POST |
| Auth | Signature verification via `stripe-signature` header |

**Headers**

| Header | Description |
|--------|-------------|
| stripe-signature | Webhook signature for verification |

**Response**

| Status | Description |
|--------|-------------|
| 200 | Successfully processed |
| 400 | Invalid signature or payload |

---

## Error Responses

### Error Response Format

| Field | Type | Description |
|-------|------|-------------|
| statusCode | number | HTTP status code |
| message | string | Error message |
| error | string | Error type |

### Common Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | Not allowed to access resource |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server error |

### Subscription-Specific Errors

| Error | Description |
|-------|-------------|
| SUBSCRIPTION_NOT_FOUND | No subscription for user |
| ALREADY_SUBSCRIBED | User already has active subscription |
| TRIAL_NOT_ELIGIBLE | User not eligible for trial |
| VERIFICATION_FAILED | Purchase verification failed |
| STRIPE_NOT_CONFIGURED | Stripe credentials not set |
| GOOGLE_NOT_CONFIGURED | Google credentials not set |

---

## Rate Limits

| Endpoint Type | Limit |
|---------------|-------|
| General endpoints | 100 requests/minute |
| Verification endpoints | 30 requests/minute |
| Webhooks | No limit |

---

## Versioning

Current API version: v1

API versions are specified in the URL path (e.g., `/api/v1/subscriptions/status`).
