# MediStore Backend

A RESTful API for an online medicine store built with Express.js, TypeScript, PostgreSQL, and Stripe payments.

## Live Deployment

- Backend API: `https://medi-store-back-end-three.vercel.app`
- Frontend URL: `https://medi-store-front-end-alpha.vercel.app`
- Frontend Extended URL: `https://medi-store-front-end-extended.vercel.app`

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
src/
├── app.ts                # Express application setup
├── server.ts             # Server startup and database connect
├── config/               # Environment and Prisma configuration
├── middlewares/          # Auth, error handling, rate limiting
├── modules/              # Domain modules (auth, category, medicine, etc.)
└── utils/                # Shared helpers, schemas, types, validators
```

## API Base URL

- Local: `http://localhost:5000`
- Production: `https://medi-store-back-end-three.vercel.app`

## Authentication

This API uses JWT authentication.

- Protect routes with `Authorization: Bearer <token>` header
- Use `/api/auth/login` to receive a token
- Use `/api/auth/register` to create a new account

## Endpoints

### Auth

- `POST /api/auth/register`
  - Register a new user
  - Request body: `{ name, email, password, role }`
- `POST /api/auth/login`
  - Login with email and password
  - Request body: `{ email, password }`
- `POST /api/auth/logout`
  - Logout current user
- `GET /api/auth/me`
  - Get authenticated user profile
- `PATCH /api/auth/profile`
  - Update authenticated user profile

### Categories

- `GET /api/categories`
  - Get all categories
- `POST /api/categories`
  - Create a new category (admin only)
- `PUT /api/categories/:id`
  - Update a category by ID (admin only)
- `DELETE /api/categories/:id`
  - Delete a category by ID (admin only)

### Medicines

- `GET /api/medicines`
  - Get all medicines
- `GET /api/medicines/:id`
  - Get medicine details by ID
- `POST /api/medicines`
  - Create a new medicine (seller or admin)
- `PUT /api/medicines/:id`
  - Update a medicine by ID (seller or admin)
- `DELETE /api/medicines/:id`
  - Delete a medicine by ID (seller or admin)

### Orders

- `POST /api/orders`
  - Create a new order (customer only)
- `GET /api/orders/my-orders`
  - Get orders for authenticated customer
- `GET /api/orders/:id`
  - Get order by ID (authenticated users)
- `PATCH /api/orders/:id/cancel`
  - Cancel an order (customer only)

### Payments

- `POST /api/payments/create-checkout-session`
  - Create a Stripe checkout session for a customer order
- `DELETE /api/payments/cancel/:orderId`
  - Cancel a pending Stripe order (customer only)
- `POST /api/payments/webhook`
  - Stripe webhook endpoint for payment events
  - Uses raw JSON body and is registered before `express.json()` in `src/app.ts`

### Reviews

- `GET /api/reviews/medicine/:medicineId`
  - Get reviews for a medicine
- `POST /api/reviews`
  - Create a review (customer only)

### Seller Routes

All routes under `/api/seller` require the `seller` role.

- `GET /api/seller/dashboard`
  - Get seller dashboard stats
- `GET /api/seller/medicines`
  - Get medicines created by the authenticated seller
- `GET /api/seller/medicines/:id`
  - Get a seller medicine by ID
- `POST /api/seller/medicines`
  - Create a medicine as a seller
- `PUT /api/seller/medicines/:id`
  - Update a seller medicine by ID
- `DELETE /api/seller/medicines/:id`
  - Delete a seller medicine by ID
- `GET /api/seller/orders`
  - Get seller orders
- `PATCH /api/seller/orders/:id`
  - Update seller order status

### Admin Routes

All routes under `/api/admin` require the `admin` role.

- `GET /api/admin/dashboard`
  - Get admin dashboard stats
- `GET /api/admin/users`
  - Get all users
- `PATCH /api/admin/users/:id`
  - Update a user status or role
- `GET /api/admin/orders`
  - Get all orders

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

