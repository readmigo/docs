# Subscription Database Schema

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                            User                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ id: String (PK)                                           │  │
│  │ email: String                                             │  │
│  │ ...                                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 1:1
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Subscription                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ id: String (PK)                                           │  │
│  │ userId: String (FK, Unique)                               │  │
│  │ planType: PlanType                                        │  │
│  │ status: SubscriptionStatus                                │  │
│  │ source: SubscriptionSource                                │  │
│  │ expiresAt: DateTime?                                      │  │
│  │ createdAt: DateTime                                       │  │
│  │ updatedAt: DateTime                                       │  │
│  │ cancelledAt: DateTime?                                    │  │
│  │ --- Apple IAP Fields ---                                  │  │
│  │ originalTransactionId: String?                            │  │
│  │ latestReceiptData: String?                                │  │
│  │ --- Google Play Fields ---                                │  │
│  │ googlePurchaseToken: String?                              │  │
│  │ googleOrderId: String?                                    │  │
│  │ googleProductId: String?                                  │  │
│  │ googleAcknowledged: Boolean?                              │  │
│  │ googleAutoRenewing: Boolean?                              │  │
│  │ --- Stripe Fields ---                                     │  │
│  │ stripeCustomerId: String?                                 │  │
│  │ stripeSubscriptionId: String?                             │  │
│  │ stripePaymentMethodId: String?                            │  │
│  │ stripePriceId: String?                                    │  │
│  │ stripeCurrentPeriodEnd: DateTime?                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 1:N
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SubscriptionEvent                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ id: String (PK)                                           │  │
│  │ subscriptionId: String (FK)                               │  │
│  │ source: SubscriptionSource                                │  │
│  │ eventType: String                                         │  │
│  │ eventData: Json                                           │  │
│  │ createdAt: DateTime                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                           Order                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ id: String (PK)                                           │  │
│  │ orderNumber: String (Unique)                              │  │
│  │ userId: String (FK)                                       │  │
│  │ subscriptionId: String? (FK)                              │  │
│  │ productId: String                                         │  │
│  │ productName: String                                       │  │
│  │ planType: PlanType                                        │  │
│  │ amount: Decimal                                           │  │
│  │ currency: String                                          │  │
│  │ status: OrderStatus                                       │  │
│  │ source: SubscriptionSource                                │  │
│  │ startedAt: DateTime?                                      │  │
│  │ expiresAt: DateTime?                                      │  │
│  │ createdAt: DateTime                                       │  │
│  │ updatedAt: DateTime                                       │  │
│  │ --- Apple Fields ---                                      │  │
│  │ appleTransactionId: String?                               │  │
│  │ appleOriginalTransactionId: String?                       │  │
│  │ --- Google Fields ---                                     │  │
│  │ googleOrderId: String?                                    │  │
│  │ googlePurchaseToken: String?                              │  │
│  │ --- Stripe Fields ---                                     │  │
│  │ stripePaymentIntentId: String?                            │  │
│  │ stripeInvoiceId: String?                                  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Enums

### PlanType

| Value | Description |
|-------|-------------|
| FREE | Free tier with limited features |
| PRO | Pro tier with extended features |
| PREMIUM | Premium tier with all features |

### SubscriptionStatus

| Value | Description |
|-------|-------------|
| ACTIVE | Subscription is active |
| CANCELLED | User cancelled, active until expiry |
| EXPIRED | Subscription has expired |
| GRACE_PERIOD | Payment failed, in grace period |

### SubscriptionSource

| Value | Description |
|-------|-------------|
| NONE | No subscription source |
| APPLE_IAP | Apple In-App Purchase |
| GOOGLE_PLAY | Google Play Billing |
| STRIPE | Stripe payment |
| PROMO_CODE | Promotional code |
| ADMIN_GRANT | Manually granted by admin |

### OrderStatus

