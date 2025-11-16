// ========================================
// EchoSprite API Client
// ========================================

class EchoSpriteAPI {
    constructor() {
        this.baseURL = window.ECHOSPRITE_CONFIG?.API_URL || 'http://localhost:3000';
    }

    // Save avatar configuration to cloud
    async saveConfig(config) {
        try {
            const response = await fetch(`${this.baseURL}/api/avatar-config`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(config)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save configuration');
            }

            return data;
        } catch (error) {
            console.error('API Error (saveConfig):', error);
            throw error;
        }
    }

    // Load avatar configuration from cloud
    async getConfig(publicId) {
        try {
            const response = await fetch(`${this.baseURL}/api/avatar-config/${publicId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load configuration');
            }

            return data;
        } catch (error) {
            console.error('API Error (getConfig):', error);
            throw error;
        }
    }

    // Get stats for a configuration
    async getStats(publicId) {
        try {
            const response = await fetch(`${this.baseURL}/api/avatar-config/${publicId}/stats`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load stats');
            }

            return data;
        } catch (error) {
            console.error('API Error (getStats):', error);
            throw error;
        }
    }

    // Health check
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            const data = await response.json();
            return data.status === 'healthy';
        } catch (error) {
            console.error('API Error (healthCheck):', error);
            return false;
        }
    }
}

// Export API client
window.EchoSpriteAPI = EchoSpriteAPI;
