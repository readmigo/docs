# Messaging 模块

> 站内信与客服消息系统 - 跨平台统一文档

---

## 1. 概述

### 1.1 功能范围

| 功能 | 优先级 | 描述 |
|------|--------|------|
| 发送消息 | P0 | 用户发送文字消息给官方 |
| 消息类型选择 | P0 | 选择反馈/咨询/建议/投诉等类型 |
| 消息历史 | P0 | 查看历史消息和官方回复 |
| 帮助中心 | P1 | FAQ 和帮助文档 |
| 附件上传 | P1 | 上传图片/截图辅助说明问题 |
| 推送通知 | P1 | 官方回复时推送通知用户 |
| 未读标记 | P1 | 显示未读消息数量 |
| 满意度评价 | P2 | 对客服回复进行评价 |
| 实时聊天 | P2 | WebSocket 实时客服聊天 |

### 1.2 平台实现对比

| 功能 | Android | React Native | Web |
|------|---------|--------------|-----|
| 消息列表 | LazyColumn | FlashList | React Query + shadcn |
| 实时通信 | FCM | socket.io-client | WebSocket |
| 附件上传 | PhotoPicker | expo-image-picker | File Input |
| 本地存储 | Room | AsyncStorage | Zustand persist |
| 推送 | FCM | expo-notifications | Web Push API |

### 1.3 系统边界

```
┌─────────────────────────────────────────────────────────────┐
│                     站内信系统                               │
├─────────────────────────────────────────────────────────────┤
│  Client                          │  Backend                 │
│  ───────                         │  ───────                 │
│  • 发送消息                       │  • 消息存储               │
│  • 查看消息历史                   │  • 消息分类/路由          │
│  • 接收回复通知                   │  • 客服回复               │
│  • 附件上传（图片/截图）          │  • 推送通知               │
│                                  │  • 数据统计               │
├─────────────────────────────────────────────────────────────┤
│  Dashboard (Admin)                                          │
│  ─────────────────                                          │
│  • 查看所有用户消息                                          │
│  • 回复用户                                                  │
│  • 消息分类管理                                              │
│  • 数据统计分析                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 数据模型

### 2.1 TypeScript 类型定义

```typescript
// 消息会话/工单
interface MessageThread {
  id: string;
  userId: string;
  type: MessageType;
  subject: string;
  status: ThreadStatus;
  priority: ThreadPriority;
  createdAt: Date;
  updatedAt: Date;
  lastMessagePreview: string;
  unreadCount: number;
  messages?: Message[];
}

type MessageType =
  | 'technical_issue'      // 技术问题
  | 'feature_suggestion'   // 功能建议
  | 'general_inquiry'      // 一般咨询
  | 'problem_report'       // 问题报告
  | 'complaint'            // 投诉
  | 'business_inquiry';    // 商务合作

type ThreadStatus =
  | 'open'                 // 待处理
  | 'pending'              // 等待回复
  | 'in_progress'          // 处理中
  | 'replied'              // 已回复
  | 'resolved'             // 已解决
  | 'closed';              // 已关闭

type ThreadPriority = 'low' | 'medium' | 'high' | 'urgent';

// 消息
interface Message {
  id: string;
  threadId: string;
  content: MessageContent;
  sender: MessageSender;
  status: MessageStatus;
  createdAt: Date;
  readAt?: Date;
}

type MessageContent =
  | { type: 'text'; text: string }
  | { type: 'image'; url: string; thumbnailUrl?: string }
  | { type: 'system'; text: string };

interface MessageSender {
  id: string;
  type: 'user' | 'agent' | 'bot' | 'system';
  name: string;
  avatarUrl?: string;
}

type MessageStatus =
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

// 附件
interface Attachment {
  id: string;
  messageId: string;
  type: 'image' | 'file';
  url: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: number;
}

// 设备信息
interface DeviceInfo {
  model: string;           // "Pixel 8 Pro" / "iPhone 15"
  osVersion: string;       // "Android 14" / "iOS 17"
  appVersion: string;      // "1.0.0"
  buildNumber: string;     // "100"
  locale: string;          // "zh-CN"
}

// 反馈评价
interface FeedbackRating {
  threadId: string;
  messageId: string;
  rating: 'helpful' | 'not_helpful';
  comment?: string;
  createdAt: Date;
}

// FAQ 条目
interface FAQItem {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  helpful: number;
  notHelpful: number;
  order: number;
}

