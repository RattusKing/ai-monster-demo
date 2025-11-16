// ========================================
// EchoSprite Viewer (OBS Browser Source) - Enhanced
// ========================================

class EchoSpriteViewer {
    constructor() {
        this.idleImage = null;
        this.talkingImage = null;
        this.isTalking = false;
        this.micStream = null;
        this.audioContext = null;
        this.analyser = null;
        this.sensitivity = 30;
        this.animationFrame = null;
        this.avatarElement = document.getElementById('avatar');
        this.api = new EchoSpriteAPI();

        // Blink animation settings
        this.blinkEnabled = true;
        this.lastBlinkTime = Date.now();
        this.blinkInterval = 5000; // Blink every 5 seconds (randomized)

        // Bounce animation settings
        this.bounceEnabled = false;

        this.init();
    }

    async init() {
        // Check URL parameters
        const params = new URLSearchParams(window.location.search);
        const cloudId = params.get('id');
        const mode = params.get('mode');
        const testMode = params.get('test') === 'true';

        // Show test controls if in test mode
        if (testMode) {
            document.getElementById('testControls').style.display = 'block';
            this.setupTestControls();
        }

        // Load from cloud if ID is provided, otherwise use localStorage
        if (cloudId) {
            await this.loadFromCloud(cloudId);
        } else {
            this.loadLocalImages();
        }

        // Auto-start mic if in live mode
        if (mode === 'live' || cloudId) {
            setTimeout(() => this.startMicDetection(), 500);
        }

        // Start blink animation
        if (this.blinkEnabled) {
            this.startBlinkAnimation();
        }
    }

    // ========================================
    // Load Images
    // ========================================

    async loadFromCloud(publicId) {
        try {
            console.log('Loading avatar from cloud:', publicId);
            const response = await this.api.getConfig(publicId);

            if (response.success && response.config) {
                const config = response.config;

                this.idleImage = config.idleImage;
                this.talkingImage = config.talkingImage;
                this.sensitivity = config.sensitivity || 30;

                // Display idle image
                if (this.idleImage) {
                    this.avatarElement.src = this.idleImage;
                    console.log('✅ Avatar loaded from cloud');
                }
            }
        } catch (error) {
            console.error('Failed to load avatar from cloud:', error);
            // Fallback to localStorage
            this.loadLocalImages();
        }
    }

    loadLocalImages() {
        this.idleImage = localStorage.getItem('echosprite_idle');
        this.talkingImage = localStorage.getItem('echosprite_talking');
        this.sensitivity = parseInt(localStorage.getItem('echosprite_sensitivity') || '30');

        // Display idle image by default
        if (this.idleImage) {
            this.avatarElement.src = this.idleImage;
            console.log('✅ Avatar loaded from localStorage');
        } else {
            this.avatarElement.alt = 'No avatar uploaded';
            console.log('⚠️ No avatar found');
        }
    }

    updateAvatar() {
        const currentImage = this.isTalking ? (this.talkingImage || this.idleImage) : this.idleImage;
        if (currentImage && this.avatarElement.src !== currentImage) {
            this.avatarElement.src = currentImage;
        }
    }

    // ========================================
    // Microphone Detection
    // ========================================

    async startMicDetection() {
        try {
            this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            const source = this.audioContext.createMediaStreamSource(this.micStream);
            source.connect(this.analyser);

            this.analyser.fftSize = 256;
            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            console.log('🎤 Microphone activated');
            this.monitorMic(dataArray);
        } catch (error) {
            console.error('Microphone access denied:', error);
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

            // Check if talking
            const threshold = this.sensitivity;
            const wasTalking = this.isTalking;

            if (volume > threshold) {
                this.isTalking = true;
            } else {
                this.isTalking = false;
            }

            // Only update avatar if state changed
            if (wasTalking !== this.isTalking) {
                this.updateAvatar();
            }

            this.animationFrame = requestAnimationFrame(check);
        };

        check();
    }

    // ========================================
    // Blink Animation
    // ========================================

    startBlinkAnimation() {
        const blink = () => {
            const now = Date.now();
            const timeSinceLastBlink = now - this.lastBlinkTime;

            // Randomize blink interval (3-7 seconds)
            const randomInterval = 3000 + Math.random() * 4000;

            if (timeSinceLastBlink > randomInterval && !this.isTalking) {
                this.doBlink();
                this.lastBlinkTime = now;
            }

            if (this.blinkEnabled) {
                requestAnimationFrame(blink);
            }
        };

        blink();
    }

    doBlink() {
        // Quick opacity animation to simulate blink
        const originalOpacity = this.avatarElement.style.opacity || '1';

        this.avatarElement.style.opacity = '0.3';
        setTimeout(() => {
            this.avatarElement.style.opacity = originalOpacity;
        }, 100);
    }

    // ========================================
    // Test Controls
    // ========================================

    setupTestControls() {
        const toggleBtn = document.getElementById('toggleState');
        const micBtn = document.getElementById('startMic');
        const stateDisplay = document.getElementById('currentState');

        toggleBtn.addEventListener('click', () => {
            this.isTalking = !this.isTalking;
            this.updateAvatar();
            stateDisplay.textContent = this.isTalking ? 'talking' : 'idle';
        });

        micBtn.addEventListener('click', () => {
            this.startMicDetection();
            micBtn.textContent = 'Mic Active';
            micBtn.disabled = true;
        });
    }
}

// Initialize viewer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new EchoSpriteViewer();
});
