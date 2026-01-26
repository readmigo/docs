# Readmigo Docs Project Guidelines

## Project Overview

VitePress documentation site for Readmigo project documentation.

## Project Structure

```
├── .vitepress/
│   └── config.mts        # VitePress configuration
├── 00-market/            # Market analysis & growth strategy
├── 01-product/           # Product requirements & features
├── 02-design/            # Design system & interaction specs
├── 03-architecture/      # System architecture & technical docs
├── 04-development/       # Development documentation
├── 05-operations/        # Operations & deployment
├── 06-content/           # Content operations & data sources
├── 07-modules/           # Feature module detailed design
├── 08-releases/          # Version releases & roadmap
├── 09-reference/         # Reference materials & archives
├── 10-pipeline/          # Data processing pipeline
├── plans/                # Implementation plans
├── index.md              # Homepage
└── README.md             # Documentation overview
```

## Development Rules

### Tech Stack

- Framework: VitePress
- Language: Markdown
- Build: Node.js

### Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Documentation Guidelines

- All documentation files should NOT include example code or implementation code
- Prioritize visual representations:
  - Flowcharts and workflow diagrams
  - Architecture diagrams
  - Tables
  - Other visual aids

## Investigation & Problem Analysis

When investigating problems, output using this template:
```
问题的原因：xxx
解决的思路：xxx
修复的方案：xxx
```
