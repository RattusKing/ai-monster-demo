// ========================================
// Middleware - Security, Rate Limiting, Validation
// ========================================

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const logger = require('./logger');

// ========================================
// Rate Limiting
// ========================================

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            error: 'Too many requests',
            message: 'Please slow down and try again later.'
        });
    }
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            error: 'Too many authentication attempts',
            message: 'Please wait before trying again.'
        });
    }
});

// Upload rate limiter (stricter)
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Limit each IP to 50 uploads per hour
    message: 'Too many uploads, please try again later.',
    handler: (req, res) => {
        logger.warn(`Upload rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            error: 'Too many uploads',
            message: 'You can upload up to 50 times per hour.'
        });
    }
});

// ========================================
// Security Headers (Helmet)
// ========================================

const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https://discord.com', 'wss:'],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false, // Required for Discord OAuth
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Required for OBS browser sources
});

// ========================================
// Input Validation Helpers
// ========================================

const validators = {
    // Avatar upload validation
    avatarUpload: [
        body('idle').optional().isString().isLength({ max: 10 * 1024 * 1024 })
            .withMessage('Idle image must be a valid base64 string under 10MB'),
        body('talking').optional().isString().isLength({ max: 10 * 1024 * 1024 })
            .withMessage('Talking image must be a valid base64 string under 10MB'),
        body('muted').optional().isString().isLength({ max: 10 * 1024 * 1024 })
            .withMessage('Muted image must be a valid base64 string under 10MB'),
        body('deafened').optional().isString().isLength({ max: 10 * 1024 * 1024 })
            .withMessage('Deafened image must be a valid base64 string under 10MB'),
        body('settings').optional().isObject()
            .withMessage('Settings must be a valid object'),
    ],

    // Settings validation
    settings: [
        body('sensitivity').optional().isInt({ min: 0, max: 100 })
            .withMessage('Sensitivity must be between 0 and 100'),
        body('showNames').optional().isBoolean()
            .withMessage('showNames must be a boolean'),
        body('includeSelf').optional().isBoolean()
            .withMessage('includeSelf must be a boolean'),
        body('spacing').optional().isInt({ min: 0, max: 100 })
            .withMessage('Spacing must be between 0 and 100'),
        body('bounce').optional().isBoolean()
            .withMessage('bounce must be a boolean'),
        body('fade').optional().isBoolean()
            .withMessage('fade must be a boolean'),
        body('dimInactive').optional().isBoolean()
            .withMessage('dimInactive must be a boolean'),
    ],
};

// Validation result handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Validation failed: ${JSON.stringify(errors.array())}`);
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

// ========================================
// Authentication Middleware
// ========================================

const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        logger.warn(`Unauthorized access attempt to ${req.path}`);
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'You must be logged in to access this resource.'
        });
    }
    next();
};

// ========================================
// Error Handler Middleware
// ========================================

const errorHandler = (err, req, res, next) => {
    logger.error(`Error: ${err.message}\nStack: ${err.stack}`);

    // Default error
    let status = err.status || 500;
    let message = err.message || 'Internal server error';

    // Specific error handling
    if (err.name === 'ValidationError') {
        status = 400;
        message = 'Invalid input data';
    } else if (err.name === 'UnauthorizedError') {
        status = 401;
        message = 'Unauthorized access';
    }

    res.status(status).json({
        error: err.name || 'Error',
        message: process.env.NODE_ENV === 'production' && status === 500
            ? 'An unexpected error occurred'
            : message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
};

// ========================================
// Request Logger Middleware
// ========================================

const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.http(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    });
    next();
};

// ========================================
// Exports
// ========================================

module.exports = {
    apiLimiter,
    authLimiter,
    uploadLimiter,
    securityHeaders,
    validators,
    handleValidationErrors,
    requireAuth,
    errorHandler,
    requestLogger,
};
