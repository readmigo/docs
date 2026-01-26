# Multi-Platform Subscription System

## Overview

Readmigo's subscription system supports multiple payment providers to enable subscriptions across all platforms.

## Supported Providers

| Provider | Platform | Use Case |
|----------|----------|----------|
| Apple IAP | iOS | Native iOS app purchases |
| Google Play | Android | Native Android app purchases |
| Stripe | Web | Web browser subscriptions |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client Applications                            │
├─────────────────┬─────────────────┬─────────────────┬───────────────────┤
│    iOS App      │   Android App   │    Web App      │   Admin Dashboard │
│  (StoreKit 2)   │ (Play Billing)  │   (Stripe.js)   │                   │
└────────┬────────┴────────┬────────┴────────┬────────┴─────────┬─────────┘
         │                 │                 │                   │
         ▼                 ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Backend API Gateway                              │
│                    /api/subscriptions/*                                  │
└─────────────────────────────────────────────────────────────────────────┘
         │                 │                 │                   │
         ▼                 ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Subscription Service Layer                           │
├─────────────────┬─────────────────┬─────────────────┬───────────────────┤
│  Apple IAP      │  Google Play    │    Stripe       │   Trial           │
│  Service        │  Service        │    Service      │   Service         │
└────────┬────────┴────────┬────────┴────────┬────────┴─────────┬─────────┘
         │                 │                 │                   │
         ▼                 ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Unified Subscription Model                          │
│                         (Prisma Database)                                │
└─────────────────────────────────────────────────────────────────────────┘
```

## Webhook Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  App Store   │     │ Google Play  │     │   Stripe     │
│  Server      │     │  Pub/Sub     │     │   Server     │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │ Server-to-Server   │ RTDN              │ Webhook
       │ Notification       │ Notification       │ Event
       ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ /webhooks/   │     │ /webhooks/   │     │ /webhooks/   │
│ apple        │     │ google-play  │     │ stripe       │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  Update Subscription    │
              │  Status in Database     │
              └─────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  Log Subscription Event │
              └─────────────────────────┘
```

## Subscription Plans

| Plan | Features | Billing Options |
|------|----------|-----------------|
| FREE | Basic reading, limited AI features | N/A |
| PRO | Unlimited books, AI translation, offline reading | Monthly, Yearly |
| PREMIUM | All PRO features + advanced analytics, priority support | Monthly, Yearly |

## Multi-Source Resolution

When a user has subscriptions from multiple sources, the system uses priority resolution:

| Priority | Source | Description |
|----------|--------|-------------|
| 1 | ADMIN_GRANT | Manual subscription grants |
| 2 | APPLE_IAP | iOS App Store purchases |
| 3 | GOOGLE_PLAY | Google Play Store purchases |
| 4 | STRIPE | Web subscriptions |
| 5 | PROMO_CODE | Promotional codes |
| 6 | NONE | No active subscription (FREE) |

## Documentation Index

| Document | Description |
|----------|-------------|
| [Google Play Integration](./google-play.md) | Google Play Billing and RTDN setup |
| [Stripe Integration](./stripe.md) | Stripe Checkout and webhook configuration |
| [Database Schema](./database-schema.md) | Subscription data model |
| [API Reference](./api-reference.md) | Subscription API endpoints |

## Environment Configuration

| Variable | Provider | Purpose |
|----------|----------|---------|
| `GOOGLE_PLAY_PACKAGE_NAME` | Google | App package name |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY_PATH` | Google | Service account credentials |
| `STRIPE_SECRET_KEY` | Stripe | API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Webhook signature verification |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Stripe | Pro monthly price ID |
| `STRIPE_PRO_YEARLY_PRICE_ID` | Stripe | Pro yearly price ID |
| `STRIPE_PREMIUM_MONTHLY_PRICE_ID` | Stripe | Premium monthly price ID |
| `STRIPE_PREMIUM_YEARLY_PRICE_ID` | Stripe | Premium yearly price ID |
