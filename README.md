# MediStore Backend

A RESTful API for an online medicine store built with Express.js, TypeScript, PostgreSQL, and Stripe payments.

## Live Deployment

- Backend API: [https://medi-store-back-end-three.vercel.app](https://medi-store-back-end-three.vercel.app)
- Frontend URL: [https://medi-store-front-end-alpha.vercel.app](https://medi-store-front-end-alpha.vercel.app)
- Frontend Extended URL: [https://medi-store-front-end-extended.vercel.app](https://medi-store-front-end-extended.vercel.app)

## Tech Stack

- Node.js + TypeScript
- Express.js
- PostgreSQL with Prisma ORM
- JWT authentication
- Stripe payments and webhook handling
- Zod validation
- bcrypt password hashing
- CORS and rate limiting

## Key Features

- User registration, login, logout, and profile management
- Roles: `customer`, `seller`, `admin`
- Public medicine browsing with category support
- Admin category management
- Seller medicine management and order handling
- Customer order creation, tracking, and cancellation
- Stripe checkout session creation and webhook processing
- Product reviews by authenticated customers
- Admin dashboard for users and orders
- Global rate limiting for API protection

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database available
- npm or yarn installed

## Install

```bash
npm install
```

## Environment Variables

Create a `.env` file at the project root with these values:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
FRONTEND_URL_2=http://localhost:3001
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Database Setup

```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run prisma:studio
```

## Scripts

- `npm run dev` — Start development server using `tsx watch`
- `npm run build` — Compile TypeScript into `dist/`
- `npm start` — Run production server from `dist/`
- `npm run prisma:generate` — Generate Prisma client
- `npm run prisma:migrate` — Run Prisma migrations
- `npm run prisma:studio` — Open Prisma Studio
- `npm run seed` — Seed initial database data

## Project Structure

```text
.
├── .env
├── .gitignore
├── .vercel/
├── api/
│   └── index.ts
├── package-lock.json
├── package.json
├── prisma/
│   ├── migrations/
│   │   ├── 20260619060358_create_store/
│   │   └── 20260621022129_medi_store_v1_1/
│   ├── migration_lock.toml
│   ├── schema.prisma
│   └── seed.ts
├── prisma.config.ts
├── README.md
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── index.ts
│   │   └── prisma.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── rateLimiter.middleware.ts
│   ├── modules/
│   │   ├── admin/
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.route.ts
│   │   │   └── admin.service.ts
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.route.ts
│   │   │   └── auth.service.ts
│   │   ├── category/
│   │   │   ├── category.controller.ts
│   │   │   ├── category.route.ts
│   │   │   └── category.service.ts
│   │   ├── medicine/
│   │   │   ├── medicine.controller.ts
│   │   │   ├── medicine.route.ts
│   │   │   └── medicine.service.ts
│   │   ├── order/
│   │   │   ├── order.controller.ts
│   │   │   ├── order.route.ts
│   │   │   └── order.service.ts
│   │   ├── payment/
│   │   │   ├── payment.controller.ts
│   │   │   ├── payment.route.ts
│   │   │   └── payment.service.ts
│   │   ├── review/
│   │   │   ├── review.controller.ts
│   │   │   ├── review.route.ts
│   │   │   └── review.service.ts
│   │   └── seller/
│   │       ├── seller.controller.ts
│   │       ├── seller.route.ts
│   │       └── seller.service.ts
│   └── utils/
│       ├── AppError.ts
│       ├── catchAsync.ts
│       ├── schemas.ts
│       ├── sendResponse.ts
│       ├── types.ts
│       └── validate.ts
├── tsconfig.json
└── vercel.json
```

## API Base URL

- Local: `http://localhost:5000`
- Production: [https://medi-store-back-end-three.vercel.app](https://medi-store-back-end-three.vercel.app)

## Authentication

This API uses JWT authentication.

- Protect routes with `Authorization: Bearer <token>` header
- Use `/api/auth/login` to receive a token
- Use `/api/auth/register` to create a new account

## Endpoints

### Auth

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login with email and password |
| POST | `/api/auth/logout` | Authenticated | Logout current user |
| GET | `/api/auth/me` | Authenticated | Get authenticated user profile |
| PATCH | `/api/auth/profile` | Authenticated | Update authenticated user profile |

### Categories

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/categories` | Public | Get all categories |
| POST | `/api/categories` | Admin | Create a new category |
| PUT | `/api/categories/:id` | Admin | Update a category |
| DELETE | `/api/categories/:id` | Admin | Delete a category |

### Medicines

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/medicines` | Public | Get all medicines |
| GET | `/api/medicines/:id` | Public | Get medicine by ID |
| POST | `/api/medicines` | Seller/Admin | Create medicine |
| PUT | `/api/medicines/:id` | Seller/Admin | Update medicine |
| DELETE | `/api/medicines/:id` | Seller/Admin | Delete medicine |

### Orders

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/orders` | Customer | Create a new order |
| GET | `/api/orders/my-orders` | Customer | Get authenticated customer orders |
| GET | `/api/orders/:id` | Authenticated | Get order by ID |
| PATCH | `/api/orders/:id/cancel` | Customer | Cancel an order |

### Payments

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/payments/create-checkout-session` | Customer | Create Stripe checkout session |
| DELETE | `/api/payments/cancel/:orderId` | Customer | Cancel pending Stripe order |
| POST | `/api/payments/webhook` | Public | Stripe webhook endpoint |

### Reviews

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/reviews/medicine/:medicineId` | Public | Get reviews for a medicine |
| POST | `/api/reviews` | Customer | Create a product review |

### Seller Routes

All routes under `/api/seller` require the `seller` role.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/seller/dashboard` | Seller | Get seller dashboard stats |
| GET | `/api/seller/medicines` | Seller | Get seller medicines |
| GET | `/api/seller/medicines/:id` | Seller | Get seller medicine by ID |
| POST | `/api/seller/medicines` | Seller | Create medicine |
| PUT | `/api/seller/medicines/:id` | Seller | Update seller medicine |
| DELETE | `/api/seller/medicines/:id` | Seller | Delete seller medicine |
| GET | `/api/seller/orders` | Seller | Get seller orders |
| PATCH | `/api/seller/orders/:id` | Seller | Update seller order status |

### Admin Routes

All routes under `/api/admin` require the `admin` role.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/admin/dashboard` | Admin | Get admin dashboard stats |
| GET | `/api/admin/users` | Admin | Get all users |
| PATCH | `/api/admin/users/:id` | Admin | Update user status or role |
| GET | `/api/admin/orders` | Admin | Get all orders |

## CORS Configuration

Allowed origins are configured from:

- `FRONTEND_URL`
- `FRONTEND_URL_2`
- `http://localhost:3000`
- `http://localhost:3001`

Requests without an origin (Postman, curl, server-to-server) are also allowed.

## Notes

- `src/app.ts` registers a Stripe webhook route before `express.json()` so Stripe can verify the raw request body.
- `src/server.ts` ensures Prisma connects before starting the server.

