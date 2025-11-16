// ========================================
// EchoSprite Backend API - Production Version
// Full Discord Integration + PostgreSQL + Security
// ========================================

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const WebSocket = require('ws');
const { Client, GatewayIntentBits } = require('discord.js');
const pgSession = require('connect-pg-simple')(session);
require('dotenv').config();

// Import custom modules
const db = require('./db');
const logger = require('./logger');
const {
    apiLimiter,
    authLimiter,
    uploadLimiter,
    securityHeaders,
    validators,
    handleValidationErrors,
    requireAuth,
    errorHandler,
    requestLogger
} = require('./middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 3001;

// ========================================
// Security & Middleware
// ========================================

// Security headers first
app.use(securityHeaders);

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());

// Session with PostgreSQL store
app.use(session({
    store: new pgSession({
        conString: process.env.DATABASE_URL,
        tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET || 'echosprite-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
}));

// Request logging
app.use(requestLogger);

// Apply general rate limiting to all routes
app.use(apiLimiter);

// ========================================
// In-Memory Cache (for voice states only)
// ========================================

const voiceChannels = new Map(); // channelId -> Set of userIds
const voiceStates = new Map(); // userId -> { channelId, state, username, avatar }

// ========================================
// Discord Bot Setup
// ========================================

let discordClient = null;

if (process.env.DISCORD_BOT_TOKEN) {
    discordClient = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates
        ]
    });

    discordClient.on('ready', () => {
        logger.info(`Discord Bot logged in as ${discordClient.user.tag}`);
    });

    discordClient.on('voiceStateUpdate', (oldState, newState) => {
        handleVoiceStateUpdate(oldState, newState);
    });

    discordClient.on('error', (error) => {
        logger.error(`Discord Bot error: ${error.message}`);
    });

    discordClient.login(process.env.DISCORD_BOT_TOKEN).catch(err => {
        logger.error(`Discord Bot login failed: ${err.message}`);
    });
}

function handleVoiceStateUpdate(oldState, newState) {
    const member = newState.member;
    const userId = member.id;
    const channelId = newState.channelId;
    const oldChannelId = oldState.channelId;

    // User left voice
    if (!channelId && oldChannelId) {
        voiceStates.delete(userId);
        if (voiceChannels.has(oldChannelId)) {
            voiceChannels.get(oldChannelId).delete(userId);
        }
        broadcastVoiceUpdate(oldChannelId, userId, null);

        // Log analytics
        db.analytics.logEvent('voice_leave', null, { userId, channelId: oldChannelId })
            .catch(err => logger.error(`Analytics error: ${err.message}`));

        return;
    }

    // User joined or moved voice
    if (channelId) {
        // Determine state
        let state = 'idle';
        if (newState.deaf || newState.selfDeaf) {
            state = 'deafened';
        } else if (newState.mute || newState.selfMute) {
            state = 'muted';
        } else if (newState.speaking) {
            state = 'talking';
        }

        voiceStates.set(userId, {
            channelId,
            state,
            username: member.displayName,
            avatar: member.user.avatar
        });

        // Track channel membership
        if (!voiceChannels.has(channelId)) {
            voiceChannels.set(channelId, new Set());
        }
        voiceChannels.get(channelId).add(userId);

        // Remove from old channel
        if (oldChannelId && oldChannelId !== channelId) {
            if (voiceChannels.has(oldChannelId)) {
                voiceChannels.get(oldChannelId).delete(userId);
            }
        }

        broadcastVoiceUpdate(channelId, userId, state);

        // Log analytics
        db.analytics.logEvent('voice_update', null, { userId, channelId, state })
            .catch(err => logger.error(`Analytics error: ${err.message}`));
    }
}

// ========================================
// WebSocket Server
// ========================================

const wss = new WebSocket.Server({ port: WS_PORT });
const channelSubscriptions = new Map(); // channelId -> Set of WebSocket clients

wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    const channelId = url.searchParams.get('channelId');
    const type = url.searchParams.get('type') || 'group';

    logger.info(`WebSocket connected: channelId=${channelId}, type=${type}`);

    if (channelId) {
        if (!channelSubscriptions.has(channelId)) {
            channelSubscriptions.set(channelId, new Set());
        }
        channelSubscriptions.get(channelId).add(ws);

        // Send current state
        if (voiceChannels.has(channelId)) {
            const members = Array.from(voiceChannels.get(channelId));
            const states = members.map(userId => ({
                userId,
                ...voiceStates.get(userId)
            }));

            ws.send(JSON.stringify({
                type: 'init',
                members: states
            }));
        }
    }

    ws.on('close', () => {
        if (channelId && channelSubscriptions.has(channelId)) {
            channelSubscriptions.get(channelId).delete(ws);
        }
    });

    ws.on('error', (error) => {
        logger.error(`WebSocket error: ${error.message}`);
    });
});

function broadcastVoiceUpdate(channelId, userId, state) {
    if (!channelSubscriptions.has(channelId)) return;

    const message = JSON.stringify({
        type: state ? 'update' : 'leave',
        userId,
        state,
        timestamp: Date.now()
    });

    channelSubscriptions.get(channelId).forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

logger.info(`WebSocket server running on port ${WS_PORT}`);

// ========================================
// Discord OAuth Routes
// ========================================

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/auth/discord/callback';

app.get('/auth/discord', authLimiter, (req, res) => {
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds%20guilds.members.read`;
    res.redirect(authUrl);
});

app.get('/auth/discord/callback', authLimiter, async (req, res) => {
    const { code } = req.query;

    if (!code) {
        logger.warn('Discord callback: No code provided');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/app.html?error=no_code`);
    }

    try {
        // Exchange code for token
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: DISCORD_REDIRECT_URI
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, refresh_token } = tokenResponse.data;

        // Get user info
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        const discordUser = userResponse.data;

        // Store user in database
        const user = await db.users.create(
            discordUser.id,
            discordUser.username,
            discordUser.discriminator,
            discordUser.avatar
        );

        // Create session
        req.session.userId = user.id;
        req.session.discordId = discordUser.id;

        // Log analytics
        await db.analytics.logEvent('user_login', user.id, { method: 'discord' });

        logger.info(`User logged in: ${discordUser.username} (${discordUser.id})`);

        // Redirect to dashboard
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/app-discord.html?login=success`);

    } catch (error) {
        logger.error(`Discord OAuth error: ${error.response?.data || error.message}`);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/app.html?error=auth_failed`);
    }
});

app.get('/auth/logout', requireAuth, (req, res) => {
    const userId = req.session.userId;

    // Log analytics
    if (userId) {
        db.analytics.logEvent('user_logout', userId)
            .catch(err => logger.error(`Analytics error: ${err.message}`));
    }

    req.session.destroy((err) => {
        if (err) {
            logger.error(`Session destroy error: ${err.message}`);
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true });
    });
});

app.get('/auth/me', requireAuth, async (req, res) => {
    try {
        const user = await db.users.findByDiscordId(req.session.discordId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            discordId: user.discord_id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar
        });
    } catch (error) {
        logger.error(`Get user error: ${error.message}`);
        res.status(500).json({ error: 'Failed to get user data' });
    }
});

// ========================================
// Avatar Management Routes (4 States)
// ========================================

app.put('/api/avatar',
    requireAuth,
    uploadLimiter,
    validators.avatarUpload,
    handleValidationErrors,
    async (req, res) => {
        try {
            const userId = req.session.userId;
            const { idle, talking, muted, deafened, settings } = req.body;

            // Validate at least one state
            if (!idle && !talking && !muted && !deafened) {
                return res.status(400).json({ error: 'At least one avatar state is required' });
            }

            // Store avatar config in database
            await db.avatars.upsert(userId, {
                idle: idle || null,
                talking: talking || null,
                muted: muted || null,
                deafened: deafened || null,
                settings: settings || {}
            });

            // Log analytics
            await db.analytics.logEvent('avatar_upload', userId, {
                states: { idle: !!idle, talking: !!talking, muted: !!muted, deafened: !!deafened }
            });

            logger.info(`Avatar updated for user ${userId}`);

            res.json({
                success: true,
                message: 'Avatar updated successfully'
            });
        } catch (error) {
            logger.error(`Avatar upload error: ${error.message}`);
            res.status(500).json({ error: 'Failed to upload avatar' });
        }
    }
);

