// ========================================
// EchoSprite App Logic - Discord Version (4 States)
// ========================================

class EchoSpriteDiscordApp {
    constructor() {
        this.avatarStates = {
            idle: null,
            talking: null,
            muted: null,
            deafened: null
        };
        this.currentState = 'idle';
        this.user = null;
        this.mode = 'guest'; // 'guest' or 'discord'
        this.api = new EchoSpriteAPI();
        this.settings = {
            showNames: true,
            includeSelf: false,
            dimInactive: true,
            animation: 'bounce',
            spacing: 20,
            sensitivity: 30
        };

        this.init();
    }

    async init() {
        // Check mode from URL
        const params = new URLSearchParams(window.location.search);
        const urlMode = params.get('mode');
        const loginSuccess = params.get('login');

        if (loginSuccess === 'success') {
            this.showToast('✅ Logged in with Discord!', 'success');
        }

        // Check if user is logged in
        await this.checkAuth();

        // Load settings
        this.loadSettings();

        // Setup event listeners
        this.setupUploadListeners();
        this.setupStatePreview();
        this.setupSettings();
        this.setupURLs();

        // Load saved avatars
        this.loadSavedAvatars();

        // Setup mode-specific features
        this.setupModeSection();
    }

    // ========================================
    // Authentication
    // ========================================

    async checkAuth() {
        try {
            const response = await this.api.getMe();
            if (response && response.discordId) {
                this.user = response;
                this.mode = 'discord';
                this.updateUserInfo();
            } else {
                this.mode = 'guest';
            }
        } catch (error) {
            this.mode = 'guest';
        }
    }

    updateUserInfo() {
        const userInfo = document.getElementById('userInfo');
        const logoutBtn = document.getElementById('logoutBtn');

        if (this.user) {
            userInfo.textContent = `👋 ${this.user.username}`;
            logoutBtn.style.display = 'inline-block';
            logoutBtn.onclick = () => this.logout();

            // Show group link section
            document.getElementById('groupLinkSection').style.display = 'block';
        }
    }

    async logout() {
        try {
            await this.api.logout();
            window.location.href = 'index.html';
        } catch (error) {
            window.location.href = 'index.html';
        }
    }

    // ========================================
    // Avatar Upload (4 States)
    // ========================================

    setupUploadListeners() {
        const states = ['idle', 'talking', 'muted', 'deafened'];
        states.forEach(state => {
            const input = document.getElementById(`${state}Upload`);
            input.addEventListener('change', (e) => this.handleImageUpload(e, state));
        });
    }