// 帮助分类
interface FAQCategory {
  id: string;
  name: string;
  icon: string;
  items: FAQItem[];
  order: number;
}
```

---

## 3. API 接口

### 3.1 消息会话 API

| Endpoint | Method | 描述 |
|----------|--------|------|
| `/api/v1/messages/threads` | GET | 获取消息列表 |
| `/api/v1/messages/threads` | POST | 创建新会话 |
| `/api/v1/messages/threads/{id}` | GET | 获取会话详情 |
| `/api/v1/messages/threads/{id}/messages` | POST | 发送回复 |
| `/api/v1/messages/threads/{id}/close` | POST | 关闭会话 |
| `/api/v1/messages/threads/{id}/read` | POST | 标记已读 |
| `/api/v1/messages/threads/{id}/rating` | POST | 提交评价 |
| `/api/v1/messages/attachments` | POST | 上传附件 |
| `/api/v1/messages/unread-count` | GET | 获取未读数 |

### 3.2 帮助中心 API

| Endpoint | Method | 描述 |
|----------|--------|------|
| `/api/v1/support/faq` | GET | 获取 FAQ 列表 |
| `/api/v1/support/faq/{id}/helpful` | POST | 标记 FAQ 有帮助 |
| `/api/v1/support/help-categories` | GET | 获取帮助分类 |
| `/api/v1/support/feedback` | POST | 提交反馈 |

---

## 4. Android 实现

### 4.1 数据模型 (Room Entity)

```kotlin
@Entity(tableName = "message_threads")
data class MessageThread(
    @PrimaryKey val id: String,
    val userId: String,
    val type: MessageType,
    val subject: String,
    val status: ThreadStatus,
    val createdAt: Instant,
    val updatedAt: Instant,
    val lastMessagePreview: String,
    val unreadCount: Int,
    @Ignore val messages: List<Message>? = null
)

enum class MessageType(val value: String) {
    TECHNICAL_ISSUE("technical_issue"),
    FEATURE_SUGGESTION("feature_suggestion"),
    GENERAL_INQUIRY("general_inquiry"),
    PROBLEM_REPORT("problem_report"),
    COMPLAINT("complaint"),
    BUSINESS_INQUIRY("business_inquiry");

    val icon: ImageVector
        get() = when (this) {
            TECHNICAL_ISSUE -> Icons.Filled.Help
            FEATURE_SUGGESTION -> Icons.Filled.Lightbulb
            GENERAL_INQUIRY -> Icons.Filled.Chat
            PROBLEM_REPORT -> Icons.Filled.Warning
            COMPLAINT -> Icons.Filled.Campaign
            BUSINESS_INQUIRY -> Icons.Filled.Work
        }
}
```

### 4.2 Repository

```kotlin
@Singleton
class MessagingRepository @Inject constructor(
    private val remoteDataSource: MessagingRemoteDataSource,
    private val localDataSource: MessagingLocalDataSource,
    private val deviceInfoProvider: DeviceInfoProvider
) {
    fun getThreads(status: ThreadStatus? = null): Flow<List<MessageThread>> = flow {
        emit(localDataSource.getThreads(status))
        try {
            val remoteThreads = remoteDataSource.getThreads(status = status)
            localDataSource.insertThreads(remoteThreads)
            emit(remoteThreads)
        } catch (e: Exception) {
            // 网络错误时继续使用本地数据
        }
    }

    suspend fun createThread(
        type: MessageType,
        subject: String,
        content: String,
        attachmentIds: List<String>? = null,
        includeDeviceInfo: Boolean = true
    ): Result<MessageThread> = runCatching {
        val request = CreateThreadRequest(
            type = type.value,
            subject = subject,
            content = content,
            attachmentIds = attachmentIds,
            includeDeviceInfo = includeDeviceInfo
        )
        remoteDataSource.createThread(request).also {
            localDataSource.insertThread(it)
        }
    }

    suspend fun sendReply(
        threadId: String,
        content: String,
        attachmentIds: List<String>? = null
    ): Result<Message> = runCatching {
        remoteDataSource.sendReply(threadId, content, attachmentIds).also {
            localDataSource.insertMessage(it)
        }
    }

    fun getDeviceInfo(): DeviceInfo = deviceInfoProvider.getDeviceInfo()
}
```

### 4.3 Compose UI

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MessageListScreen(
    viewModel: MessageListViewModel = hiltViewModel(),
    onNavigateToThread: (String) -> Unit,
    onNavigateToNewMessage: () -> Unit,
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.messaging_title)) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onNavigateToNewMessage) {
                Icon(Icons.Default.Add, contentDescription = "New Message")
            }
        }
    ) { paddingValues ->
        when (val state = uiState) {
            is MessageListUiState.Success -> {
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(paddingValues),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(state.threads, key = { it.id }) { thread ->
                        MessagePreviewCard(
                            thread = thread,
                            onClick = { onNavigateToThread(thread.id) }
                        )
                    }
                }
            }
            // Loading, Empty, Error states...
        }
    }
}
```

