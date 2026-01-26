# FAQ & Help System (iOS)

In-app FAQ and help center for user support.

---

## Overview

| Item | Description |
|------|-------------|
| Path | `ios/Readmigo/Features/Help/` |
| Entry | Settings → Help & FAQ |
| Service | `FAQService.shared` |

---

## Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                        FAQView                                 │
├───────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  🔍 Search questions...                                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  ⭐ Hot Questions                                             │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  📌 How do I cancel my subscription?        👁 1.2k  ▶  │  │
│  │  📌 How do I download books for offline?    👁 890   ▶  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  📱 Account                                           (5)  ▼  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  How do I change my password?               👁 234   ▶  │  │
│  │  How do I delete my account?                👁 156   ▶  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  📚 Reading                                          (12)  ▶  │
│  💳 Subscription                                      (8)  ▶  │
│  ⚙️ Settings                                          (6)  ▶  │
└───────────────────────────────────────────────────────────────┘
```

---

## Components

### FAQView

Main container with search and categorized FAQs.

**Features:**
- Search FAQs by keyword
- Featured/pinned FAQs section
- Expandable category sections
- View count and helpfulness stats

### FAQRow

Individual FAQ item in the list.

```
┌─────────────────────────────────────────────────┐
│ 📌 How do I cancel my subscription?             │
│    👁 1,234    👍 85%                       ▶   │
└─────────────────────────────────────────────────┘
```

### FAQDetailSheet

Modal sheet displaying full FAQ content.

```
┌─────────────────────────────────────────────────┐
│  FAQ                                    [Close] │
├─────────────────────────────────────────────────┤
│  ❓ Question                                    │
│  How do I cancel my subscription?               │
│                                                 │
│  ────────────────────────────────────────────   │
│                                                 │
│  💡 Answer                                      │
│  To cancel your subscription:                   │
│  1. Go to Settings > Subscription               │
│  2. Tap "Manage Subscription"                   │
│  3. Select "Cancel Subscription"                │
│  ...                                            │
│                                                 │
│  ────────────────────────────────────────────   │
│                                                 │
│  Was this helpful?                              │
│  [ 👍 Helpful ] [ 👎 Not helpful ]             │
│                                                 │
│  👁 1,234 views    👍 85% found helpful        │
└─────────────────────────────────────────────────┘
```

---

## Data Models

### FAQ

```swift
struct FAQ: Identifiable, Decodable {
    let id: String
    let question: String       // English
    let questionZh: String?    // Chinese
    let answer: String         // English
    let answerZh: String?      // Chinese
    let categoryId: String
    let isPinned: Bool
    let viewCount: Int
    let helpfulYes: Int
    let helpfulNo: Int
    let sortOrder: Int

    // Computed
    var localizedQuestion: String
    var localizedAnswer: String
    var helpfulPercentage: Double
}
```

### FAQCategory

```swift
struct FAQCategory: Identifiable, Decodable {
    let id: String
    let name: String           // English
    let nameZh: String?        // Chinese
    let icon: String?          // SF Symbol name
    let sortOrder: Int
    var faqs: [FAQ]

    // Computed
    var localizedName: String
    var faqCount: Int
}
```

---

## FAQService

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/faqs` | Get all FAQs with categories |
| GET | `/faqs/featured` | Get pinned/featured FAQs |
| GET | `/faqs/search?q=` | Search FAQs |
| POST | `/faqs/:id/feedback` | Submit helpfulness feedback |
| POST | `/faqs/:id/view` | Track FAQ view |

### Methods

```swift
@MainActor
class FAQService: ObservableObject {
    static let shared = FAQService()

    @Published var categories: [FAQCategory] = []
    @Published var featuredFAQs: [FAQ] = []
    @Published var searchResults: [FAQ] = []
    @Published var isLoading = false

    func loadAllFAQs() async
    func loadFeaturedFAQs() async
    func searchFAQs(query: String) async
    func submitFeedback(faqId: String, helpful: Bool) async -> Bool
    func trackView(faqId: String) async
    func clearSearch()
}
```

---

## User Flows

### Browse FAQs

```
Settings → Help & FAQ
         ↓
    FAQView loads
         ↓
  [Load all FAQs + Featured]
         ↓
    Display categories
         ↓
  User taps category
         ↓
    Category expands
         ↓
    User taps FAQ
         ↓
  FAQDetailSheet opens
         ↓
    Track view count
```

### Search FAQs

```
FAQView → Type in search
              ↓
      [Debounced search]
              ↓
      searchFAQs(query:)
              ↓
      Display results
              ↓
      User taps result
              ↓
   FAQDetailSheet opens
```

### Submit Feedback

```
FAQDetailSheet → Tap 👍/👎
                    ↓
          submitFeedback()
                    ↓
           POST /faqs/:id/feedback
                    ↓
          Show "Thank you!"
                    ↓
         Disable feedback buttons
```

---

## Localization

FAQs support bilingual content:

| Field | English | Chinese |
|-------|---------|---------|
| question | "How do I...?" | "如何...?" |
| answer | "To do this..." | "要做到这一点..." |
| categoryName | "Account" | "账户" |

The `localizedQuestion` and `localizedAnswer` computed properties automatically select the appropriate language based on user's locale.

---

## Caching Strategy

| Data | Cache Duration | Storage |
|------|----------------|---------|
| All FAQs | 1 hour | Memory |
| Featured | 30 minutes | Memory |
| Search results | Session | Memory |

---

## Analytics

Track the following events:

| Event | Parameters |
|-------|------------|
| faq_viewed | faqId, categoryId |
| faq_searched | query, resultCount |
| faq_feedback | faqId, helpful (bool) |
| faq_category_expanded | categoryId |

---

## Related Documentation

- [Customer Support System](../../../01-product/features/support/customer-support-system-design.md)
- [Settings Module](../../../07-modules/modules/settings.md)
- [Internationalization](../../shared/internationalization.md)
