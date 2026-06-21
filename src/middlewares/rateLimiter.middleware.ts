import rateLimit from "express-rate-limit";

// Login limiter — max 10 attempts per 15 minutes per IP
export const loginLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              10,              // max 10 requests per window
  standardHeaders:  true,           // Return rate limit info in RateLimit-* headers
  legacyHeaders:    false,
  message: {
    success: false,
    message:
      "Too many login attempts from this IP. Please try again after 15 minutes.",
  },
  // Skip successful requests — only count failed attempts
  skipSuccessfulRequests: true,
});

// General API limiter — max 200 requests per 15 minutes per IP
// Protects against scraping and abuse
export const generalLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             200,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please slow down.",
  },
});