---

## 5. React Native 实现

### 5.1 Zustand Store

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface MessagingState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Record<string, Message[]>;
  isLoadingMessages: boolean;
  totalUnreadCount: number;
  agentTyping: boolean;
  isConnected: boolean;
}

interface MessagingActions {
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessageStatus: (conversationId: string, messageId: string, status: MessageStatus) => void;
  setTotalUnreadCount: (count: number) => void;
  markAsRead: (conversationId: string) => void;
  setAgentTyping: (typing: boolean) => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

export const useMessagingStore = create<MessagingState & MessagingActions>()(
  immer((set) => ({
    conversations: [],
    currentConversation: null,
    messages: {},
    isLoadingMessages: false,
    totalUnreadCount: 0,
    agentTyping: false,
    isConnected: false,

    setConversations: (conversations) => set((state) => {
      state.conversations = conversations;
      state.totalUnreadCount = conversations.reduce(
        (sum, c) => sum + c.unreadCount, 0
      );
    }),

    addMessage: (conversationId, message) => set((state) => {
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);
    }),

    // ... other actions
  }))
);
```

### 5.2 WebSocket 服务

```typescript
import { io, Socket } from 'socket.io-client';
import { useMessagingStore } from '../stores/messagingStore';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string): void {
    if (this.socket?.connected) return;

    this.socket = io('wss://api.readmigo.app/support', {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      useMessagingStore.getState().setConnected(true);
    });

    this.socket.on('message', (message: Message) => {
      useMessagingStore.getState().addMessage(message.conversationId, message);
    });

    this.socket.on('typing', (data) => {
      useMessagingStore.getState().setAgentTyping(data.typing);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  sendTyping(conversationId: string): void {
    this.socket?.emit('typing', { conversationId });
  }
}

export const socketService = new SocketService();
```

### 5.3 React Query Hooks

```typescript
export function useConversations() {
  const { setConversations } = useMessagingStore();

  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const conversations = await messagingService.getConversations();
      setConversations(conversations);
      return conversations;
    },
  });
}

