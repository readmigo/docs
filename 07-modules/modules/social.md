# Social 模块

> 社交功能系统 - 跨平台统一文档

---

## 1. 概述

### 1.1 功能范围

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 阅读分享 | 分享书评、进度、金句 | P0 |
| 书评系统 | 评分和书评发布 | P0 |
| 关注系统 | 关注与粉丝管理 | P0 |
| 动态流 | 好友阅读动态 | P1 |
| 排行榜 | 阅读数据排行 | P1 |
| 读书俱乐部 | 线上读书社群 | P2 |

### 1.2 平台实现对比

| 功能 | Android | React Native | Web |
|------|---------|--------------|-----|
| 分享 | Intent / ShareSheet | expo-sharing | Web Share API |
| 动态列表 | LazyColumn | FlashList | React Query |
| 状态管理 | StateFlow | Zustand | Zustand |
| 实时更新 | Firebase | WebSocket | SSE / WebSocket |
| 社交平台 | 原生 SDK | URL Scheme | URL Scheme |

---

## 2. 数据模型

```typescript
// 用户资料
interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  stats: UserStats;
  isFollowing: boolean;
  isFollower: boolean;
  createdAt: Date;
}

// 用户统计
interface UserStats {
  booksRead: number;
  wordsLearned: number;
  readingTime: number;       // 分钟
  currentStreak: number;
  followers: number;
  following: number;
  reviewCount: number;
}

// 书评
interface BookReview {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  bookId: string;
  rating: number;            // 1-5
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 动态
interface Activity {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  type: ActivityType;
  data: ActivityData;
  createdAt: Date;
}

type ActivityType =
  | 'book_started'
  | 'book_finished'
  | 'review_posted'
  | 'milestone_reached'
  | 'streak_achieved'
  | 'word_mastered';

// 动态数据
interface BookStartedData {
  bookId: string;
  bookTitle: string;
  bookCover: string;
}

interface BookFinishedData {
  bookId: string;
  bookTitle: string;
  bookCover: string;
  readingDays: number;
  wordsLearned: number;
}

interface ReviewPostedData {
  bookId: string;
  bookTitle: string;
  rating: number;
  preview: string;
}

interface MilestoneReachedData {
  milestone: string;
  value: number;
}

interface StreakAchievedData {
  days: number;
}

interface WordMasteredData {
  word: string;
  count: number;
}

// 排行榜条目
interface LeaderboardEntry {
  rank: number;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  score: number;
  change: number;            // 排名变化
}

type LeaderboardType =
  | 'reading_time'
  | 'books_read'
  | 'words_learned'
  | 'streak';

// 分享内容
interface ShareContent {
  type: 'quote' | 'progress' | 'achievement' | 'review';
  title: string;
  text: string;
  image?: string;
  url?: string;
}

// 读书俱乐部
interface ReadingClub {
  id: string;
  name: string;
  description: string;
  cover?: string;
  memberCount: number;
  currentBook?: {
    id: string;
    title: string;
    cover: string;
  };
  isJoined: boolean;
  createdAt: Date;
}
```

---

## 3. API 接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/reviews` | POST | 创建书评 |
| `/reviews/{bookId}` | GET | 获取书籍书评 |
| `/reviews/{id}/like` | POST | 点赞书评 |
| `/reviews/{id}/unlike` | DELETE | 取消点赞 |
| `/users/{id}/follow` | POST | 关注用户 |
| `/users/{id}/unfollow` | DELETE | 取消关注 |
| `/users/{id}/followers` | GET | 获取粉丝列表 |
| `/users/{id}/following` | GET | 获取关注列表 |
| `/activity/feed` | GET | 获取动态流 |
| `/leaderboard/{type}` | GET | 获取排行榜 |

---

## 4. Android 实现

### 4.1 ViewModel

