# AI Career Copilot — Codebase Snapshot Map

> Auto-generated reference. 80+ files across lib/, app/, components/, public/.

---

## Config & Setup

| File | Purpose |
|------|---------|
| `package.json` | Dependencies: Next.js 14, React 18, Tailwind, Playwright, MongoDB, Anthropic, Recharts, Zod, Sonner, Nodemailer, node-cron, pdf-parse, @power-seo/*, @glincker/geo-seo |
| `tailwind.config.js` | Dark mode, custom fonts/colors |
| `postcss.config.js` | PostCSS with tailwind + autoprefixer |
| `.env.example` | Proxy, API keys, SMTP, MongoDB, Supabase, webhook config |
| `middleware.js` | Rate limiting + security headers on API routes |

## Application Shell (`app/`)

| File | Purpose |
|------|---------|
| `app/layout.jsx` | Root layout: SEO metadata, JSON-LD structured data (SoftwareApplication, Organization, FAQPage), ErrorBoundary, Providers |
| `app/providers.jsx` | ThemeProvider wrapper (next-themes) |
| `app/page.jsx` | Main SPA: 14-tab dashboard (Dashboard, Agents, Profile, Search, Visa, Analytics, Campaigns, Discoveries, Interview, SEO, Status, Audit, Health, Alerts) |
| `app/globals.css` | Tailwind base styles, custom scrollbar |

## API Routes (`app/api/`)

| Route | Methods | Purpose |
|-------|---------|---------|
| `auto-apply/route.js` | POST | Launch Playwright auto-apply with dedup + audit |
| `applications/route.js` | GET, POST, PATCH | Application CRUD with deduplication |
| `applications/[id]/route.js` | GET, PATCH | Single application detail/update |
| `campaigns/route.js` | GET, POST, PATCH | Campaign CRUD with cron scheduling |
| `discoveries/route.js` | GET, POST, PATCH | Discovery engine + web scraping sweep |
| `analytics/route.js` | GET | Dashboard statistics aggregation |
| `stream/route.js` | GET (SSE) | Real-time agent log streaming |
| `resume/route.js` | GET, POST | Profile fetch, PDF parsing, resume tailoring |
| `notifications/route.js` | GET, POST | Email notification dispatch |
| `logs/route.js` | GET | Agent telemetry logs |
| `health/route.js` | GET | System health check (DB, pool, scheduler, LLM, SMTP, memory) |
| `export/route.js` | GET | CSV/JSON data export |
| `webhooks/route.js` | GET, POST | Webhook config + test dispatch |
| `visa/route.js` | GET, POST | Visa probability scoring (6 countries) |
| `tasks/[queueId]/route.js` | GET, POST | Task status check + cancellation |
| `status/route.js` | GET, POST | Portal status check results + trigger |
| `interview/route.js` | POST | Interview prep package generation |
| `search/route.js` | GET | Full-text search across all data |
| `audit/route.js` | GET | Audit trail logs + stats |
| `seo/sitemap/route.js` | GET | Dynamic XML sitemap |
| `seo/llms-txt/route.js` | GET | AI crawler discovery file |
| `seo/optimize/route.js` | POST | Profile SEO optimization |
| `seo/analyze/route.js` | POST | Content SEO analysis |

## Core Libraries (`lib/`)

| File | Purpose |
|------|---------|
| `mongodb.js` | Primary data layer: 5 collections (users, applications, agent_logs, discoveries, campaigns), in-memory fallback |
| `db.js` | Legacy re-export bridge |
| `orchestrator.js` | Central command: 5 agents, job queue, resume pipeline, dedup, webhooks, audit, post-tracker |
| `llm-filler.js` | Anthropic Claude API form field generation |
| `match-engine.js` | Multi-factor scoring (6 weighted factors) |
| `discovery-engine.js` | Web scraper for DAAD, Chevening, LinkedIn, Indeed, IND, UK Visas |
| `resume-pipeline.js` | Pre-apply resume tailoring pipeline |
| `resume-parser.js` | PDF extraction + regex + LLM tailoring |
| `browser-pool.js` | Singleton Chromium pool (max 3), anti-detection |
| `browser-driver.js` | Playwright wrapper with human-mimic typing |
| `notifier.js` | Nodemailer SMTP with styled HTML templates |
| `webhooks.js` | Slack, Telegram, Discord, Custom HTTP webhooks |
| `audit-trail.js` | Compliance-grade audit logging |
| `deduplication.js` | Levenshtein fuzzy dedup: URL + title+institution |
| `post-tracker.js` | Post-submission monitoring |
| `job-queue.js` | Persistent job queue with retry + exponential backoff |
| `scheduler.js` | node-cron campaign scheduler (5 presets) |
| `status-checker.js` | Real portal scraping for status changes |
| `health-check.js` | System health monitoring |
| `env-validator.js` | Startup environment validation |
| `rate-limiter.js` | Sliding window rate limiter |
| `visa-scorer.js` | Visa probability for 6 countries, 18 programs |
| `validation.js` | Zod schemas for all API inputs |

## SEO Libraries (`lib/seo/`)

| File | Purpose |
|------|---------|
| `schema-builder.js` | JSON-LD structured data: SoftwareApplication, Organization, FAQPage, WebSite, BreadcrumbList |
| `keyword-extractor.js` | TF-IDF-like keyword extraction from job descriptions |
| `ats-scorer.js` | ATS compatibility scoring (sections, formatting, keywords, action verbs) |
| `linkedin-optimizer.js` | LinkedIn profile analysis + headline/about generation |

## Agents (`lib/agents/`)

| Agent | Version | Capabilities |
|-------|---------|-------------|
| `ScholarshipScout.js` | v3.0 | Browser automation, LLM form fill, pool reuse |
| `JobHunter.js` | v4.0 | AI cover letter, smart field detection, human-mimic typing |
| `PermitPathfinder.js` | v2.0 | Visa eligibility, smart select detection, government portals |
| `InterviewCoach.js` | v1.0 | Company research, question generation, salary intel, briefing docs |
| `SeoOptimizer.js` | v1.0 | ATS scoring, keyword extraction, LinkedIn optimization, content analysis |

## Components (`components/`)

| Component | Purpose |
|-----------|---------|
| `PipelineCard.jsx` | Application card with status, progress, auto-apply |
| `AgentCard.jsx` | Agent status display with pulse animation |
| `TerminalLog.jsx` | Terminal-style log viewer with SSE |
| `AnalyticsCharts.jsx` | Recharts: Pie, Bar, Line + stat cards |
| `CampaignManager.jsx` | Campaign CRUD with presets |
| `DiscoveryFeed.jsx` | Discovery list with auto-apply |
| `ProfileForm.jsx` | Editable profile + PDF upload + AI tools |
| `ApplicationDetailModal.jsx` | Detail view with auto-apply |
| `OnboardingWizard.jsx` | 5-step first-time flow |
| `NotificationSettings.jsx` | Persisted email preferences |
| `ErrorBoundary.jsx` | Error boundary + wrapper |
| `SearchPanel.jsx` | Universal full-text search |
| `VisaScorer.jsx` | Visual visa probability cards |
| `AuditTrail.jsx` | Filterable audit log |
| `HealthDashboard.jsx` | System health monitoring |
| `InterviewPrep.jsx` | Interview prep form + questions + salary |
| `StatusCheck.jsx` | Portal status tracker |
| `SEOAnalyzer.jsx` | Resume/LinkedIn SEO scoring + keyword analysis |
| `LinkedInOptimizer.jsx` | LinkedIn profile optimization + suggestions |
| `SEOHead.jsx` | Reusable meta tags + Open Graph component |

## Static Assets

| File | Purpose |
|------|---------|
| `public/llms.txt` | AI crawler discovery file (llmstxt.org standard) |

## Data Schema (MongoDB)

### `users`
```
_id, firstName, lastName, email, phone, coreStack, bio, gpa, ielts, nationality, passportNumber, createdAt
```

### `applications`
```
_id, userId, title, institution, type, country, status, progress, matchScore, agent, url, date, createdAt, updatedAt
```

### `agent_logs`
```
_id, timestamp, type, status, msg, category, action, userId, targetType, targetId, details, severity
```

### `discoveries`
```
_id, userId, source, type, country, title, url, discoveredAt, status
```

### `campaigns`
```
_id, userId, name, preset, cron, maxApplications, delay, types, countries, status, runCount, createdAt, lastRunAt
```

## Totals

| Category | Files | ~Lines |
|----------|-------|--------|
| lib/ (core) | 22 | 3,759 |
| lib/seo/ | 4 | 650 |
| lib/agents/ | 5 | 780 |
| app/api/ | 23 | 1,400 |
| app/ (shell) | 3 | 520 |
| components/ | 19 | 2,900 |
| public/ | 1 | 40 |
| Config | 5 | 120 |
| **TOTAL** | **82** | **~10,170** |
