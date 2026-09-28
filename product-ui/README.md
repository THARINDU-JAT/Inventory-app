# Product UI

Angular 20 (standalone components, signals, lazy routes) frontend for the Product API.

## Requirements
Node 20.19+ (or 22.12+), npm 10+. The backend (`product-api`) must be running on http://localhost:8080.

## Run
```
npm install
npm start          # http://localhost:4200
```

## Scripts
- `npm start`: dev server (uses `environment.development.ts`)
- `npm run build`: production build (uses `environment.ts`)
- `npm test`: unit tests (Karma + Jasmine, needs Chrome)

## Configuration
Set the API URL in `src/environments/environment.development.ts` (dev) and
`src/environments/environment.ts` (production).

## Structure
```
src/app
├── core/          models, services, HTTP interceptor
├── shared/toast/  toast notifications
└── features/products/  list (paginated) + create/edit form
```