```kotlin
@HiltViewModel
class SocialViewModel @Inject constructor(
    private val socialRepository: SocialRepository
) : ViewModel() {

    private val _reviews = MutableStateFlow<List<BookReview>>(emptyList())
    val reviews: StateFlow<List<BookReview>> = _reviews.asStateFlow()

    private val _activityFeed = MutableStateFlow<List<Activity>>(emptyList())
    val activityFeed: StateFlow<List<Activity>> = _activityFeed.asStateFlow()

    fun loadBookReviews(bookId: String) {
        viewModelScope.launch {
            socialRepository.getBookReviews(bookId).collect { reviews ->
                _reviews.value = reviews
            }
        }
    }

    fun submitReview(bookId: String, rating: Int, content: String) {
        viewModelScope.launch {
            socialRepository.createReview(bookId, rating, content)
        }
    }

    fun toggleLike(reviewId: String, isLiked: Boolean) {
        viewModelScope.launch {
            if (isLiked) {
                socialRepository.unlikeReview(reviewId)
            } else {
                socialRepository.likeReview(reviewId)
            }
        }
    }

    fun toggleFollow(userId: String, isFollowing: Boolean) {
        viewModelScope.launch {
            if (isFollowing) {
                socialRepository.unfollowUser(userId)
            } else {
                socialRepository.followUser(userId)
            }
        }
    }
}
```

### 4.2 分享功能

```kotlin
object ShareUtils {
    fun shareContent(context: Context, content: ShareContent) {
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, content.title)
            putExtra(Intent.EXTRA_TEXT, "${content.text}\n\n${content.url ?: ""}")
        }
        context.startActivity(Intent.createChooser(intent, "分享到"))
    }

    fun shareToWeChat(context: Context, content: ShareContent) {
        // 微信分享 SDK 实现
    }

    fun shareToWeibo(context: Context, content: ShareContent) {
        // 微博分享 SDK 实现
    }
}
```

---

## 5. React Native 实现

### 5.1 Zustand Store

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface SocialState {
  activityFeed: Activity[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
}

interface SocialActions {
  loadActivityFeed: () => Promise<void>;
  loadLeaderboard: (type: LeaderboardType) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
}

export const useSocialStore = create<SocialState & SocialActions>()(
  immer((set, get) => ({
    activityFeed: [],
    leaderboard: [],
    isLoading: false,

    loadActivityFeed: async () => {
      set({ isLoading: true });
      const activities = await api.getActivityFeed();
      set({ activityFeed: activities, isLoading: false });
    },

    loadLeaderboard: async (type) => {
      set({ isLoading: true });
      const entries = await api.getLeaderboard(type);
      set({ leaderboard: entries, isLoading: false });
    },

    followUser: async (userId) => {
      await api.followUser(userId);
    },

    unfollowUser: async (userId) => {
      await api.unfollowUser(userId);
    },
  }))
);
```

### 5.2 分享 Hook

```typescript
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

export function useShare() {
  const share = async (content: ShareContent) => {
    const isAvailable = await Sharing.isAvailableAsync();

    if (isAvailable) {
      // 如果有图片，先保存后分享
      if (content.image) {
        // 下载并分享图片
      } else {
        await Sharing.shareAsync(content.url || '', {
          dialogTitle: content.title,
        });
      }
    } else {
      // 降级到复制链接
      await Clipboard.setStringAsync(
        `${content.title}\n\n${content.text}\n\n${content.url || ''}`
      );
      Toast.show({ text1: '已复制到剪贴板' });
    }
  };

  return { share };
}
```

### 5.3 书评组件

```typescript
interface ReviewCardProps {
  review: BookReview;
  onLike: (id: string, isLiked: boolean) => void;
}

export function ReviewCard({ review, onLike }: ReviewCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar source={{ uri: review.user.avatar }} size={40} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{review.user.name}</Text>
          <Text style={styles.date}>
            {formatDistanceToNow(review.createdAt)}
          </Text>
        </View>
      </View>

      <StarRating rating={review.rating} size={16} />

      <Text style={styles.content}>{review.content}</Text>

      <Pressable
        style={styles.likeButton}
        onPress={() => onLike(review.id, review.isLiked)}
      >
        <Ionicons
          name={review.isLiked ? 'heart' : 'heart-outline'}
          size={20}
          color={review.isLiked ? '#E53935' : '#999'}
        />
        <Text style={styles.likeCount}>{review.likes}</Text>
      </Pressable>
    </View>
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

export async function createReview(
  bookId: string,
  rating: number,
  content: string
): Promise<{ success: boolean; review?: BookReview }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false };
  }

  const review = await prisma.bookReview.create({
    data: {
      userId: session.user.id,
      bookId,
      rating,
      content,
    },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  // 创建动态
  await createActivity('review_posted', {
    bookId,
    bookTitle: '', // 从书籍获取
    rating,
    preview: content.slice(0, 100),
  });

  revalidatePath(`/books/${bookId}`);

  return {
    success: true,
    review: {
      ...review,
      user: {
        id: review.user.id,
        name: review.user.name ?? '',
        avatar: review.user.image ?? undefined,
      },
      likes: 0,
      isLiked: false,
    },
  };
}

export async function followUser(userId: string): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session?.user?.id || session.user.id === userId) {
    return { success: false };
  }

  await prisma.follow.create({
    data: {
      followerId: session.user.id,
      followingId: userId,
    },
  });

  return { success: true };
}

