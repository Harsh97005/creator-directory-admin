# Creator Directory Admin Dashboard

An admin screen for managing creators in a talent/influencer CRM: a server-driven table with
pagination, sorting, and filtering, plus create/edit/delete — all server state managed by
TanStack Query.

## Project overview

This repo is a small monorepo with two apps:

- **`web/`** — Next.js 15 (App Router) + TypeScript frontend.
- **`server/`** — a tiny Express mock API backing it.

The brief asked us to build a mock backend ourselves, so `server/` implements the exact
`GET/POST/PATCH/DELETE /creators` contract from the spec, in-memory, seeded from `seed.json`.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | Hand-built shadcn-style primitives on Radix UI (see note below) |
| Server state | TanStack Query v5 |
| HTTP client | Axios |
| Forms | React Hook Form + Zod |
| Icons / toasts | lucide-react / Sonner |
| Mock backend | Express.js |

> **Note on shadcn/ui:** the `shadcn` CLI pulls component source from `ui.shadcn.com` at
> generation time. That host wasn't reachable from the sandbox this was built in, so the
> shadcn-style primitives in `src/components/ui/` (Button, Dialog, Select, Table, Dropdown,
> AlertDialog, Badge, Skeleton, Label, Input) were hand-written directly against the same
> Radix UI + `class-variance-authority` + Tailwind stack shadcn itself generates — same
> approach, no CLI dependency. If you have access to `ui.shadcn.com`, `npx shadcn add <component>`
> will happily overwrite these with the canonical versions.

## Folder structure

```
creator-directory/
├── server/                      # Mock Express API
│   ├── index.js                 # All routes: pagination, sorting, filtering, validation
│   ├── generate-seed.js         # One-off script that produced seed.json (40 rows)
│   └── seed.json                # In-memory seed data
│
└── web/
    └── src/
        ├── app/
        │   ├── page.tsx          # Suspense boundary + <CreatorsScreen />
        │   ├── layout.tsx        # Root layout, fonts, <Providers>
        │   ├── providers.tsx     # QueryClientProvider + Toaster + devtools
        │   └── globals.css       # Design tokens (CSS variables) + Tailwind v4 setup
        ├── components/
        │   ├── creators/         # Feature components (table, filters, dialogs, pagination...)
        │   └── ui/               # Hand-built shadcn-style primitives
        ├── hooks/                # All React Query hooks + query-key factory
        ├── services/             # creator.service.ts — the only file that calls Axios
        ├── lib/                  # cn(), format.ts, validation.ts (Zod), api-error.ts
        └── types/                # Shared Creator / API contract types
```

Every file is under ~250 lines; components, data-fetching hooks, and the API layer are kept
in separate directories so presentation never imports Axios directly.

## Installation

From the repo root:

```bash
npm run install:all
```

This runs `npm install` inside both `server/` and `web/`. (Or `cd server && npm install` and
`cd web && npm install` separately.)

## Running the backend

```bash
npm run dev:server
# or: cd server && npm run dev
```

Starts the mock API on **http://localhost:4001**. It seeds 40 creators from `seed.json` into
memory on boot (data resets on restart — this is a mock API for local development, not a
persistence layer). Artificial 350–650ms latency is added to every response so loading states
are actually visible while you're testing.

## Running the frontend

```bash
npm run dev:web
# or: cd web && npm run dev
```

Starts Next.js on **http://localhost:3000**. It talks to the API at the URL in
`web/.env.local` (`NEXT_PUBLIC_API_URL`, defaults to `http://localhost:4001`).

Run both at once in two terminals, or use two panes of your terminal multiplexer of choice.

## API documentation

Base URL: `http://localhost:4001`

### `GET /creators`

Query params (all optional except none — everything has a default):

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | number | `1` | |
| `limit` | number | `10` | capped at 100 |
| `sortBy` | `followerCount \| engagementRate \| name \| createdAt` | — | omit for insertion order |
| `order` | `asc \| desc` | `asc` | |
| `niche` | `beauty \| fitness \| travel \| food \| tech \| fashion` | — | omit for all niches |
| `minFollowers` | number | — | inclusive |
| `maxFollowers` | number | — | inclusive |

Response:

```json
{ "data": [ /* Creator[] */ ], "total": 42, "page": 1, "limit": 10 }
```

### `GET /creators/:id`
Returns a single creator, or `404 { "error": "Creator not found" }`.

### `POST /creators`
Body: `{ name, email, niche, followerCount, engagementRate, status }`. Server validates name,
email format, niche enum, non-negative followers, and engagement in `[0, 100]`, returning
`400 { "error": "Validation failed", "details": [...] }` on failure. Returns the created
`201 Creator` (with server-assigned `id`/`createdAt`) on success.