| Value | Description |
|-------|-------------|
| PENDING | Order pending payment |
| ACTIVE | Order is active |
| CANCELLED | Order was cancelled |
| REFUNDED | Order was refunded |
| EXPIRED | Order has expired |

## Indexes

### Subscription Table

| Index Name | Columns | Purpose |
|------------|---------|---------|
| subscription_userId_unique | userId | Unique constraint, fast user lookup |
| subscription_source_idx | source | Filter by provider |
| subscription_status_idx | status | Filter by status |
| subscription_stripeCustomerId_idx | stripeCustomerId | Stripe customer lookup |
| subscription_stripeSubscriptionId_idx | stripeSubscriptionId | Stripe subscription lookup |
| subscription_googlePurchaseToken_idx | googlePurchaseToken | Google purchase lookup |

### SubscriptionEvent Table

| Index Name | Columns | Purpose |
|------------|---------|---------|
| subscriptionEvent_subscriptionId_idx | subscriptionId | Get events for subscription |
| subscriptionEvent_source_idx | source | Filter by provider |
| subscriptionEvent_createdAt_idx | createdAt | Time-based queries |

### Order Table

| Index Name | Columns | Purpose |
|------------|---------|---------|
| order_userId_idx | userId | Get user's orders |
| order_subscriptionId_idx | subscriptionId | Get subscription's orders |
| order_orderNumber_unique | orderNumber | Unique order lookup |
| order_stripeInvoiceId_idx | stripeInvoiceId | Stripe invoice lookup |

## Field Descriptions

### Subscription Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | String | No | Primary key (CUID) |
| userId | String | No | Reference to User |
| planType | Enum | No | Current subscription plan |
| status | Enum | No | Current subscription status |
| source | Enum | No | Payment provider source |
| expiresAt | DateTime | Yes | When subscription expires |
| cancelledAt | DateTime | Yes | When user cancelled |

### Apple IAP Fields

| Field | Type | Description |
|-------|------|-------------|
| originalTransactionId | String | Apple's original transaction ID |
| latestReceiptData | String | Latest receipt for re-verification |

### Google Play Fields

| Field | Type | Description |
|-------|------|-------------|
| googlePurchaseToken | String | Purchase token for verification |
| googleOrderId | String | Google's order ID |
| googleProductId | String | Product ID (e.g., `readmigo_pro_monthly`) |
| googleAcknowledged | Boolean | Whether purchase was acknowledged |
| googleAutoRenewing | Boolean | Whether auto-renewing is enabled |

### Stripe Fields

| Field | Type | Description |
|-------|------|-------------|
| stripeCustomerId | String | Stripe customer ID |
| stripeSubscriptionId | String | Stripe subscription ID |
| stripePaymentMethodId | String | Default payment method |
| stripePriceId | String | Price ID for current plan |
| stripeCurrentPeriodEnd | DateTime | Current billing period end |

## Migration History

| Migration | Date | Description |
|-----------|------|-------------|
| Initial | - | Base subscription model with Apple IAP |
| 20251231150000 | 2024-12-31 | Add Google Play and Stripe fields |

## Data Integrity Rules

| Rule | Description |
|------|-------------|
| One subscription per user | userId has unique constraint |
| Source consistency | Provider fields should match source enum |
| Status transitions | Only valid status transitions allowed |
| Expiry validation | expiresAt must be in future for ACTIVE status |

## Status Transition Diagram

```
                    ┌─────────────────┐
                    │     ACTIVE      │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
    │  CANCELLED    │ │ GRACE_PERIOD  │ │   EXPIRED     │
    └───────┬───────┘ └───────┬───────┘ └───────────────┘
            │                 │                │
            │                 │                │
            ▼                 ▼                │
    ┌───────────────┐ ┌───────────────┐        │
    │   EXPIRED     │ │   EXPIRED     │        │
    └───────────────┘ └───────────────┘        │
                             │                 │
                             └────────┬────────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │    ACTIVE     │
                              │ (Re-subscribe)│
                              └───────────────┘
```
