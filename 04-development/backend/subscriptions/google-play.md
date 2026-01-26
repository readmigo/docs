# Google Play Billing Integration

## Overview

The Google Play integration handles Android subscription purchases through Google Play Billing Library and receives real-time notifications via RTDN (Real-time Developer Notifications).

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Android Application                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │ BillingClient   │  │ Subscription    │  │ Subscription    │          │
│  │ Wrapper         │──│ Repository      │──│ Manager         │          │
│  └────────┬────────┘  └────────┬────────┘  └─────────────────┘          │
│           │                    │                                         │
└───────────┼────────────────────┼─────────────────────────────────────────┘
            │                    │
            ▼                    ▼
┌───────────────────┐   ┌───────────────────────────────────────┐
│   Google Play     │   │              Backend API               │
│   Store           │   │  ┌─────────────────────────────────┐  │
│                   │   │  │    Google Play Service          │  │
└─────────┬─────────┘   │  │  - verifyPurchase()             │  │
          │             │  │  - acknowledgePurchase()        │  │
          │             │  │  - restorePurchases()           │  │
          ▼             │  │  - cancelSubscription()         │  │
┌───────────────────┐   │  └─────────────────────────────────┘  │
│  Google Play      │   └───────────────────────────────────────┘
│  Developer API    │                    ▲
└─────────┬─────────┘                    │
          │                              │
          │  Verification                │
          └──────────────────────────────┘
```

## RTDN (Real-time Developer Notifications) Flow

```
┌─────────────────┐
│  Google Play    │
│  Store Action   │
│  (Purchase,     │
│   Cancel, etc.) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Google Cloud   │
│  Pub/Sub Topic  │
└────────┬────────┘
         │
         ▼ Push Subscription
┌─────────────────┐
│  Backend        │
│  /webhooks/     │
│  google-play    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Decode Base64  │
│  Message        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Parse RTDN     │
│  Notification   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Handle by      │
│  Notification   │
│  Type           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Update DB &    │
│  Log Event      │
└─────────────────┘
```

## RTDN Notification Types

| Notification Type | Description | Action |
|-------------------|-------------|--------|
| SUBSCRIPTION_RECOVERED | Subscription recovered from account hold | Reactivate subscription |
| SUBSCRIPTION_RENEWED | Subscription successfully renewed | Update expiry date |
| SUBSCRIPTION_CANCELED | Subscription cancelled by user | Mark as cancelled |
| SUBSCRIPTION_PURCHASED | New subscription purchased | Create/activate subscription |
| SUBSCRIPTION_ON_HOLD | Payment failed, grace period started | Set grace period status |
| SUBSCRIPTION_IN_GRACE_PERIOD | Still in grace period | Maintain grace period status |
| SUBSCRIPTION_RESTARTED | Subscription restarted after cancellation | Reactivate subscription |
| SUBSCRIPTION_PRICE_CHANGE_CONFIRMED | User confirmed price change | Update price info |
| SUBSCRIPTION_DEFERRED | Subscription deferred | Update to deferred |
| SUBSCRIPTION_PAUSED | Subscription paused | Set paused status |
| SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED | Pause schedule modified | Update schedule |
| SUBSCRIPTION_REVOKED | Subscription revoked (refund) | Immediately expire |
| SUBSCRIPTION_EXPIRED | Subscription expired | Mark as expired |
| SUBSCRIPTION_PENDING_PURCHASE_CANCELED | Pending purchase cancelled | Remove pending |

## Purchase Verification Flow

```
┌─────────────────┐
│  User Taps      │
│  "Subscribe"    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  BillingClient  │
│  launchBilling  │
│  Flow()         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Google Play    │
│  Purchase UI    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│        Purchase Complete?           │
├─────────────────┬───────────────────┤
│      YES        │        NO         │
│                 │                   │
▼                 ▼                   │
┌─────────────┐  ┌─────────────┐      │
│ Send to     │  │ Show Error/ │      │
│ Backend for │  │ Cancel      │      │
│ Verification│  └─────────────┘      │
└──────┬──────┘                       │
       │                              │
       ▼                              │
┌─────────────────┐                   │
│  Backend calls  │                   │
│  Google Play    │                   │
│  Developer API  │                   │
└────────┬────────┘                   │
         │                            │
         ▼                            │
┌─────────────────────────────────────┤
│      Valid Purchase?                │
├─────────────────┬───────────────────┤
│      YES        │        NO         │
│                 │                   │
▼                 ▼                   │
┌─────────────┐  ┌─────────────┐      │
│ Update DB   │  │ Return      │      │
│ Acknowledge │  │ Error       │      │
│ Purchase    │  └─────────────┘      │
└──────┬──────┘                       │
       │                              │
       ▼                              │
┌─────────────────┐                   │
│  Return Success │                   │
│  to App         │                   │
└─────────────────┘                   │
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/subscriptions/google/verify` | POST | Verify a purchase |
| `/subscriptions/google/restore` | POST | Restore previous purchases |
| `/subscriptions/google/acknowledge` | POST | Acknowledge a purchase |
| `/webhooks/google-play` | POST | RTDN webhook endpoint |

## Google Play Console Setup

### Step 1: Create Service Account

| Action | Location |
|--------|----------|
| Create service account | Google Cloud Console > IAM & Admin |
| Grant permissions | Android Publisher API access |
| Download JSON key | Service account keys section |

### Step 2: Configure RTDN

| Action | Location |
|--------|----------|
| Create Pub/Sub topic | Google Cloud Console > Pub/Sub |
| Create push subscription | Topic > Subscriptions |
| Set endpoint URL | `https://api.readmigo.app/webhooks/google-play` |
| Link to app | Play Console > Monetization > Real-time notifications |

### Step 3: Configure Products

| Field | Value |
|-------|-------|
| Product ID (Pro Monthly) | `readmigo_pro_monthly` |
| Product ID (Pro Yearly) | `readmigo_pro_yearly` |
| Product ID (Premium Monthly) | `readmigo_premium_monthly` |
| Product ID (Premium Yearly) | `readmigo_premium_yearly` |

## Database Fields

| Field | Type | Description |
|-------|------|-------------|
| googlePurchaseToken | String | Purchase token from Play Store |
| googleOrderId | String | Order ID |
| googleProductId | String | Product ID (e.g., `readmigo_pro_monthly`) |
| googleAcknowledged | Boolean | Whether purchase is acknowledged |
| googleAutoRenewing | Boolean | Auto-renewal status |

## Testing

### Test License Accounts

| Account Type | Behavior |
|--------------|----------|
| License Test Account | Real purchase flow, no charges |
| Subscription tester | Shortened renewal periods |

### Test Subscription Periods

| Production Period | Test Period |
|-------------------|-------------|
| 1 week | 5 minutes |
| 1 month | 5 minutes |
| 3 months | 10 minutes |
| 6 months | 15 minutes |
| 1 year | 30 minutes |

## Error Handling

| Error Code | Meaning | Resolution |
|------------|---------|------------|
| `BILLING_UNAVAILABLE` | Play Store unavailable | Check device compatibility |
| `SERVICE_DISCONNECTED` | Connection lost | Reconnect billing client |
| `USER_CANCELED` | User cancelled purchase | No action needed |
| `ITEM_ALREADY_OWNED` | Already subscribed | Restore purchase |
| `DEVELOPER_ERROR` | Invalid configuration | Check product IDs |
