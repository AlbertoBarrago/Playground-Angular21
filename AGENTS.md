# AGENTS.md - Coding Agent Guidelines

This document provides essential information for AI coding agents working on this Angular 21 Zoneless codebase.

## Project Overview

- **Framework**: Angular 21 (Zoneless mode - no Zone.js for change detection)
- **State Management**: NgRx SignalStore (Signal-based, functional API)
- **Backend**: Fastify 5 with Bun runtime
- **Package Manager**: Bun
- **Testing**: Vitest (unit) + Playwright (E2E)

## Build/Lint/Test Commands

### Development
```bash
bun start              # Start Angular dev server (http://localhost:4200)
bun run start:api      # Start Fastify API server (hot reload)
bun run start:all      # Start both frontend and API concurrently
```

### Build
```bash
bun run build          # Development build
bun run build:prod     # Production build
```

### Linting
```bash
bun run lint           # Run Angular linting (ng lint)
```

### Unit Testing (Vitest)
```bash
bun test                      # Run all unit tests in watch mode
bun run test:ui               # Run tests with Vitest UI
bun run test:coverage         # Run tests with coverage report

# Run a single test file
bun test path/to/file.spec.ts

# Run tests matching a pattern
bun test -t "pattern"

# Run specific describe block
bun test -t "InventoryStore"
```

### E2E Testing (Playwright)
```bash
bun run e2e            # Run all E2E tests
bun run e2e:ui         # Run E2E with Playwright UI

# Run single E2E test file
bunx playwright test e2e/specific-file.spec.ts

# Run tests in specific browser
bunx playwright test --project=chromium
```

## Project Structure

```
src/app/
├── core/           # Singleton services, guards, interceptors
├── shared/         # Reusable stateless components, utils, models
├── features/       # Feature modules (smart components, stores)
│   ├── auth/
│   ├── dashboard/
│   └── inventory/
server/             # Fastify backend API
tests/              # Unit test files
e2e/                # Playwright E2E tests
```

## Path Aliases (use these for imports)

```typescript
@core/*      -> src/app/core/*
@shared/*    -> src/app/shared/*
@features/*  -> src/app/features/*
@env/*       -> src/environments/*
```

## Code Style Guidelines

### TypeScript Configuration
- **Strict mode enabled**: All strict checks are on
- **No implicit any**: Always provide explicit types
- **No implicit returns**: All code paths must return
- Target: ES2022, Module: ES2022

### Import Style
```typescript
// Angular imports first
import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

// Third-party imports
import { signalStore, withState, withMethods } from '@ngrx/signals';
import { pipe, switchMap } from 'rxjs';

// Internal imports using path aliases (ALWAYS use aliases, never relative paths beyond same directory)
import { InventoryStore } from '@features/inventory/store/inventory.store';
import { Product } from '@features/inventory/models/inventory.models';
import { LoadingState } from '@shared/models/base.models';
```

### Component Pattern
```typescript
@Component({
  selector: 'app-component-name',     // Prefix: app-
  standalone: true,                   // Always standalone (no NgModules)
  imports: [...],
  template: `...`,                    // Prefer inline templates
  styles: [`...`],                    // Prefer inline SCSS styles
  changeDetection: ChangeDetectionStrategy.OnPush,  // Always OnPush
})
export class ComponentNameComponent {
  // 1. Injected dependencies
  readonly store = inject(InventoryStore);
  private readonly router = inject(Router);

  // 2. Signal inputs/outputs
  readonly product = input.required<Product>();
  readonly productSelect = output<Product>();

  // 3. Local state signals
  readonly isExpanded = signal(false);

  // 4. Computed signals
  readonly displayName = computed(() => this.product().name.toUpperCase());

  // 5. Methods
  onSelect(): void {
    this.productSelect.emit(this.product());
  }
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase + Component | `ProductListComponent` |
| Pages | PascalCase + Page | `InventoryAdjustmentPage` |
| Services | PascalCase + Service | `InventoryService` |
| Stores | PascalCase + Store | `InventoryStore` |
| Guards | camelCase + Guard | `authGuard` |
| Interceptors | camelCase + Interceptor | `authInterceptor` |
| Files | kebab-case | `product-list.component.ts` |
| Interfaces | PascalCase (no I prefix) | `Product`, `LoadingState` |
| Type aliases | PascalCase | `AdjustmentType` |

### NgRx SignalStore Pattern
```typescript
export const FeatureStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    derivedValue: computed(() => store.items().length),
  })),
  withMethods((store, service = inject(FeatureService)) => ({
    // Async methods use rxMethod
    loadData: rxMethod<Params>(
      pipe(
        tap(() => patchState(store, { loadingState: 'loading' })),
        switchMap((params) => service.fetch(params).pipe(
          tapResponse({
            next: (data) => patchState(store, { data, loadingState: 'success' }),
            error: (err) => patchState(store, { error: err.message, loadingState: 'error' }),
          })
        ))
      )
    ),
    // Sync methods are regular functions
    clearError(): void {
      patchState(store, { error: null });
    },
  })),
  withHooks({
    onInit(store) {
      store.loadData({});
    },
  })
);
```

### Template Syntax (Angular 21)
```html
<!-- Use new control flow syntax -->
@if (isLoading()) {
  <app-loading-spinner />
}

@for (item of items(); track item.id) {
  <app-item-card [item]="item" (click)="onSelect(item)" />
} @empty {
  <p>No items found</p>
}

<!-- Self-closing components -->
<app-search-input />

<!-- Signal reads in templates (call the signal) -->
{{ store.productsCount() }}
```

### Guards and Interceptors (Functional)
```typescript
// Guard
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated() || router.createUrlTree(['/auth/login']);
};

// Interceptor
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  if (token) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
  return next(req);
};
```

### Error Handling
- Use `LoadingState` type: `'idle' | 'loading' | 'success' | 'error'`
- Store errors in state as `error: string | null`
- Use `tapResponse` from `@ngrx/operators` for RxJS error handling
- Display errors via `NotificationService`

### Testing Patterns
```typescript
describe('FeatureStore', () => {
  let store: InstanceType<typeof FeatureStore>;
  let mockService: Partial<FeatureService>;

  beforeEach(() => {
    mockService = {
      fetch: vi.fn().mockReturnValue(of(mockData)),
    };

    TestBed.configureTestingModule({
      providers: [
        FeatureStore,
        { provide: FeatureService, useValue: mockService },
      ],
    });

    store = TestBed.inject(FeatureStore);
  });

  it('should load data', () => {
    store.loadData({});
    expect(mockService.fetch).toHaveBeenCalled();
  });
});
```

## Key Patterns to Follow

1. **Signals everywhere**: Use `signal()`, `computed()`, `input()`, `output()` - not decorators
2. **Functional over class-based**: Prefer functional guards, interceptors, and store patterns
3. **OnPush change detection**: All components must use OnPush
4. **Standalone components**: No NgModules - all components are standalone
5. **Path aliases**: Always use `@core/`, `@shared/`, `@features/` for imports
6. **Inline templates/styles**: Prefer inline over separate files for small components
7. **No Zone.js**: This app runs in zoneless mode - never rely on Zone.js
