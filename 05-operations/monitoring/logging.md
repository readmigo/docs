# Full-Stack Logging & Crash Collection System

## Overview

This document outlines the comprehensive logging and crash collection infrastructure for Readmigo, covering iOS client, NestJS backend, and operational monitoring.

---

## Current State Summary

### What Exists

| Component | Status | Location |
|-----------|--------|----------|
| iOS CrashTrackingService | ✅ Implemented | `ios/.../Services/CrashTrackingService.swift` |
| iOS LoggingService | ✅ Implemented | `ios/.../Services/LoggingService.swift` |
| Backend LogsModule | ✅ Complete | `apps/backend/src/modules/logs/` |
| Backend TrackingModule | ✅ Implemented | `apps/backend/src/modules/tracking/` |
| Database Models | ✅ Implemented | CrashReport, ErrorLog, RuntimeLog |
| Global Exception Filter | ✅ Implemented | `apps/backend/src/common/filters/` |
| Correlation ID Middleware | ✅ Implemented | `apps/backend/src/common/middleware/` |
| Sentry Integration | ✅ Implemented | `apps/backend/src/common/sentry/` |

### Remaining Work

- [ ] Prometheus metrics (Phase 3 - optional)
- [ ] Grafana dashboards (Phase 3 - optional)
- [ ] Winston logger configuration (optional - using NestJS Logger)

---

## Architecture Design

```
+------------------+       +-------------------+       +------------------+
|   iOS Client     |       |   NestJS Backend  |       |   Storage/Tools  |
+------------------+       +-------------------+       +------------------+
|                  |       |                   |       |                  |
| CrashTracking    |------>| LogsController    |------>| PostgreSQL       |
| Service          |       |   /logs/crash     |       |   - CrashReport  |
|                  |       |   /logs/batch     |       |   - ErrorLog     |
| LoggingService   |       |                   |       |   - AppLog       |
|   - Breadcrumbs  |       | GlobalException   |       |                  |
|   - Batch Queue  |       |   Filter          |       | Sentry           |
|   - Offline      |       |                   |       |   - Real-time    |
|                  |       | Winston Logger    |       |   - Grouping     |
| Signal Handlers  |       |   - JSON format   |       |   - Alerts       |
|   - SIGABRT      |       |   - Correlation   |       |                  |
|   - SIGSEGV      |       |                   |       | Prometheus       |
|                  |       | Metrics Collector |       |   - Metrics      |
+------------------+       +-------------------+       +------------------+
```

---

## Phase 1: Database & Backend Foundation (Critical)

### 1.1 Prisma Schema Additions

```prisma
// Add to prisma/schema.prisma

model CrashReport {
  id            String   @id @default(uuid())
  userId        String?

  // Crash Details
  errorType     String
  message       String
  stackTrace    String   @db.Text
  breadcrumbs   Json?    // Last 20 breadcrumbs

  // Device Info
  platform      String   // iOS, Android
  osVersion     String
  appVersion    String
  buildNumber   String
  deviceModel   String

  // Context
  screenName    String?
  userContext   Json?    // Custom context data
  memoryUsage   Int?     // MB
  batteryLevel  Int?     // Percentage
  networkType   String?  // WiFi, Cellular, None

  // Metadata
  sessionId     String?
  isBackground  Boolean  @default(false)
  createdAt     DateTime @default(now())

  // Relations
  user          User?    @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([createdAt])
  @@index([errorType])
  @@index([appVersion])
}

model ErrorLog {
  id            String   @id @default(uuid())
  userId        String?

  // Error Details
  level         String   // error, warning, fatal
  message       String
  stackTrace    String?  @db.Text
  code          String?  // Error code

  // Request Context
  correlationId String?
  endpoint      String?
  method        String?
  statusCode    Int?

  // Source
  source        String   // ios, backend, web
  component     String?  // Module/Service name

  // Metadata
  metadata      Json?
  createdAt     DateTime @default(now())

  user          User?    @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([createdAt])
  @@index([level])
  @@index([correlationId])
  @@index([source])
}

model ApplicationLog {
  id            String   @id @default(uuid())

  // Log Details
  level         String   // debug, info, warning, error
  message       String

  // Context
  correlationId String?
  source        String   // Service/module name
  action        String?  // Action being performed

  // Metadata
  metadata      Json?
  duration      Int?     // Operation duration in ms
  createdAt     DateTime @default(now())

  @@index([createdAt])
  @@index([level])
  @@index([correlationId])
}
```

