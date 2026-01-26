# Readmigo 客服系统与订单管理设计

> 版本: 2.0
> 最后更新: 2025-12-27
> 状态: ✅ 设计完成 | 进度: 90%

## 目录

1. [系统概述](#1-系统概述)
2. [客户端反馈功能](#2-客户端反馈功能)
3. [工单系统设计](#3-工单系统设计)
4. [订单系统设计](#4-订单系统设计)
5. [Dashboard 客服管理](#5-dashboard-客服管理)
6. [API 接口设计](#6-api-接口设计)
7. [数据模型设计](#7-数据模型设计)
8. [通知与沟通](#8-通知与沟通)
9. [运营与分析](#9-运营与分析)
10. [实施计划](#10-实施计划)
11. [实施进度](#11-实施进度)

**附录**:
- [附录 A：常见问题自动回复库](#附录-a常见问题自动回复库)
- [附录 B：客户满意度调查（CSAT）设计](#附录-b客户满意度调查csat设计)
- [附录 C：邮件模板示例](#附录-c邮件模板示例)
- [附录 D：技术依赖](#附录-d技术依赖)

---

## 1. 系统概述

### 1.1 系统架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              用户触点                                        │
├────────────────────┬────────────────────┬───────────────────────────────────┤
│   iOS App 内反馈    │   邮件 support@    │    App Store Review              │
│   (主要入口)        │   (备用渠道)        │    (需要监控)                     │
└─────────┬──────────┴─────────┬──────────┴─────────────────┬─────────────────┘
          │                    │                            │
          ▼                    ▼                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API Gateway                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │  Feedback API   │  │  Ticket API     │  │  Order API                  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
          │                    │                            │
          ▼                    ▼                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Business Services                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ FeedbackService │  │  TicketService  │  │  OrderService               │  │
│  │                 │  │                 │  │                             │  │
│  │ - 创建反馈      │  │ - 工单生命周期   │  │ - Apple 订单同步            │  │
│  │ - 自动分类      │  │ - 分配客服      │  │ - 订单查询                  │  │
│  │ - 情感分析      │  │ - SLA 监控      │  │ - 退款处理                  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
          │                    │                            │
          ▼                    ▼                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Database                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │    Feedback     │  │     Ticket      │  │     Order / Transaction     │  │
│  │    Attachment   │  │  TicketMessage  │  │     RefundRequest           │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Dashboard (React-Admin)                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │  反馈管理       │  │   工单处理       │  │     订单管理                 │  │
│  │  - 反馈列表     │  │   - 工单队列     │  │     - 订单列表               │  │
│  │  - 快速回复     │  │   - 处理面板     │  │     - 退款审批               │  │
│  │  - 批量操作     │  │   - 客服分配     │  │     - 订单详情               │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 核心功能模块

| 模块 | 描述 | 优先级 |
|------|------|--------|
| **用户反馈** | 客户端内提交反馈、问题报告 | P0 |
| **工单系统** | 反馈转工单、分配、跟踪、解决 | P0 |
| **订单管理** | 查看订单、处理退款、订单历史 | P0 |
| **客服仪表盘** | 统一管理界面、数据分析 | P1 |
| **自动化** | 自动分类、智能回复建议 | P2 |

---

## 2. 客户端反馈功能

### 2.1 反馈入口设计

```
┌─────────────────────────────────────────────────────────────────┐
│                       反馈入口位置                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 设置页 → 帮助与反馈 → 提交反馈                              │
│     (主入口，永久可见)                                          │
│                                                                 │
│  2. 阅读器 → 更多菜单 → 报告问题                                │
│     (上下文相关，自动携带书籍信息)                               │
│                                                                 │
│  3. 错误弹窗 → 反馈此问题                                       │
│     (异常时触发，自动携带错误日志)                               │
│                                                                 │
│  4. 订阅页 → 遇到问题？联系我们                                 │
│     (订阅相关问题快速入口)                                       │
│                                                                 │
│  5. Shake to Feedback (可选)                                    │
│     (摇一摇触发，开发/测试模式)                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 反馈类型分类

```swift
enum FeedbackCategory: String, Codable, CaseIterable {
    // 功能问题
    case bug = "BUG"                           // 功能异常/崩溃
    case featureNotWorking = "FEATURE_NOT_WORKING" // 功能无法使用

    // 内容问题
    case bookContent = "BOOK_CONTENT"          // 书籍内容问题
    case translationError = "TRANSLATION"      // 翻译错误
    case aiResponse = "AI_RESPONSE"            // AI 回答问题

    // 订阅问题
    case subscriptionIssue = "SUBSCRIPTION"    // 订阅相关
    case paymentIssue = "PAYMENT"              // 支付问题
    case refundRequest = "REFUND"              // 退款请求

    // 账户问题
    case accountIssue = "ACCOUNT"              // 账户问题
    case loginIssue = "LOGIN"                  // 登录问题
    case dataSync = "DATA_SYNC"                // 数据同步

    // 建议反馈
    case featureRequest = "FEATURE_REQUEST"    // 功能建议
    case improvement = "IMPROVEMENT"           // 改进建议

    // 其他
    case other = "OTHER"

    var displayName: String {
        switch self {
        case .bug: return "功能异常"
        case .featureNotWorking: return "功能无法使用"
        case .bookContent: return "书籍内容问题"
        case .translationError: return "翻译错误"
        case .aiResponse: return "AI 回答问题"
        case .subscriptionIssue: return "订阅问题"
        case .paymentIssue: return "支付问题"
        case .refundRequest: return "申请退款"
        case .accountIssue: return "账户问题"
        case .loginIssue: return "登录问题"
        case .dataSync: return "数据同步问题"
        case .featureRequest: return "功能建议"
        case .improvement: return "改进建议"
        case .other: return "其他"
        }
    }

    var icon: String {
        switch self {
        case .bug, .featureNotWorking: return "ladybug"
        case .bookContent, .translationError: return "book"
        case .aiResponse: return "bubble.left.and.bubble.right"
        case .subscriptionIssue, .paymentIssue, .refundRequest: return "creditcard"
        case .accountIssue, .loginIssue: return "person.crop.circle"
        case .dataSync: return "arrow.triangle.2.circlepath"
        case .featureRequest, .improvement: return "lightbulb"
        case .other: return "ellipsis.circle"
        }
    }

    var priority: TicketPriority {
        switch self {
        case .bug, .paymentIssue, .refundRequest: return .high
        case .subscriptionIssue, .loginIssue, .featureNotWorking: return .medium
        default: return .low
        }
    }
}
```

### 2.3 反馈表单 UI 设计

```swift
// FeedbackView.swift
struct FeedbackView: View {
    @StateObject private var viewModel = FeedbackViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                // 1. 反馈类型选择
                Section {
                    Picker("问题类型", selection: $viewModel.category) {
                        ForEach(FeedbackCategory.allCases, id: \.self) { category in
                            Label(category.displayName, systemImage: category.icon)
                                .tag(category)
                        }
                    }
                    .pickerStyle(.navigationLink)
                } header: {
                    Text("问题类型")
                }

                // 2. 问题描述
                Section {
                    TextEditor(text: $viewModel.description)
                        .frame(minHeight: 120)
                        .overlay(alignment: .topLeading) {
                            if viewModel.description.isEmpty {
                                Text("请详细描述您遇到的问题...")
                                    .foregroundColor(.secondary)
                                    .padding(.top, 8)
                                    .padding(.leading, 4)
                            }
                        }
                } header: {
                    Text("问题描述")
                } footer: {
                    Text("请尽量详细描述，帮助我们更快解决问题")
                }

                // 3. 截图/附件
                Section {
                    AttachmentPicker(attachments: $viewModel.attachments)

                    if !viewModel.attachments.isEmpty {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack {
                                ForEach(viewModel.attachments) { attachment in
                                    AttachmentThumbnail(attachment: attachment) {
                                        viewModel.removeAttachment(attachment)
                                    }
                                }
                            }
                        }
                    }
                } header: {
                    Text("截图或附件（可选）")
                } footer: {
                    Text("最多可添加 5 张图片")
                }

                // 4. 联系方式
                Section {
                    TextField("邮箱地址", text: $viewModel.contactEmail)
                        .keyboardType(.emailAddress)
                        .textContentType(.emailAddress)
                        .autocapitalization(.none)
                } header: {
                    Text("联系方式")
                } footer: {
                    Text("我们会通过邮件回复您的反馈")
                }

                // 5. 自动收集的信息（折叠显示）
                Section {
                    DisclosureGroup("查看诊断信息") {
                        DiagnosticInfoView(info: viewModel.diagnosticInfo)
                    }
                } footer: {
                    Text("这些信息帮助我们诊断问题，不包含个人隐私数据")
                }
            }
            .navigationTitle("提交反馈")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("取消") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("提交") {
                        Task { await viewModel.submit() }
                    }
                    .disabled(!viewModel.isValid || viewModel.isSubmitting)
                }
            }
            .overlay {
                if viewModel.isSubmitting {
                    ProgressOverlay(message: "正在提交...")
                }
            }
            .alert("提交成功", isPresented: $viewModel.showSuccess) {
                Button("好的") { dismiss() }
            } message: {
                Text("感谢您的反馈！我们会尽快处理并通过邮件回复您。")
            }
        }
    }
}

// 诊断信息（自动收集）
struct DiagnosticInfo: Codable {
    let appVersion: String           // App 版本
    let buildNumber: String          // Build 号
    let iosVersion: String           // iOS 版本
    let deviceModel: String          // 设备型号
    let locale: String               // 语言设置
    let timezone: String             // 时区

    // 用户上下文
    let userId: String?
    let subscriptionPlan: String?
    let subscriptionStatus: String?

    // 当前页面上下文
    let currentScreen: String?
    let currentBookId: String?
    let currentBookTitle: String?

    // 网络状态
    let networkType: String          // WiFi/Cellular/None
    let isOnline: Bool

    // 最近错误日志（脱敏）
    let recentErrors: [String]?      // 最近 5 条错误

    // 性能数据
    let memoryUsage: String?
    let diskSpace: String?
}
```

### 2.4 反馈 ViewModel

```swift
@MainActor
class FeedbackViewModel: ObservableObject {
    @Published var category: FeedbackCategory = .other
    @Published var description: String = ""
    @Published var attachments: [FeedbackAttachment] = []
    @Published var contactEmail: String = ""

    @Published var isSubmitting = false
    @Published var showSuccess = false
    @Published var error: Error?

    private let feedbackService = FeedbackService.shared
    private let maxAttachments = 5

    var diagnosticInfo: DiagnosticInfo {
        DiagnosticInfo(
            appVersion: Bundle.main.appVersion,
            buildNumber: Bundle.main.buildNumber,
            iosVersion: UIDevice.current.systemVersion,
            deviceModel: UIDevice.current.modelName,
            locale: Locale.current.identifier,
            timezone: TimeZone.current.identifier,
            userId: AuthManager.shared.currentUserId,
            subscriptionPlan: SubscriptionManager.shared.planType.rawValue,
            subscriptionStatus: SubscriptionManager.shared.status.rawValue,
            currentScreen: NavigationState.shared.currentScreen,
            currentBookId: ReaderState.shared.currentBookId,
            currentBookTitle: ReaderState.shared.currentBookTitle,
            networkType: NetworkMonitor.shared.connectionType.rawValue,
            isOnline: NetworkMonitor.shared.isConnected,
            recentErrors: ErrorLogger.shared.recentErrors(limit: 5),
            memoryUsage: PerformanceMonitor.memoryUsageString,
            diskSpace: PerformanceMonitor.diskSpaceString
        )
    }

    var isValid: Bool {
        !description.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        description.count >= 10 &&
        (contactEmail.isEmpty || contactEmail.isValidEmail)
    }

    func addAttachment(_ image: UIImage) {
        guard attachments.count < maxAttachments else { return }
        let attachment = FeedbackAttachment(image: image)
        attachments.append(attachment)
    }

    func removeAttachment(_ attachment: FeedbackAttachment) {
        attachments.removeAll { $0.id == attachment.id }
    }

    func submit() async {
        isSubmitting = true
        defer { isSubmitting = false }

        do {
            // 1. 上传附件
            var attachmentUrls: [String] = []
            for attachment in attachments {
                let url = try await feedbackService.uploadAttachment(attachment)
                attachmentUrls.append(url)
            }

            // 2. 提交反馈
            let request = CreateFeedbackRequest(
                category: category,
                description: description,
                contactEmail: contactEmail.isEmpty ? nil : contactEmail,
                attachmentUrls: attachmentUrls,
                diagnosticInfo: diagnosticInfo
            )

            try await feedbackService.submitFeedback(request)
            showSuccess = true

        } catch {
            self.error = error
        }
    }
}
```

### 2.5 快速反馈（上下文相关）

```swift
// 阅读器内的快速反馈
struct QuickFeedbackSheet: View {
    let context: FeedbackContext
    @StateObject private var viewModel: QuickFeedbackViewModel

    init(context: FeedbackContext) {
        self.context = context
        _viewModel = StateObject(wrappedValue: QuickFeedbackViewModel(context: context))
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                // 快速选项
                Text("您遇到了什么问题？")
                    .font(.headline)

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    QuickOptionButton(
                        icon: "text.badge.xmark",
                        title: "内容显示错误",
                        action: { viewModel.selectQuickOption(.displayError) }
                    )
                    QuickOptionButton(
                        icon: "character.book.closed",
                        title: "翻译有误",
                        action: { viewModel.selectQuickOption(.translationError) }
                    )
                    QuickOptionButton(
                        icon: "bubble.left.and.exclamationmark.bubble.right",
                        title: "AI 回答不对",
                        action: { viewModel.selectQuickOption(.aiError) }
                    )
                    QuickOptionButton(
                        icon: "ellipsis.circle",
                        title: "其他问题",
                        action: { viewModel.selectQuickOption(.other) }
                    )
                }

                // 选中后显示详情输入
                if viewModel.selectedOption != nil {
                    TextEditor(text: $viewModel.additionalInfo)
                        .frame(height: 100)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.secondary.opacity(0.3))
                        )

                    Button("提交反馈") {
                        Task { await viewModel.submit() }
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(viewModel.isSubmitting)
                }

                Spacer()
            }
            .padding()
            .navigationTitle("报告问题")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// 反馈上下文
struct FeedbackContext: Codable {
    let source: FeedbackSource
    let bookId: String?
    let bookTitle: String?
    let chapterId: String?
    let selectedText: String?
    let pageNumber: Int?
    let aiConversationId: String?
    let errorMessage: String?
    let errorStack: String?
}

enum FeedbackSource: String, Codable {
    case reader           // 阅读器
    case aiChat          // AI 对话
    case vocabulary      // 词汇页
    case settings        // 设置
    case subscription    // 订阅页
    case error           // 错误弹窗
    case shake           // 摇一摇
}
```

---

## 3. 工单系统设计

### 3.1 工单生命周期

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           工单状态流转                                    │
└──────────────────────────────────────────────────────────────────────────┘

                            用户提交反馈
                                 │
                                 ▼
                        ┌───────────────┐
                        │     NEW       │
                        │   (新建)      │
                        └───────┬───────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
           ┌───────────────┐       ┌───────────────┐
           │  AUTO_REPLIED │       │   ASSIGNED    │
           │ (自动回复)     │       │  (已分配)     │
           └───────┬───────┘       └───────┬───────┘
                   │                       │
                   └───────────┬───────────┘
                               │
                               ▼
                      ┌───────────────┐
                      │  IN_PROGRESS  │◄─────────────────┐
                      │   (处理中)     │                  │
                      └───────┬───────┘                  │
                              │                          │
              ┌───────────────┼───────────────┐         │
              │               │               │         │
              ▼               ▼               ▼         │
     ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
     │    PENDING    │ │   ESCALATED   │ │   ON_HOLD     │
     │ (待用户回复)   │ │  (已升级)      │ │  (暂停)       │
     └───────┬───────┘ └───────┬───────┘ └───────┬───────┘
             │                 │                 │
             │                 │                 │
             └─────────────────┴─────────────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
     ┌───────────────┐                 ┌───────────────┐
     │   RESOLVED    │                 │    CLOSED     │
     │   (已解决)     │────────────────►│   (已关闭)    │
     └───────────────┘   用户确认或     └───────────────┘
                         7天无响应
```

### 3.2 工单状态定义

```typescript
enum TicketStatus {
  // 初始状态
  NEW = 'NEW',                    // 新建，待分配
  AUTO_REPLIED = 'AUTO_REPLIED',  // 已自动回复，待人工跟进

  // 处理中状态
  ASSIGNED = 'ASSIGNED',          // 已分配给客服
  IN_PROGRESS = 'IN_PROGRESS',    // 处理中
  PENDING = 'PENDING',            // 待用户回复
  ON_HOLD = 'ON_HOLD',            // 暂停（等待其他部门/外部）
  ESCALATED = 'ESCALATED',        // 已升级（需要高级支持）

  // 终止状态
  RESOLVED = 'RESOLVED',          // 已解决（待确认）
  CLOSED = 'CLOSED',              // 已关闭
  SPAM = 'SPAM',                  // 垃圾信息
  DUPLICATE = 'DUPLICATE',        // 重复工单
}

enum TicketPriority {
  LOW = 'LOW',           // 低优先级：功能建议、一般咨询
  MEDIUM = 'MEDIUM',     // 中优先级：功能问题、账户问题
  HIGH = 'HIGH',         // 高优先级：支付问题、无法使用
  URGENT = 'URGENT',     // 紧急：大规模故障、安全问题
}

// SLA 配置
const SLA_CONFIG: Record<TicketPriority, SLAConfig> = {
  [TicketPriority.URGENT]: {
    firstResponseTime: 1 * 60,      // 1小时
    resolutionTime: 4 * 60,         // 4小时
    escalationTime: 2 * 60,         // 2小时未响应自动升级
  },
  [TicketPriority.HIGH]: {
    firstResponseTime: 4 * 60,      // 4小时
    resolutionTime: 24 * 60,        // 24小时
    escalationTime: 8 * 60,         // 8小时未响应自动升级
  },
  [TicketPriority.MEDIUM]: {
    firstResponseTime: 24 * 60,     // 24小时
    resolutionTime: 72 * 60,        // 72小时
    escalationTime: 48 * 60,        // 48小时未响应自动升级
  },
  [TicketPriority.LOW]: {
    firstResponseTime: 48 * 60,     // 48小时
    resolutionTime: 168 * 60,       // 7天
    escalationTime: null,           // 不自动升级
  },
};
```

### 3.3 工单分配策略

```typescript
@Injectable()
export class TicketAssignmentService {
  // 自动分配策略
  async autoAssign(ticket: Ticket): Promise<string | null> {
    // 1. 按类别分配到专门队列
    const queue = this.getCategoryQueue(ticket.category);

    // 2. 获取队列中可用的客服
    const availableAgents = await this.getAvailableAgents(queue);

    if (availableAgents.length === 0) {
      return null; // 无可用客服，进入未分配队列
    }

    // 3. 负载均衡分配
    const agent = this.selectAgent(availableAgents, ticket);

    return agent.id;
  }

  private getCategoryQueue(category: FeedbackCategory): string {
    const queueMapping: Record<FeedbackCategory, string> = {
      [FeedbackCategory.SUBSCRIPTION]: 'billing',
      [FeedbackCategory.PAYMENT]: 'billing',
      [FeedbackCategory.REFUND]: 'billing',
      [FeedbackCategory.BUG]: 'technical',
      [FeedbackCategory.FEATURE_NOT_WORKING]: 'technical',
      [FeedbackCategory.BOOK_CONTENT]: 'content',
      [FeedbackCategory.TRANSLATION]: 'content',
      [FeedbackCategory.AI_RESPONSE]: 'content',
      [FeedbackCategory.ACCOUNT]: 'general',
      [FeedbackCategory.LOGIN]: 'general',
      // ...
    };
    return queueMapping[category] || 'general';
  }

  private selectAgent(agents: Agent[], ticket: Ticket): Agent {
    // 加权轮询：考虑当前工单数、技能匹配、工作时间
    const scored = agents.map(agent => ({
      agent,
      score: this.calculateScore(agent, ticket),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored[0].agent;
  }

  private calculateScore(agent: Agent, ticket: Ticket): number {
    let score = 100;

    // 当前工单数（越少分数越高）
    score -= agent.activeTicketCount * 5;

    // 技能匹配
    if (agent.skills.includes(ticket.category)) {
      score += 20;
    }

    // 语言匹配
    if (agent.languages.includes(ticket.language)) {
      score += 15;
    }

    // 历史处理同类工单的解决率
    score += agent.resolutionRate * 10;

    return score;
  }
}
```

### 3.4 自动回复与智能建议

```typescript
@Injectable()
export class AutoReplyService {
  // 常见问题自动回复
  private readonly autoReplies: Record<string, AutoReplyTemplate> = {
    'SUBSCRIPTION.HOW_TO_CANCEL': {
      trigger: ['取消订阅', '怎么取消', '如何取消', 'cancel subscription'],
      reply: `
感谢您的反馈！

要取消订阅，请按以下步骤操作：
1. 打开 iPhone「设置」
2. 点击顶部的您的 Apple ID
3. 选择「订阅」
4. 找到 Readmigo 并点击
5. 选择「取消订阅」

取消后，您仍可使用付费功能直到当前订阅期结束。

如有其他问题，请回复此邮件，我们的客服团队会尽快为您处理。
      `,
      closeAfterDays: 3,
    },
    'SUBSCRIPTION.RESTORE': {
      trigger: ['恢复购买', '购买记录', 'restore purchase'],
      reply: `
感谢您的反馈！

要恢复购买，请按以下步骤操作：
1. 打开 Readmigo App
2. 进入「设置」→「订阅」
3. 点击「恢复购买」按钮
4. 使用购买时的 Apple ID 验证

如果恢复失败，请确保：
- 使用的是购买时的同一 Apple ID
- Apple ID 已登录并可正常使用
- 网络连接正常

如问题仍未解决，请回复此邮件，我们会为您人工处理。
      `,
      closeAfterDays: 3,
    },
    // ... 更多自动回复模板
  };

  async processNewTicket(ticket: Ticket): Promise<AutoReplyResult> {
    // 1. 分析内容，匹配关键词
    const matchedTemplate = this.matchTemplate(ticket.description);

    if (matchedTemplate) {
      // 2. 发送自动回复
      await this.sendAutoReply(ticket, matchedTemplate);

      // 3. 更新工单状态
      await this.updateTicketStatus(ticket.id, TicketStatus.AUTO_REPLIED);

      // 4. 设置自动关闭定时器
      if (matchedTemplate.closeAfterDays) {
        await this.scheduleAutoClose(ticket.id, matchedTemplate.closeAfterDays);
      }

      return { autoReplied: true, template: matchedTemplate.id };
    }

    return { autoReplied: false };
  }

  // AI 智能回复建议（供客服参考）
  async generateReplySuggestion(ticket: Ticket): Promise<string[]> {
    const context = {
      category: ticket.category,
      description: ticket.description,
      userPlan: ticket.user.subscription?.planType,
      previousTickets: await this.getUserPreviousTickets(ticket.userId),
    };

    // 调用 AI 生成建议回复
    const suggestions = await this.aiService.generateReplySuggestions(context);

    return suggestions;
  }
}
```

---

## 4. 订单系统设计

### 4.1 订单数据来源

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          订单数据同步                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Apple App Store Connect                                               │
│        │                                                                │
│        ├─── Server-to-Server Notifications (实时)                       │
│        │    - SUBSCRIBED: 新订阅                                        │
│        │    - DID_RENEW: 续订                                           │
│        │    - REFUND: 退款                                              │
│        │    - ... 其他事件                                               │
│        │                                                                │
│        └─── App Store Connect API (定时同步/查询)                        │
│             - 订单详情查询                                               │
│             - 交易历史                                                   │
│             - 退款状态                                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Order Service                                  │
│                                                                         │
│   1. 解析 Apple 通知/响应                                                │
│   2. 创建/更新 Order 记录                                                │
│   3. 创建 Transaction 记录                                               │
│   4. 同步 Subscription 状态                                              │
│   5. 触发相关业务逻辑                                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 订单状态

```typescript
enum OrderStatus {
  // 正常状态
  ACTIVE = 'ACTIVE',              // 有效订单
  COMPLETED = 'COMPLETED',        // 已完成（一次性购买或订阅结束）

  // 问题状态
  PENDING_PAYMENT = 'PENDING',    // 待支付（宽限期）
  PAYMENT_FAILED = 'FAILED',      // 支付失败

  // 退款状态
  REFUND_REQUESTED = 'REFUND_REQUESTED', // 退款已申请
  REFUNDED = 'REFUNDED',                  // 已退款
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED', // 部分退款

  // 取消状态
  CANCELLED = 'CANCELLED',        // 已取消
  REVOKED = 'REVOKED',            // 被撤销
}

enum TransactionType {
  INITIAL_PURCHASE = 'INITIAL_PURCHASE',   // 首次购买
  RENEWAL = 'RENEWAL',                      // 续订
  UPGRADE = 'UPGRADE',                      // 升级
  DOWNGRADE = 'DOWNGRADE',                  // 降级
  REFUND = 'REFUND',                        // 退款
  REVOKE = 'REVOKE',                        // 撤销
}
```

### 4.3 订单服务

```typescript
@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private subscriptionService: SubscriptionService,
    private appleService: AppleStoreService,
  ) {}

  // 从 Apple 通知创建/更新订单
  async processAppleNotification(
    notification: AppleServerNotification,
  ): Promise<void> {
    const { notificationType, data } = notification;
    const transactionInfo = data.signedTransactionInfo;
    const renewalInfo = data.signedRenewalInfo;

    // 解析交易信息
    const transaction = await this.appleService.decodeTransaction(transactionInfo);

    // 查找或创建订单
    let order = await this.findByOriginalTransactionId(transaction.originalTransactionId);

    if (!order) {
      order = await this.createOrder(transaction);
    }

    // 创建交易记录
    const txRecord = await this.createTransaction(order, transaction, notificationType);

    // 根据通知类型更新订单状态
    switch (notificationType) {
      case 'SUBSCRIBED':
        await this.handleNewSubscription(order, transaction);
        break;

      case 'DID_RENEW':
        await this.handleRenewal(order, transaction);
        break;

      case 'DID_FAIL_TO_RENEW':
        await this.handleRenewalFailure(order, transaction);
        break;

      case 'REFUND':
        await this.handleRefund(order, transaction);
        break;

      case 'REVOKE':
        await this.handleRevoke(order, transaction);
        break;

      // ... 其他类型
    }
  }

  private async handleRefund(order: Order, transaction: AppleTransaction) {
    // 1. 更新订单状态
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.REFUNDED,
        refundedAt: new Date(),
        refundAmount: transaction.price,
      },
    });

    // 2. 更新用户订阅状态
    await this.subscriptionService.updateStatus(
      order.userId,
      SubscriptionStatus.REFUNDED,
    );

    // 3. 创建工单（如果需要跟进）
    await this.ticketService.createSystemTicket({
      userId: order.userId,
      category: 'REFUND_PROCESSED',
      title: '退款已处理',
      description: `订单 ${order.id} 已退款 ${transaction.price}`,
      priority: TicketPriority.LOW,
    });

    // 4. 发送通知
    await this.notificationService.sendRefundNotification(order.userId, order);
  }

  // 查询用户订单历史
  async getUserOrders(userId: string, options: OrderQueryOptions): Promise<PaginatedOrders> {
    const { page = 1, limit = 20, status } = options;

    const where: Prisma.OrderWhereInput = { userId };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 订单详情（包含完整交易历史）
  async getOrderDetail(orderId: string): Promise<OrderDetail> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { id: true, email: true, displayName: true },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
        subscription: true,
        refundRequests: {
          orderBy: { createdAt: 'desc' },
        },
        relatedTickets: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
```

### 4.4 退款处理流程

```typescript
@Injectable()
export class RefundService {
  // 客服发起退款请求
  async createRefundRequest(
    orderId: string,
    request: CreateRefundRequestDto,
    adminId: string,
  ): Promise<RefundRequest> {
    const order = await this.orderService.getOrderDetail(orderId);

    // 验证订单可退款
    this.validateRefundEligibility(order);

    // 创建退款请求记录
    const refundRequest = await this.prisma.refundRequest.create({
      data: {
        orderId,
        userId: order.userId,
        amount: request.amount || order.amount,
        reason: request.reason,
        internalNote: request.internalNote,
        requestedBy: adminId,
        status: RefundRequestStatus.PENDING,
      },
    });

    // 根据退款类型处理
    if (request.type === 'APPLE_REFUND') {
      // 通过 Apple API 发起退款
      await this.initiateAppleRefund(order, refundRequest);
    } else if (request.type === 'CREDIT') {
      // 账户余额/积分补偿
      await this.issueCredit(order.userId, request.amount, refundRequest);
    } else if (request.type === 'EXTEND_SUBSCRIPTION') {
      // 延长订阅期作为补偿
      await this.extendSubscription(order.userId, request.extensionDays);
    }

    return refundRequest;
  }

  private async initiateAppleRefund(order: Order, refundRequest: RefundRequest) {
    try {
      // 调用 App Store Connect API
      const result = await this.appleService.requestRefund(
        order.originalTransactionId,
        refundRequest.reason,
      );

      // 更新状态为处理中（等待 Apple 处理）
      await this.prisma.refundRequest.update({
        where: { id: refundRequest.id },
        data: {
          status: RefundRequestStatus.PROCESSING,
          appleRefundId: result.refundId,
        },
      });

    } catch (error) {
      // 记录失败
      await this.prisma.refundRequest.update({
        where: { id: refundRequest.id },
        data: {
          status: RefundRequestStatus.FAILED,
          failureReason: error.message,
        },
      });
      throw error;
    }
  }

  // 处理 Apple 退款通知
  async handleAppleRefundNotification(notification: AppleRefundNotification) {
    const refundRequest = await this.prisma.refundRequest.findFirst({
      where: { appleRefundId: notification.refundId },
    });

    if (refundRequest) {
      await this.prisma.refundRequest.update({
        where: { id: refundRequest.id },
        data: {
          status: notification.success
            ? RefundRequestStatus.COMPLETED
            : RefundRequestStatus.REJECTED,
          completedAt: new Date(),
        },
      });
    }
  }
}

enum RefundRequestStatus {
  PENDING = 'PENDING',           // 待处理
  PROCESSING = 'PROCESSING',     // 处理中
  COMPLETED = 'COMPLETED',       // 已完成
  REJECTED = 'REJECTED',         // 被拒绝
  FAILED = 'FAILED',             // 失败
  CANCELLED = 'CANCELLED',       // 已取消
}
```

---

## 5. Dashboard 客服管理

### 5.1 Dashboard 页面结构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Dashboard 客服模块                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📊 概览仪表盘 (/dashboard/support)                                     │
│     ├── 今日统计（新工单、已解决、待处理）                               │
│     ├── SLA 达成率                                                      │
│     ├── 客服工作量分布                                                  │
│     └── 紧急工单提醒                                                    │
│                                                                         │
│  📝 工单管理 (/dashboard/tickets)                                       │
│     ├── 工单列表（筛选、排序、搜索）                                     │
│     ├── 工单详情页                                                      │
│     ├── 批量操作                                                        │
│     └── 工单分配                                                        │
│                                                                         │
│  💬 反馈管理 (/dashboard/feedback)                                      │
│     ├── 反馈列表                                                        │
│     ├── 反馈详情                                                        │
│     └── 转工单操作                                                      │
│                                                                         │
│  💳 订单管理 (/dashboard/orders)                                        │
│     ├── 订单列表                                                        │
│     ├── 订单详情                                                        │
│     ├── 退款管理                                                        │
│     └── 交易记录                                                        │
│                                                                         │
│  👥 用户管理 (/dashboard/users) [已有]                                  │
│     └── 扩展：订阅管理、工单历史                                         │
│                                                                         │
│  ⚙️ 客服设置 (/dashboard/support/settings)                              │
│     ├── 快捷回复模板                                                    │
│     ├── 自动回复规则                                                    │
│     ├── SLA 配置                                                        │
│     └── 客服人员管理                                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 工单列表页

```tsx
// apps/dashboard/src/pages/tickets/index.tsx
import {
  List,
  Datagrid,
  TextField,
  DateField,
  ReferenceField,
  FunctionField,
  FilterList,
  FilterListItem,
  SelectInput,
  TextInput,
  useListContext,
  TopToolbar,
  ExportButton,
  BulkActionsToolbar,
  BulkUpdateButton,
} from 'react-admin';
import { Chip, Box, Badge, Card, CardContent, Typography } from '@mui/material';

// 工单列表
export const TicketList = () => {
  return (
    <List
      filters={ticketFilters}
      sort={{ field: 'createdAt', order: 'DESC' }}
      aside={<TicketFilterSidebar />}
      actions={<TicketListActions />}
    >
      <Datagrid
        rowClick="show"
        bulkActionButtons={<TicketBulkActions />}
      >
        <TextField source="ticketNumber" label="工单号" />

        <FunctionField
          label="优先级"
          render={(record: Ticket) => (
            <PriorityBadge priority={record.priority} />
          )}
        />

        <FunctionField
          label="状态"
          render={(record: Ticket) => (
            <StatusChip status={record.status} />
          )}
        />

        <TextField source="category" label="分类" />

        <TextField source="subject" label="主题" />

        <ReferenceField source="userId" reference="users" label="用户">
          <TextField source="email" />
        </ReferenceField>

        <ReferenceField source="assigneeId" reference="admins" label="处理人">
          <TextField source="name" />
        </ReferenceField>

        <FunctionField
          label="SLA"
          render={(record: Ticket) => (
            <SLAIndicator ticket={record} />
          )}
        />

        <DateField source="createdAt" label="创建时间" showTime />

        <DateField source="updatedAt" label="更新时间" showTime />
      </Datagrid>
    </List>
  );
};

// 工单筛选器
const ticketFilters = [
  <TextInput source="q" label="搜索" alwaysOn />,
  <SelectInput
    source="status"
    label="状态"
    choices={[
      { id: 'NEW', name: '新建' },
      { id: 'ASSIGNED', name: '已分配' },
      { id: 'IN_PROGRESS', name: '处理中' },
      { id: 'PENDING', name: '待用户回复' },
      { id: 'RESOLVED', name: '已解决' },
      { id: 'CLOSED', name: '已关闭' },
    ]}
  />,
  <SelectInput
    source="priority"
    label="优先级"
    choices={[
      { id: 'URGENT', name: '紧急' },
      { id: 'HIGH', name: '高' },
      { id: 'MEDIUM', name: '中' },
      { id: 'LOW', name: '低' },
    ]}
  />,
  <SelectInput
    source="category"
    label="分类"
    choices={categoryChoices}
  />,
];

// 侧边栏快捷筛选
const TicketFilterSidebar = () => (
  <Card sx={{ width: 240, mr: 2 }}>
    <CardContent>
      <FilterList label="我的工单" icon={<PersonIcon />}>
        <FilterListItem label="分配给我" value={{ assigneeId: 'me' }} />
        <FilterListItem label="我创建的" value={{ createdBy: 'me' }} />
      </FilterList>

      <FilterList label="快捷筛选" icon={<FilterIcon />}>
        <FilterListItem
          label="未分配"
          value={{ status: 'NEW', assigneeId: null }}
        />
        <FilterListItem
          label="SLA 即将超时"
          value={{ slaWarning: true }}
        />
        <FilterListItem
          label="等待回复 >24h"
          value={{ pendingOverdue: true }}
        />
      </FilterList>

      <FilterList label="分类" icon={<CategoryIcon />}>
        <FilterListItem label="订阅问题" value={{ category: 'SUBSCRIPTION' }} />
        <FilterListItem label="支付问题" value={{ category: 'PAYMENT' }} />
        <FilterListItem label="技术问题" value={{ category: 'BUG' }} />
        <FilterListItem label="功能建议" value={{ category: 'FEATURE_REQUEST' }} />
      </FilterList>
    </CardContent>
  </Card>
);

// 批量操作
const TicketBulkActions = () => (
  <>
    <BulkUpdateButton
      label="批量分配"
      data={{ assigneeId: 'PROMPT' }}
      icon={<AssignmentIndIcon />}
    />
    <BulkUpdateButton
      label="批量关闭"
      data={{ status: 'CLOSED' }}
      icon={<CheckIcon />}
    />
    <BulkUpdateButton
      label="批量标记垃圾"
      data={{ status: 'SPAM' }}
      icon={<DeleteIcon />}
    />
  </>
);

// SLA 指示器组件
const SLAIndicator = ({ ticket }: { ticket: Ticket }) => {
  const slaStatus = calculateSLAStatus(ticket);

  const colors = {
    ok: 'success',
    warning: 'warning',
    breached: 'error',
  };

  return (
    <Chip
      size="small"
      label={slaStatus.label}
      color={colors[slaStatus.status]}
      icon={slaStatus.status === 'breached' ? <WarningIcon /> : undefined}
    />
  );
};
```

### 5.3 工单详情页

```tsx
// apps/dashboard/src/pages/tickets/[id]/show.tsx
export const TicketShow = () => {
  const { record: ticket } = useShowController<Ticket>();

  return (
    <Show>
      <TabbedShowLayout>
        {/* 工单信息 Tab */}
        <TabbedShowLayout.Tab label="工单信息">
          <Grid container spacing={3}>
            {/* 左侧：工单详情 */}
            <Grid item xs={8}>
              <Card>
                <CardHeader
                  title={ticket?.subject}
                  subheader={`#${ticket?.ticketNumber}`}
                  action={
                    <Box>
                      <PriorityBadge priority={ticket?.priority} />
                      <StatusChip status={ticket?.status} />
                    </Box>
                  }
                />
                <CardContent>
                  {/* 工单描述 */}
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {ticket?.description}
                  </Typography>

                  {/* 附件 */}
                  {ticket?.attachments?.length > 0 && (
                    <AttachmentGallery attachments={ticket.attachments} />
                  )}

                  {/* 诊断信息 */}
                  {ticket?.diagnosticInfo && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>诊断信息</Typography>
                      </AccordionSummary>
                      <AccordionContent>
                        <DiagnosticInfoDisplay info={ticket.diagnosticInfo} />
                      </AccordionContent>
                    </Accordion>
                  )}
                </CardContent>
              </Card>

              {/* 对话记录 */}
              <Card sx={{ mt: 2 }}>
                <CardHeader title="对话记录" />
                <CardContent>
                  <TicketConversation ticketId={ticket?.id} />
                </CardContent>
              </Card>

              {/* 回复框 */}
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <TicketReplyForm ticketId={ticket?.id} />
                </CardContent>
              </Card>
            </Grid>

            {/* 右侧：用户信息和操作 */}
            <Grid item xs={4}>
              {/* 用户信息卡片 */}
              <UserInfoCard userId={ticket?.userId} />

              {/* 订阅信息 */}
              <SubscriptionInfoCard userId={ticket?.userId} />

              {/* 工单操作 */}
              <TicketActionsCard ticket={ticket} />

              {/* 工单历史 */}
              <TicketHistoryCard ticketId={ticket?.id} />
            </Grid>
          </Grid>
        </TabbedShowLayout.Tab>

        {/* 用户历史 Tab */}
        <TabbedShowLayout.Tab label="用户历史">
          <UserTicketHistory userId={ticket?.userId} />
          <UserOrderHistory userId={ticket?.userId} />
        </TabbedShowLayout.Tab>

        {/* 关联订单 Tab */}
        <TabbedShowLayout.Tab label="关联订单">
          <RelatedOrders userId={ticket?.userId} />
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
};

// 工单回复表单
const TicketReplyForm = ({ ticketId }: { ticketId: string }) => {
  const [reply, setReply] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [templates, setTemplates] = useState<ReplyTemplate[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // 加载 AI 建议回复
  useEffect(() => {
    loadSuggestions(ticketId).then(setSuggestions);
  }, [ticketId]);

  const handleSubmit = async () => {
    await createTicketMessage({
      ticketId,
      content: reply,
      isInternal,
    });
    setReply('');
  };

  return (
    <Box>
      {/* 快捷回复模板 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">快捷回复</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {templates.map(t => (
            <Chip
              key={t.id}
              label={t.name}
              onClick={() => setReply(t.content)}
              size="small"
            />
          ))}
        </Box>
      </Box>

      {/* AI 建议 */}
      {suggestions.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">AI 建议回复</Typography>
          {suggestions.map((s, i) => (
            <Card key={i} sx={{ mb: 1, cursor: 'pointer' }} onClick={() => setReply(s)}>
              <CardContent>
                <Typography variant="body2">{s.substring(0, 100)}...</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* 回复输入框 */}
      <TextField
        fullWidth
        multiline
        rows={4}
        value={reply}
        onChange={e => setReply(e.target.value)}
        placeholder="输入回复内容..."
      />

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <FormControlLabel
          control={
            <Switch
              checked={isInternal}
              onChange={e => setIsInternal(e.target.checked)}
            />
          }
          label="内部备注（用户不可见）"
        />

        <Box>
          <Button onClick={handleSubmit} variant="contained">
            发送回复
          </Button>
          <Button
            onClick={() => handleSubmitAndClose()}
            variant="outlined"
            sx={{ ml: 1 }}
          >
            发送并关闭
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

// 工单操作卡片
const TicketActionsCard = ({ ticket }: { ticket: Ticket }) => {
  const [update] = useUpdate();

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader title="操作" />
      <CardContent>
        {/* 状态变更 */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>状态</InputLabel>
          <Select
            value={ticket.status}
            onChange={e => update('tickets', {
              id: ticket.id,
              data: { status: e.target.value },
            })}
          >
            {statusOptions.map(s => (
              <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 优先级变更 */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>优先级</InputLabel>
          <Select
            value={ticket.priority}
            onChange={e => update('tickets', {
              id: ticket.id,
              data: { priority: e.target.value },
            })}
          >
            {priorityOptions.map(p => (
              <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 分配客服 */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>分配给</InputLabel>
          <Select
            value={ticket.assigneeId || ''}
            onChange={e => update('tickets', {
              id: ticket.id,
              data: { assigneeId: e.target.value },
            })}
          >
            {agents.map(a => (
              <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        {/* 快捷操作 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={() => assignToMe(ticket.id)}
          >
            分配给我
          </Button>

          <Button
            variant="outlined"
            startIcon={<EscalateIcon />}
            onClick={() => escalateTicket(ticket.id)}
          >
            升级工单
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<MergeIcon />}
            onClick={() => mergeTicket(ticket.id)}
          >
            合并工单
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
```

### 5.4 订单管理页

```tsx
// apps/dashboard/src/pages/orders/index.tsx
export const OrderList = () => {
  return (
    <List
      filters={orderFilters}
      sort={{ field: 'createdAt', order: 'DESC' }}
    >
      <Datagrid rowClick="show">
        <TextField source="orderNumber" label="订单号" />

        <FunctionField
          label="状态"
          render={(record: Order) => (
            <OrderStatusChip status={record.status} />
          )}
        />

        <ReferenceField source="userId" reference="users" label="用户">
          <TextField source="email" />
        </ReferenceField>

        <TextField source="productId" label="产品" />

        <FunctionField
          label="金额"
          render={(record: Order) => (
            <Typography>
              {formatCurrency(record.amount, record.currency)}
            </Typography>
          )}
        />

        <TextField source="source" label="来源" />

        <DateField source="createdAt" label="创建时间" showTime />

        <DateField source="expiresAt" label="到期时间" showTime />
      </Datagrid>
    </List>
  );
};

// 订单详情页
export const OrderShow = () => {
  const { record: order } = useShowController<Order>();

  return (
    <Show>
      <SimpleShowLayout>
        <Grid container spacing={3}>
          {/* 订单基本信息 */}
          <Grid item xs={8}>
            <Card>
              <CardHeader
                title={`订单 #${order?.orderNumber}`}
                action={<OrderStatusChip status={order?.status} />}
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <LabeledField label="产品">
                      {order?.productId}
                    </LabeledField>
                  </Grid>
                  <Grid item xs={6}>
                    <LabeledField label="金额">
                      {formatCurrency(order?.amount, order?.currency)}
                    </LabeledField>
                  </Grid>
                  <Grid item xs={6}>
                    <LabeledField label="来源">
                      {order?.source}
                    </LabeledField>
                  </Grid>
                  <Grid item xs={6}>
                    <LabeledField label="创建时间">
                      {formatDateTime(order?.createdAt)}
                    </LabeledField>
                  </Grid>
                  <Grid item xs={6}>
                    <LabeledField label="开始时间">
                      {formatDateTime(order?.startedAt)}
                    </LabeledField>
                  </Grid>
                  <Grid item xs={6}>
                    <LabeledField label="到期时间">
                      {formatDateTime(order?.expiresAt)}
                    </LabeledField>
                  </Grid>
                </Grid>

                {/* Apple 交易信息 */}
                {order?.appleInfo && (
                  <Accordion sx={{ mt: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Apple 交易信息</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <AppleTransactionInfo info={order.appleInfo} />
                    </AccordionDetails>
                  </Accordion>
                )}
              </CardContent>
            </Card>

            {/* 交易历史 */}
            <Card sx={{ mt: 2 }}>
              <CardHeader title="交易历史" />
              <CardContent>
                <TransactionTimeline transactions={order?.transactions} />
              </CardContent>
            </Card>

            {/* 退款记录 */}
            {order?.refundRequests?.length > 0 && (
              <Card sx={{ mt: 2 }}>
                <CardHeader title="退款记录" />
                <CardContent>
                  <RefundRequestList requests={order.refundRequests} />
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* 右侧：用户信息和操作 */}
          <Grid item xs={4}>
            <UserInfoCard userId={order?.userId} />

            <SubscriptionInfoCard userId={order?.userId} />

            {/* 订单操作 */}
            <OrderActionsCard order={order} />
          </Grid>
        </Grid>
      </SimpleShowLayout>
    </Show>
  );
};

// 订单操作卡片
const OrderActionsCard = ({ order }: { order: Order }) => {
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showExtendDialog, setShowExtendDialog] = useState(false);

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader title="操作" />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* 发起退款 */}
          {order.status === 'ACTIVE' && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<RefundIcon />}
              onClick={() => setShowRefundDialog(true)}
            >
              发起退款
            </Button>
          )}

          {/* 延长订阅 */}
          <Button
            variant="outlined"
            startIcon={<ExtendIcon />}
            onClick={() => setShowExtendDialog(true)}
          >
            延长订阅
          </Button>

          {/* 创建工单 */}
          <Button
            variant="outlined"
            startIcon={<TicketIcon />}
            onClick={() => createRelatedTicket(order)}
          >
            创建关联工单
          </Button>

          {/* 发送收据 */}
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={() => resendReceipt(order.id)}
          >
            重发收据
          </Button>
        </Box>
      </CardContent>

      {/* 退款对话框 */}
      <RefundDialog
        open={showRefundDialog}
        onClose={() => setShowRefundDialog(false)}
        order={order}
      />

      {/* 延长订阅对话框 */}
      <ExtendSubscriptionDialog
        open={showExtendDialog}
        onClose={() => setShowExtendDialog(false)}
        order={order}
      />
    </Card>
  );
};

// 退款对话框
const RefundDialog = ({ open, onClose, order }: RefundDialogProps) => {
  const [refundType, setRefundType] = useState<'APPLE_REFUND' | 'CREDIT' | 'EXTEND'>('APPLE_REFUND');
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState(order.amount);
  const [extensionDays, setExtensionDays] = useState(7);
  const [internalNote, setInternalNote] = useState('');

  const handleSubmit = async () => {
    await createRefundRequest({
      orderId: order.id,
      type: refundType,
      reason,
      amount: refundType === 'APPLE_REFUND' ? amount : undefined,
      extensionDays: refundType === 'EXTEND' ? extensionDays : undefined,
      internalNote,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>发起退款/补偿</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>处理方式</InputLabel>
          <Select value={refundType} onChange={e => setRefundType(e.target.value)}>
            <MenuItem value="APPLE_REFUND">Apple 退款（真实退款）</MenuItem>
            <MenuItem value="CREDIT">账户积分补偿</MenuItem>
            <MenuItem value="EXTEND">延长订阅期</MenuItem>
          </Select>
        </FormControl>

        {refundType === 'APPLE_REFUND' && (
          <TextField
            fullWidth
            label="退款金额"
            type="number"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            sx={{ mt: 2 }}
            InputProps={{
              startAdornment: <Typography>$</Typography>,
            }}
          />
        )}

        {refundType === 'EXTEND' && (
          <TextField
            fullWidth
            label="延长天数"
            type="number"
            value={extensionDays}
            onChange={e => setExtensionDays(Number(e.target.value))}
            sx={{ mt: 2 }}
          />
        )}

        <TextField
          fullWidth
          label="退款原因（用户可见）"
          value={reason}
          onChange={e => setReason(e.target.value)}
          sx={{ mt: 2 }}
          multiline
          rows={2}
        />

        <TextField
          fullWidth
          label="内部备注"
          value={internalNote}
          onChange={e => setInternalNote(e.target.value)}
          sx={{ mt: 2 }}
          multiline
          rows={2}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleSubmit} variant="contained" color="warning">
          确认
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

### 5.5 客服人员权限

```typescript
// 客服角色定义
enum SupportRole {
  SUPPORT_AGENT = 'SUPPORT_AGENT',     // 一线客服
  SUPPORT_LEAD = 'SUPPORT_LEAD',       // 客服主管
  SUPPORT_ADMIN = 'SUPPORT_ADMIN',     // 客服管理员
}

// 权限定义
const supportPermissions: Record<SupportRole, Permission[]> = {
  [SupportRole.SUPPORT_AGENT]: [
    // 工单
    'ticket:read',
    'ticket:reply',
    'ticket:update_status',
    'ticket:assign_self',

    // 反馈
    'feedback:read',
    'feedback:convert_to_ticket',

    // 订单
    'order:read',

    // 用户
    'user:read',
    'user:subscription:read',
  ],

  [SupportRole.SUPPORT_LEAD]: [
    // 继承 AGENT 权限
    ...supportPermissions[SupportRole.SUPPORT_AGENT],

    // 额外权限
    'ticket:assign_others',
    'ticket:escalate',
    'ticket:merge',
    'ticket:bulk_update',

    'order:refund:request',    // 可以发起退款请求
    'order:extend',            // 可以延长订阅

    'user:subscription:update', // 可以修改订阅

    'report:read',             // 可以查看报表
  ],

  [SupportRole.SUPPORT_ADMIN]: [
    // 全部权限
    'ticket:*',
    'feedback:*',
    'order:*',
    'user:*',
    'report:*',
    'settings:*',

    'admin:manage_agents',     // 管理客服人员
    'admin:configure_sla',     // 配置 SLA
    'admin:configure_templates', // 配置回复模板
  ],
};
```

---

## 6. API 接口设计

### 6.1 反馈 API

```typescript
// ===== 客户端 API =====

// 提交反馈
POST /api/feedback
Request:
{
  category: FeedbackCategory;
  description: string;
  contactEmail?: string;
  attachmentUrls?: string[];
  diagnosticInfo: DiagnosticInfo;
  context?: FeedbackContext;
}
Response:
{
  id: string;
  ticketNumber: string;
  status: 'RECEIVED';
  message: string;
}

// 上传附件
POST /api/feedback/attachments
Request: FormData { file: File }
Response:
{
  url: string;
  key: string;
}

// 获取反馈历史
GET /api/feedback/history
Response:
{
  data: Feedback[];
  pagination: Pagination;
}

// ===== Dashboard API =====

// 反馈列表
GET /api/admin/feedback
Query: { page, limit, status, category, search }
Response:
{
  data: Feedback[];
  pagination: Pagination;
}

// 反馈详情
GET /api/admin/feedback/:id
Response: FeedbackDetail

// 转为工单
POST /api/admin/feedback/:id/convert-to-ticket
Request:
{
  priority?: TicketPriority;
  assigneeId?: string;
  additionalNote?: string;
}
Response: Ticket
```

### 6.2 工单 API

```typescript
// ===== Dashboard API =====

// 工单列表
GET /api/admin/tickets
Query: {
  page: number;
  limit: number;
  status?: TicketStatus | TicketStatus[];
  priority?: TicketPriority;
  category?: FeedbackCategory;
  assigneeId?: string;
  userId?: string;
  search?: string;
  slaWarning?: boolean;
  createdAfter?: string;
  createdBefore?: string;
}
Response:
{
  data: Ticket[];
  pagination: Pagination;
  stats: {
    total: number;
    byStatus: Record<TicketStatus, number>;
    byPriority: Record<TicketPriority, number>;
  };
}

// 工单详情
GET /api/admin/tickets/:id
Response: TicketDetail

// 更新工单
PATCH /api/admin/tickets/:id
Request:
{
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: string;
  category?: FeedbackCategory;
  tags?: string[];
}

// 添加回复
POST /api/admin/tickets/:id/messages
Request:
{
  content: string;
  isInternal: boolean;
  attachments?: string[];
}

// 获取消息历史
GET /api/admin/tickets/:id/messages
Response:
{
  data: TicketMessage[];
}

// 分配工单
POST /api/admin/tickets/:id/assign
Request:
{
  assigneeId: string;
  note?: string;
}

// 升级工单
POST /api/admin/tickets/:id/escalate
Request:
{
  reason: string;
  targetTeam?: string;
}

// 合并工单
POST /api/admin/tickets/:id/merge
Request:
{
  targetTicketId: string;
  reason?: string;
}

// 批量更新
POST /api/admin/tickets/bulk-update
Request:
{
  ticketIds: string[];
  updates: {
    status?: TicketStatus;
    priority?: TicketPriority;
    assigneeId?: string;
  };
}

// 获取 AI 回复建议
GET /api/admin/tickets/:id/suggestions
Response:
{
  suggestions: string[];
}

// 工单统计
GET /api/admin/tickets/stats
Query: { period: 'day' | 'week' | 'month' }
Response:
{
  overview: {
    totalTickets: number;
    openTickets: number;
    resolvedToday: number;
    avgResolutionTime: number;
    slaComplianceRate: number;
  };
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  byAgent: AgentStats[];
  trends: TrendData[];
}
```

### 6.3 订单 API

```typescript
// ===== Dashboard API =====

// 订单列表
GET /api/admin/orders
Query: {
  page: number;
  limit: number;
  status?: OrderStatus;
  userId?: string;
  productId?: string;
  source?: SubscriptionSource;
  createdAfter?: string;
  createdBefore?: string;
}
Response:
{
  data: Order[];
  pagination: Pagination;
}

// 订单详情
GET /api/admin/orders/:id
Response: OrderDetail

// 获取用户订单
GET /api/admin/users/:userId/orders
Response:
{
  data: Order[];
  pagination: Pagination;
}

// 发起退款
POST /api/admin/orders/:id/refund
Request:
{
  type: 'APPLE_REFUND' | 'CREDIT' | 'EXTEND';
  amount?: number;
  extensionDays?: number;
  reason: string;
  internalNote?: string;
}
Response:
{
  refundRequestId: string;
  status: RefundRequestStatus;
}

// 延长订阅
POST /api/admin/orders/:id/extend
Request:
{
  days: number;
  reason: string;
}

// 重发收据
POST /api/admin/orders/:id/resend-receipt
Response:
{
  sent: boolean;
}

// 退款请求列表
GET /api/admin/refund-requests
Query: { page, limit, status, orderId }
Response:
{
  data: RefundRequest[];
  pagination: Pagination;
}

// 订单统计
GET /api/admin/orders/stats
Query: { period: 'day' | 'week' | 'month' }
Response:
{
  revenue: {
    total: number;
    recurring: number;
    new: number;
  };
  subscriptions: {
    active: number;
    trial: number;
    cancelled: number;
    churned: number;
  };
  refunds: {
    count: number;
    amount: number;
    rate: number;
  };
  trends: TrendData[];
}
```

---

## 7. 数据模型设计

### 7.1 完整数据模型

```prisma
// ===== 反馈模型 =====
model Feedback {
  id          String   @id @default(uuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])

  // 反馈内容
  category    FeedbackCategory
  description String
  contactEmail String?

  // 附件
  attachments FeedbackAttachment[]

  // 诊断信息
  diagnosticInfo Json?

  // 上下文
  context     Json?    // FeedbackContext

  // 状态
  status      FeedbackStatus @default(NEW)

  // 转工单
  convertedToTicketId String?
  convertedToTicket   Ticket? @relation(fields: [convertedToTicketId], references: [id])

  // 处理
  processedBy   String?
  processedAt   DateTime?
  processorNote String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([status])
  @@index([category])
  @@index([createdAt])
}

model FeedbackAttachment {
  id         String   @id @default(uuid())
  feedbackId String
  feedback   Feedback @relation(fields: [feedbackId], references: [id], onDelete: Cascade)

  url        String
  key        String
  filename   String
  mimeType   String
  size       Int

  createdAt  DateTime @default(now())

  @@index([feedbackId])
}

enum FeedbackCategory {
  BUG
  FEATURE_NOT_WORKING
  BOOK_CONTENT
  TRANSLATION
  AI_RESPONSE
  SUBSCRIPTION
  PAYMENT
  REFUND
  ACCOUNT
  LOGIN
  DATA_SYNC
  FEATURE_REQUEST
  IMPROVEMENT
  OTHER
}

enum FeedbackStatus {
  NEW
  PROCESSING
  CONVERTED_TO_TICKET
  RESOLVED
  SPAM
}

// ===== 工单模型 =====
model Ticket {
  id            String   @id @default(uuid())
  ticketNumber  String   @unique // 格式: TK-20241215-0001

  userId        String
  user          User     @relation(fields: [userId], references: [id])

  // 工单内容
  subject       String
  description   String
  category      FeedbackCategory

  // 状态
  status        TicketStatus   @default(NEW)
  priority      TicketPriority @default(MEDIUM)

  // 分配
  assigneeId    String?
  assignee      Admin?   @relation("TicketAssignee", fields: [assigneeId], references: [id])

  // 来源
  source        TicketSource
  sourceFeedbackId String?
  sourceFeedback   Feedback? @relation(fields: [sourceFeedbackId], references: [id])

  // SLA
  firstResponseAt  DateTime?
  firstResponseDue DateTime?
  resolutionDue    DateTime?
  resolvedAt       DateTime?
  closedAt         DateTime?

  // 附件和诊断信息
  attachments      TicketAttachment[]
  diagnosticInfo   Json?

  // 消息
  messages         TicketMessage[]

  // 标签
  tags             String[]

  // 关联订单
  relatedOrders    Order[]

  // 升级
  escalatedAt      DateTime?
  escalatedTo      String?
  escalationReason String?

  // 合并
  mergedIntoId     String?
  mergedInto       Ticket?  @relation("TicketMerge", fields: [mergedIntoId], references: [id])
  mergedTickets    Ticket[] @relation("TicketMerge")

  // 历史
  history          TicketHistory[]

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([userId])
  @@index([status])
  @@index([priority])
  @@index([assigneeId])
  @@index([createdAt])
  @@index([firstResponseDue])
  @@index([resolutionDue])
}

model TicketMessage {
  id          String   @id @default(uuid())
  ticketId    String
  ticket      Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  // 发送者
  senderId    String?  // null = 系统消息
  senderType  MessageSenderType

  // 内容
  content     String
  isInternal  Boolean  @default(false) // 内部备注

  // 附件
  attachments String[] // URLs

  // 通知状态
  notifiedAt  DateTime?

  createdAt   DateTime @default(now())

  @@index([ticketId])
  @@index([createdAt])
}

model TicketHistory {
  id          String   @id @default(uuid())
  ticketId    String
  ticket      Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  // 变更信息
  action      TicketAction
  field       String?
  oldValue    String?
  newValue    String?

  // 操作者
  actorId     String?
  actorType   ActorType

  createdAt   DateTime @default(now())

  @@index([ticketId])
  @@index([createdAt])
}

model TicketAttachment {
  id         String   @id @default(uuid())
  ticketId   String
  ticket     Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  url        String
  key        String
  filename   String
  mimeType   String
  size       Int

  createdAt  DateTime @default(now())

  @@index([ticketId])
}

enum TicketStatus {
  NEW
  AUTO_REPLIED
  ASSIGNED
  IN_PROGRESS
  PENDING
  ON_HOLD
  ESCALATED
  RESOLVED
  CLOSED
  SPAM
  DUPLICATE
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TicketSource {
  USER_FEEDBACK
  EMAIL
  SYSTEM
  ADMIN
}

enum MessageSenderType {
  USER
  AGENT
  SYSTEM
}

enum TicketAction {
  CREATED
  STATUS_CHANGED
  PRIORITY_CHANGED
  ASSIGNED
  ESCALATED
  MERGED
  MESSAGE_ADDED
  RESOLVED
  CLOSED
  REOPENED
}

enum ActorType {
  USER
  AGENT
  SYSTEM
}

// ===== 订单模型 =====
model Order {
  id            String   @id @default(uuid())
  orderNumber   String   @unique // 格式: ORD-20241215-0001

  userId        String
  user          User     @relation(fields: [userId], references: [id])

  // 产品信息
  productId     String   // com.readmigo.pro.yearly
  productName   String
  planType      PlanType

  // 金额
  amount        Decimal  @db.Decimal(10, 2)
  currency      String   @default("USD")

  // 状态
  status        OrderStatus @default(ACTIVE)

  // 来源
  source        SubscriptionSource

  // 时间
  startedAt     DateTime
  expiresAt     DateTime?
  cancelledAt   DateTime?
  refundedAt    DateTime?

  // Apple 信息
  appleOriginalTransactionId String?
  appleTransactionId         String?
  appleEnvironment           AppleEnvironment?
  appleProductId             String?

  // 交易记录
  transactions  Transaction[]

  // 退款请求
  refundRequests RefundRequest[]

  // 关联工单
  relatedTickets Ticket[]

  // 关联订阅
  subscriptionId String?
  subscription   Subscription? @relation(fields: [subscriptionId], references: [id])

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
  @@index([status])
  @@index([appleOriginalTransactionId])
  @@index([createdAt])
}

model Transaction {
  id          String   @id @default(uuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id])

  // 交易类型
  type        TransactionType

  // 金额
  amount      Decimal  @db.Decimal(10, 2)
  currency    String   @default("USD")

  // Apple 交易 ID
  appleTransactionId String?

  // 状态
  status      TransactionStatus @default(COMPLETED)
  failureReason String?

  createdAt   DateTime @default(now())

  @@index([orderId])
  @@index([createdAt])
}

model RefundRequest {
  id          String   @id @default(uuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id])
  userId      String

  // 退款类型
  type        RefundType

  // 金额/补偿
  amount      Decimal? @db.Decimal(10, 2)
  extensionDays Int?

  // 原因
  reason      String
  internalNote String?

  // 状态
  status      RefundRequestStatus @default(PENDING)
  failureReason String?

  // Apple 退款 ID
  appleRefundId String?

  // 处理信息
  requestedBy String   // Admin ID
  processedBy String?
  processedAt DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([orderId])
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

enum OrderStatus {
  ACTIVE
  COMPLETED
  PENDING_PAYMENT
  PAYMENT_FAILED
  REFUND_REQUESTED
  REFUNDED
  PARTIALLY_REFUNDED
  CANCELLED
  REVOKED
}

enum TransactionType {
  INITIAL_PURCHASE
  RENEWAL
  UPGRADE
  DOWNGRADE
  REFUND
  REVOKE
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

enum RefundType {
  APPLE_REFUND
  CREDIT
  EXTEND_SUBSCRIPTION
}

enum RefundRequestStatus {
  PENDING
  PROCESSING
  COMPLETED
  REJECTED
  FAILED
  CANCELLED
}

// ===== 回复模板 =====
model ReplyTemplate {
  id          String   @id @default(uuid())

  name        String
  category    FeedbackCategory?
  content     String
  variables   String[] // 可用变量: {{user_name}}, {{order_id}} 等

  isActive    Boolean  @default(true)

  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])
  @@index([isActive])
}

// ===== 客服人员 =====
model Admin {
  id          String   @id @default(uuid())

  email       String   @unique
  name        String
  role        AdminRole

  // 客服专属字段
  supportRole SupportRole?
  skills      FeedbackCategory[]
  languages   String[]
  maxTickets  Int      @default(20) // 最大同时处理工单数

  isActive    Boolean  @default(true)

  // 统计
  totalTicketsHandled   Int @default(0)
  avgResolutionTime     Int? // 分钟
  customerSatisfaction  Float?

  assignedTickets Ticket[] @relation("TicketAssignee")

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([supportRole])
  @@index([isActive])
}

enum AdminRole {
  SUPER_ADMIN
  ADMIN
  EDITOR
  SUPPORT_ADMIN
  SUPPORT_LEAD
  SUPPORT_AGENT
}

enum SupportRole {
  SUPPORT_AGENT
  SUPPORT_LEAD
  SUPPORT_ADMIN
}
```

---

## 8. 通知与沟通

### 8.1 通知渠道

```typescript
// 通知类型和渠道配置
const notificationConfig: Record<NotificationType, NotificationChannels> = {
  // 工单相关
  TICKET_CREATED: {
    email: true,       // 发送确认邮件给用户
    push: false,
    inApp: true,
  },
  TICKET_REPLIED: {
    email: true,       // 客服回复时通知用户
    push: true,
    inApp: true,
  },
  TICKET_RESOLVED: {
    email: true,
    push: true,
    inApp: true,
  },
  TICKET_SLA_WARNING: {
    email: false,
    push: false,
    inApp: false,
    slack: true,       // 通知客服团队
  },

  // 订单相关
  ORDER_CREATED: {
    email: true,       // 发送收据
    push: false,
    inApp: true,
  },
  SUBSCRIPTION_EXPIRING: {
    email: true,
    push: true,
    inApp: true,
  },
  REFUND_PROCESSED: {
    email: true,
    push: true,
    inApp: true,
  },
};

// 邮件模板
const emailTemplates = {
  TICKET_CREATED: {
    subject: '[Readmigo] 我们收到了您的反馈 #{{ticketNumber}}',
    template: 'ticket-created',
  },
  TICKET_REPLIED: {
    subject: '[Readmigo] 您的反馈有新回复 #{{ticketNumber}}',
    template: 'ticket-replied',
  },
  TICKET_RESOLVED: {
    subject: '[Readmigo] 您的问题已解决 #{{ticketNumber}}',
    template: 'ticket-resolved',
  },
  REFUND_PROCESSED: {
    subject: '[Readmigo] 退款处理通知',
    template: 'refund-processed',
  },
};
```

### 8.2 邮件模板示例

```html
<!-- templates/ticket-replied.html -->
<!DOCTYPE html>
<html>
<head>
  <style>
    /* 邮件样式 */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="{{logoUrl}}" alt="Readmigo" />
    </div>

    <div class="content">
      <h2>您好，{{userName}}！</h2>

      <p>您的反馈 <strong>#{{ticketNumber}}</strong> 有了新的回复：</p>

      <div class="message-box">
        <div class="agent-info">
          <img src="{{agentAvatar}}" alt="{{agentName}}" />
          <span>{{agentName}}</span>
          <span class="time">{{replyTime}}</span>
        </div>
        <div class="message-content">
          {{replyContent}}
        </div>
      </div>

      <p>如果问题已解决，您可以忽略此邮件。如需继续沟通，请直接回复此邮件。</p>

      <a href="{{ticketUrl}}" class="button">查看详情</a>
    </div>

    <div class="footer">
      <p>此邮件由 Readmigo 自动发送，请勿直接回复。</p>
      <p>如有疑问，请访问 <a href="{{helpUrl}}">帮助中心</a></p>
    </div>
  </div>
</body>
</html>
```

---

## 9. 运营与分析

### 9.1 关键指标

```typescript
// 客服团队 KPI
interface SupportMetrics {
  // 响应指标
  avgFirstResponseTime: number;     // 平均首次响应时间（分钟）
  avgResolutionTime: number;        // 平均解决时间（分钟）
  firstResponseSLARate: number;     // 首响 SLA 达成率
  resolutionSLARate: number;        // 解决 SLA 达成率

  // 工作量指标
  ticketsCreated: number;           // 新建工单数
  ticketsResolved: number;          // 解决工单数
  ticketsReopened: number;          // 重开工单数
  backlogSize: number;              // 积压工单数

  // 质量指标
  customerSatisfaction: number;     // 客户满意度 (CSAT)
  firstContactResolutionRate: number; // 一次解决率
  escalationRate: number;           // 升级率

  // 效率指标
  ticketsPerAgent: number;          // 人均处理量
  avgHandleTime: number;            // 平均处理时长
}

// 订单指标
interface OrderMetrics {
  // 收入指标
  totalRevenue: number;
  newRevenue: number;
  renewalRevenue: number;
  mrr: number;                      // 月度经常性收入
  arr: number;                      // 年度经常性收入

  // 订阅指标
  activeSubscriptions: number;
  newSubscriptions: number;
  churnedSubscriptions: number;
  churnRate: number;
  conversionRate: number;

  // 退款指标
  refundCount: number;
  refundAmount: number;
  refundRate: number;
}
```

### 9.2 Dashboard 报表

```tsx
// apps/dashboard/src/pages/support/dashboard.tsx
export const SupportDashboard = () => {
  const { data: stats } = useQuery('support-stats');

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>客服概览</Typography>

      {/* 今日概要 */}
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <StatCard
            title="今日新工单"
            value={stats.todayNewTickets}
            trend={stats.todayNewTicketsTrend}
            icon={<InboxIcon />}
          />
        </Grid>
        <Grid item xs={3}>
          <StatCard
            title="今日已解决"
            value={stats.todayResolvedTickets}
            trend={stats.todayResolvedTicketsTrend}
            icon={<CheckCircleIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={3}>
          <StatCard
            title="待处理"
            value={stats.pendingTickets}
            icon={<PendingIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={3}>
          <StatCard
            title="SLA 达成率"
            value={`${stats.slaComplianceRate}%`}
            trend={stats.slaComplianceRateTrend}
            icon={<SpeedIcon />}
            color={stats.slaComplianceRate > 90 ? 'success' : 'error'}
          />
        </Grid>
      </Grid>

      {/* 紧急工单 */}
      <Card sx={{ mt: 3 }}>
        <CardHeader
          title="需要关注"
          avatar={<WarningIcon color="error" />}
        />
        <CardContent>
          <List>
            {stats.urgentTickets.map(ticket => (
              <ListItem key={ticket.id}>
                <ListItemText
                  primary={`#${ticket.ticketNumber}: ${ticket.subject}`}
                  secondary={`${ticket.slaStatus} - ${ticket.waitingTime}`}
                />
                <Button size="small" onClick={() => goToTicket(ticket.id)}>
                  处理
                </Button>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* 图表 */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={6}>
          <Card>
            <CardHeader title="工单趋势" />
            <CardContent>
              <TicketTrendChart data={stats.ticketTrend} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card>
            <CardHeader title="分类分布" />
            <CardContent>
              <CategoryPieChart data={stats.categoryDistribution} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 客服工作量 */}
      <Card sx={{ mt: 3 }}>
        <CardHeader title="团队工作量" />
        <CardContent>
          <AgentWorkloadTable data={stats.agentWorkload} />
        </CardContent>
      </Card>
    </Box>
  );
};
```

---

## 10. 实施计划

### Phase 1: 基础反馈系统

**目标**: 用户可以在 App 内提交反馈，后台可以查看

**任务清单**:

#### 1.1 数据库设计
- [ ] 创建 Feedback 模型
- [ ] 创建 FeedbackAttachment 模型
- [ ] 添加相关枚举（FeedbackCategory, FeedbackStatus）
- [ ] 运行数据库迁移

#### 1.2 后端 API
- [ ] 创建 FeedbackModule
- [ ] 实现 FeedbackService
  - [ ] `createFeedback()` - 创建反馈
  - [ ] `uploadAttachment()` - 上传附件到 R2
  - [ ] `getUserFeedbackHistory()` - 获取用户反馈历史
- [ ] 实现 FeedbackController
  - [ ] `POST /api/feedback` - 提交反馈
  - [ ] `POST /api/feedback/attachments` - 上传附件
  - [ ] `GET /api/feedback/history` - 获取历史
- [ ] 实现 Admin FeedbackController
  - [ ] `GET /api/admin/feedback` - 反馈列表
  - [ ] `GET /api/admin/feedback/:id` - 反馈详情
  - [ ] `PATCH /api/admin/feedback/:id` - 更新状态

#### 1.3 iOS 客户端
- [ ] 创建 FeedbackView（反馈表单）
- [ ] 创建 FeedbackViewModel
- [ ] 创建 FeedbackService
- [ ] 实现诊断信息收集（DiagnosticInfo）
- [ ] 实现图片选择和上传
- [ ] 添加反馈入口（设置页、阅读器、错误弹窗）
- [ ] 添加 QuickFeedbackSheet（快速反馈）

#### 1.4 Dashboard 管理
- [ ] 创建反馈列表页 `/feedback`
- [ ] 创建反馈详情页 `/feedback/:id`
- [ ] 实现筛选和搜索
- [ ] 实现状态更新操作

#### 1.5 邮件通知
- [ ] 配置邮件服务（SendGrid/Resend）
- [ ] 创建邮件模板：反馈已收到
- [ ] 实现自动发送确认邮件

**验收标准**:
- [ ] 用户可以在 App 内选择类型、填写描述、上传截图提交反馈
- [ ] 反馈自动收集设备和 App 信息
- [ ] 提交后用户收到确认邮件
- [ ] 管理员可以在后台查看所有反馈
- [ ] 管理员可以标记反馈状态

---

### Phase 2: 工单系统

**目标**: 将反馈转为工单，实现工单全生命周期管理

**任务清单**:

#### 2.1 数据库设计
- [ ] 创建 Ticket 模型
- [ ] 创建 TicketMessage 模型
- [ ] 创建 TicketHistory 模型
- [ ] 创建 TicketAttachment 模型
- [ ] 添加相关枚举
- [ ] 运行数据库迁移

#### 2.2 后端服务
- [ ] 创建 TicketModule
- [ ] 实现 TicketService
  - [ ] `createTicket()` - 创建工单
  - [ ] `convertFromFeedback()` - 从反馈转工单
  - [ ] `updateTicket()` - 更新工单
  - [ ] `addMessage()` - 添加消息/回复
  - [ ] `assignTicket()` - 分配工单
  - [ ] `escalateTicket()` - 升级工单
  - [ ] `mergeTickets()` - 合并工单
  - [ ] `getTicketStats()` - 统计数据
- [ ] 实现 TicketNumberGenerator（工单号生成）
- [ ] 实现 TicketHistoryService（操作日志）
- [ ] 实现 Admin TicketController

#### 2.3 工单分配
- [ ] 实现 TicketAssignmentService
  - [ ] `autoAssign()` - 自动分配
  - [ ] `getCategoryQueue()` - 分类队列
  - [ ] `selectAgent()` - 选择客服（负载均衡）
  - [ ] `calculateScore()` - 评分算法

#### 2.4 SLA 监控
- [ ] 实现 SLAService
  - [ ] `calculateDueDates()` - 计算 SLA 截止时间
  - [ ] `checkSLABreaches()` - 检查 SLA 违规
  - [ ] `sendSLAWarnings()` - 发送预警
- [ ] 创建定时任务：每 5 分钟检查 SLA
- [ ] 实现自动升级逻辑

#### 2.5 Dashboard 工单管理
- [ ] 创建工单列表页 `/tickets`
  - [ ] 实现多维度筛选
  - [ ] 实现批量操作
  - [ ] 显示 SLA 状态
- [ ] 创建工单详情页 `/tickets/:id`
  - [ ] 工单信息展示
  - [ ] 对话记录
  - [ ] 回复表单（支持快捷回复、内部备注）
  - [ ] 操作面板（状态、优先级、分配）
  - [ ] 用户信息卡片
  - [ ] 工单历史

#### 2.6 邮件通知
- [ ] 创建邮件模板：客服已回复
- [ ] 创建邮件模板：工单已解决
- [ ] 实现回复通知自动发送

**验收标准**:
- [ ] 可以将反馈一键转为工单
- [ ] 工单自动分配给合适的客服
- [ ] 客服可以回复工单，用户收到邮件通知
- [ ] SLA 监控正常工作，超时工单自动预警
- [ ] 支持工单升级、合并操作

---

### Phase 3: 订单管理系统

**目标**: 客服可以查看和管理用户订单，处理退款

**任务清单**:

#### 3.1 数据库设计
- [ ] 创建/更新 Order 模型（如已有则扩展）
- [ ] 创建 Transaction 模型
- [ ] 创建 RefundRequest 模型
- [ ] 添加相关枚举
- [ ] 运行数据库迁移

#### 3.2 后端服务
- [ ] 创建/扩展 OrderModule
- [ ] 实现 OrderService
  - [ ] `syncFromApple()` - Apple 订单同步
  - [ ] `getUserOrders()` - 用户订单列表
  - [ ] `getOrderDetail()` - 订单详情
  - [ ] `createTransaction()` - 创建交易记录
- [ ] 实现 RefundService
  - [ ] `createRefundRequest()` - 创建退款请求
  - [ ] `initiateAppleRefund()` - 发起 Apple 退款
  - [ ] `issueCredit()` - 发放积分补偿
  - [ ] `extendSubscription()` - 延长订阅
- [ ] 扩展 Apple Webhook 处理（REFUND 事件）

#### 3.3 Dashboard 订单管理
- [ ] 创建订单列表页 `/orders`
- [ ] 创建订单详情页 `/orders/:id`
  - [ ] 订单基本信息
  - [ ] Apple 交易信息
  - [ ] 交易历史时间线
  - [ ] 退款记录
  - [ ] 操作按钮（退款、延期、创建工单）
- [ ] 创建退款对话框组件
- [ ] 创建延长订阅对话框组件
- [ ] 创建退款请求列表页 `/refund-requests`

#### 3.4 用户订单关联
- [ ] 工单详情页显示用户订单
- [ ] 用户详情页显示订单历史

**验收标准**:
- [ ] 客服可以查看用户所有订单和交易历史
- [ ] 客服可以发起退款请求（Apple 退款/积分补偿/延期）
- [ ] 退款状态自动同步
- [ ] 工单中可以快速关联查看相关订单

---

### Phase 4: 增强功能

**目标**: 提升客服效率和用户满意度

**任务清单**:

#### 4.1 自动回复系统
- [ ] 创建 AutoReplyService
- [ ] 实现关键词匹配算法
- [ ] 创建常见问题回复模板库（20+ 模板）
- [ ] 实现自动回复触发逻辑
- [ ] 实现自动关闭定时器

#### 4.2 AI 回复建议
- [ ] 实现 AISuggestionService
- [ ] 接入 Claude API 生成回复建议
- [ ] 工单详情页显示 AI 建议
- [ ] 支持一键采用 AI 建议

#### 4.3 快捷回复模板
- [ ] 创建 ReplyTemplate 模型
- [ ] 实现模板 CRUD API
- [ ] Dashboard 模板管理页面
- [ ] 工单回复时显示模板列表
- [ ] 支持变量替换（用户名、订单号等）

#### 4.4 客服权限管理
- [ ] 扩展 Admin 模型（添加客服字段）
- [ ] 实现客服角色权限（Agent/Lead/Admin）
- [ ] Dashboard 客服人员管理页面
- [ ] 实现权限检查中间件

#### 4.5 报表统计
- [ ] 实现 SupportStatsService
- [ ] 创建客服概览仪表盘
- [ ] 实现工单趋势图表
- [ ] 实现分类分布图表
- [ ] 实现客服工作量报表
- [ ] 实现 SLA 达成率报表

**验收标准**:
- [ ] 常见问题自动回复，减少客服工作量
- [ ] AI 可以生成合理的回复建议
- [ ] 快捷模板提升回复效率
- [ ] 不同角色有不同权限
- [ ] 管理员可以查看完整的运营报表

---

### Phase 5: 持续优化

**目标**: 持续提升服务质量和用户体验

**任务清单**:

#### 5.1 客户满意度调查（CSAT）
- [ ] 工单解决后发送满意度调查邮件
- [ ] 创建满意度评价页面（1-5星 + 评论）
- [ ] Dashboard 满意度统计和趋势
- [ ] 低分工单自动标记跟进

#### 5.2 知识库集成
- [ ] 设计知识库数据模型
- [ ] 创建知识库文章管理
- [ ] 提交反馈时推荐相关文章
- [ ] AI 回复建议引用知识库

#### 5.3 多渠道整合
- [ ] 邮件工单创建（解析 support@ 邮件）
- [ ] App Store 评论监控和回复
- [ ] 统一收件箱视图

#### 5.4 自动化工作流
- [ ] 创建工作流引擎
- [ ] 支持自定义触发条件和动作
- [ ] 预设常用工作流模板
- [ ] Dashboard 工作流管理

#### 5.5 性能优化
- [ ] 工单列表分页优化
- [ ] 添加 Redis 缓存
- [ ] 消息实时推送（WebSocket）
- [ ] 移动端客服 App（可选）

**验收标准**:
- [ ] CSAT 系统正常运行，收集到满意度数据
- [ ] 知识库帮助用户自助解决问题
- [ ] 支持邮件创建工单
- [ ] 自动化工作流减少重复操作

---

## 11. 实施进度

### 当前状态

| 阶段 | 状态 | 进度 | 说明 |
|------|------|------|------|
| Phase 1: 基础反馈系统 | 📝 | 0% | 设计完成，待开发 |
| Phase 2: 工单系统 | 📝 | 0% | 设计完成，待开发 |
| Phase 3: 订单管理系统 | 📝 | 0% | 设计完成，待开发 |
| Phase 4: 增强功能 | 📝 | 0% | 设计完成，待开发 |
| Phase 5: 持续优化 | 📝 | 0% | 设计完成，待开发 |

### 总体进度

- **设计文档**: ✅ 100% 完成
- **数据模型**: 📝 0% - 待实施
- **后端 API**: 📝 0% - 待实施
- **iOS 客户端**: 📝 0% - 待实施
- **Dashboard**: 📝 0% - 待实施
- **测试**: 📝 0% - 待实施

### 里程碑

| 里程碑 | 目标日期 | 实际日期 | 状态 |
|--------|----------|----------|------|
| 设计文档完成 | - | 2025-12-27 | ✅ |
| Phase 1 完成 | TBD | - | 📝 |
| Phase 2 完成 | TBD | - | 📝 |
| Phase 3 完成 | TBD | - | 📝 |
| Phase 4 完成 | TBD | - | 📝 |
| 生产环境上线 | TBD | - | 📝 |

---

## 附录 A：常见问题自动回复库

```typescript
const faqAutoReplies: AutoReplyTemplate[] = [
  // ===== 订阅相关 =====
  {
    id: 'cancel-subscription',
    keywords: ['取消订阅', '怎么取消', '不想续费', 'cancel subscription', 'unsubscribe'],
    category: FeedbackCategory.SUBSCRIPTION,
    priority: 'high',
    response: `
您好！

感谢您使用 Readmigo。要取消订阅，请按以下步骤操作：

1. 打开 iPhone「设置」App
2. 点击顶部的您的 Apple ID（您的名字）
3. 选择「订阅」
4. 找到 Readmigo 并点击
5. 选择「取消订阅」

📌 注意：
- 取消后，您仍可使用付费功能直到当前订阅期结束
- 订阅到期后，您的阅读进度和笔记会保留，但高级功能将受限

如有其他问题，请回复此邮件，我们会尽快为您处理。

Readmigo 团队
    `,
    closeAfterDays: 3,
  },

  {
    id: 'restore-purchase',
    keywords: ['恢复购买', '购买记录', 'restore purchase', '换手机', '新设备'],
    category: FeedbackCategory.SUBSCRIPTION,
    priority: 'high',
    response: `
您好！

要恢复您之前的购买，请按以下步骤操作：

1. 打开 Readmigo App
2. 进入「设置」→「订阅」
3. 点击「恢复购买」按钮
4. 使用购买时的 Apple ID 验证

⚠️ 如果恢复失败，请检查：
- 确保使用的是购买时的同一 Apple ID
- 确保 Apple ID 已登录且可正常使用
- 确保网络连接正常
- 尝试重启 App 后再试

如果问题仍未解决，请回复此邮件并提供您的 Apple ID 邮箱（用于购买的邮箱），我们会为您人工核实处理。

Readmigo 团队
    `,
    closeAfterDays: 3,
  },

  {
    id: 'subscription-not-working',
    keywords: ['订阅了但是', '付费了没有', '买了但是', '会员不生效', 'paid but'],
    category: FeedbackCategory.SUBSCRIPTION,
    priority: 'urgent',
    response: `
您好！

非常抱歉给您带来不便！请尝试以下步骤：

1. **恢复购买**：进入「设置」→「订阅」→「恢复购买」
2. **重启 App**：完全关闭 Readmigo 后重新打开
3. **检查 Apple ID**：确保当前登录的 Apple ID 与购买时相同

如果以上步骤无法解决，请提供以下信息，我们会优先为您处理：
- 您的 Apple ID 邮箱
- 购买时间（大约）
- 订阅类型（月度/年度）

我们会在 24 小时内为您核实并解决。

Readmigo 团队
    `,
    closeAfterDays: null, // 不自动关闭，需要人工跟进
  },

  // ===== 退款相关 =====
  {
    id: 'refund-request',
    keywords: ['退款', '要求退款', '申请退款', 'refund', '退钱'],
    category: FeedbackCategory.REFUND,
    priority: 'high',
    response: `
您好！

感谢您联系我们。关于退款请求，请了解以下信息：

📌 **App Store 退款流程**：
由于 Readmigo 的订阅是通过 Apple App Store 处理的，退款需要通过 Apple 申请：

1. 访问 [reportaproblem.apple.com](https://reportaproblem.apple.com)
2. 使用您的 Apple ID 登录
3. 找到 Readmigo 的购买记录
4. 点击「报告问题」并选择退款原因

Apple 通常会在 48 小时内处理退款请求。

💡 **我们可以帮您**：
- 如果您遇到了 App 问题，我们很乐意帮您解决
- 如果您对功能不满意，我们想听听您的反馈来改进

请告诉我们您申请退款的原因，我们会尽力帮助您。

Readmigo 团队
    `,
    closeAfterDays: 5,
  },

  // ===== 账户问题 =====
  {
    id: 'login-issue',
    keywords: ['登录不了', '无法登录', '登录失败', 'cannot login', 'login failed'],
    category: FeedbackCategory.LOGIN,
    priority: 'high',
    response: `
您好！

抱歉您遇到了登录问题。请尝试以下步骤：

1. **检查网络**：确保网络连接正常
2. **重启 App**：完全关闭 Readmigo 后重新打开
3. **更新 App**：确保您使用的是最新版本
4. **重新登录**：
   - 如果使用 Apple 登录：确保 Apple ID 正常
   - 如果使用邮箱登录：尝试「忘记密码」重置

⚠️ 常见问题：
- 如果显示「账号不存在」：可能之前使用了不同的登录方式
- 如果显示「密码错误」：请尝试重置密码

如果问题仍然存在，请提供：
- 您使用的登录方式（Apple/邮箱）
- 具体的错误提示信息

我们会尽快帮您解决。

Readmigo 团队
    `,
    closeAfterDays: 3,
  },

  {
    id: 'delete-account',
    keywords: ['删除账号', '注销账户', 'delete account', '删号'],
    category: FeedbackCategory.ACCOUNT,
    priority: 'medium',
    response: `
您好！

我们收到了您的账号删除请求。在此之前，请了解：

⚠️ **删除账号将**：
- 永久删除您的所有数据（阅读进度、笔记、生词本等）
- 取消任何有效订阅
- 此操作不可撤销

📌 **如何删除账号**：
1. 打开 Readmigo App
2. 进入「设置」→「账户」→「删除账号」
3. 按照提示确认删除

💡 **其他选择**：
- 如果只是想暂停使用，可以直接卸载 App，数据会保留
- 如果遇到问题想解决，请告诉我们，我们很乐意帮助

确认要删除账号吗？请回复「确认删除」，我们会为您处理。

Readmigo 团队
    `,
    closeAfterDays: 7,
  },

  // ===== 功能问题 =====
  {
    id: 'app-crash',
    keywords: ['闪退', '崩溃', 'crash', 'app crash', '打不开'],
    category: FeedbackCategory.BUG,
    priority: 'urgent',
    response: `
您好！

非常抱歉 App 出现了问题！请尝试以下步骤：

1. **重启 App**：
   - 完全关闭 Readmigo（上滑关闭）
   - 重新打开

2. **重启设备**：
   - 有时候重启手机可以解决问题

3. **更新 App**：
   - 前往 App Store 检查是否有更新

4. **重新安装**：
   - 如果以上都无效，尝试卸载后重新安装
   - 登录后您的数据会自动同步

📌 为了帮助我们定位问题，请提供：
- 闪退发生在什么操作时？
- 是否每次都会闪退？
- 您的 iOS 版本是多少？

我们的技术团队会优先处理此问题。

Readmigo 团队
    `,
    closeAfterDays: null,
  },

  {
    id: 'sync-issue',
    keywords: ['同步', '数据丢失', '进度没了', 'sync', '不同步'],
    category: FeedbackCategory.DATA_SYNC,
    priority: 'high',
    response: `
您好！

抱歉您遇到了数据同步问题。请尝试以下步骤：

1. **检查网络**：确保网络连接正常
2. **手动同步**：进入「设置」→「同步」→「立即同步」
3. **检查登录状态**：确保您已登录账号

📌 **关于同步机制**：
- Readmigo 会自动同步您的阅读进度、笔记和生词本
- 同步需要网络连接
- 在不同设备上需要使用同一账号登录

⚠️ **如果数据丢失**：
请提供以下信息，我们会尝试帮您恢复：
- 丢失的数据类型（进度/笔记/生词）
- 大约什么时候丢失的
- 是否在多个设备使用

我们会尽快帮您处理。

Readmigo 团队
    `,
    closeAfterDays: 3,
  },

  // ===== 内容问题 =====
  {
    id: 'book-content-error',
    keywords: ['书籍错误', '内容错误', '排版问题', '显示错误', 'book error'],
    category: FeedbackCategory.BOOK_CONTENT,
    priority: 'medium',
    response: `
您好！

感谢您报告书籍内容问题！为了更快地修复，请提供以下信息：

📚 **请告诉我们**：
1. 书籍名称
2. 问题所在的章节/位置
3. 具体是什么问题（错字/排版/内容缺失等）
4. 如果可能，请附上截图

我们的内容团队会尽快核实并修复。感谢您帮助我们提升阅读体验！

Readmigo 团队
    `,
    closeAfterDays: 7,
  },

  {
    id: 'translation-error',
    keywords: ['翻译错误', '翻译不对', '翻译问题', 'translation error', '译文'],
    category: FeedbackCategory.TRANSLATION,
    priority: 'medium',
    response: `
您好！

感谢您报告翻译问题！请提供以下信息：

📝 **请告诉我们**：
1. 书籍名称和章节
2. 原文内容
3. 当前的翻译
4. 您建议的翻译（如果有）

我们会核实并更正翻译。感谢您帮助我们提升翻译质量！

Readmigo 团队
    `,
    closeAfterDays: 7,
  },

  // ===== 功能建议 =====
  {
    id: 'feature-request',
    keywords: ['建议', '希望有', '能不能', 'feature request', '功能建议'],
    category: FeedbackCategory.FEATURE_REQUEST,
    priority: 'low',
    response: `
您好！

非常感谢您的宝贵建议！🙏

我们已经记录下您的反馈，产品团队会认真评估。我们一直在努力改进 Readmigo，您的建议对我们非常重要。

如果您有更多想法，欢迎随时告诉我们！

Readmigo 团队
    `,
    closeAfterDays: 14,
  },
];
```

---

## 附录 B：客户满意度调查（CSAT）设计

### B.1 调查触发时机

```typescript
// 满意度调查触发规则
const csatTriggerRules = {
  // 工单解决后触发
  onTicketResolved: {
    delay: '24h',           // 解决后 24 小时发送
    condition: {
      excludeCategories: ['SPAM', 'DUPLICATE'],
      minMessagesCount: 2,  // 至少有 2 条消息
    },
  },

  // 排除规则
  excludeUsers: {
    recentSurvey: '30d',    // 30 天内已填过调查
    newUsers: '7d',         // 注册 7 天内的新用户
  },
};
```

### B.2 调查表单设计

```swift
// iOS CSAT 调查视图
struct CSATSurveyView: View {
    let ticketId: String
    @State private var rating: Int = 0
    @State private var feedback: String = ""

    var body: some View {
        VStack(spacing: 24) {
            Text("您对此次服务满意吗？")
                .font(.headline)

            // 1-5 星评分
            HStack(spacing: 16) {
                ForEach(1...5, id: \.self) { star in
                    Button {
                        rating = star
                    } label: {
                        Image(systemName: star <= rating ? "star.fill" : "star")
                            .font(.title)
                            .foregroundColor(star <= rating ? .yellow : .gray)
                    }
                }
            }

            // 评分说明
            if rating > 0 {
                Text(ratingDescription(rating))
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            // 可选反馈
            if rating > 0 {
                VStack(alignment: .leading) {
                    Text("有什么建议吗？（可选）")
                        .font(.subheadline)

                    TextEditor(text: $feedback)
                        .frame(height: 80)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.secondary.opacity(0.3))
                        )
                }
            }

            // 提交按钮
            Button("提交") {
                submitSurvey()
            }
            .buttonStyle(.borderedProminent)
            .disabled(rating == 0)
        }
        .padding()
    }

    func ratingDescription(_ rating: Int) -> String {
        switch rating {
        case 1: return "非常不满意"
        case 2: return "不太满意"
        case 3: return "一般"
        case 4: return "满意"
        case 5: return "非常满意"
        default: return ""
        }
    }
}
```

### B.3 数据模型

```prisma
model CSATSurvey {
  id          String   @id @default(uuid())
  ticketId    String   @unique
  ticket      Ticket   @relation(fields: [ticketId], references: [id])
  userId      String

  // 评分
  rating      Int      // 1-5
  feedback    String?  // 可选文字反馈

  // 元数据
  sentAt      DateTime @default(now())
  respondedAt DateTime?

  @@index([ticketId])
  @@index([userId])
  @@index([rating])
  @@index([sentAt])
}
```

### B.4 报表指标

```typescript
interface CSATMetrics {
  // 整体指标
  overallScore: number;           // 平均分 (1-5)
  responseRate: number;           // 响应率
  totalResponses: number;         // 总响应数

  // 分布
  ratingDistribution: {
    1: number;  // 非常不满意
    2: number;  // 不太满意
    3: number;  // 一般
    4: number;  // 满意
    5: number;  // 非常满意
  };

  // 趋势
  weeklyTrend: { week: string; score: number }[];

  // 按维度
  byCategory: Record<FeedbackCategory, number>;
  byAgent: { agentId: string; name: string; score: number }[];

  // 低分工单
  lowRatingTickets: {
    ticketId: string;
    rating: number;
    feedback: string;
    agentName: string;
  }[];
}
```

---

## 附录 C：邮件模板示例

### C.1 反馈确认邮件

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
    .header img { width: 120px; }
    .content { padding: 30px 0; }
    .ticket-info { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .ticket-number { font-size: 18px; font-weight: bold; color: #007AFF; }
    .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #666; font-size: 14px; }
    .button { display: inline-block; background: #007AFF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://readmigo.com/logo.png" alt="Readmigo">
    </div>

    <div class="content">
      <h2>我们收到了您的反馈</h2>

      <p>您好，{{userName}}！</p>

      <p>感谢您联系 Readmigo 客服团队。我们已收到您的反馈，会尽快为您处理。</p>

      <div class="ticket-info">
        <div class="ticket-number">工单号：#{{ticketNumber}}</div>
        <p><strong>问题类型：</strong>{{category}}</p>
        <p><strong>提交时间：</strong>{{createdAt}}</p>
      </div>

      <p>我们通常会在 24 小时内回复您的问题。如果是紧急问题，我们会优先处理。</p>

      <p>如有补充信息，请直接回复此邮件。</p>

      <p>
        Readmigo 团队
      </p>
    </div>

    <div class="footer">
      <p>此邮件由 Readmigo 自动发送</p>
      <p>如有疑问，请访问 <a href="https://readmigo.com/help">帮助中心</a></p>
    </div>
  </div>
</body>
</html>
```

### C.2 满意度调查邮件

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    /* 样式同上 */
    .rating-buttons { text-align: center; margin: 30px 0; }
    .rating-btn { display: inline-block; width: 50px; height: 50px; line-height: 50px; margin: 0 5px; border-radius: 50%; text-decoration: none; font-size: 20px; }
    .rating-1 { background: #ff6b6b; color: white; }
    .rating-2 { background: #ffa94d; color: white; }
    .rating-3 { background: #ffd43b; color: #333; }
    .rating-4 { background: #69db7c; color: white; }
    .rating-5 { background: #38d9a9; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://readmigo.com/logo.png" alt="Readmigo">
    </div>

    <div class="content">
      <h2>您对我们的服务满意吗？</h2>

      <p>您好，{{userName}}！</p>

      <p>您的工单 <strong>#{{ticketNumber}}</strong> 已解决。我们非常重视您的体验，希望您能花 30 秒告诉我们您的感受。</p>

      <div class="rating-buttons">
        <a href="{{ratingUrl}}&rating=1" class="rating-btn rating-1">😠</a>
        <a href="{{ratingUrl}}&rating=2" class="rating-btn rating-2">😕</a>
        <a href="{{ratingUrl}}&rating=3" class="rating-btn rating-3">😐</a>
        <a href="{{ratingUrl}}&rating=4" class="rating-btn rating-4">😊</a>
        <a href="{{ratingUrl}}&rating=5" class="rating-btn rating-5">😍</a>
      </div>

      <p style="text-align: center; color: #666;">
        点击表情即可完成评价
      </p>

      <p>您的反馈将帮助我们不断改进服务质量。感谢您的支持！</p>

      <p>
        Readmigo 团队
      </p>
    </div>

    <div class="footer">
      <p>此邮件由 Readmigo 自动发送</p>
      <p>如不想接收此类邮件，<a href="{{unsubscribeUrl}}">点击取消订阅</a></p>
    </div>
  </div>
</body>
</html>
```

---

## 附录 D：技术依赖

### D.1 后端依赖

```json
{
  "dependencies": {
    // 邮件服务（选其一）
    "@sendgrid/mail": "^8.0.0",
    "resend": "^2.0.0",

    // 文件上传
    "@aws-sdk/client-s3": "^3.0.0",  // R2 兼容 S3 API

    // 定时任务
    "@nestjs/schedule": "^4.0.0",

    // AI 服务
    "@anthropic-ai/sdk": "^0.20.0"
  }
}
```

### D.2 iOS 依赖

```swift
// Package.swift
dependencies: [
    // 无额外依赖，使用原生组件
]
```

### D.3 Dashboard 依赖

```json
{
  "dependencies": {
    // 图表
    "recharts": "^2.10.0",

    // 日期处理
    "date-fns": "^3.0.0",

    // 富文本编辑器（工单回复）
    "@tiptap/react": "^2.0.0"
  }
}
```

---

*文档版本: 2.0 | 最后更新: 2025-12-27 | 状态: ✅ 设计完成*
