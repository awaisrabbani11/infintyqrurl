// Utility Functions for InfinityQR URL
// Common helper functions used across the application

// Global AppConfig reference
const AppConfig = window.AppConfig || {};

/**
 * URL Validation
 */
const urlUtils = {
    /**
     * Validates if a string is a valid URL
     * @param {string} url - URL to validate
     * @returns {boolean} - True if valid URL
     */
    isValid: (url) => {
        if (!url || typeof url !== 'string') return false;
        return AppConfig.patterns?.url.test(url) || false;
    },

    /**
     * Normalizes URL by ensuring it has a protocol
     * @param {string} url - URL to normalize
     * @returns {string} - Normalized URL
     */
    normalize: (url) => {
        if (!url) return '';

        // Remove whitespace
        url = url.trim();

        // Add protocol if missing
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }

        return url;
    },

    /**
     * Extracts domain from URL
     * @param {string} url - URL to extract domain from
     * @returns {string} - Domain name
     */
    getDomain: (url) => {
        try {
            const urlObj = new URL(urlUtils.normalize(url));
            return urlObj.hostname;
        } catch (error) {
            return '';
        }
    }
};

/**
 * Custom Alias Validation
 */
const aliasUtils = {
    /**
     * Validates if a custom alias is valid
     * @param {string} alias - Custom alias to validate
     * @returns {boolean} - True if valid
     */
    isValid: (alias) => {
        if (!alias || typeof alias !== 'string') return true; // Optional field
        return AppConfig.patterns?.customAlias.test(alias) || false;
    },

    /**
     * Cleans up a custom alias
     * @param {string} alias - Alias to clean
     * @returns {string} - Cleaned alias
     */
    clean: (alias) => {
        if (!alias) return '';

        return alias
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9-]/g, '') // Only alphanumeric and hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    },

    /**
     * Generates suggestions for custom aliases
     * @param {string} url - Original URL
     * @param {Array} existingAliases - Array of existing aliases to avoid
     * @returns {Array} - Array of suggested aliases
     */
    generateSuggestions: (url, existingAliases = []) => {
        const suggestions = [];
        const domain = urlUtils.getDomain(url);

        if (domain) {
            const domainName = domain.replace('www.', '').split('.')[0];
            suggestions.push(domainName);
            suggestions.push(`${domainName}-link`);
            suggestions.push(`${domainName}-url`);
        }

        // Add random suggestions
        const adjectives = ['quick', 'fast', 'easy', 'smart', 'best', 'top', 'pro'];
        const nouns = ['link', 'url', 'site', 'page', 'web', 'app'];

        for (let i = 0; i < 3; i++) {
            const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
            const noun = nouns[Math.floor(Math.random() * nouns.length)];
            const random = Math.floor(Math.random() * 999);
            suggestions.push(`${adj}-${noun}-${random}`);
        }

        // Filter out existing aliases and limit to 5 suggestions
        return suggestions
            .filter(alias => !existingAliases.includes(alias))
            .slice(0, 5);
    }
};

/**
 * Storage Utilities
 */
const storageUtils = {
    /**
     * Safely get item from localStorage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} - Stored value or default
     */
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Error reading from localStorage:', error);
            return defaultValue;
        }
    },

    /**
     * Safely set item in localStorage
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @returns {boolean} - True if successful
     */
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('Error writing to localStorage:', error);
            return false;
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} - True if successful
     */
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('Error removing from localStorage:', error);
            return false;
        }
    },

    /**
     * Clear all localStorage items
     * @returns {boolean} - True if successful
     */
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.warn('Error clearing localStorage:', error);
            return false;
        }
    }
};

/**
 * Date Utilities
 */
