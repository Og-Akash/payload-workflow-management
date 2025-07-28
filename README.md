
# 📚 Dynamic Workflow Management System – README

A complete, self-hosted workflow orchestration layer built with **Payload CMS v3 + Next.js 15**.
It lets you attach **unlimited, condition-based approval flows** to any collection (Blog, Contracts, etc.) while keeping an immutable audit trail and a rich admin UI for real-time actions.

## ✨ Key Features

* Dynamic workflow engine (steps, conditions, SLA, branching)
* Role / user assignments with permission checks
* Immutable `WorkflowLogs` collection for audits
* Inline “Approve / Reject / Comment” panel injected into every targeted document
* REST endpoints (`/api/workflows/*`) for external triggers and status polling
* TypeScript, Postgres (via Drizzle) \& App Router—all batteries included


## 🏗️ High-Level Architecture

```
┌───────── Next.js 15 (App Router) ────────┐
│  • Public routes (/posts, /contracts)    │
│  • /api/<collection>/*  (built-in)       │
│  • /api/workflows/*  (plugin)            │
│                                          │
│   ┌──────────────────────────────────┐    │
│   │  Payload Admin (React)           │    │
│   │  ├─ Custom UI Field              │    │
│   │  │   ↳ WorkflowInterface.tsx     │    │
│   │  ├─ Auth, Media, Rich Text       │    │
│   └──────────────────────────────────┘    │
└───────────────────────────────────────────┘
                 │
                 ▼
┌───────────────────────────────────────────┐
│           Payload Core (Node)             │
│  • Collections: Blog, Contracts, …        │
│  • WorkflowEngine Plugin                  │
│    ├─ Hooks (before/after Change)         │
│    ├─ Dynamic UI injection                │
│    └─ Custom endpoints                    │
└───────────────────────────────────────────┘
                 │
                 ▼
┌───────────────────────────────────────────┐
│        PostgreSQL (Drizzle ORM)           │
│  Tables: users, blog, contracts,          │
│          workflows, workflow_logs, …      │
└───────────────────────────────────────────┘
```


## 🚀 Quick Start

### 1. Clone \& Install

```bash
git clone https://github.com/Og-Akash/payload-workflow-management
cd workflow-management
pnpm install   # or npm / yarn
```


### 2. Configure Environment

```bash
cp .env.example .env
# --- edit .env ---
DATABASE_URI=postgres://admin:password@127.0.0.1:5432/payload_db
PAYLOAD_SECRET=0b419b94fd45fe04b1872113
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```


### 3. DB Migrate \& Seed

```bash
pnpm run payload migrate   # creates tables
pnpm run seed              # inserts demo users, workflows & docs
```


### 4. Run Dev Server

```bash
pnpm run dev
# Admin UI → http://localhost:3000/admin
# Demo creds:
#  • admin@example.com / admin123
#  • manager@example.com / manager123
#  • reviewer@example.com / reviewer123
```


## 🔍 Project Structure

```
src/
├─ collections/        → Blog.ts, Contract.ts, Workflows.ts …
├─ plugins/            → workflowEngine.ts   (core magic)
├─ components/         → WorkflowInterface.tsx (admin UI)
├─ scripts/            → seed.ts, slaMonitor.ts
├─ payload.config.ts   → main configuration
└─ app/                → Next.js routes & API
```


## ⚙️ How It Works

| Action | What Happens |
| :-- | :-- |
| **Create document** | `beforeChange` hook sets `workflowStatus="in-progress"` + step 1 → log **started** |
| **Approve / Reject** | User clicks inline button → `/api/workflows/trigger` → permission check → doc update → `afterChange` logs **approved/rejected** |
| **Auto Advance** | After each update the plugin evaluates step conditions; if met, moves to next step or marks **completed** |
| **Audit Trail** | Every transition is written to `workflowLogs` (immutable) \& visible in the “Activity Log” panel |
| **Notification** | Console email stub (replace with real SMTP in `sendWorkflowNotification`) |

## 🧑💻 Performing Common Tasks

### A. Add Workflow Support to Another Collection

1. Create your collection file (e.g. `Invoice.ts`).
2. Add its slug in `workflowEngine({ collections: ['invoice', …] })`.
3. Define relevant status fields.
4. Seed or create a Workflow targeting `invoice`.

### B. Trigger via API

```bash
# Approve step 1 for a blog post
curl -X POST http://localhost:3000/api/workflows/trigger \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"documentId":"abc123","collection":"blog","stepId":"1","action":"approve"}'
```


### C. Check Workflow Status

```bash
GET /api/workflows/status/blog/:blog-id
```


## 🛡️ Roles \& Permissions

| Role | Abilities |
| :-- | :-- |
| **admin** | Manage users, workflows, delete logs |
| **manager** | Approve “Manager” steps |
| **reviewer** | Handle initial reviews |
| **user** | Create content only |

## 🚑 Troubleshooting

| Symptom | Fix |
| :-- | :-- |
| `Route not found /api/workflows/*` | Restart dev server after editing plugin |
| 401 Unauthorized | Include `Authorization: Bearer <JWT>` header |
| Logs not written | Ensure `action` value exists in `WorkflowLogs.options` and `beforeChange` hook only blocks updates |
| `NaN` in query params | Pass **real document IDs**, not incremental numbers |

## 🧩 Extending

* **Email / Slack alerts**   → replace console output in `sendWorkflowNotification`.
* **Cron-based SLA monitor** → run `pnpm run slaMonitor` via cron.
* **GraphQL**   → Payload auto-exposes queries/mutations for every collection.
* **UI theming**   → tweak styles inside `WorkflowInterface.tsx` or swap for CSS Modules.
