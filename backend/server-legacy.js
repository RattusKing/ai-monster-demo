// ========================================
// EchoSprite Backend API - Full Discord Integration
// ========================================

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const WebSocket = require('ws');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 3001;

// ========================================
// In-Memory Database (Replace with PostgreSQL in production)
// ========================================

const users = new Map(); // discordId -> user data
const avatars = new Map(); // discordId -> avatar config (4 states)
const voiceChannels = new Map(); // channelId -> Set of userIds
const sessions = new Map(); // sessionId -> userId

// ========================================
// Middleware
// ========================================

app.use(cors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || 'echosprite-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ========================================
// Discord Bot Setup
// ========================================

let discordClient = null;
const voiceStates = new Map(); // userId -> { channelId, speaking, muted, deafened }

if (process.env.DISCORD_BOT_TOKEN) {
    discordClient = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates
        ]
    });

    discordClient.on('ready', () => {
        console.log(`✅ Discord Bot logged in as ${discordClient.user.tag}`);
    });

    discordClient.on('voiceStateUpdate', (oldState, newState) => {
        handleVoiceStateUpdate(oldState, newState);
    });

    discordClient.login(process.env.DISCORD_BOT_TOKEN).catch(err => {
        console.error('❌ Discord Bot login failed:', err.message);
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

    console.log(`🔌 WebSocket connected: channelId=${channelId}, type=${type}`);

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
        console.error('WebSocket error:', error);
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

console.log(`🔌 WebSocket server running on port ${WS_PORT}`);

// ========================================
// Discord OAuth Routes
// ========================================

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/auth/discord/callback';

app.get('/auth/discord', (req, res) => {
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds%20guilds.members.read`;
    res.redirect(authUrl);
});

app.get('/auth/discord/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
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

        // Store user
        users.set(discordUser.id, {
            discordId: discordUser.id,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            avatar: discordUser.avatar,
            accessToken: access_token,
            refreshToken: refresh_token,
            lastLogin: new Date().toISOString()
        });

        // Create session
        const sessionId = generateSecureId();
        sessions.set(sessionId, discordUser.id);
        req.session.userId = discordUser.id;
        req.session.sessionId = sessionId;

        // Redirect to dashboard
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/app.html?login=success`);

    } catch (error) {
        console.error('Discord OAuth error:', error.response?.data || error.message);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/app.html?error=auth_failed`);
    }
});

app.get('/auth/logout', (req, res) => {
    const sessionId = req.session.sessionId;
    if (sessionId) {
        sessions.delete(sessionId);
    }
    req.session.destroy();
    res.json({ success: true });
});

app.get('/auth/me', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = users.get(userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({
        discordId: user.discordId,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar
    });
});

// ========================================
// Avatar Management Routes (4 States)
// ========================================

app.put('/api/avatar', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const { idle, talking, muted, deafened, settings } = req.body;

    // Validate at least one state
    if (!idle && !talking && !muted && !deafened) {
        return res.status(400).json({ error: 'At least one avatar state is required' });
    }

    // Store avatar config
    avatars.set(userId, {
        idle: idle || null,
        talking: talking || null,
        muted: muted || null,
        deafened: deafened || null,
        settings: settings || {},
        updatedAt: new Date().toISOString()
    });

    console.log(`✅ Updated avatar for user ${userId}`);

    res.json({
        success: true,
        message: 'Avatar updated successfully'
    });
});

app.get('/api/avatar/:discordId', (req, res) => {
    const { discordId } = req.params;

    const avatar = avatars.get(discordId);
    if (!avatar) {
        return res.status(404).json({ error: 'Avatar not found' });
    }

    res.json({
        success: true,
        avatar: {
            idle: avatar.idle,
            talking: avatar.talking,
            muted: avatar.muted,
            deafened: avatar.deafened,
            settings: avatar.settings
        }
    });
});

// ========================================
// Channel & Group Routes
// ========================================

app.get('/api/channel/:channelId/members', (req, res) => {
    const { channelId } = req.params;

    if (!voiceChannels.has(channelId)) {
        return res.json({ members: [] });
    }

    const memberIds = Array.from(voiceChannels.get(channelId));
    const members = memberIds.map(userId => {
        const voiceState = voiceStates.get(userId);
        const user = users.get(userId);

        return {
            userId,
            username: voiceState?.username || user?.username || 'Unknown',
            state: voiceState?.state || 'idle',
            avatar: voiceState?.avatar || user?.avatar
        };
    });

    res.json({ members });
});

// ========================================
// Backward Compatibility (Old Cloud Save)
// ========================================

const legacyConfigs = new Map();

app.post('/api/avatar-config', (req, res) => {
    const { idleImage, talkingImage, mutedImage, deafenedImage, sensitivity, settings } = req.body;

    const publicId = generateSecureId();

    legacyConfigs.set(publicId, {
        publicId,
        idle: idleImage,
        talking: talkingImage,
        muted: mutedImage,
        deafened: deafenedImage,
        sensitivity: sensitivity || 30,
        settings: settings || {},
        createdAt: new Date().toISOString()
    });

    res.json({
        success: true,
        publicId,
        viewerUrl: `/viewer.html?id=${publicId}`
    });
});

app.get('/api/avatar-config/:publicId', (req, res) => {
    const { publicId } = req.params;
    const config = legacyConfigs.get(publicId);

    if (!config) {
        return res.status(404).json({ error: 'Configuration not found' });
    }

    res.json({
        success: true,
        config: {
            idleImage: config.idle,
            talkingImage: config.talking,
            mutedImage: config.muted,
            deafenedImage: config.deafened,
            sensitivity: config.sensitivity,
            settings: config.settings
        }
    });
});

// ========================================
// Health Check
// ========================================

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        discord: {
            bot: discordClient?.isReady() || false,
            oauth: !!(DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET)
        },
        websocket: {
            port: WS_PORT,
            connections: wss.clients.size
        }
    });
});

app.get('/', (req, res) => {
    res.json({
        name: 'EchoSprite API v2',
        version: '2.0.0',
        features: ['Discord OAuth', 'Discord Bot', 'WebSocket', '4 Avatar States', 'Group Viewing']
    });
});

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
    console.log(`🚀 EchoSprite API v2 running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🎮 Discord Bot: ${discordClient ? 'Enabled' : 'Disabled (set DISCORD_BOT_TOKEN)'}`);
    console.log(`🔐 Discord OAuth: ${DISCORD_CLIENT_ID ? 'Configured' : 'Not configured'}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down...');
    wss.close();
    if (discordClient) {
        discordClient.destroy();
    }
    process.exit(0);
});
