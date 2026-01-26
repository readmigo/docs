# Readmigo Workers Deployment Guide

This guide explains how to deploy and manage background workers for batch job processing.

## Architecture Overview

```
┌─────────────────────┐     ┌─────────────────────┐
│   Fly.io API        │     │   Fly.io Workers    │
│   (readmigo-api)    │     │ (readmigo-workers)  │
│                     │     │                     │
│   - HTTP endpoints  │     │   - Job processors  │
│   - Job submission  │     │   - AI enrichment   │
│   - Queue stats     │     │   - Batch tasks     │
└─────────┬───────────┘     └──────────┬──────────┘
          │                            │
          └────────────┬───────────────┘
                       │
              ┌────────▼────────┐
              │     Redis       │
              │   (Upstash)     │
              │                 │
              │  Bull MQ Queues │
              └─────────────────┘
```

## Prerequisites

1. **Fly.io CLI** installed and authenticated
   ```bash
   # Install
   curl -L https://fly.io/install.sh | sh

   # Login
   fly auth login
   ```

2. **Redis** - Workers need Redis for job queues
   - Recommended: [Upstash Redis](https://upstash.com/) (serverless)
   - Or Fly.io Redis

3. **Environment Variables** configured in Fly.io secrets

## Deployment

### Quick Deploy

```bash
./scripts/deploy-workers.sh
```

### Manual Deploy

```bash
# Deploy workers
fly deploy --config fly.workers.toml

# Scale to multiple instances
fly scale count 2 --config fly.workers.toml
```

### Environment Setup

Set required secrets in Fly.io:

```bash
# Database
fly secrets set DATABASE_URL="postgresql://..." --config fly.workers.toml

# Redis
fly secrets set REDIS_HOST="your-redis-host" --config fly.workers.toml
fly secrets set REDIS_PORT="6379" --config fly.workers.toml
fly secrets set REDIS_PASSWORD="your-password" --config fly.workers.toml

# AI Providers (at least one required)
fly secrets set DEEPSEEK_API_KEY="sk-..." --config fly.workers.toml
fly secrets set OPENAI_API_KEY="sk-..." --config fly.workers.toml
fly secrets set QWEN_API_KEY="sk-..." --config fly.workers.toml
```

## Queue Configuration

Workers process jobs from these queues:

| Queue | Concurrency | Description |
|-------|-------------|-------------|
| `author-data` | 3 | Author personas, bios, timelines |
| `book-data` | 2 | Book summaries, CEFR scores, chapter analysis |
| `quote-data` | 5 | Quote extraction, translation, tagging |
| `batch-orchestrator` | 1 | Batch job coordination |

### Selective Queue Processing

To run workers for specific queues only:

```bash
# In fly.workers.toml or as environment variable
WORKER_QUEUES=author-data,book-data
```

## AI Provider Routing

### Batch Tasks (Cost Optimized)

| Task Type | Primary | Fallback |
|-----------|---------|----------|
| Book Summary | DeepSeek | GPT-4o-mini |
| CEFR Assessment | DeepSeek | GPT-4o-mini |
| Chapter Summary | DeepSeek | GPT-4o-mini |
| Author Bio | DeepSeek | GPT-4o-mini |
| Author Persona | DeepSeek | Claude Haiku |
| Quote Extract | DeepSeek | GPT-4o-mini |
| Chinese Translation | **Qwen** | DeepSeek |

### Cost Comparison (per 1M tokens)

| Provider | Input | Output | Best For |
|----------|-------|--------|----------|
| DeepSeek V3 | $0.27 | $1.10 | Batch English tasks |
| Qwen Plus | ¥0.004 | ¥0.012 | Chinese content |
| GPT-4o-mini | $0.15 | $0.60 | Real-time fallback |
| Claude Haiku | $0.25 | $1.25 | Quality fallback |

## Monitoring

### View Logs

```bash
fly logs --config fly.workers.toml
```

### Check Status

```bash
fly status --config fly.workers.toml
```

### Queue Statistics (via API)

```bash
curl https://api.readmigo.app/api/v1/admin/jobs/queue/stats
```

## Scaling

### Horizontal Scaling

```bash
# Scale to 3 worker instances
fly scale count 3 --config fly.workers.toml
```

### Vertical Scaling

Edit `fly.workers.toml`:

```toml
[[vm]]
  cpu_kind = "shared"
  cpus = 2          # Increase CPUs
  memory_mb = 1024  # Increase memory
```

## Troubleshooting

### Workers Not Processing Jobs

1. Check Redis connection:
   ```bash
   fly ssh console --config fly.workers.toml
   node -e "require('ioredis').createClient().ping().then(console.log)"
   ```

2. Verify environment variables:
   ```bash
   fly ssh console --config fly.workers.toml
   echo $REDIS_HOST
   ```

### High Memory Usage

- Reduce `WORKER_CONCURRENCY` in environment
- Scale horizontally instead of vertically

### Job Failures

Check failed jobs via API:
```bash
curl https://api.readmigo.app/api/v1/admin/jobs/failed/book-data
```

## Local Development

Run workers locally:

```bash
cd apps/backend

# Run all queues
WORKER_MODE=true pnpm start:worker

# Run specific queues
WORKER_QUEUES=author-data,book-data pnpm start:worker
```

## Cost Estimation

| Workload | Workers | Est. Monthly Cost |
|----------|---------|-------------------|
| Light (100 books/month) | 1 | ~$5 |
| Medium (500 books/month) | 2 | ~$15 |
| Heavy (2000 books/month) | 3 | ~$30 |

*Costs are for Fly.io compute only. AI API costs depend on usage.*
