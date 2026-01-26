# Audiobook 模块

> 有声书播放系统 - 跨平台统一文档

---

## 1. 概述

### 1.1 功能范围

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 音频播放 | 播放/暂停/跳转 | P0 |
| 章节导航 | 章节列表与切换 | P0 |
| 进度同步 | 云端进度同步 | P0 |
| 播放速度 | 0.5x - 3.0x 调节 | P1 |
| 睡眠定时 | 定时停止播放 | P1 |
| Whispersync | 音频-文本同步 | P1 |
| 后台播放 | 锁屏/后台播放 | P1 |
| 离线下载 | 下载供离线播放 | P2 |

### 1.2 平台实现对比

| 功能 | Android | React Native | Web |
|------|---------|--------------|-----|
| 音频引擎 | Media3 (ExoPlayer) | expo-av | HTML5 Audio API |
| 后台服务 | MediaSessionService | Background Mode | Service Worker |
| 媒体控制 | MediaSession | expo-av | Media Session API |
| 状态管理 | StateFlow | Zustand | Zustand |
| 离线存储 | File + Room | FileSystem | IndexedDB |

---

## 2. 数据来源

### 2.1 Loyal Books (Primary Source)

| 项目 | 说明 |
|------|------|
| 网站 | http://www.loyalbooks.com |
| 内容类型 | 公共领域 (Public Domain) 经典文学 |
| 总藏书量 | 7,000+ 有声书 |
| 音频来源 | LibriVox (archive.org) |
| 电子书来源 | Project Gutenberg |
| 许可证 | 免费使用，无版权限制 |

### 2.2 数据存储结构 (R2)

```
loyalbooks/
├── audiobooks/
│   └── {bookId}/
│       ├── cover.jpg
│       └── chapters/
│           ├── 001.mp3
│           ├── 002.mp3
│           └── ...
├── ebooks/
│   └── {bookId}/
│       └── book.epub
├── metadata/
│   └── {bookId}.json
└── associations.json
```

### 2.3 Audiobook-eBook 关联

每本书的 metadata.json 包含完整的关联信息：

| 字段 | 说明 |
|------|------|
| gutenbergId | Project Gutenberg ID，用于关联电子书 |
| archiveId | archive.org ID，用于获取音频文件 |
| r2Assets.coverUrl | R2 封面链接 |
| r2Assets.audioChapters | R2 音频章节链接列表 |
| r2Assets.epubUrl | R2 电子书链接 |

### 2.4 Top 100 优先列表

首批导入的 100 本有声书基于 Loyal Books 热门排行：

| 排名 | 书名 | 作者 |
|-----|------|------|
| 1 | Pride and Prejudice | Jane Austen |
| 2 | Moby Dick | Herman Melville |
| 3 | The Adventures of Huckleberry Finn | Mark Twain |
| 4 | Alice's Adventures in Wonderland | Lewis Carroll |
| 5 | The Adventures of Tom Sawyer | Mark Twain |
| ... | ... | ... |

完整列表见 `scripts/loyalbooks-ingestion/` 下载脚本。

---

## 3. 数据模型

```typescript
// 有声书
interface Audiobook {
  id: string;
  bookId: string;
  title: string;
  author: string;
  narrator?: string;
  coverUrl: string;
  totalDuration: number;
  chapterCount: number;
  source: 'librivox' | 'internet-archive' | 'premium';
  isDownloaded: boolean;
  lastPlayedAt?: string;
  lastPosition: number;
}

// 音频章节
interface AudioChapter {
  id: string;
  audiobookId: string;
  index: number;
  title: string;
  audioUrl: string;
  localPath?: string;
  duration: number;
  startTime: number;
  isDownloaded: boolean;
}

// 播放状态
interface PlaybackState {
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'ended';
  audiobookId: string | null;
  currentChapterIndex: number;
  position: number;
  duration: number;
  playbackRate: number;
  volume: number;
}

// 睡眠定时器
interface SleepTimer {
  isActive: boolean;
  endTime: number | null;
  remainingMinutes: number;
  mode: 'off' | 'end_of_chapter' | 'custom';
}

// Whispersync 同步点
interface SyncPoint {
  audioTime: number;
  textStart: number;
  textEnd: number;
  textCfi?: string;
  text?: string;
}
```

---

## 4. API 接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/audiobooks` | GET | 获取有声书列表 |
| `/audiobooks/{id}` | GET | 获取有声书详情 |
| `/audiobooks/{id}/chapters` | GET | 获取章节列表 |
| `/books/{bookId}/audiobook` | GET | 获取书籍关联的有声书 |
| `/audiobooks/{id}/whispersync` | GET | 获取 Whispersync 数据 |
| `/audiobooks/{id}/progress` | POST | 保存播放进度 |

---

## 5. Android 实现

### 5.1 MediaSession 服务

