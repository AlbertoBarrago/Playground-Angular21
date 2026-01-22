# Playground Angular 21

Angular 21 Zoneless Warehouse Management Dashboard with NgRx SignalStore.

## Tech Stack

- Angular 21 (Zoneless)
- NgRx Signals
- Vitest for unit testing
- Playwright for E2E testing
- Fastify 5 API server (in `/server`) using Bun + TypeScript


## Getting Started FE

```bash
# Install dependencies
bun install

# Start development server
bun start

# Run unit tests
bun test

# Run E2E tests
bun run e2e
```

## Getting Started BE
_For more info look the `README.md` inside `/server` folder_.

```bash
# Move on server folder 
cd server

# Start the server 
bun start  
```

## Project Structure

```
src/
├── app/
│   ├── core/           # Auth, interceptors, guards
│   ├── features/       # Feature modules (inventory, dashboard)
│   └── shared/         # Shared components and utilities
├── environments/       # Environment configs
└── styles/             # Global styles
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun start` | Start dev server |
| `bun run build` | Build for development |
| `bun run build:prod` | Build for production |
| `bun test` | Run unit tests |
| `bun run test:ui` | Run tests with UI |
| `bun run e2e` | Run E2E tests |
