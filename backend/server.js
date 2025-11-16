// ========================================
// EchoSprite Backend API
// ========================================

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
        const { idleImage, talkingImage, sensitivity } = req.body;

        if (!idleImage && !talkingImage) {
            return res.status(400).json({
                error: 'At least one image (idle or talking) is required'
            });
        }

        // Generate a public ID (simple random string for now)
        const publicId = generatePublicId();

        // Store configuration
        const config = {
            publicId,
            idleImage,
            talkingImage,
            sensitivity: sensitivity || 30,
            createdAt: new Date().toISOString()
        };

        avatarConfigs.set(publicId, config);

        res.json({
            success: true,
            publicId,
            message: 'Avatar configuration saved successfully'
        });

    } catch (error) {
        console.error('Error saving avatar config:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get avatar configuration by public ID
app.get('/api/avatar-config/:publicId', (req, res) => {
    try {
        const { publicId } = req.params;
        const config = avatarConfigs.get(publicId);

        if (!config) {
            return res.status(404).json({
                error: 'Avatar configuration not found'
            });
        }

        res.json({
            success: true,
            config: {
                idleImage: config.idleImage,
                talkingImage: config.talkingImage,
                sensitivity: config.sensitivity
            }
        });

    } catch (error) {
        console.error('Error fetching avatar config:', error);
        res.status(500).json({ error: 'Internal server error' });
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

function generatePublicId() {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
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