### 1.2 Global Exception Filter

```typescript
// apps/backend/src/common/filters/all-exceptions.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly prisma: PrismaService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = request.headers['x-correlation-id'] as string || uuidv4();
    const userId = request.user?.id;

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof Error
        ? exception.message
        : 'Internal server error';

    const stack =
      exception instanceof Error ? exception.stack : undefined;

    // Log to database for 4xx and 5xx errors
    if (status >= 400) {
      try {
        await this.prisma.errorLog.create({
          data: {
            userId,
            level: status >= 500 ? 'error' : 'warning',
            message,
            stackTrace: stack,
            correlationId,
            endpoint: request.url,
            method: request.method,
            statusCode: status,
            source: 'backend',
            component: 'http',
            metadata: {
              body: this.sanitizeBody(request.body),
              query: request.query,
              userAgent: request.headers['user-agent'],
            },
          },
        });
      } catch (dbError) {
        this.logger.error('Failed to persist error log', dbError);
      }
    }

    // Structured log output
    this.logger.error({
      correlationId,
      status,
      message,
      endpoint: request.url,
      method: request.method,
      userId,
      stack: status >= 500 ? stack : undefined,
    });

    response.status(status).json({
      statusCode: status,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) sanitized[field] = '[REDACTED]';
    });
    return sanitized;
  }
}
```

### 1.3 Correlation ID Middleware

```typescript
// apps/backend/src/common/middleware/correlation-id.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    next();
  }
}
```

### 1.4 Winston Logger Configuration

```typescript
// apps/backend/src/common/logger/winston.config.ts

import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig = WinstonModule.forRoot({
  transports: [
    // Console transport with colors for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const correlationId = meta.correlationId ? `[${meta.correlationId}]` : '';
          return `${timestamp} ${level} ${correlationId}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          }`;
        }),
      ),
    }),

    // JSON file transport for production
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),

    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});
```

### 1.5 Updated LogsService

```typescript
// apps/backend/src/modules/logs/logs.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCrashReportDto, CreateLogBatchDto } from './dto';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processBatch(dto: CreateLogBatchDto, userId?: string) {
    const results = { processed: 0, errors: 0 };

    for (const log of dto.logs) {
      try {
        // Persist error-level logs to database
        if (['error', 'warning', 'fatal'].includes(log.level)) {
          await this.prisma.errorLog.create({
            data: {
              userId,
              level: log.level,
              message: log.message,
              source: 'ios',
              component: log.context,
              metadata: log.metadata,
              createdAt: new Date(log.timestamp),
            },
          });
        }

        // Also log to Winston for all levels
        this.logger.log({
          level: log.level,
          message: log.message,
          source: 'ios',
          context: log.context,
          userId,
        });

        results.processed++;
      } catch (error) {
        results.errors++;
        this.logger.error(`Failed to process log: ${error.message}`);
      }
    }

    return results;
  }

  async createCrashReport(dto: CreateCrashReportDto, userId?: string) {
    const crashReport = await this.prisma.crashReport.create({
      data: {
        userId,
        errorType: dto.errorType,
        message: dto.message,
        stackTrace: dto.stackTrace,
        breadcrumbs: dto.breadcrumbs,
        platform: dto.deviceInfo.platform,
        osVersion: dto.deviceInfo.osVersion,
        appVersion: dto.deviceInfo.appVersion,
        buildNumber: dto.deviceInfo.buildNumber || '',
        deviceModel: dto.deviceInfo.deviceModel,
        screenName: dto.context?.screen,
        userContext: dto.context,
        sessionId: dto.sessionId,
      },
    });

    // Alert on crash (integrate with Sentry/PagerDuty)
    this.logger.error({
      message: 'CRASH REPORT RECEIVED',
      crashId: crashReport.id,
      errorType: dto.errorType,
      appVersion: dto.deviceInfo.appVersion,
      userId,
    });

    // TODO: Send to Sentry, trigger alerts

    return { id: crashReport.id, received: true };
  }

  async getCrashStats(days: number = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [total, byType, byVersion] = await Promise.all([
      this.prisma.crashReport.count({
        where: { createdAt: { gte: since } },
      }),
      this.prisma.crashReport.groupBy({
        by: ['errorType'],
        where: { createdAt: { gte: since } },
        _count: true,
      }),
      this.prisma.crashReport.groupBy({
        by: ['appVersion'],
        where: { createdAt: { gte: since } },
        _count: true,
      }),
    ]);

    return { total, byType, byVersion, period: `${days} days` };
  }
}
```

