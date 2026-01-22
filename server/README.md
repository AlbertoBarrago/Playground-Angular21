# Playground Angular 21 - API Server

Fastify API server for the Playground Angular 21 application.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Framework**: [Fastify 5](https://fastify.dev)
- **Language**: TypeScript

## Plugins

| Plugin | Purpose |
|--------|---------|
| `@fastify/cors` | CORS support for Angular frontend |
| `@fastify/helmet` | Security headers |
| `@fastify/jwt` | JWT authentication (8h token expiry) |
| `@fastify/rate-limit` | Rate limiting (100 req/min) |
| `@fastify/swagger` | OpenAPI spec generation |
| `@fastify/swagger-ui` | API documentation UI |
| `@fastify/sensible` | HTTP utilities |

## Getting Started

```bash
# Install dependencies
bun install

# Start development server (with hot reload)
bun run dev

# Start production server
bun run start

# Type check
bun run typecheck
```

Server runs at `http://localhost:3000`

## API Documentation

Interactive API docs available at: `http://localhost:3000/documentation`

## Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login with email/password | No |
| POST | `/api/auth/logout` | Logout | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| POST | `/api/auth/refresh` | Refresh JWT token | Yes |

### Products

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | Search/filter products | Yes |
| GET | `/api/products/:id` | Get product by ID | Yes |
| GET | `/api/products/sku/:sku` | Get product by SKU | Yes |
| PATCH | `/api/products/:id/stock` | Update stock level | Yes |
| GET | `/api/products/:id/adjustments` | Get adjustment history | Yes |

### Health

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | No |

## Test Users

| Email | Password | Role |
|-------|----------|------|
| `admin@warehouse.com` | `admin123` | Admin |
| `manager@warehouse.com` | `manager123` | Manager |
| `operator@warehouse.com` | `operator123` | Operator |
| `demo@warehouse.com` | `demo` | Manager |

## Project Structure

```
server/
├── src/
│   ├── data/           # In-memory data (products, users)
│   ├── plugins/        # Fastify plugins configuration
│   ├── routes/         # API route handlers
│   ├── types/          # TypeScript types
│   └── index.ts        # Server entry point
├── package.json
└── tsconfig.json
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `3000` | Server port |
| `JWT_SECRET` | `warehouse-secret-key...` | JWT signing secret |

## Example Requests

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@warehouse.com", "password": "demo"}'
```

### Get Products (with token)

```bash
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer <token>"
```

### Search Products

```bash
curl "http://localhost:3000/api/products?query=keyboard&category=electronics" \
  -H "Authorization: Bearer <token>"
```

### Update Stock

```bash
curl -X PATCH http://localhost:3000/api/products/1/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "newStock": 200,
    "adjustmentType": "increase",
    "reason": "received_shipment",
    "notes": "New batch arrived"
  }'
```
