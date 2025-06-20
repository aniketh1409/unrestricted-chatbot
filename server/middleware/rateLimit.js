const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs, // 15 minutes by default
    max, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
};

// Different rate limits for different endpoints
const chatRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  50 // 50 chat requests per 15 minutes
);

const generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  200 // 200 general requests per 15 minutes
);

module.exports = {
  chatRateLimit,
  generalRateLimit
}; 