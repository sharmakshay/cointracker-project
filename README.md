# CoinTracker Wallet Dashboard

## Development Setup

1. Start the mock API (separate repo in this workspace):
   - Terminal A:
     - cd ../cointracker-mock-api
     - npm install
     - npm run dev

2. Start the Next.js app:
   - Terminal B:
     - cd ./
     - npm install
     - npm run dev

3. Configuration:
   - Backend base URL (proxy target) can be set via env:
     - BACKEND_API_URL=http://localhost:3000 (server-only) or is set to http://localhost:3000 as fallback
   - The frontend always calls relative `/api/*` routes; the Next.js app proxies to the mock API to avoid CORS.

## How It Works

- API Proxy: Next.js route handlers under `app/api` forward requests to the mock API (`/wallets`, `/wallets/:walletId`, `/wallets/:walletId/sync`).
- Data Layer: TanStack Query for fetching, caching and mutations with typed hooks (`lib/queries`).
- Transactions:
  - Sorted reverse-chronologically by default.
  - Infinite scrolling with cursor pagination (cursor = last item date).
  - Stable wallet balance is computed on the backend and returned with the first page to avoid changing totals while scrolling.
- Sync: Adds only newer, de-duplicated transactions and refreshes the cache.

## Assumptions

- The mock API runs locally on port 3000; change via BACKEND_API_URL if needed.
- Transaction IDs are unique; dates are ISO strings suitable for sorting and cursoring.
- The total balance is the sum of all wallet transactions (provided by backend on the first page).
- Error simulation in the mock API may intermittently fail requests (intended for testing retries/UX).

## Key Architecture Decisions

- CORS Avoidance via Proxy: Frontend uses Next.js API routes as a thin proxy to the mock API, eliminating browser CORS issues and centralizing service URLs.
- React Query as Source of Truth: Query keys (`wallets`, `detail`, `transactions(-infinite)`) structure cache; mutations invalidate or surgically update cache.
- Infinite Pagination Contract: Backend exposes `?cursor&limit` and returns `{ items, nextCursor, totalBalance }`. Client uses `useInfiniteQuery` and an IntersectionObserver sentinel.
- Stability & UX: Balance shown is backend-computed and stable; sync dedupes by ID and preserves reverse-chronological order.
- Type-Safe Client: Central `api-client` defines request/response contracts, reused by query hooks and components.