app.get('/api/avatar/:discordId', async (req, res) => {
    try {
        const { discordId } = req.params;

        const avatar = await db.avatars.findByDiscordId(discordId);

        if (!avatar) {
            return res.status(404).json({ error: 'Avatar not found' });
        }

        res.json({
            success: true,
            avatar: {
                idle: avatar.idle_image,
                talking: avatar.talking_image,
                muted: avatar.muted_image,
                deafened: avatar.deafened_image,
                settings: avatar.settings
            }
        });
    } catch (error) {
        logger.error(`Get avatar error: ${error.message}`);
        res.status(500).json({ error: 'Failed to get avatar' });
    }
});

// ========================================
// Channel & Group Routes
// ========================================

app.get('/api/channel/:channelId/members', async (req, res) => {
    try {
        const { channelId } = req.params;

        if (!voiceChannels.has(channelId)) {
            return res.json({ members: [] });
        }

        const memberIds = Array.from(voiceChannels.get(channelId));
        const members = [];

        for (const userId of memberIds) {
            const voiceState = voiceStates.get(userId);
            const user = await db.users.findByDiscordId(userId);

            members.push({
                userId,
                username: voiceState?.username || user?.username || 'Unknown',
                state: voiceState?.state || 'idle',
                avatar: voiceState?.avatar || user?.avatar
            });
        }

        res.json({ members });
    } catch (error) {
        logger.error(`Get channel members error: ${error.message}`);
        res.status(500).json({ error: 'Failed to get channel members' });
    }
});

// ========================================
// Analytics Routes (Admin Only - Add auth later)
// ========================================

app.get('/api/analytics/stats', async (req, res) => {
    try {
        const { start, end } = req.query;
        const startDate = start ? new Date(start) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const endDate = end ? new Date(end) : new Date();

        const stats = await db.analytics.getStats(startDate, endDate);

        res.json({ success: true, stats });
    } catch (error) {
        logger.error(`Get analytics error: ${error.message}`);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

// ========================================
// Health Check
// ========================================

app.get('/health', async (req, res) => {
    try {
        // Test database connection
        await db.query('SELECT 1');

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '2.0.0-production',
            database: 'connected',
            discord: {
                bot: discordClient?.isReady() || false,
                oauth: !!(DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET)
            },
            websocket: {
                port: WS_PORT,
                connections: wss.clients.size
            }
        });
    } catch (error) {
        logger.error(`Health check failed: ${error.message}`);
        res.status(503).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.json({
        name: 'EchoSprite API v2 (Production)',
        version: '2.0.0',
        features: [
            'Discord OAuth',
            'Discord Bot',
            'WebSocket',
            '4 Avatar States',
            'Group Viewing',
            'PostgreSQL Database',
            'Rate Limiting',
            'Security Headers',
            'Analytics'
        ]
    });
});

// ========================================
// Error Handling
// ========================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Global error handler (must be last)
app.use(errorHandler);

// ========================================
// Helper Functions
// ========================================

function generateSecureId() {
    return crypto.randomBytes(16).toString('hex');
}

// ========================================
// Start Server
// ========================================

app.listen(PORT, () => {
    logger.info(`EchoSprite API v2 (Production) running on port ${PORT}`);
    logger.info(`Health check: http://localhost:${PORT}/health`);
    logger.info(`Discord Bot: ${discordClient ? 'Enabled' : 'Disabled (set DISCORD_BOT_TOKEN)'}`);
    logger.info(`Discord OAuth: ${DISCORD_CLIENT_ID ? 'Configured' : 'Not configured'}`);
    logger.info(`Database: PostgreSQL`);
    logger.info(`Security: Helmet, Rate Limiting, Input Validation`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully...');

    wss.close(() => {
        logger.info('WebSocket server closed');
    });

    if (discordClient) {
        discordClient.destroy();
        logger.info('Discord client destroyed');
    }

    process.exit(0);
});

process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});
