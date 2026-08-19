# Car Hero Admin Dashboard

Next.js admin dashboard for managing Car Hero operations.

## Commands

- `npm run dev` starts the local development server.
- `npm run build` creates a production build.
- `npm run lint` runs ESLint.
- `npm test` runs Vitest service tests.

## Structure

- `src/app/(dashboard)` contains admin dashboard routes and page-level components.
- `src/components` contains shared layout, providers, and UI primitives.
- `src/domain/entities` contains typed API/domain models.
- `src/infrastructure` contains API clients, services, auth helpers, query keys, and tests.
- `public` contains static assets served by Next.js.

Legacy starter assets, unused docs, and unused dependencies should stay out of this package.
