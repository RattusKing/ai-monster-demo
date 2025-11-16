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

    // ========================================
    // Discord Integration Methods
    // ========================================

    async getMe() {
        try {
            const response = await fetch(`${this.baseURL}/auth/me`, {
                credentials: 'include'
            });

            if (!response.ok) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('API Error (getMe):', error);
            return null;
        }
    }

    async logout() {
        try {
            const response = await fetch(`${this.baseURL}/auth/logout`, {
                credentials: 'include'
            });
            return await response.json();
        } catch (error) {
            console.error('API Error (logout):', error);
            throw error;
        }
    }

    async uploadAvatar(avatarData) {
        try {
            const response = await fetch(`${this.baseURL}/api/avatar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(avatarData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload avatar');
            }

            return data;
        } catch (error) {
            console.error('API Error (uploadAvatar):', error);
            throw error;
        }
    }

    async getAvatar(discordId) {
        try {
            const response = await fetch(`${this.baseURL}/api/avatar/${discordId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load avatar');
            }

            return data;
        } catch (error) {
            console.error('API Error (getAvatar):', error);
            throw error;
        }
    }

    async getChannelMembers(channelId) {
        try {
            const response = await fetch(`${this.baseURL}/api/channel/${channelId}/members`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load channel members');
            }

            return data;
        } catch (error) {
            console.error('API Error (getChannelMembers):', error);
            throw error;
        }
    }
}

// Export API client
window.EchoSpriteAPI = EchoSpriteAPI;
