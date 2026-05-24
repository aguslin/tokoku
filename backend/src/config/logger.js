const winston = require('winston');
const path = require('path');
const util = require('util');

const logDir = path.resolve(__dirname, '../../storage/logs');

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

function safeStringify(obj) {
  const cache = new Set();
  return JSON.stringify(obj, (_, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) return '[Circular]';
      cache.add(value);
    }
    return value;
  });
}

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const keys = Object.keys(meta);
    let metaStr = '';
    if (keys.length) {
      try { metaStr = ' ' + safeStringify(meta); } catch { metaStr = ' ' + util.inspect(meta); }
    }
    return `${timestamp} ${level}: ${message}${metaStr}${stack ? '\n' + stack : ''}`;
  }),
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const keys = Object.keys(meta);
    let metaStr = '';
    if (keys.length) {
      try { metaStr = ' ' + safeStringify(meta); } catch { metaStr = ' ' + util.inspect(meta); }
    }
    return `${timestamp} ${level}: ${message}${metaStr}${stack ? '\n' + stack : ''}`;
  }),
);

const transports = [
  new winston.transports.Console({ format: consoleFormat }),
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    maxsize: 5242880,
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    maxsize: 5242880,
    maxFiles: 5,
  }),
];

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports,
});

module.exports = logger;
