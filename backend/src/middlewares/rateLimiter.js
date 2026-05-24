const ApiError = require('../utils/ApiError');

const createRateLimiter = (windowMs, max) => {
  const requests = new Map();

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requests.entries()) {
      if (now - record.startTime > windowMs) {
        requests.delete(key);
      }
    }
  }, windowMs);

  if (cleanup.unref) {
    cleanup.unref();
  }

  return (req, _res, next) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    let record = requests.get(key);

    if (!record || now - record.startTime > windowMs) {
      record = { count: 0, startTime: now };
      requests.set(key, record);
    }

    record.count += 1;

    if (record.count > max) {
      return next(ApiError.tooManyRequests('Too many requests. Please try again later.'));
    }

    next();
  };
};

const generalLimiter = createRateLimiter(15 * 60 * 1000, 100);

const authLimiter = createRateLimiter(15 * 60 * 1000, 10);

const apiLimiter = createRateLimiter(15 * 60 * 1000, 200);

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
};