```kotlin
@AndroidEntryPoint
class AudiobookPlaybackService : MediaSessionService() {
    private var player: ExoPlayer? = null
    private var mediaSession: MediaSession? = null

    override fun onCreate() {
        super.onCreate()
        player = ExoPlayer.Builder(this)
            .setAudioAttributes(
                AudioAttributes.Builder()
                    .setContentType(C.AUDIO_CONTENT_TYPE_SPEECH)
                    .build(), true
            )
            .setHandleAudioBecomingNoisy(true)
            .build()

        mediaSession = MediaSession.Builder(this, player!!).build()
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo) = mediaSession
}
```

### 5.2 播放控制器

```kotlin
@Singleton
class PlaybackController @Inject constructor(
    private val audiobookRepository: AudiobookRepository
) {
    private val _playbackState = MutableStateFlow(PlaybackState())
    val playbackState: StateFlow<PlaybackState> = _playbackState.asStateFlow()

    suspend fun playAudiobook(audiobookId: String) {
        val chapters = audiobookRepository.getChapters(audiobookId)
        val mediaItems = chapters.map { chapter ->
            MediaItem.Builder()
                .setMediaId(chapter.id)
                .setUri(chapter.audioUrl)
                .build()
        }
        mediaController?.setMediaItems(mediaItems)
        mediaController?.play()
    }

    fun skipForward(seconds: Int = 30) {
        mediaController?.seekTo(mediaController!!.currentPosition + seconds * 1000)
    }

    fun skipBackward(seconds: Int = 15) {
        mediaController?.seekTo(maxOf(0, mediaController!!.currentPosition - seconds * 1000))
    }
}
```

---

## 6. React Native 实现

### 6.1 Zustand Store

```typescript
export const useAudioStore = create<AudioState & AudioActions>()(
  persist(
    immer((set) => ({
      playback: { status: 'idle', position: 0, playbackRate: 1.0 },
      sleepTimer: { isActive: false, mode: 'off' },

      setPlaybackStatus: (status) => set((s) => { s.playback.status = status; }),
      setPosition: (position) => set((s) => { s.playback.position = position; }),
      setPlaybackRate: (rate) => set((s) => { s.playback.playbackRate = rate; }),

      setSleepTimer: (minutes) => set((s) => {
        s.sleepTimer = {
          isActive: true,
          endTime: Date.now() + minutes * 60 * 1000,
          remainingMinutes: minutes,
          mode: 'custom',
        };
      }),
    })),
    { name: 'audio-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);
```

### 6.2 音频服务

```typescript
class AudioPlayerService {
  private sound: Audio.Sound | null = null;

  async initialize() {
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });
  }

  async loadAudio(chapter: AudioChapter) {
    if (this.sound) await this.sound.unloadAsync();
    const { sound } = await Audio.Sound.createAsync({ uri: chapter.audioUrl });
    this.sound = sound;
  }

  async play() { await this.sound?.playAsync(); }
  async pause() { await this.sound?.pauseAsync(); }
  async seekTo(seconds: number) { await this.sound?.setPositionAsync(seconds * 1000); }
  async setPlaybackRate(rate: number) { await this.sound?.setRateAsync(rate, true); }
}

export const audioPlayerService = new AudioPlayerService();
```

---

## 7. Web 实现

### 7.1 音频管理器

```typescript
class AudioManager {
  private audio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
    }
  }

  async load(url: string) {
    this.audio!.src = url;
    await new Promise((resolve) => {
      this.audio!.addEventListener('canplaythrough', resolve, { once: true });
    });
  }

  play() { this.audio?.play(); }
  pause() { this.audio?.pause(); }
  seek(time: number) { if (this.audio) this.audio.currentTime = time; }
  setPlaybackRate(rate: number) { if (this.audio) this.audio.playbackRate = rate; }
}

export const audioManager = typeof window !== 'undefined' ? new AudioManager() : null;
```

### 7.2 Media Session Hook

```typescript
export function useMediaSession() {
  const { currentBook, playback, togglePlayPause, skipForward, skipBackward } = useAudiobookStore();

  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentBook) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentBook.title,
      artist: currentBook.narrator,
      artwork: [{ src: currentBook.coverUrl }],
    });

    navigator.mediaSession.setActionHandler('play', togglePlayPause);
    navigator.mediaSession.setActionHandler('pause', togglePlayPause);
    navigator.mediaSession.setActionHandler('seekforward', skipForward);
    navigator.mediaSession.setActionHandler('seekbackward', skipBackward);
  }, [currentBook, playback.status]);
}
```

---

## 8. 工具函数

```typescript
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return h > 0
    ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m}:${s.toString().padStart(2, '0')}`;
}

export const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
export const TIMER_PRESETS = [5, 10, 15, 30, 45, 60];
```

---

*最后更新: 2025-12-28*