    handleImageUpload(event, state) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            this.showToast('Please upload an image file', 'error');
            return;
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showToast('Image must be smaller than 10MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const imageData = e.target.result;

            // Store in memory
            this.avatarStates[state] = imageData;

            // Update preview
            this.updateStatePreview(state, imageData);

            // Save locally
            localStorage.setItem(`echosprite_${state}`, imageData);

            // Upload to backend if logged in
            if (this.mode === 'discord') {
                await this.uploadToBackend();
            }

            this.showToast(`${state.charAt(0).toUpperCase() + state.slice(1)} image uploaded!`, 'success');
            this.updateURLs();
        };
        reader.readAsDataURL(file);
    }

    updateStatePreview(state, imageData) {
        const preview = document.getElementById(`${state}Preview`);
        preview.innerHTML = `<img src="${imageData}" alt="${state}" class="fade-in">`;

        // Update large preview if this is the current state
        if (this.currentState === state) {
            this.updateLargePreview(state);
        }
    }

    loadSavedAvatars() {
        const states = ['idle', 'talking', 'muted', 'deafened'];
        states.forEach(state => {
            const saved = localStorage.getItem(`echosprite_${state}`);
            if (saved) {
                this.avatarStates[state] = saved;
                this.updateStatePreview(state, saved);
            }
        });

        this.updateLargePreview(this.currentState);
    }

    async uploadToBackend() {
        if (this.mode !== 'discord') return;

        try {
            await this.api.uploadAvatar({
                idle: this.avatarStates.idle,
                talking: this.avatarStates.talking,
                muted: this.avatarStates.muted,
                deafened: this.avatarStates.deafened,
                settings: this.settings
            });
        } catch (error) {
            console.error('Failed to upload to backend:', error);
        }
    }

    // ========================================
    // State Preview
    // ========================================

    setupStatePreview() {
        const btns = document.querySelectorAll('.state-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentState = btn.dataset.state;
                this.updateLargePreview(this.currentState);
            });
        });
    }

    updateLargePreview(state) {
        const preview = document.getElementById('avatarPreviewLarge');
        const image = this.avatarStates[state];

        if (image) {
            preview.innerHTML = `<img src="${image}" alt="${state}" class="fade-in">`;
        } else {
            preview.innerHTML = `<p class="placeholder-text">Upload ${state} image to preview</p>`;
        }
    }

    // ========================================
    // Mode-Specific Features
    // ========================================

    setupModeSection() {
        const section = document.getElementById('modeSection');

        if (this.mode === 'discord') {
            section.innerHTML = `
                <h2>🎮 Step 3: Discord Integration</h2>
                <div class="discord-status">
                    <p>✅ Connected to Discord as <strong>${this.user.username}</strong></p>
                    <p>Your avatar will automatically react when you:</p>
                    <ul>
                        <li>🎙️ Talk in Discord voice channels</li>
                        <li>🔇 Mute your microphone</li>
                        <li>🔊 Deafen yourself</li>
                    </ul>
                    <p class="help-text">
                        💡 Make sure the EchoSprite bot is in the same Discord server as your voice channel!
                    </p>
                </div>
            `;
        } else {
            section.innerHTML = `
                <h2>🎙️ Step 3: Test Mic Reactivity (Guest Mode)</h2>
                <p class="help-text">Guest mode only supports idle/talking states via local microphone.</p>
                <div class="preview-container">
                    <div class="mic-controls">
                        <button id="startMicTest" class="btn btn-primary">Start Mic Test</button>
                        <button id="stopMicTest" class="btn btn-secondary" style="display: none;">Stop</button>
                        <div class="mic-indicator">
                            <p>Mic Level:</p>
                            <div class="level-bar">
                                <div class="level-fill" id="micLevel"></div>
                            </div>
                            <p class="status-text" id="statusText">Not listening</p>
                        </div>
                    </div>
                </div>
                <p class="help-text">
                    💡 Want full Discord integration with 4 states? <a href="login.html">Login with Discord</a>
                </p>
            `;

            // Setup mic test for guest mode
            this.setupGuestMicTest();
        }
    }

    setupGuestMicTest() {
        const startBtn = document.getElementById('startMicTest');
        const stopBtn = document.getElementById('stopMicTest');

        if (!startBtn) return;

        let micStream = null;
        let audioContext = null;
        let analyser = null;
        let animationFrame = null;

        startBtn.addEventListener('click', async () => {
            try {
                micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                const source = audioContext.createMediaStreamSource(micStream);
                source.connect(analyser);

                analyser.fftSize = 256;
                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                startBtn.style.display = 'none';
                stopBtn.style.display = 'inline-block';
                document.getElementById('statusText').textContent = 'Listening...';

                const monitor = () => {
                    if (!analyser) return;

                    analyser.getByteFrequencyData(dataArray);
                    const sum = dataArray.reduce((a, b) => a + b, 0);
                    const average = sum / dataArray.length;
                    const volume = Math.round((average / 255) * 100);

                    document.getElementById('micLevel').style.width = volume + '%';

                    if (volume > this.settings.sensitivity) {
                        this.currentState = 'talking';
                        document.getElementById('statusText').textContent = 'Talking!';
                    } else {
                        this.currentState = 'idle';
                        document.getElementById('statusText').textContent = 'Listening...';
                    }

                    this.updateLargePreview(this.currentState);
                    animationFrame = requestAnimationFrame(monitor);
                };

                monitor();
            } catch (error) {
                this.showToast('Could not access microphone', 'error');
            }
        });

        stopBtn.addEventListener('click', () => {
            if (micStream) {
                micStream.getTracks().forEach(track => track.stop());
            }
            if (audioContext) {
                audioContext.close();
            }
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }

            startBtn.style.display = 'inline-block';
            stopBtn.style.display = 'none';
            document.getElementById('statusText').textContent = 'Not listening';
            document.getElementById('micLevel').style.width = '0%';
        });
    }

    // ========================================
    // URL Generation
    // ========================================

    setupURLs() {
        document.getElementById('copyIndividualUrl').addEventListener('click', () => this.copyURL('individual'));
        document.getElementById('copyGroupUrl').addEventListener('click', () => this.copyURL('group'));
        this.updateURLs();
    }

    updateURLs() {
        const baseUrl = window.location.origin + window.location.pathname.replace('app-discord.html', '').replace('app.html', '');

        // Individual URL
        let individualUrl;
        if (this.mode === 'discord' && this.user) {
            individualUrl = `${baseUrl}viewer.html?userId=${this.user.discordId}&mode=discord`;
        } else {
            individualUrl = `${baseUrl}viewer.html?mode=mic`;
        }

        document.getElementById('individualUrl').value = individualUrl;
        document.getElementById('previewIndividualLink').href = individualUrl;
        if (this.avatarStates.idle || this.avatarStates.talking) {
            document.getElementById('previewIndividualLink').style.display = 'inline-block';
        }

        // Group URL (Discord only)
        if (this.mode === 'discord') {
            const groupUrl = `${baseUrl}viewer-group.html`;
            document.getElementById('groupUrl').value = groupUrl + ' (Join a voice channel first)';
        }
    }

    copyURL(type) {
        const input = type === 'individual'
            ? document.getElementById('individualUrl')
            : document.getElementById('groupUrl');

        input.select();
        document.execCommand('copy');
        this.showToast('URL copied to clipboard!', 'success');
    }

    // ========================================
    // Settings
    // ========================================

    setupSettings() {
        document.getElementById('showNames').addEventListener('change', (e) => {
            this.settings.showNames = e.target.checked;
        });

        document.getElementById('includeSelf').addEventListener('change', (e) => {
            this.settings.includeSelf = e.target.checked;
        });

        document.getElementById('dimInactive').addEventListener('change', (e) => {
            this.settings.dimInactive = e.target.checked;
        });

        document.getElementById('animationStyle').addEventListener('change', (e) => {
            this.settings.animation = e.target.value;
        });

        document.getElementById('spacing').addEventListener('input', (e) => {
            this.settings.spacing = parseInt(e.target.value);
            document.getElementById('spacingValue').textContent = e.target.value + 'px';
        });

        document.getElementById('sensitivity').addEventListener('input', (e) => {
            this.settings.sensitivity = parseInt(e.target.value);
            document.getElementById('sensitivityValue').textContent = e.target.value;
        });

        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });
    }

    loadSettings() {
        const saved = localStorage.getItem('echosprite_settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };

            // Apply to UI
            document.getElementById('showNames').checked = this.settings.showNames;
            document.getElementById('includeSelf').checked = this.settings.includeSelf;
            document.getElementById('dimInactive').checked = this.settings.dimInactive;
            document.getElementById('animationStyle').value = this.settings.animation;
            document.getElementById('spacing').value = this.settings.spacing;
            document.getElementById('spacingValue').textContent = this.settings.spacing + 'px';
            document.getElementById('sensitivity').value = this.settings.sensitivity;
            document.getElementById('sensitivityValue').textContent = this.settings.sensitivity;
        }
    }

    async saveSettings() {
        localStorage.setItem('echosprite_settings', JSON.stringify(this.settings));

        if (this.mode === 'discord') {
            await this.uploadToBackend();
        }

        this.showToast('Settings saved!', 'success');
    }

    // ========================================
    // UI Helpers
    // ========================================

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast show ' + type;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new EchoSpriteDiscordApp();
});
