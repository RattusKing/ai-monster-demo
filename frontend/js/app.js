// ========================================
// EchoSprite App Logic - Enhanced Professional Version
// ========================================

class EchoSpriteApp {
    constructor() {
        this.idleImage = null;
        this.talkingImage = null;
        this.isTalking = false;
        this.micStream = null;
        this.audioContext = null;
        this.analyser = null;
        this.sensitivity = 30;
        this.animationFrame = null;
        this.api = new EchoSpriteAPI();
        this.cloudId = null;

        this.init();
    }

    init() {
        // Load saved images from localStorage
        this.loadSavedImages();

        // Setup event listeners
        this.setupUploadListeners();
        this.setupMicControls();
        this.setupSensitivity();
        this.setupOBSUrl();
        this.setupCloudSave();

        // Check for URL parameters (loading from cloud)
        this.checkURLParams();
    }

    // ========================================
    // URL Parameter Handling
    // ========================================

    async checkURLParams() {
        const params = new URLSearchParams(window.location.search);
        const loadId = params.get('load');

        if (loadId) {
            await this.loadFromCloud(loadId);
        }
    }

    // ========================================
    // Upload Handlers
    // ========================================

    setupUploadListeners() {
        const idleUpload = document.getElementById('idleUpload');
        const talkingUpload = document.getElementById('talkingUpload');

        idleUpload.addEventListener('change', (e) => this.handleImageUpload(e, 'idle'));
        talkingUpload.addEventListener('change', (e) => this.handleImageUpload(e, 'talking'));
    }

    handleImageUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showToast('Please upload an image file', 'error');
            return;
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showToast('Image must be smaller than 10MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;

            if (type === 'idle') {
                this.idleImage = imageData;
                localStorage.setItem('echosprite_idle', imageData);
                this.updatePreview('idlePreview', imageData);
                this.showToast('Idle image uploaded!', 'success');
            } else {
                this.talkingImage = imageData;
                localStorage.setItem('echosprite_talking', imageData);
                this.updatePreview('talkingPreview', imageData);
                this.showToast('Talking image uploaded!', 'success');
            }

            this.updateAvatarPreview();
            this.updateOBSUrl();
        };
        reader.readAsDataURL(file);
    }

    updatePreview(elementId, imageData) {
        const preview = document.getElementById(elementId);
        preview.innerHTML = `<img src="${imageData}" alt="Avatar" class="fade-in">`;
    }

    loadSavedImages() {
        this.idleImage = localStorage.getItem('echosprite_idle');
        this.talkingImage = localStorage.getItem('echosprite_talking');

        if (this.idleImage) {
            this.updatePreview('idlePreview', this.idleImage);
        }
        if (this.talkingImage) {
            this.updatePreview('talkingPreview', this.talkingImage);
        }

        this.updateAvatarPreview();
    }

    updateAvatarPreview() {
        const preview = document.getElementById('avatarPreview');

        if (!this.idleImage && !this.talkingImage) {
            preview.innerHTML = '<p class="placeholder-text">Your avatar will appear here</p>';
            return;
        }

        const currentImage = this.isTalking ? (this.talkingImage || this.idleImage) : this.idleImage;
        if (currentImage) {
            preview.innerHTML = `<img src="${currentImage}" alt="Avatar Preview" class="fade-in">`;
        }
    }

    // ========================================
    // Mic Controls
    // ========================================

    setupMicControls() {
        const startBtn = document.getElementById('startMicTest');
        const stopBtn = document.getElementById('stopMicTest');

        startBtn.addEventListener('click', () => this.startMicTest());
        stopBtn.addEventListener('click', () => this.stopMicTest());
    }

    async startMicTest() {
        try {
            // Request microphone access
            this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Setup Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            const source = this.audioContext.createMediaStreamSource(this.micStream);
            source.connect(this.analyser);

            this.analyser.fftSize = 256;
            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            // Update UI
            document.getElementById('startMicTest').style.display = 'none';
            document.getElementById('stopMicTest').style.display = 'inline-block';
            document.getElementById('statusText').textContent = 'Listening...';
            document.getElementById('statusText').classList.add('listening');

            this.showToast('Microphone activated!', 'success');

            // Start monitoring
            this.monitorMic(dataArray);

        } catch (error) {
            console.error('Microphone access denied:', error);
            this.showToast('Could not access microphone. Please check permissions.', 'error');
        }
    }

    monitorMic(dataArray) {
        const check = () => {
            if (!this.analyser) return;

            this.analyser.getByteFrequencyData(dataArray);

            // Calculate average volume
            const sum = dataArray.reduce((a, b) => a + b, 0);
            const average = sum / dataArray.length;
            const volume = Math.round((average / 255) * 100);

            // Update level bar
            document.getElementById('micLevel').style.width = volume + '%';

            // Check if talking
            const threshold = this.sensitivity;
            if (volume > threshold) {
                if (!this.isTalking) {
                    this.isTalking = true;
                    this.updateAvatarPreview();
                    document.getElementById('statusText').textContent = 'Talking!';
                    document.getElementById('statusText').classList.remove('listening');
                    document.getElementById('statusText').classList.add('talking');
                }
            } else {
                if (this.isTalking) {
                    this.isTalking = false;
                    this.updateAvatarPreview();
                    document.getElementById('statusText').textContent = 'Listening...';
                    document.getElementById('statusText').classList.add('listening');
                    document.getElementById('statusText').classList.remove('talking');
                }
            }

            this.animationFrame = requestAnimationFrame(check);
        };

        check();
    }

    stopMicTest() {
        // Stop mic stream
        if (this.micStream) {
            this.micStream.getTracks().forEach(track => track.stop());
            this.micStream = null;
        }

        // Stop audio context
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        // Cancel animation
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        // Reset UI
        document.getElementById('startMicTest').style.display = 'inline-block';
        document.getElementById('stopMicTest').style.display = 'none';
        document.getElementById('statusText').textContent = 'Not listening';
        document.getElementById('statusText').classList.remove('listening', 'talking');
        document.getElementById('micLevel').style.width = '0%';
        this.isTalking = false;
        this.updateAvatarPreview();

        this.showToast('Microphone deactivated', 'success');
    }

    // ========================================
    // Sensitivity Control
    // ========================================

    setupSensitivity() {
        const slider = document.getElementById('sensitivity');
        const valueDisplay = document.getElementById('sensitivityValue');

        // Load saved sensitivity
        const saved = localStorage.getItem('echosprite_sensitivity');
        if (saved) {
            this.sensitivity = parseInt(saved);
            slider.value = this.sensitivity;
            valueDisplay.textContent = this.sensitivity;
        }

        slider.addEventListener('input', (e) => {
            this.sensitivity = parseInt(e.target.value);
            valueDisplay.textContent = this.sensitivity;
            localStorage.setItem('echosprite_sensitivity', this.sensitivity);
        });
    }

    // ========================================
    // OBS URL Generation
    // ========================================

    setupOBSUrl() {
        const copyBtn = document.getElementById('copyUrl');
        copyBtn.addEventListener('click', () => this.copyOBSUrl());
        this.updateOBSUrl();
    }

    updateOBSUrl() {
        const baseUrl = window.location.origin + window.location.pathname.replace('app.html', '');
        let viewerUrl = `${baseUrl}viewer.html?mode=live`;

        // If we have a cloud ID, use that instead of localStorage
        if (this.cloudId) {
            viewerUrl = `${baseUrl}viewer.html?id=${this.cloudId}`;
        }

        const urlInput = document.getElementById('obsUrl');
        const previewLink = document.getElementById('previewLink');

        if (this.idleImage || this.talkingImage || this.cloudId) {
            urlInput.value = viewerUrl;
            previewLink.href = viewerUrl;
            previewLink.style.display = 'inline-block';
        } else {
            urlInput.value = 'Upload images first to generate URL';
            previewLink.style.display = 'none';
        }
    }

    copyOBSUrl() {
        const urlInput = document.getElementById('obsUrl');
        urlInput.select();
        document.execCommand('copy');

        this.showToast('OBS URL copied to clipboard!', 'success');
    }

    // ========================================
    // Cloud Save & Load
    // ========================================

    setupCloudSave() {
        const saveBtn = document.getElementById('saveToCloud');
        const copyShareBtn = document.getElementById('copyShareUrl');

        saveBtn.addEventListener('click', () => this.saveToCloud());
        copyShareBtn.addEventListener('click', () => this.copyShareUrl());
    }

    async saveToCloud() {
        if (!this.idleImage && !this.talkingImage) {
            this.showToast('Please upload at least one image first', 'error');
            return;
        }

        this.showLoading('Saving to cloud...');

        try {
            const config = {
                idleImage: this.idleImage,
                talkingImage: this.talkingImage,
                sensitivity: this.sensitivity
            };

            const response = await this.api.saveConfig(config);

            if (response.success) {
                this.cloudId = response.publicId;
                localStorage.setItem('echosprite_cloud_id', this.cloudId);

                // Update OBS URL to use cloud ID
                this.updateOBSUrl();

                // Show share URL
                const baseUrl = window.location.origin + window.location.pathname.replace('app.html', '');
                const shareUrl = `${baseUrl}viewer.html?id=${this.cloudId}`;

                document.getElementById('shareUrl').value = shareUrl;
                document.getElementById('cloudInfo').style.display = 'block';

                this.hideLoading();
                this.showToast('✅ Saved to cloud successfully!', 'success');
            }
        } catch (error) {
            this.hideLoading();
            this.showToast(`Failed to save: ${error.message}`, 'error');
            console.error('Save error:', error);
        }
    }

    async loadFromCloud(publicId) {
        this.showLoading('Loading from cloud...');

        try {
            const response = await this.api.getConfig(publicId);

            if (response.success && response.config) {
                const config = response.config;

                // Load images
                if (config.idleImage) {
                    this.idleImage = config.idleImage;
                    localStorage.setItem('echosprite_idle', config.idleImage);
                    this.updatePreview('idlePreview', config.idleImage);
                }

                if (config.talkingImage) {
                    this.talkingImage = config.talkingImage;
                    localStorage.setItem('echosprite_talking', config.talkingImage);
                    this.updatePreview('talkingPreview', config.talkingImage);
                }

                // Load sensitivity
                if (config.sensitivity) {
                    this.sensitivity = config.sensitivity;
                    localStorage.setItem('echosprite_sensitivity', config.sensitivity);
                    document.getElementById('sensitivity').value = config.sensitivity;
                    document.getElementById('sensitivityValue').textContent = config.sensitivity;
                }

                this.cloudId = publicId;
                localStorage.setItem('echosprite_cloud_id', publicId);

                this.updateAvatarPreview();
                this.updateOBSUrl();

                this.hideLoading();
                this.showToast('✅ Loaded from cloud successfully!', 'success');
            }
        } catch (error) {
            this.hideLoading();
            this.showToast(`Failed to load: ${error.message}`, 'error');
            console.error('Load error:', error);
        }
    }

    copyShareUrl() {
        const urlInput = document.getElementById('shareUrl');
        urlInput.select();
        document.execCommand('copy');

        this.showToast('Share URL copied to clipboard!', 'success');
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

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const textEl = overlay.querySelector('p');
        if (textEl) textEl.textContent = message;
        overlay.style.display = 'flex';
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = 'none';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new EchoSpriteApp();
});