---

## Phase 2: Sentry Integration (High Priority)

### 2.1 iOS Sentry Setup

```swift
// In Package.swift or via CocoaPods
// pod 'Sentry', '~> 8.0'

// AppDelegate or App initialization
import Sentry

func initializeSentry() {
    SentrySDK.start { options in
        options.dsn = "YOUR_SENTRY_DSN"
        options.environment = AppConfig.environment // dev, staging, prod
        options.releaseName = "\(Bundle.main.appVersion).\(Bundle.main.buildNumber)"

        // Performance monitoring
        options.tracesSampleRate = 0.2 // 20% of transactions
        options.profilesSampleRate = 0.1 // 10% profile sampling

        // Breadcrumbs
        options.maxBreadcrumbs = 100
        options.enableAutoBreadcrumbTracking = true

        // Attachments
        options.attachScreenshot = true
        options.attachViewHierarchy = true

        // Session tracking
        options.enableAutoSessionTracking = true
        options.sessionTrackingIntervalMillis = 30000

        // Before send hook for PII filtering
        options.beforeSend = { event in
            // Sanitize user data
            if var user = event.user {
                user.email = nil // Remove PII
                event.user = user
            }
            return event
        }
    }
}
```

### 2.2 Backend Sentry Setup

```typescript
// apps/backend/src/main.ts

import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.APP_VERSION,

  integrations: [
    new ProfilingIntegration(),
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    new Sentry.Integrations.Prisma({ client: prisma }),
  ],

  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,

  beforeSend(event) {
    // Sanitize sensitive data
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
    }
    return event;
  },
});
```

---

## Phase 3: Metrics & Monitoring

### 3.1 Prometheus Metrics

```typescript
// apps/backend/src/common/metrics/metrics.service.ts

import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry: Registry;

  // Counters
  readonly httpRequestsTotal: Counter;
  readonly crashReportsTotal: Counter;
  readonly errorsTotal: Counter;

  // Histograms
  readonly httpRequestDuration: Histogram;
  readonly dbQueryDuration: Histogram;

  // Gauges
  readonly activeUsers: Gauge;
  readonly cacheHitRate: Gauge;

  constructor() {
    this.registry = new Registry();

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'path', 'status'],
      registers: [this.registry],
    });

    this.crashReportsTotal = new Counter({
      name: 'crash_reports_total',
      help: 'Total crash reports received',
      labelNames: ['platform', 'app_version', 'error_type'],
      registers: [this.registry],
    });

    this.errorsTotal = new Counter({
      name: 'errors_total',
      help: 'Total errors logged',
      labelNames: ['level', 'source', 'component'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration',
      labelNames: ['method', 'path'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.dbQueryDuration = new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Database query duration',
      labelNames: ['operation', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.registry],
    });

    this.activeUsers = new Gauge({
      name: 'active_users',
      help: 'Current active users',
      registers: [this.registry],
    });
  }

  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
```

