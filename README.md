# MediStore Backend

A RESTful API for an online medicine store built with Express.js, TypeScript, and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Stripe Integration
- **Security**: bcrypt, CORS, Rate Limiting
- **Validation**: Zod

## Features

- **Authentication**: User login/registration with JWT
- **Role-based Access**: Customer, Seller, Admin roles
- **Medicine Management**: Browse, search, and manage medicines
- **Categories**: Organize medicines by categories
- **Orders**: Create and track orders
- **Payments**: Stripe payment integration with webhooks
- **Reviews**: User reviews and ratings
- **Seller Management**: Seller dashboard and operations
- **Admin Panel**: User and system management
- **Rate Limiting**: API protection against abuse

## Prerequisites

- Node.js >= 18.x
- PostgreSQL database
- npm or yarn

## Installation

```bash
npm install
```

## Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run seed

# Open Prisma Studio
npm run prisma:studio
```

## Available Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Run production build
- `npm run seed` - Seed database with initial data

## Project Structure

```
src/
├── modules/        # Feature modules (auth, medicine, order, etc.)
├── middlewares/    # Custom middlewares (auth, error handling, rate limiting)
├── config/         # Configuration files
├── utils/          # Utility functions and types
├── app.ts         # Express app setup
└── server.ts      # Server entry point
```

## API Endpoints

- `/api/auth` - Authentication routes
- `/api/medicines` - Medicine catalog
- `/api/categories` - Medicine categories
- `/api/orders` - Order management
- `/api/payments` - Payment processing
- `/api/reviews` - Product reviews
- `/api/sellers` - Seller management
- `/api/admin` - Admin operations

## Development

```bash
npm run dev
```

The API runs on `https://medi-store-back-end-three.vercel.app` (configurable)

## License

MIT
