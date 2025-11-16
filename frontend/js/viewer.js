// ========================================
// EchoSprite Viewer (OBS Browser Source)
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

        this.init();
    }

    init() {
        // Check URL parameters
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode');
        const testMode = params.get('test') === 'true';

        // Show test controls if in test mode
        if (testMode) {
            document.getElementById('testControls').style.display = 'block';
            this.setupTestControls();
        }

        // Load images from localStorage
        this.loadImages();

        // Auto-start mic if in live mode
        if (mode === 'live') {
            this.startMicDetection();
        }
    }

    loadImages() {
        this.idleImage = localStorage.getItem('echosprite_idle');
        this.talkingImage = localStorage.getItem('echosprite_talking');
        this.sensitivity = parseInt(localStorage.getItem('echosprite_sensitivity') || '30');

        // Display idle image by default
        if (this.idleImage) {
            this.avatarElement.src = this.idleImage;
        } else {
            // Fallback placeholder
            this.avatarElement.alt = 'No avatar uploaded';
        }
    }

    updateAvatar() {
        const currentImage = this.isTalking ? (this.talkingImage || this.idleImage) : this.idleImage;
        if (currentImage) {
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
            if (volume > threshold) {
                if (!this.isTalking) {
                    this.isTalking = true;
                    this.updateAvatar();
                }
            } else {
                if (this.isTalking) {
                    this.isTalking = false;
                    this.updateAvatar();
                }
            }

            this.animationFrame = requestAnimationFrame(check);
        };

        check();
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
