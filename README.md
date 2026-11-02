# Flowboard

Flowboard is a project management app for teams. People work in **workspaces**,
organise work on **boards** with lists and cards, plan **sprints**, track time,
discuss work on each card, and get **notifications** about changes. Workspaces
can upgrade to paid plans through **Stripe**.

Built with Next.js (App Router), PostgreSQL and Drizzle ORM.

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [How the code is organised](#how-the-code-is-organised)
- [Database](#database)
- [Roles and permissions](#roles-and-permissions)
- [Billing and plans](#billing-and-plans)
- [API overview](#api-overview)
- [Error handling](#error-handling)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)

---

## Features

**Accounts**

- Sign up with email verification, log in and log out
- Forgot password and reset password by email, change password
- Session in an HTTP-only cookie (JWT). Logging out invalidates every session
  of that user (`tokenVersion`).

**Workspaces and members**

- Create, rename and delete workspaces
- Invite people by email (the link expires after 12 hours), accept or revoke invitations
- Roles: owner, admin, manager, member. Remove (deactivate) members.

**Boards**

- Boards inside a workspace, each with its own members and roles
- Lists and cards with drag and drop (`@dnd-kit`), including reordering lists
- Board statistics (task counts, sprint time totals)

**Cards**

- Numbered per board, with title, rich text description (Tiptap editor,
  stored as Markdown), priority, type, assignee, start and due dates,
  estimated and spent time, and sprints
- Priorities: `normal`, `show stopper`, `critical`, `major`, `minor`.
  Types: `bug`, `feature`, `task`, `tbd`.
- Commits (comments) on a card, with file attachments
- Attachments stored in Vercel Blob (up to 4 MB: images, PDF, text, zip, docx, xlsx)

**Sprints**

- Create sprints with a goal and dates. Status: planned, active, completed, cancelled.
- Optionally carry unresolved cards over to the next sprint

**Activity and notifications**

- Every change is written to an audit log
- Activity page: a timeline per board, grouped by day, with readable sentences
  such as "moved a card To Do → Done"
- In-app notifications (bell, refreshes every 30 seconds) for card assigned,
  card moved, commit created and sprint created

**Billing** (see [Billing and plans](#billing-and-plans))

- Free, Pro and Business plans per workspace, billed monthly with Stripe
- 7-day grace period when a payment fails
- Board and member limits enforced on the server

**Other**

- Light and dark theme
- Public home page with features and pricing

---

## Tech stack

| Area                 | Technology                                                      |
| -------------------- | --------------------------------------------------------------- |
| Framework            | Next.js 16 (App Router), React 19, React Compiler               |
| Language             | TypeScript                                                      |
| Styling              | Tailwind CSS 4, CSS variables for light/dark themes             |
| Database             | PostgreSQL (Neon), Drizzle ORM, drizzle-kit migrations          |
| Data fetching        | TanStack Query                                                  |
| Forms and validation | React Hook Form, Zod                                            |
| Rich text            | Tiptap (+ tiptap-markdown), react-markdown with rehype-sanitize |
| Drag and drop        | dnd-kit                                                         |
| Auth                 | JSON Web Tokens (`jsonwebtoken`), bcrypt password hashing       |
| Email                | Mailgun                                                         |
| File storage         | Vercel Blob                                                     |
| Payments             | Stripe (Checkout, Billing, Customer Portal, webhooks)           |
| Icons                | lucide-react, Font Awesome                                      |
| Hosting              | Vercel                                                          |

---

## Getting started

### Requirements

- Node.js 20.9 or newer
- pnpm
- A PostgreSQL database (the project uses Neon)
- Accounts for Mailgun, Vercel Blob and Stripe (test mode is enough for development)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Create .env.local (see "Environment variables" below)

# 3. Create the database tables
pnpm db:migrate

# 4. Start the development server
pnpm dev
```

Open http://localhost:3000.

### Receiving Stripe webhooks locally

Stripe cannot reach `localhost`, so use the Stripe CLI to forward events:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Put the `whsec_...` value it prints into `STRIPE_WEBHOOK_SECRET`. Without this,
payments stay "Pending" locally because the webhook never arrives.

Test card: `4242 4242 4242 4242`, any future date, any CVC.

---

## Environment variables

Create `.env.local` in the project root. It is git-ignored; never commit it.

| Variable                             | Required | Used for                                                                      |
| ------------------------------------ | -------- | ----------------------------------------------------------------------------- |
| `DATABASE_URL`                       | yes      | PostgreSQL connection for the app (pooled)                                    |
| `DATABASE_URL_UNPOOLED`              | yes      | Direct connection used by drizzle-kit for migrations                          |
| `JWT_SECRET`                         | yes      | Signs session tokens. Use a long random string (32+ characters).              |
| `NEXT_PUBLIC_APP_URL`                | yes      | Base URL for email links and Stripe return URLs, e.g. `http://localhost:3000` |
| `MAILGUN_API_KEY`                    | yes      | Sending verification, reset and invitation emails                             |
| `MAILGUN_DOMAIN`                     | yes      | Mailgun sending domain                                                        |
| `BLOB_READ_WRITE_TOKEN`              | yes      | Vercel Blob uploads (read by `@vercel/blob`)                                  |
| `STRIPE_SECRET_KEY`                  | yes      | Server-side Stripe API calls (`sk_test_...` / `sk_live_...`)                  |
| `STRIPE_WEBHOOK_SECRET`              | yes      | Verifies Stripe webhook signatures (`whsec_...`)                              |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | no       | Not used by the code yet                                                      |

---

## Scripts

| Command                  | What it does                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm dev`               | Start the development server                                                                                                         |
| `pnpm build`             | Production build                                                                                                                     |
| `pnpm start`             | Run migrations, then start the production server                                                                                     |
| `pnpm lint`              | ESLint                                                                                                                               |
| `pnpm exec tsc --noEmit` | Type check. Run this separately: `next.config.ts` sets `typescript.ignoreBuildErrors`, so `pnpm build` does not fail on type errors. |
| `pnpm db:generate`       | Create a migration from changes in `src/db/*Schema.ts`                                                                               |
| `pnpm db:migrate`        | Apply pending migrations                                                                                                             |

---

## Project structure

```
src/
├── app/
│   ├── (public)/            Home page (features, pricing)
│   ├── auth/                Login, register, verify email, forgot/reset password
│   ├── dashboard/           Signed-in area
│   │   ├── @modal/          Create workspace as a modal (intercepting route)
│   │   └── workspace/[workspaceId]/
│   │       ├── board/[boardId]/        Board canvas
│   │       │   └── card/[cardId]/      Card details
│   │       ├── member/                 Members
│   │       ├── activity/               Activity timeline
│   │       ├── billing/                Plans, subscription, usage, payments
│   │       └── invitation/accept/      Accept an invitation
│   ├── api/                 Route handlers (see API overview)
│   ├── error.tsx            Error page with "Try again"
│   └── global-error.tsx     Last-resort error page if the root layout fails
├── components/              UI, grouped by area (board, card, billing, dashboard, ...)
├── services/                Business logic, one file per area
├── repositories/            Database queries (Drizzle)
├── db/                      Table definitions (*Schema.ts) and migrations/
├── lib/
│   ├── billing/plans.ts     Plans, prices, limits, grace period, effective plan
│   ├── errors/              AppError and the shared route error handler
│   ├── middleware/          Auth (current user) and workspace/board role checks
│   ├── validations/         Zod schemas
│   ├── stripe/              Stripe client
│   ├── email/               Mailgun email sending
│   └── token/               Token generation and hashing
└── proxy.ts                 Redirects signed-out users away from /dashboard
```

---

## How the code is organised

A request goes through three layers:

```
app/api/.../route.ts   →   services/*.ts   →   repositories/*.ts   →   PostgreSQL
(HTTP in/out)              (rules, checks)      (queries only)
```

- **Route handlers** read the request and return the response. Every handler
  wraps its work in `try/catch` and uses `handleRouteError`.
- **Services** hold the business rules: who is logged in (`getCurrentUser`),
  role checks (`requireWorkspaceRole`, `requireBoardRole`), Zod validation,
  plan limits, audit logging and transactions.
- **Repositories** only talk to the database. Functions accept an optional
  transaction, so several writes can be saved together.

Other conventions:

- Changes that belong together (for example a board and its audit log entry)
  are written in one database transaction.
- Known problems are thrown as `AppError(message, statusCode)`.
- The browser uses TanStack Query for loading data and checks `response.ok`.

---

## Database

Tables are defined in `src/db/*Schema.ts`. Migrations live in `src/db/migrations`.

| Table                                               | Purpose                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| `user`                                              | Accounts (password hash, email verified, `token_version`)          |
| `email_verification_token`, `reset_password_tokens` | Hashed one-time tokens                                             |
| `workspace`                                         | Workspaces                                                         |
| `organization_members`                              | Workspace members, role and status                                 |
| `invite_members`                                    | Workspace invitations (hashed token, expiry, status)               |
| `board`, `board_members`                            | Boards and their members/roles                                     |
| `board_list`                                        | Lists on a board, ordered by position                              |
| `card`                                              | Cards                                                              |
| `sprint`                                            | Sprints of a board                                                 |
| `commit`                                            | Comments ("commits") on cards                                      |
| `card_attachment`                                   | Files on cards and commits (Vercel Blob URLs)                      |
| `audit_logs`                                        | Every change, with JSON details (feeds the Activity page)          |
| `notifications`                                     | In-app notifications per recipient                                 |
| `subscriptions`                                     | One per workspace: plan, status, next charge date, grace end       |
| `payments`                                          | Checkouts and monthly invoices: amount (cents), status, Stripe ids |

To change the schema: edit the `*Schema.ts` file, run `pnpm db:generate`,
review the generated SQL, then run `pnpm db:migrate`.

---

## Roles and permissions

Workspaces and boards use the same four roles: **owner**, **admin**,
**manager**, **member**. Checks always run on the server.

| Action                                            | Who                                            |
| ------------------------------------------------- | ---------------------------------------------- |
| Billing (view, upgrade, manage subscription)      | Workspace owner                                |
| Create boards, invite or remove workspace members | Owner, admin                                   |
| Manage board settings and board members           | Board owner, admin (some actions also manager) |
| Work with cards, commits and sprints              | Board members, by board role                   |

---

## Billing and plans

### Plans

|                                         | Free | Pro         | Business    |
| --------------------------------------- | ---- | ----------- | ----------- |
| Price                                   | $0   | $10 / month | $25 / month |
| Boards                                  | 3    | Unlimited   | Unlimited   |
| Members (including pending invitations) | 5    | 25          | Unlimited   |

Plans, prices, limits and feature lists live in one file:
`src/lib/billing/plans.ts`. The home page pricing and the billing page both read
from it. The prices are placeholders.

### How a payment works

1. The workspace owner clicks **Upgrade**. The browser sends only the plan name;
   the server sets the price.
2. The server creates a Stripe Checkout Session (monthly subscription) and
   saves a `PENDING` payment.
3. The customer pays on Stripe's page. Card details never reach Flowboard.
4. Stripe sends a webhook to `/api/webhooks/stripe`. The server:
   - verifies the signature,
   - re-reads the session from Stripe and checks the amount, currency and
     workspace,
   - marks the payment `PAID` (only once) and saves the subscription.

The "success" page after checkout proves nothing on its own. Only the
webhook can activate a plan.

### Failed payments and the 7-day grace period

- If a monthly payment fails, the subscription becomes `PAST_DUE` and
  `grace_ends_at` is set to the failure time + 7 days. Stripe's retries never
  extend it.
- During those 7 days the workspace keeps its plan, and the owner sees an
  "Update card" banner (Stripe Customer Portal).
- Paying during grace keeps the original billing date.
- After 7 days the workspace is on Free. **No data is deleted**: existing boards
  and members stay, and only adding new ones is blocked.
- `getEffectivePlan` checks the grace date itself, so paid features end on time
  even if a webhook is missed.

### Plan limits

- Checked on the server when creating a board, sending an invitation and
  accepting one. Blocked actions return **402** with a clear message.
- The count and the insert run in one transaction with a per-workspace lock, so
  two requests at the same moment cannot both pass a limit.

### Webhook events handled

`checkout.session.completed`, `checkout.session.async_payment_succeeded`,
`invoice.paid`, `invoice.payment_failed`, `customer.subscription.created`,
`customer.subscription.updated`, `customer.subscription.deleted`.

---

## API overview

All routes are under `/api`. Signed-in requests use the `token` cookie.

| Route                                                                  | Purpose                                                                                           |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `POST /auth`                                                           | `action`: register, login, verify-email, forgot-password, reset-password, change-password, logout |
| `GET, POST /workspace`                                                 | List or create workspaces                                                                         |
| `GET, PATCH, DELETE /workspace/[workspaceId]`                          | One workspace                                                                                     |
| `/workspace/[workspaceId]/members`                                     | Members and roles                                                                                 |
| `/workspace/[workspaceId]/invitation`                                  | Invite, accept, preview, revoke, list                                                             |
| `/workspace/[workspaceId]/activity`                                    | Activity for a board (paginated)                                                                  |
| `/workspace/[workspaceId]/board`                                       | List or create boards                                                                             |
| `/workspace/[workspaceId]/board/[boardId]`                             | One board                                                                                         |
| `.../board/[boardId]/boardList`                                        | Lists, reorder                                                                                    |
| `.../board/[boardId]/boardMembers`                                     | Board members                                                                                     |
| `.../board/[boardId]/card` and `card/[cardId]`                         | Cards                                                                                             |
| `.../card/[cardId]/comments`                                           | Commits on a card                                                                                 |
| `.../card/[cardId]/attachment`                                         | Upload, list, delete files                                                                        |
| `.../board/[boardId]/sprint`                                           | Sprints                                                                                           |
| `.../board/[boardId]/stats`                                            | Board statistics                                                                                  |
| `/workspace/[workspaceId]/billing`                                     | Plans, subscription, usage, payment history                                                       |
| `/workspace/[workspaceId]/billing/checkout`                            | Start a subscription checkout                                                                     |
| `/workspace/[workspaceId]/billing/portal`                              | Open the Stripe Customer Portal                                                                   |
| `/notifications`, `/notifications/[id]`, `/notifications/unread-count` | Notifications                                                                                     |
| `POST /webhooks/stripe`                                                | Stripe webhooks (called by Stripe, not the app)                                                   |

---

## Error handling

- Services throw `AppError(message, statusCode)` for expected problems
  (401, 403, 404, 400, 402, 409, 502).
- Every route's `catch` calls `handleRouteError` (`src/lib/errors/handleRouteError.ts`):

| Error                                 | Response                                                               |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `AppError`                            | Its own status and message                                             |
| Request body is not valid JSON        | 400 "Invalid JSON request body"                                        |
| Invalid id or value (e.g. not a uuid) | 400                                                                    |
| Anything else                         | Logged on the server; 500 with a generic message (no internal details) |

- If an email fails after something was saved, the change is undone (a
  cancelled invitation or a removed unfinished sign-up) so the user can try
  again.
- `app/error.tsx` and `app/global-error.tsx` show a friendly page with
  **Try again** if a page crashes.

---

## Deployment

The app is deployed on Vercel.

1. Set all [environment variables](#environment-variables) in the Vercel project.
   `NEXT_PUBLIC_APP_URL` must be the deployed URL. `NEXT_PUBLIC_` values are
   built into the app, so redeploy after changing them.
2. Apply migrations to the production database (`pnpm db:migrate`).
3. In Stripe, add a webhook endpoint `https://<your-domain>/api/webhooks/stripe`
   with the events listed above, and use its signing secret for `STRIPE_WEBHOOK_SECRET`.
4. In Stripe → Billing → Revenue recovery, make retries finish within 7 days and
   cancel the subscription when all retries fail.
5. Make sure a Stripe Customer Portal configuration exists.
6. For real payments: activate the Stripe account and switch to live keys.

---

## Known limitations

- Plan prices are placeholders, and Stripe runs in test mode.
- Only board and member limits are enforced. Sprint, activity history and audit
  log limits are not enforced yet.
- Switching between Pro and Business is not supported yet.
- There is no "resend verification email". Someone who does not verify within
  30 minutes cannot register again with the same email.
- Some activity entries say "a card" because older audit details do not store
  the card title.
- `typescript.ignoreBuildErrors` is on, so always run `tsc` before committing.