const dateUtils = {
    /**
     * Formats date in a user-friendly way
     * @param {Date|string|number} date - Date to format
     * @returns {string} - Formatted date string
     */
    format: (date) => {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid date';

        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    /**
     * Gets current timestamp in ISO format
     * @returns {string} - Current timestamp
     */
    now: () => new Date().toISOString(),

    /**
     * Generates a unique ID based on timestamp
     * @returns {string} - Unique ID
     */
    generateId: () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
};

/**
 * Clipboard Utilities
 */
const clipboardUtils = {
    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} - True if successful
     */
    copy: async (text) => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const result = document.execCommand('copy');
                textArea.remove();
                return result;
            }
        } catch (error) {
            console.warn('Error copying to clipboard:', error);
            return false;
        }
    },

    /**
     * Read text from clipboard
     * @returns {Promise<string>} - Clipboard content
     */
    read: async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                return await navigator.clipboard.readText();
            }
            return '';
        } catch (error) {
            console.warn('Error reading from clipboard:', error);
            return '';
        }
    }
};

/**
 * File Download Utilities
 */
const downloadUtils = {
    /**
     * Download file from URL
     * @param {string} url - File URL
     * @param {string} filename - Filename for download
     */
    downloadFromUrl: (url, filename) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    /**
     * Download blob as file
     * @param {Blob} blob - File blob
     * @param {string} filename - Filename for download
     */
    downloadBlob: (blob, filename) => {
        const url = URL.createObjectURL(blob);
        downloadUtils.downloadFromUrl(url, filename);
        URL.revokeObjectURL(url);
    },

    /**
     * Convert data URL to blob
     * @param {string} dataUrl - Data URL
     * @returns {Blob} - File blob
     */
    dataUrlToBlob: (dataUrl) => {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new Blob([u8arr], { type: mime });
    }
};

/**
 * Debounce utility
 */
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle utility
 */
const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Form Validation Utilities
 */
const validationUtils = {
    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {boolean} - True if valid
     */
    isValidEmail: (email) => {
        return AppConfig.patterns?.email.test(email) || false;
    },

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} - Validation result with score and feedback
     */
    validatePassword: (password) => {
        const result = {
            isValid: false,
            score: 0,
            feedback: []
        };

        if (!password) {
            result.feedback.push('Password is required');
            return result;
        }

        if (password.length < 8) {
            result.feedback.push('Password must be at least 8 characters');
        } else {
            result.score += 1;
        }

        if (!/[a-z]/.test(password)) {
            result.feedback.push('Include lowercase letters');
        } else {
            result.score += 1;
        }

        if (!/[A-Z]/.test(password)) {
            result.feedback.push('Include uppercase letters');
        } else {
            result.score += 1;
        }

        if (!/\d/.test(password)) {
            result.feedback.push('Include numbers');
        } else {
            result.score += 1;
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            result.feedback.push('Include special characters');
        } else {
            result.score += 1;
        }

        result.isValid = result.score >= 3 && password.length >= 8;
        return result;
    }
};

/**
 * Performance Utilities
 */
const performanceUtils = {
    /**
     * Measure function execution time
     * @param {Function} func - Function to measure
     * @param {string} label - Label for the measurement
     * @returns {any} - Function result
     */
    measure: (func, label) => {
        const start = performance.now();
        const result = func();
        const end = performance.now();
        console.log(`${label}: ${end - start}ms`);
        return result;
    },

    /**
     * Check if user is on slow connection
     * @returns {boolean} - True if on slow connection
     */
    isSlowConnection: () => {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        return connection && (
            connection.effectiveType === 'slow-2g' ||
            connection.effectiveType === '2g' ||
            connection.saveData === true
        );
    }
};

// Export utilities for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        urlUtils,
        aliasUtils,
        storageUtils,
        dateUtils,
        clipboardUtils,
        downloadUtils,
        debounce,
        throttle,
        validationUtils,
        performanceUtils
    };
} else {
    window.AppUtils = {
        urlUtils,
        aliasUtils,
        storageUtils,
        dateUtils,
        clipboardUtils,
        downloadUtils,
        debounce,
        throttle,
        validationUtils,
        performanceUtils
    };
}