### 3.2 Metrics Endpoint

```typescript
// apps/backend/src/modules/metrics/metrics.controller.ts

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', 'text/plain');
    res.send(await this.metricsService.getMetrics());
  }
}
```

---

## Phase 4: Alerting Rules

### 4.1 Alert Conditions

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| High Crash Rate | >10 crashes/hour | Critical | PagerDuty + Slack |
| Error Spike | 5x normal error rate | High | Slack |
| New Error Type | First occurrence | Medium | Slack |
| API Latency | p99 > 2s | High | Slack |
| Database Slow | Query > 1s | Medium | Log only |
| Memory Pressure | >90% usage | Critical | Auto-restart |

### 4.2 Sentry Alert Configuration

```yaml
# Sentry alert rules (configure in Sentry UI)
alerts:
  - name: "High Crash Rate"
    conditions:
      - type: event_frequency
        value: 10
        interval: 1h
    actions:
      - type: pagerduty
        severity: critical
      - type: slack
        channel: "#incidents"

  - name: "New Issue"
    conditions:
      - type: first_seen_event
    actions:
      - type: slack
        channel: "#errors"

  - name: "Error Regression"
    conditions:
      - type: regression
    actions:
      - type: slack
        channel: "#errors"
```

---

## Log Retention Policy

| Log Type | Retention | Storage |
|----------|-----------|---------|
| Crash Reports | 90 days | PostgreSQL + S3 |
| Error Logs | 30 days | PostgreSQL |
| Application Logs | 7 days | File + CloudWatch |
| Debug Logs | 24 hours | File only |
| Metrics | 30 days | Prometheus/Grafana |

### Cleanup Job

```typescript
// apps/backend/src/jobs/log-cleanup.job.ts

@Injectable()
export class LogCleanupJob {
  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 2 * * *') // Daily at 2 AM
  async cleanup() {
    const now = new Date();

    // Delete error logs older than 30 days
    await this.prisma.errorLog.deleteMany({
      where: {
        createdAt: { lt: new Date(now.setDate(now.getDate() - 30)) },
      },
    });

    // Archive crash reports older than 90 days (move to S3)
    const oldCrashes = await this.prisma.crashReport.findMany({
      where: {
        createdAt: { lt: new Date(now.setDate(now.getDate() - 90)) },
      },
    });

    // Archive to S3, then delete from DB
    // await this.archiveService.archiveCrashReports(oldCrashes);
  }
}
```

---

## Implementation Checklist

### Phase 1 - Foundation ✅ COMPLETED
- [x] Add Prisma models for CrashReport, ErrorLog, RuntimeLog
- [x] Run database migration
- [x] Implement GlobalExceptionFilter
- [x] Add CorrelationIdMiddleware
- [x] Update LogsService with database persistence
- [x] Add crash stats endpoint
- [x] Add error stats endpoint
- [x] Add runtime log batch API
- [x] Add runtime log query API
- [x] Add runtime log stats API
- [x] Implement 10-day cleanup cron job

### Phase 2 - Sentry Integration ✅ COMPLETED
- [x] Add Sentry SDK to iOS project (conditional import ready)
- [x] Configure Sentry in CrashTrackingService
- [x] Add @sentry/node to backend
- [x] Configure Sentry in main.ts
- [x] Configure release tracking
- [x] Integrate Sentry with GlobalExceptionFilter

### Phase 3 - Monitoring (Optional - Future)
- [ ] Add prom-client to backend
- [ ] Create MetricsService
- [ ] Add /metrics endpoint
- [ ] Set up Prometheus scraping
- [ ] Create Grafana dashboards
- [ ] Configure basic alerts

### Phase 4 - Operations (Optional - Future)
- [ ] Set up Sentry alert rules
- [ ] Configure PagerDuty integration (when team grows)
- [ ] Implement S3 archival for old crash reports

---

## Dashboard Recommendations

### Grafana Dashboards

1. **Application Health**
   - Request rate / Error rate
   - Response time percentiles
   - Active users
   - Database connection pool

