import { slidingWindow } from '@arcjet/node';
import aj from '#config/arcjet.js';
import logger from '#config/logger.js';

/**
 * 🛡️ Arcjet Security Middleware
 *
 * This middleware applies per-role request limits using Arcjet.
 * - Admins: 20 requests per minute
 * - Users: 10 requests per minute
 * - Guests: 5 requests per minute
 *
 * 👉 Note: We're using DRY_RUN mode here for testing,
 * so nothing actually gets blocked — only logged.
 */
const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest'; // default to guest if no role

    let limit, message;

    switch (role) {
      case 'admin':
        limit = 20;
        message = 'Admin request limit exceeded (20 per minute). Slow down.';
        break;
      case 'user':
        limit = 10;
        message = 'User request limit exceeded (10 per minute). Slow down.';
        break;
      case 'guest':
        limit = 5;
        message = 'Guest request limit exceeded (5 per minute). Slow down.';
        break;
    }

    // 👇 Create a per-role sliding window rule
    // DRY_RUN = logs what *would* be blocked, but doesn’t deny requests
    const client = aj.withRule(
      slidingWindow({
        mode: 'DRY_RUN', // 🔧 use DRY_RUN for safe testing
        interval: 60, // 1 minute in seconds
        max: limit, // role-specific limit
        name: `${role}-slow-down`,
      })
    );

    // Run Arcjet protection against the current request
    const decision = await client.protect(req);

    // If Arcjet thinks the request *would* be denied
    if (decision.isDenied) {
      switch (decision.reason) {
        case 'bot':
          logger.warn('Bot request blocked', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
          });
          return res.status(403).json({
            error: 'Forbidden',
            message: 'Automated requests are not allowed',
          });

        case 'shield':
          logger.warn('Shield request blocked', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method,
          });
          return res.status(403).json({
            error: 'Forbidden',
            message: 'Request blocked by security policy',
          });

        case 'rate_limit':
          logger.warn('Rate limit exceeded', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method,
          });
          return res.status(429).json({
            error: 'Too Many Requests',
            message,
          });
      }
    }


    // Always call next() since we’re testing
    next();
  } catch (error) {
    console.error('Arcjet middleware error', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong with securityMiddleware',
    });
  }
};

export default securityMiddleware;
