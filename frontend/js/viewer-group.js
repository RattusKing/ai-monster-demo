// ========================================
// EchoSprite Group Viewer - WebSocket Integration
// ========================================

class EchoSpriteGroupViewer {
    constructor() {
        this.ws = null;
        this.channelId = null;
        this.members = new Map(); // userId -> member data
        this.settings = {
            showNames: true,
            includeSelf: false,
            dimInactive: true,
            animation: 'bounce',
            spacing: 20
        };
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;

        this.init();
    }

    async init() {
        // Load settings
        this.loadSettings();

        // Apply settings to CSS
        this.applySettings();

        // Get channel ID from URL or detect current voice channel
        const params = new URLSearchParams(window.location.search);
        this.channelId = params.get('channelId');

        if (!this.channelId) {
            // Try to get from current user's voice state
            await this.detectVoiceChannel();
        }

        if (this.channelId) {
            this.connectWebSocket();
        } else {
            this.showError('No voice channel detected. Please join a Discord voice channel.');
        }
    }

    async detectVoiceChannel() {
        try {
            // This would need to be implemented on the backend
            // For now, show instruction
            console.log('Detecting voice channel...');
        } catch (error) {
            console.error('Failed to detect voice channel:', error);
        }
    }

    // ========================================
    // WebSocket Connection
    // ========================================

    connectWebSocket() {
        const wsUrl = window.ECHOSPRITE_CONFIG.WS_URL;
        const url = `${wsUrl}?channelId=${this.channelId}`;

        console.log('Connecting to WebSocket:', url);
        this.updateConnectionStatus('Connecting...');

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log('✅ WebSocket connected');
            this.updateConnectionStatus('Connected', true);
            this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateConnectionStatus('Error', false);
        };

        this.ws.onclose = () => {
            console.log('WebSocket closed');
            this.updateConnectionStatus('Disconnected', false);
            this.attemptReconnect();
        };
    }

    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.showError('Connection lost. Please refresh the page.');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

        console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);

        setTimeout(() => {
            this.connectWebSocket();
        }, delay);
    }

    // ========================================
    // Message Handling
    // ========================================

    handleMessage(data) {
        console.log('Received message:', data);

        switch (data.type) {
            case 'init':
                // Initial state of all members in channel
                data.members.forEach(member => {
                    this.addOrUpdateMember(member);
                });
                break;

            case 'update':
                // State change for a specific user
                this.updateMemberState(data.userId, data.state);
                break;

            case 'leave':
                // User left the channel
                this.removeMember(data.userId);
                break;

            default:
                console.warn('Unknown message type:', data.type);
        }
    }

    async addOrUpdateMember(memberData) {
        const { userId, username, state, avatar } = memberData;

        // Check if we should include this member
        if (!this.settings.includeSelf) {
            // Would need to check if userId matches current user
            // For now, include everyone
        }

        // Fetch avatar images for this user
        let avatarImages = null;
        try {
            const response = await fetch(`${window.ECHOSPRITE_CONFIG.API_URL}/api/avatar/${userId}`);
            if (response.ok) {
                const data = await response.json();
                avatarImages = data.avatar;
            }
        } catch (error) {
            console.error(`Failed to fetch avatar for ${userId}:`, error);
        }

        // Store member data
        this.members.set(userId, {
            userId,
            username,
            state,
            avatar,
            avatarImages
        });

        // Update or create avatar slot
        this.renderMember(userId);
    }

    updateMemberState(userId, state) {
        const member = this.members.get(userId);
        if (member) {
            member.state = state;
            this.renderMember(userId);
        }
    }

    removeMember(userId) {
        this.members.delete(userId);
        const slot = document.querySelector(`[data-user-id="${userId}"]`);
        if (slot) {
            slot.remove();
        }

        // Check if container is empty
        if (this.members.size === 0) {
            this.showPlaceholder();
        }
    }

    // ========================================
    // Rendering
    // ========================================

    renderMember(userId) {
        const member = this.members.get(userId);
        if (!member) return;

        const container = document.getElementById('groupContainer');

        // Remove placeholder if exists
        const placeholder = container.querySelector('p');
        if (placeholder) {
            placeholder.remove();
        }

        // Check if slot already exists
        let slot = document.querySelector(`[data-user-id="${userId}"]`);

        if (!slot) {
            // Create new slot
            slot = document.createElement('div');
            slot.className = 'avatar-slot';
            slot.dataset.userId = userId;
            container.appendChild(slot);
        }

        // Get current state image
        const stateImage = member.avatarImages
            ? member.avatarImages[member.state] || member.avatarImages.idle
            : null;

        // Update slot content
        slot.innerHTML = `
            ${stateImage ? `<img src="${stateImage}" alt="${member.username}">` : `<div style="width:200px;height:200px;background:#333;border-radius:50%"></div>`}
            <span class="username">${member.username}</span>
            <div class="state-indicator">${this.getStateEmoji(member.state)}</div>
        `;

        // Apply state classes
        slot.className = 'avatar-slot';
        if (member.state === 'talking') {
            slot.classList.add('talking');
            if (this.settings.animation) {
                slot.classList.add(this.settings.animation);
            }
        } else if (this.settings.dimInactive && member.state === 'idle') {
            slot.classList.add('inactive');
        }
    }

    getStateEmoji(state) {
        const emojis = {
            idle: '😌',
            talking: '🎙️',
            muted: '🔇',
            deafened: '🔊'
        };
        return emojis[state] || '❓';
    }

    showPlaceholder() {
        const container = document.getElementById('groupContainer');
        container.innerHTML = '<p style="color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">Waiting for voice channel members...</p>';
    }

    // ========================================
    // Settings
    // ========================================

    loadSettings() {
        const saved = localStorage.getItem('echosprite_settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }

    applySettings() {
        document.documentElement.style.setProperty('--spacing', `${this.settings.spacing}px`);
        document.documentElement.style.setProperty('--show-names', this.settings.showNames ? 'block' : 'none');
    }

    // ========================================
    // UI Updates
    // ========================================

    updateConnectionStatus(message, connected = false) {
        const status = document.getElementById('connectionStatus');
        status.textContent = message;
        status.className = 'connection-status ' + (connected ? 'connected' : 'disconnected');

        // Hide after 3 seconds if connected
        if (connected) {
            setTimeout(() => {
                status.style.display = 'none';
            }, 3000);
        } else {
            status.style.display = 'block';
        }
    }

    showError(message) {
        const container = document.getElementById('groupContainer');
        container.innerHTML = `<p style="color: #EF4444; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">${message}</p>`;
    }
}

// Initialize viewer
document.addEventListener('DOMContentLoaded', () => {
    new EchoSpriteGroupViewer();
});