export async function getActivityFeed(
  page = 1,
  limit = 20
): Promise<{ activities: Activity[]; hasMore: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { activities: [], hasMore: false };
  }

  // 获取关注的用户
  const following = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    select: { followingId: true },
  });

  const userIds = [session.user.id, ...following.map((f) => f.followingId)];

  const activities = await prisma.activity.findMany({
    where: { userId: { in: userIds } },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit + 1,
  });

  const hasMore = activities.length > limit;

  return {
    activities: activities.slice(0, limit).map((a) => ({
      id: a.id,
      userId: a.userId,
      user: {
        id: a.user.id,
        name: a.user.name ?? '',
        avatar: a.user.image ?? undefined,
      },
      type: a.type as ActivityType,
      data: a.data as ActivityData,
      createdAt: a.createdAt,
    })),
    hasMore,
  };
}

export async function getLeaderboard(
  type: LeaderboardType,
  period: 'week' | 'month' | 'all' = 'week'
): Promise<LeaderboardEntry[]> {
  // 根据类型和周期查询排行榜
  const leaderboard = await prisma.$queryRaw<LeaderboardEntry[]>`
    SELECT
      ROW_NUMBER() OVER (ORDER BY score DESC) as rank,
      u.id as "userId",
      u.name,
      u.image as avatar,
      COALESCE(s.${type}, 0) as score
    FROM users u
    LEFT JOIN user_stats s ON u.id = s.user_id
    ORDER BY score DESC
    LIMIT 100
  `;

  return leaderboard;
}
```

### 6.2 分享 Hook

```typescript
'use client';

export function useShare() {
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  const share = async (content: ShareContent) => {
    if (canShare) {
      try {
        await navigator.share({
          title: content.title,
          text: content.text,
          url: content.url,
        });
        return true;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Failed to share:', error);
        }
        return false;
      }
    }

    // 降级：复制到剪贴板
    await navigator.clipboard.writeText(
      `${content.title}\n\n${content.text}\n\n${content.url ?? ''}`
    );
    return true;
  };

  const shareToTwitter = (content: ShareContent) => {
    const text = encodeURIComponent(`${content.title}\n\n${content.text}`);
    const url = encodeURIComponent(content.url ?? '');
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank'
    );
  };

  const shareToWeibo = (content: ShareContent) => {
    const text = encodeURIComponent(`${content.title} ${content.text}`);
    const url = encodeURIComponent(content.url ?? '');
    window.open(
      `https://service.weibo.com/share/share.php?title=${text}&url=${url}`,
      '_blank'
    );
  };

  return { canShare, share, shareToTwitter, shareToWeibo };
}
```

### 6.3 书评 Hooks

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useBookReviews(bookId: string) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', bookId],
    queryFn: () => getBookReviews(bookId),
  });

  const createMutation = useMutation({
    mutationFn: ({ rating, content }: { rating: number; content: string }) =>
      createReview(bookId, rating, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', bookId] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: likeReview,
    onMutate: async (reviewId) => {
      // 乐观更新
      await queryClient.cancelQueries({ queryKey: ['reviews', bookId] });
      const previous = queryClient.getQueryData(['reviews', bookId]);

      queryClient.setQueryData(['reviews', bookId], (old: any) => ({
        ...old,
        reviews: old.reviews.map((review: any) =>
          review.id === reviewId
            ? { ...review, isLiked: true, likes: review.likes + 1 }
            : review
        ),
      }));

      return { previous };
    },
    onError: (err, reviewId, context) => {
      queryClient.setQueryData(['reviews', bookId], context?.previous);
    },
  });

  return {
    reviews: data?.reviews ?? [],
    isLoading,
    createReview: createMutation.mutateAsync,
    toggleLike: (reviewId: string, isLiked: boolean) => {
      if (isLiked) {
        unlikeMutation.mutate(reviewId);
      } else {
        likeMutation.mutate(reviewId);
      }
    },
  };
}
```

