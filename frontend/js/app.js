// ========================================
// EchoSprite App Logic
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

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;

            if (type === 'idle') {
                this.idleImage = imageData;
                localStorage.setItem('echosprite_idle', imageData);
                this.updatePreview('idlePreview', imageData);
            } else {
                this.talkingImage = imageData;
                localStorage.setItem('echosprite_talking', imageData);
                this.updatePreview('talkingPreview', imageData);
            }

            this.updateAvatarPreview();
            this.updateOBSUrl();
        };
        reader.readAsDataURL(file);
    }

    updatePreview(elementId, imageData) {
        const preview = document.getElementById(elementId);
        preview.innerHTML = `<img src="${imageData}" alt="Avatar">`;
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
            preview.innerHTML = `<img src="${currentImage}" alt="Avatar Preview">`;
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

            // Start monitoring
            this.monitorMic(dataArray);

        } catch (error) {
            console.error('Microphone access denied:', error);
            alert('Could not access microphone. Please check your browser permissions.');
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
        const viewerUrl = `${baseUrl}viewer.html?mode=live`;

        const urlInput = document.getElementById('obsUrl');
        const previewLink = document.getElementById('previewLink');

        if (this.idleImage || this.talkingImage) {
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

        const btn = document.getElementById('copyUrl');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new EchoSpriteApp();
});
