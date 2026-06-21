import dotenv from "dotenv";
dotenv.config();

const config = {
  port:                process.env.PORT || 5000,
  nodeEnv:             process.env.NODE_ENV || "development",
  frontendUrl:         process.env.FRONTEND_URL || "http://localhost:3000",

  // JWT
  jwtSecret:           process.env.JWT_SECRET || "fallback_secret_change_this",
  jwtExpiresIn:        process.env.JWT_EXPIRES_IN || "7d",

  // Cookie
  cookieMaxAge:        7 * 24 * 60 * 60 * 1000, // 7 days in ms

  // Stripe
  stripeSecretKey:     process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
};

export default config;
