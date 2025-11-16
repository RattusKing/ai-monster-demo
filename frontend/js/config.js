// ========================================
// EchoSprite Configuration
// ========================================

const CONFIG = {
    // API Base URL - automatically detects environment
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'https://echosprite.onrender.com', // Your live Render API

    // WebSocket URL for real-time updates
    WS_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'ws://localhost:3001'
        : 'wss://echosprite.onrender.com:3001',

    // Feature flags
    FEATURES: {
        CLOUD_SAVE: true,
        DISCORD_LOGIN: true,
        DISCORD_BOT: true,
        GROUP_VIEWER: true,
        BLINK_ANIMATION: true,
        BOUNCE_EFFECT: true,
        ADVANCED_SETTINGS: true
    },

    // Default settings
    DEFAULTS: {
        sensitivity: 30,
        blinkInterval: 5000, // ms between blinks
        bounceAmplitude: 5, // pixels
        bounceSpeed: 2000 // ms per bounce cycle
    },

    // Validation limits
    LIMITS: {
        MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
        MAX_SENSITIVITY: 100,
        MIN_SENSITIVITY: 0
    }
};

// Export for use in other scripts
window.ECHOSPRITE_CONFIG = CONFIG;