### `PATCH /creators/:id`
Same validation, but every field is optional (partial update). Returns the updated `200 Creator`
or `404` if the id doesn't exist.

### `DELETE /creators/:id`
Returns `204` with no body, or `404` if the id doesn't exist.

## Architecture notes

### Query-key strategy

Query keys are centralized in `src/hooks/query-keys.ts` as a hierarchical factory:

```ts
creatorKeys.all          // ["creators"]
creatorKeys.lists()      // ["creators", "list"]
creatorKeys.list(params) // ["creators", "list", { page, limit, sortBy, order, niche, minFollowers, maxFollowers }]
creatorKeys.detail(id)   // ["creators", "detail", id]
```

`useCreators` keys its query on the **entire** params object, so page, sort, and every filter
are part of the cache key — changing any of them is a genuinely different cache entry rather
than a mutation of shared state. Pagination doesn't flash back to a skeleton on page/sort/filter
changes because `placeholderData: keepPreviousData` keeps the previous page's rows on screen
while the next one loads.

Filters, sort, and page all live in the URL (`useCreatorQueryState`, backed by
`useSearchParams`/`router.replace`), so a specific filtered/sorted/paginated view is shareable
and survives a refresh — the query key is effectively driven by the URL.

### Cache invalidation

Every mutation calls `queryClient.invalidateQueries({ queryKey: creatorKeys.all })` (in
`onSuccess` for create, `onSettled` for edit/delete). Because `creatorKeys.all` is a prefix of
every list and detail key, this invalidates **every** cached page/sort/filter combination in
one call — there's no manual refetch button, and no risk of one page's cache going stale while
another page updates.

### Optimistic updates

Implemented for **edit** and **delete**, not **create**:

- **Edit** (`useUpdateCreator`) and **delete** (`useDeleteCreator`) both patch/remove the
  affected row in place, in *every* cached list query that currently contains it (via
  `queryClient.setQueriesData` with a `creatorKeys.lists()` predicate), regardless of which
  page/filter it's showing under. `onMutate` snapshots the previous cache state; `onError`
  restores that exact snapshot; `onSettled` invalidates everything so the server's version of
  the truth eventually wins even after a successful optimistic write.
- **Create** deliberately skips optimistic insertion. Where a new row lands depends on the
  server's current sort order and pagination — inserting an optimistic row at a guessed
  position would either be wrong or require duplicating the server's sort logic on the client.
  Instead it waits for the real response, then invalidates, so every open view refetches and
  shows the new creator in its correct position. This is called out here explicitly as an
  intentional asymmetry, not an oversight.

### Data flow / separation of concerns

`services/creator.service.ts` is the only file that imports Axios. Hooks in `src/hooks/` call
the service and own all React Query concerns (keys, caching, invalidation); components only
ever call hooks, never the service or Axios directly.

## Assumptions

- **Mock API persistence**: data lives in memory in the Express process and resets on restart.
  Acceptable for a challenge; a real backend would be swapped in behind the same
  `creator.service.ts` interface with no changes needed elsewhere.
- **Sorting fields**: the spec requires sorting on Followers and Engagement Rate; `name` and
  `createdAt` are also wired up server-side since they were trivial to add, but the UI only
  exposes clickable headers for the two required columns.
- **Follower range filter**: both bounds are inclusive; an empty min/max means "no bound" on
  that side rather than `0`.
- **Status is editable** in the create/edit form even though the spec doesn't explicitly list
  it as a form field — it's part of the Creator shape and the table displays/relies on it, so
  leaving it un-settable on create felt like it'd always create "active" rows and make the
  filter/status column pointless to test.
- **Debounce**: the follower min/max inputs debounce for 450ms before triggering a request,
  to avoid firing a request per keystroke; niche filtering and sorting are immediate since
  they're discrete selections, not free text.

## What we'd do differently with more time

- Add integration tests (React Testing Library + MSW) around the mutation hooks' optimistic
  rollback paths, and a Playwright smoke test for the full create → edit → delete flow.
- Server-side field-level validation errors aren't currently mapped back to individual form
  fields (they surface as a single toast) — worth wiring `details` into
  `setError` per field.
- Bulk actions (multi-select rows, bulk status change/delete).
- Persisting the mock API to a file or SQLite so data survives a server restart.
- A dark mode toggle — the token system in `globals.css` is already structured to support one
  cleanly (swap the CSS variable values under a `.dark` selector).

## Screenshots

_Add screenshots here._
