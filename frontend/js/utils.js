// ========================================
// Utility Functions for EchoSprite Frontend
// Loading states, error handling, notifications
// ========================================

class LoadingManager {
    constructor() {
        this.activeLoaders = new Set();
        this.createOverlay();
    }

    createOverlay() {
        // Create loading overlay if it doesn't exist
        if (!document.getElementById('loading-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'loading-overlay hidden';
            overlay.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p class="loading-text">Loading...</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
    }

    show(message = 'Loading...') {
        const overlay = document.getElementById('loading-overlay');
        const text = overlay.querySelector('.loading-text');
        if (text) text.textContent = message;
        overlay.classList.remove('hidden');
    }

    hide() {
        const overlay = document.getElementById('loading-overlay');
        overlay.classList.add('hidden');
    }

    async wrap(promise, message = 'Loading...') {
        this.show(message);
        try {
            const result = await promise;
            return result;
        } finally {
            this.hide();
        }
    }
}

class NotificationManager {
    constructor() {
        this.createContainer();
    }

    createContainer() {
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
    }

    show(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const icon = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        }[type] || 'ℹ';

        notification.innerHTML = `
            <span class="notification-icon">${icon}</span>
            <span class="notification-message">${this.escapeHtml(message)}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(notification);

        // Fade in
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }

        return notification;
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Error handler
class ErrorHandler {
    static handle(error, context = '') {
        console.error(`Error${context ? ` in ${context}` : ''}:`, error);

        let message = 'An unexpected error occurred';

        if (error.response) {
            // HTTP error
            message = error.response.data?.message || error.response.data?.error || `Server error (${error.response.status})`;
        } else if (error.request) {
            // Network error
            message = 'Network error. Please check your connection.';
        } else if (error.message) {
            message = error.message;
        }

        window.notify.error(message);
        return message;
    }

    static async wrapAsync(fn, context = '') {
        try {
            return await fn();
        } catch (error) {
            this.handle(error, context);
            throw error;
        }
    }
}

// Image validation
class ImageValidator {
    static MAX_SIZE = 10 * 1024 * 1024; // 10MB
    static ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

    static validate(file) {
        const errors = [];

        // Check file exists
        if (!file) {
            errors.push('No file selected');
            return { valid: false, errors };
        }

        // Check file type
        if (!this.ALLOWED_TYPES.includes(file.type)) {
            errors.push(`Invalid file type. Allowed: ${this.ALLOWED_TYPES.join(', ')}`);
        }

        // Check file size
        if (file.size > this.MAX_SIZE) {
            errors.push(`File too large. Maximum size: ${this.MAX_SIZE / 1024 / 1024}MB`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    static async toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// Retry logic for failed requests
class RetryManager {
    static async retry(fn, maxAttempts = 3, delay = 1000) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (error) {
                if (attempt === maxAttempts) {
                    throw error;
                }

                console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            }
        }
    }
}

// URL parameter helpers
class URLHelper {
    static getParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    static setParam(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    }

    static removeParam(name) {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.pushState({}, '', url);
    }

    static getAllParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }
}

// Storage helpers with error handling
class StorageHelper {
    static get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error('localStorage get error:', error);
            return defaultValue;
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('localStorage set error:', error);
            return false;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('localStorage remove error:', error);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('localStorage clear error:', error);
            return false;
        }
    }
}

// Initialize global utilities
window.loading = new LoadingManager();
window.notify = new NotificationManager();
window.ErrorHandler = ErrorHandler;
window.ImageValidator = ImageValidator;
window.RetryManager = RetryManager;
window.URLHelper = URLHelper;
window.StorageHelper = StorageHelper;

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Don't show notification for every error, just log it
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Don't show notification for every error, just log it
});

console.log('✅ EchoSprite utilities loaded');