2. **Crash Analytics**
   - Crash rate over time
   - Top crash types
   - Crashes by app version
   - Affected users count

3. **Error Tracking**
   - Error rate by severity
   - Top error messages
   - Errors by endpoint
   - Error resolution time

---

## Cost Strategy (Free Tier Focus)

Since Readmigo is a new project with limited users initially, we'll maximize free tiers and scale later.

| Service | Free Tier | Sufficient For |
|---------|-----------|----------------|
| **Sentry** | 5K errors/mo | Early stage (< 1K users) |
| **Custom Backend Logs** | PostgreSQL storage | Unlimited (own DB) |
| **Prometheus** | Self-hosted | Free forever |
| **Grafana** | Self-hosted | Free forever |
| **Email Alerts** | SMTP/SendGrid free | 100 emails/day |

### Recommended Stack (100% Free)

```
┌─────────────────────────────────────────────────────────────┐
│                     FREE TIER STACK                         │
├─────────────────────────────────────────────────────────────┤
│  Sentry Free (5K errors/mo)                                 │
│    - Real-time crash reporting                              │
│    - Error grouping & deduplication                         │
│    - iOS + Backend integration                              │
│    - Email alerts on new issues                             │
├─────────────────────────────────────────────────────────────┤
│  Custom Backend (PostgreSQL - existing)                     │
│    - Full crash report storage                              │
│    - Error logs with full context                           │
│    - Reading session analytics                              │
│    - No limits, your own data                               │
├─────────────────────────────────────────────────────────────┤
│  Simple Email Alerts                                        │
│    - Crash notifications to your email                      │
│    - Daily digest of errors                                 │
│    - No complex alerting system needed initially            │
└─────────────────────────────────────────────────────────────┘
```

### When to Upgrade

| Trigger | Action |
|---------|--------|
| > 5K errors/month | Upgrade Sentry OR rely more on custom backend |
| > 10K DAU | Add Prometheus + Grafana for metrics |
| Team grows to 2+ devs | Add Slack integration |
| Revenue > $1K/month | Consider paid monitoring |

---

## Decisions Made (Readmigo-Specific)

### 1. Logging Strategy: Both Sentry + Custom

**Decision**: Use both in parallel

| Aspect | Sentry | Custom Backend |
|--------|--------|----------------|
| Crash grouping | Primary | Backup |
| Error alerts | Primary | - |
| Full crash data | Limited | Full storage |
| Historical analysis | 90 days | Unlimited |
| Offline crashes | Syncs later | Syncs later |

**Rationale**: Sentry for real-time visibility, custom backend for full data ownership and no vendor lock-in.

### 2. PII Policy for Crash Reports

**Decision**: Capture minimal PII, focused on debugging

| Data | Capture? | Reason |
|------|----------|--------|
| User ID | Yes | Link crashes to user for support |
| Email | No | Not needed for debugging |
| Device Model | Yes | Hardware-specific bugs |
| OS Version | Yes | OS-specific bugs |
| App Version | Yes | Version regression tracking |
| Current Screen | Yes | UI context for crash |
| Book ID (if reading) | Yes | Content-specific bugs |
| Reading Position | Yes | Reader component bugs |
| AI Chat Context | Last message only | AI feature debugging |
| Network State | Yes | Offline/sync issues |

**Sanitization Rules**:
```swift
// iOS - sanitize before sending
func sanitizeCrashContext(_ context: [String: Any]) -> [String: Any] {
    var sanitized = context
    // Remove any auth tokens
    sanitized.removeValue(forKey: "authToken")
    sanitized.removeValue(forKey: "refreshToken")
    // Truncate long text (AI responses, book content)
    if let text = sanitized["lastAIResponse"] as? String {
        sanitized["lastAIResponse"] = String(text.prefix(200))
    }
    return sanitized
}
```

### 3. Alert Delivery: Email to Developer

**Decision**: Direct email alerts to you

