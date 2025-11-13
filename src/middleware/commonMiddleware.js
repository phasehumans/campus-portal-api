const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

/**
 * Configure CORS
 */
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
};

/**
 * Configure rate limiting
 */
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter rate limit for auth routes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

/**
 * Logger configuration
 */
const loggerConfig = process.env.LOG_FORMAT || 'combined';

/**
 * Apply all middleware
 */
const applyMiddleware = (app) => {
  // Security
  app.use(helmet());
  app.use(cors(corsOptions));

  // Logging
  app.use(morgan(loggerConfig));

  // Body parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ limit: '10kb', extended: true }));

  // Rate limiting
  app.use(limiter);
};

module.exports = {
  applyMiddleware,
  corsOptions,
  limiter,
  authLimiter,
  loggerConfig,
};
