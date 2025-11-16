// ========================================
// EchoSprite Backend API
// ========================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// In-memory storage (will be replaced with database later)
const avatarConfigs = new Map();

// ========================================
// Routes
// ========================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Get root info
app.get('/', (req, res) => {
    res.json({
        name: 'EchoSprite API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            saveConfig: 'POST /api/avatar-config',
            getConfig: 'GET /api/avatar-config/:publicId'
        }
    });
});

// Save avatar configuration
app.post('/api/avatar-config', (req, res) => {
    try {
        const { idleImage, talkingImage, sensitivity, settings } = req.body;

        // Validation
        if (!idleImage && !talkingImage) {
            return res.status(400).json({
                success: false,
                error: 'At least one image (idle or talking) is required'
            });
        }

        // Validate image data URLs
        if (idleImage && !isValidDataURL(idleImage)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid idle image format'
            });
        }

        if (talkingImage && !isValidDataURL(talkingImage)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid talking image format'
            });
        }

        // Validate sensitivity
        const sens = parseInt(sensitivity) || 30;
        if (sens < 0 || sens > 100) {
            return res.status(400).json({
                success: false,
                error: 'Sensitivity must be between 0 and 100'
            });
        }

        // Generate a secure public ID
        const publicId = generateSecureId();

        // Store configuration with metadata
        const config = {
            publicId,
            idleImage,
            talkingImage,
            sensitivity: sens,
            settings: settings || {},
            createdAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
            accessCount: 0
        };

        avatarConfigs.set(publicId, config);

        console.log(`✅ Saved avatar config: ${publicId}`);

        res.json({
            success: true,
            publicId,
            message: 'Avatar configuration saved successfully',
            viewerUrl: `/viewer.html?id=${publicId}`
        });

    } catch (error) {
        console.error('Error saving avatar config:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get avatar configuration by public ID
app.get('/api/avatar-config/:publicId', (req, res) => {
    try {
        const { publicId } = req.params;
        const config = avatarConfigs.get(publicId);

        if (!config) {
            return res.status(404).json({
                success: false,
                error: 'Avatar configuration not found'
            });
        }

        // Update access metadata
        config.lastAccessedAt = new Date().toISOString();
        config.accessCount = (config.accessCount || 0) + 1;
        avatarConfigs.set(publicId, config);

        console.log(`📥 Retrieved avatar config: ${publicId} (accessed ${config.accessCount} times)`);

        res.json({
            success: true,
            config: {
                idleImage: config.idleImage,
                talkingImage: config.talkingImage,
                sensitivity: config.sensitivity,
                settings: config.settings || {}
            }
        });

    } catch (error) {
        console.error('Error fetching avatar config:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get stats for an avatar config (without full data)
app.get('/api/avatar-config/:publicId/stats', (req, res) => {
    try {
        const { publicId } = req.params;
        const config = avatarConfigs.get(publicId);

        if (!config) {
            return res.status(404).json({
                success: false,
                error: 'Avatar configuration not found'
            });
        }

        res.json({
            success: true,
            stats: {
                publicId: config.publicId,
                createdAt: config.createdAt,
                lastAccessedAt: config.lastAccessedAt,
                accessCount: config.accessCount,
                hasIdleImage: !!config.idleImage,
                hasTalkingImage: !!config.talkingImage
            }
        });

    } catch (error) {
        console.error('Error fetching avatar stats:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Placeholder for future Discord OAuth
app.get('/api/auth/discord', (req, res) => {
    res.json({
        message: 'Discord OAuth integration coming soon',
        status: 'not_implemented'
    });
});

// Placeholder for future Discord bot integration
app.get('/api/discord/voice-status', (req, res) => {
    res.json({
        message: 'Discord voice channel integration coming soon',
        status: 'not_implemented'
    });
});

// ========================================
// Helper Functions
// ========================================

function generateSecureId() {
    // Generate a cryptographically secure random ID
    return crypto.randomBytes(16).toString('hex');
}

function isValidDataURL(dataUrl) {
    if (!dataUrl || typeof dataUrl !== 'string') {
        return false;
    }
    // Check if it's a valid data URL
    return dataUrl.startsWith('data:image/');
}

function validateImageSize(dataUrl) {
    // Rough estimate: base64 is ~33% larger than original
    // 10MB limit on raw data = ~13.3MB base64
    const maxSize = 13 * 1024 * 1024; // 13MB in bytes
    return dataUrl.length <= maxSize;
}

// ========================================
// Start Server
// ========================================

app.listen(PORT, () => {
    console.log(`🚀 EchoSprite API running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