**Setup**:
```typescript
// Backend alert configuration
const ALERT_CONFIG = {
  recipient: 'your-email@example.com', // Your email

  // What triggers immediate email
  immediate: [
    'crash_report',           // Any crash
    'fatal_error',            // Fatal errors
    'auth_failure_spike',     // Unusual auth failures (possible attack)
  ],

  // Daily digest (sent at 9 AM)
  digest: [
    'error_summary',          // Error count by type
    'new_error_types',        // First-time errors
    'api_health_summary',     // Slow endpoints
  ],
};
```

**Sentry Email Settings**:
- Enable: "Email me on new issue"
- Enable: "Email me on issue regression"
- Disable: "Email on every occurrence" (too noisy)

### 4. Retention Policy (Readmigo-Specific)

**Decision**: Conservative retention for new project

| Data Type | Retention | Reason |
|-----------|-----------|--------|
| Crash Reports | 180 days | Long retention for pattern analysis |
| Error Logs | 30 days | Sufficient for debugging |
| Application Logs | 7 days | Debug only, not critical |
| Reading Sessions | Forever | User analytics, never delete |
| AI Interactions | Forever | Product improvement data |

**Storage Estimate** (first year, < 1K users):
- Crash Reports: ~50MB (assuming 100 crashes/month)
- Error Logs: ~100MB
- App Logs: ~500MB (rotated)
- **Total**: < 1GB additional PostgreSQL storage

**Cleanup Job** (simplified for solo dev):
```typescript
// Run weekly, not daily - less maintenance
@Cron('0 3 * * 0') // Sunday 3 AM
async cleanup() {
  // Only clean logs, keep crash reports longer
  await this.prisma.errorLog.deleteMany({
    where: { createdAt: { lt: subDays(new Date(), 30) } },
  });

  await this.prisma.applicationLog.deleteMany({
    where: { createdAt: { lt: subDays(new Date(), 7) } },
  });

  // Crash reports: clean after 180 days
  await this.prisma.crashReport.deleteMany({
    where: { createdAt: { lt: subDays(new Date(), 180) } },
  });
}
```

### 5. Budget: $0/month Initially

**Decision**: 100% free tier stack

| Component | Solution | Cost |
|-----------|----------|------|
| Crash Reporting | Sentry Free | $0 |
| Log Storage | PostgreSQL (existing) | $0 |
| Alerts | Email (existing SMTP) | $0 |
| Metrics | Skip for now | $0 |
| **Total** | | **$0** |

**Scale-up Trigger**: When hitting 5K errors/month on Sentry, evaluate:
1. Reduce noise (filter non-critical errors)
2. Rely more on custom backend
3. Pay for Sentry ($26/mo) if project revenue supports it

---

## Simplified Implementation for Solo Developer

Given you're the only developer, here's a streamlined approach:

### Phase 1: Quick Wins (Do Now)
1. Add Prisma models (CrashReport, ErrorLog)
2. Update LogsService to persist crashes
3. Enable Sentry free tier
4. Set up email alerts for crashes

### Phase 2: When You Have Time
1. Add GlobalExceptionFilter
2. Improve breadcrumb tracking
3. Add crash stats endpoint for admin

### Phase 3: When Users Grow (> 1K)
1. Add Prometheus metrics
2. Create simple Grafana dashboard
3. Consider paid monitoring

### Skip Entirely (Over-engineering for now)
- Complex alerting rules
- PagerDuty integration
- On-call rotation
- Distributed tracing
- Real-time dashboards

---

## Quick Reference: What to Track in Readmigo

### Critical (Always Log)
- App crashes
- API errors (4xx, 5xx)
- Authentication failures
- Payment/subscription errors
- Book download failures

### Important (Log Errors Only)
- AI chat failures
- Sync conflicts
- Cache misses on critical data
- Network timeouts

### Debug (Development Only)
- API response times
- Cache hit rates
- UI navigation timing
- Memory warnings

### Never Log
- Full book content
- User reading speed details
- AI conversation history (beyond debugging)
- Any payment card details