---

## 7. UI 组件

### 分享弹窗 (Web)

```tsx
export function ShareModal({ open, onOpenChange, content }: ShareModalProps) {
  const { canShare, share, shareToTwitter, shareToWeibo } = useShare();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>分享</DialogTitle>
        </DialogHeader>

        {/* 预览 */}
        <div className="bg-muted rounded-lg p-4 mb-4">
          <h3 className="font-medium mb-1">{content.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {content.text}
          </p>
        </div>

        {/* 分享按钮 */}
        <div className="grid grid-cols-4 gap-4">
          {canShare && (
            <ShareButton icon={<MessageCircle />} label="分享" onClick={() => share(content)} />
          )}
          <ShareButton icon={<Twitter />} label="Twitter" onClick={() => shareToTwitter(content)} />
          <ShareButton icon="微" label="微博" onClick={() => shareToWeibo(content)} />
          <ShareButton icon={<Link />} label="复制链接" onClick={handleCopyLink} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 排行榜 (Web)

```tsx
export function Leaderboard() {
  const [type, setType] = useState<LeaderboardType>('reading_time');
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');

  const { data: entries, isLoading } = useQuery({
    queryKey: ['leaderboard', type, period],
    queryFn: () => getLeaderboard(type, period),
  });

  const formatScore = (score: number, type: LeaderboardType) => {
    switch (type) {
      case 'reading_time': return `${Math.floor(score / 60)} 小时`;
      case 'books_read': return `${score} 本`;
      case 'words_learned': return `${score} 词`;
      case 'streak': return `${score} 天`;
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={type} onValueChange={(v) => setType(v as LeaderboardType)}>
        <TabsList className="w-full">
          <TabsTrigger value="reading_time">阅读时长</TabsTrigger>
          <TabsTrigger value="books_read">读书数量</TabsTrigger>
          <TabsTrigger value="words_learned">学习单词</TabsTrigger>
          <TabsTrigger value="streak">连续天数</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        {entries?.map((entry, index) => (
          <LeaderboardRow
            key={entry.userId}
            rank={index + 1}
            entry={entry}
            score={formatScore(entry.score, type)}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 8. 数据分析埋点

| 事件 | 描述 | 参数 |
|------|------|------|
| `review_submitted` | 提交书评 | book_id, rating |
| `review_liked` | 点赞书评 | review_id |
| `user_followed` | 关注用户 | target_user_id |
| `share_initiated` | 发起分享 | type, platform |
| `share_completed` | 分享完成 | type, platform |
| `activity_viewed` | 查看动态 | - |
| `leaderboard_viewed` | 查看排行榜 | type, period |

---

## 9. 导出

```typescript
// src/features/social/index.ts
export { ShareModal } from './components/share-modal';
export { ReviewCard, WriteReview } from './components/book-review';
export { ActivityCard } from './components/activity-card';
export { Leaderboard } from './components/leaderboard';
export { FollowButton } from './components/follow-button';

export { useShare } from './hooks/use-share';
export { useBookReviews } from './hooks/use-reviews';
export { useFollow } from './hooks/use-follow';

export { useSocialStore } from './stores/social-store';

export type {
  UserProfile,
  UserStats,
  BookReview,
  Activity,
  ActivityType,
  LeaderboardEntry,
  LeaderboardType,
  ShareContent,
  ReadingClub,
} from './types';
```

---

*最后更新: 2025-12-28*