export function useSendMessage() {
  const { addMessage, updateMessageStatus } = useMessagingStore();

  return useMutation({
    mutationFn: async ({ conversationId, content }) => {
      // 乐观更新
      const tempId = `temp-${Date.now()}`;
      const tempMessage: Message = {
        id: tempId,
        conversationId,
        content,
        sender: { id: 'user', type: 'user', name: 'Me' },
        status: 'sending',
        createdAt: new Date(),
      };
      addMessage(conversationId, tempMessage);

      try {
        const message = await messagingService.sendMessage(conversationId, content);
        updateMessageStatus(conversationId, tempId, 'sent');
        return message;
      } catch (error) {
        updateMessageStatus(conversationId, tempId, 'failed');
        throw error;
      }
    },
  });
}
```

### 5.4 聊天页面

```typescript
export function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const listRef = useRef<FlashList<Message>>(null);
  const { messages, agentTyping, isConnected } = useMessagingStore();
  const conversationMessages = messages[conversationId] || [];

  const { fetchNextPage, hasNextPage } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();

  useEffect(() => {
    socketService.joinConversation(conversationId);
    markAsRead.mutate(conversationId);
    return () => socketService.leaveConversation(conversationId);
  }, [conversationId]);

  const handleSend = (text: string) => {
    sendMessage.mutate({
      conversationId,
      content: { type: 'text', text },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlashList
          ref={listRef}
          data={conversationMessages}
          renderItem={({ item }) => <MessageBubble message={item} />}
          estimatedItemSize={80}
          onStartReached={() => hasNextPage && fetchNextPage()}
          ListFooterComponent={agentTyping ? <TypingIndicator /> : null}
        />
        <ChatInput onSend={handleSend} disabled={!isConnected} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

---

## 6. Web 实现

### 6.1 Server Actions

```typescript
'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 获取 FAQ 列表
export async function getFAQs(): Promise<FAQCategory[]> {
  const categories = await prisma.faqCategory.findMany({
    include: {
      items: { orderBy: { order: 'asc' } },
    },
    orderBy: { order: 'asc' },
  });
  return categories;
}

// 提交反馈
export async function submitFeedback(data: FeedbackData): Promise<{ success: boolean; ticketId?: string }> {
  const session = await auth();

  try {
    const ticket = await prisma.ticket.create({
      data: {
        userId: session?.user?.id ?? null,
        email: data.email ?? session?.user?.email,
        subject: data.subject,
        category: data.type,
        status: 'open',
        priority: 'medium',
        messages: {
          create: {
            senderId: session?.user?.id ?? 'anonymous',
            senderType: 'user',
            content: data.description,
          },
        },
        metadata: data.metadata,
      },
    });

    return { success: true, ticketId: ticket.id };
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    return { success: false };
  }
}

// 回复工单
export async function replyToTicket(ticketId: string, content: string): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  try {
    await prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: session.user.id,
        senderType: 'user',
        content,
      },
    });

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'pending', updatedAt: new Date() },
    });

    revalidatePath(`/support/tickets/${ticketId}`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
```

### 6.2 Zustand Store

```typescript
import { create } from 'zustand';
import type { ChatMessage } from '../types';

interface MessagingState {
  messages: ChatMessage[];
  isTyping: boolean;
  isConnected: boolean;
  isChatOpen: boolean;
  unreadCount: number;

  addMessage: (message: ChatMessage) => void;
  updateMessageStatus: (id: string, status: ChatMessage['status']) => void;
  setTyping: (typing: boolean) => void;
  setConnected: (connected: boolean) => void;
  openChat: () => void;
  closeChat: () => void;
  markAsRead: () => void;
  clearMessages: () => void;
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  messages: [],
  isTyping: false,
  isConnected: false,
  isChatOpen: false,
  unreadCount: 0,

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
    unreadCount: state.isChatOpen ? 0 : state.unreadCount + (message.role !== 'user' ? 1 : 0),
  })),

  openChat: () => set({ isChatOpen: true, unreadCount: 0 }),
  closeChat: () => set({ isChatOpen: false }),
  markAsRead: () => set({ unreadCount: 0 }),
}));
```

### 6.3 帮助中心组件

```tsx
'use client';

export function HelpCenter() {
  const [search, setSearch] = useState('');
  const { data: categories, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: getFAQs,
  });

  const filteredCategories = categories?.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.question.toLowerCase().includes(search.toLowerCase()) ||
        item.answer.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">帮助中心</h1>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索问题..." className="pl-10" />
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Link href="/support/contact" className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-primary">
          <MessageCircle className="w-8 h-8 text-primary" />
          <span className="font-medium">联系客服</span>
        </Link>
        <Link href="/support/tickets" className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-primary">
          <FileText className="w-8 h-8 text-primary" />
          <span className="font-medium">我的工单</span>
        </Link>
        <Link href="/support/feedback" className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-primary">
          <HelpCircle className="w-8 h-8 text-primary" />
          <span className="font-medium">意见反馈</span>
        </Link>
      </div>

      <Tabs defaultValue="faq">
        <TabsList className="mb-6">
          <TabsTrigger value="faq">常见问题</TabsTrigger>
          <TabsTrigger value="feedback">提交反馈</TabsTrigger>
        </TabsList>
        <TabsContent value="faq">
          <FAQList categories={filteredCategories} />
        </TabsContent>
        <TabsContent value="feedback">
          <FeedbackForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 6.4 聊天窗口组件

```tsx
'use client';

export function ChatWidget() {
  const { isChatOpen, openChat, closeChat, unreadCount } = useMessagingStore();
  const { messages, isTyping, isConnected, sendMessage } = useChat();
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <>
      {/* 浮动按钮 */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={openChat}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center z-50"
          >
            <MessageCircle className="w-6 h-6 text-primary-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* 聊天窗口 */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] bg-background border rounded-lg shadow-xl flex flex-col z-50"
          >
            {/* Header, Messages, Input */}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

---

## 7. 消息类型设计

| 类型 | 图标 | 英文 | 中文 | 繁中 |
|------|------|------|------|------|
| 技术问题 | ❓ | Technical Issue | 技术问题 | 技術問題 |
| 功能建议 | 📝 | Feature Suggestion | 功能建议 | 功能建議 |
| 一般咨询 | 💬 | General Inquiry | 一般咨询 | 一般諮詢 |
| 问题报告 | ⚠️ | Report a Problem | 问题报告 | 問題回報 |
| 投诉 | 📢 | Complaint | 投诉 | 投訴 |
| 商务合作 | 🤝 | Business Inquiry | 商务合作 | 商務合作 |

---

## 8. 入口位置

| 入口 | 路径 | 场景 |
|------|------|------|
| 关于页面 | Me → About → Contact Us | 通用联系 |
| 帮助中心 | Me → Help Center → Contact Support | 获取帮助 |
| 设置页面 | Me → Settings → Feedback | 反馈入口 |
| 消息中心 | Me → Messages | 查看历史/回复 |

---

## 9. 推送通知

### Android (FCM)

```kotlin
class MessagingFirebaseService : FirebaseMessagingService() {
    @Inject lateinit var notificationManager: MessagingNotificationManager

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        val data = remoteMessage.data
        if (data["type"] == "message_reply") {
            notificationManager.showReplyNotification(
                threadId = data["thread_id"] ?: return,
                title = data["title"] ?: "New Reply",
                body = data["body"] ?: "You have a new reply"
            )
        }
    }
}
```

### React Native (expo-notifications)

```typescript
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

---

## 10. 数据分析埋点

| 事件 | 描述 | 参数 |
|------|------|------|
| `messaging_list_viewed` | 查看消息列表 | - |
| `messaging_new_opened` | 打开新消息页 | source |
| `messaging_type_selected` | 选择消息类型 | type |
| `messaging_sent` | 发送消息 | type, hasAttachment, contentLength |
| `messaging_reply_sent` | 发送回复 | threadId |
| `messaging_attachment_added` | 添加附件 | count |
| `messaging_rating_submitted` | 提交评价 | rating |
| `messaging_thread_opened` | 打开会话详情 | threadId, status |
| `faq_viewed` | 查看 FAQ | faqId, category |
| `faq_helpful_clicked` | 点击 FAQ 有帮助 | faqId, helpful |

---

## 11. 安全考虑

- 用户只能查看和操作自己的消息
- 附件上传需要进行类型和大小校验
- API 请求需要携带有效的用户 Token
- 设备信息仅在用户同意时附带
- 用户发送的内容需要进行敏感词过滤
- 图片附件需要进行违规内容检测

---

## 12. 文件结构

```
# Android
android/app/src/main/java/com/readmigo/features/messaging/
├── ui/
│   ├── MessageListScreen.kt
│   ├── MessageThreadScreen.kt
│   └── NewMessageScreen.kt
├── data/
│   ├── model/
│   ├── remote/
│   ├── local/
│   └── repository/
├── domain/
│   └── usecase/
└── viewmodel/

# React Native
src/features/messaging/
├── components/
│   ├── ChatScreen.tsx
│   ├── MessageBubble.tsx
│   ├── ChatInput.tsx
│   └── HelpCenterScreen.tsx
├── stores/
│   └── messagingStore.ts
├── services/
│   ├── messagingService.ts
│   └── socketService.ts
├── hooks/
│   └── useMessaging.ts
└── types/
    └── index.ts

# Web
src/features/messaging/
├── components/
│   ├── help-center.tsx
│   ├── faq-list.tsx
│   ├── feedback-form.tsx
│   ├── chat-widget.tsx
│   └── ticket-list.tsx
├── hooks/
│   ├── use-chat.ts
│   └── use-tickets.ts
├── stores/
│   └── messaging-store.ts
├── actions/
│   └── messaging-actions.ts
└── types/
    └── index.ts
```

---

## 13. 导出

```typescript
// src/features/messaging/index.ts

// Components
export { HelpCenter } from './components/help-center';
export { FAQList } from './components/faq-list';
export { FeedbackForm } from './components/feedback-form';
export { ChatWidget } from './components/chat-widget';
export { TicketList } from './components/ticket-list';

// Hooks
export { useChat } from './hooks/use-chat';
export { useTickets, useTicket } from './hooks/use-tickets';

// Stores
export { useMessagingStore } from './stores/messaging-store';

// Actions
export {
  getFAQs,
  submitFeedback,
  getTickets,
  replyToTicket,
} from './actions/messaging-actions';

// Types
export type {
  MessageThread,
  Message,
  MessageType,
  ThreadStatus,
  FAQItem,
  FAQCategory,
  FeedbackData,
} from './types';
```

---

*最后更新: 2025-12-28*
