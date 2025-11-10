// Configuration for InfinityQR URL
// This file handles API keys and application settings

// API Configuration
const config = {
    // URL Shortener API
    urlShortener: {
        apiKey: window.ENV?.URL_SHORTENER_API_KEY || 'a74ebde57f5143ad8a2db22b04d8ef64',
        baseUrl: 'https://api.rebrandly.com/v1', // Using Rebrandly API
        timeout: 10000
    },

    // QR Code Generator API
    qrCode: {
        apiKey: window.ENV?.QR_CODE_API_KEY || '02cd960d08ce334bde110a243c164108',
        baseUrl: 'https://qrcode.co.uk/api',
        timeout: 10000
    },

    // Application Settings
    app: {
        name: 'InfinityQR URL',
        version: '1.0.0',
        domain: 'infinityqrurl.com',
        maxHistoryItems: 10,
        debounceDelay: 500
    },

    // Local Storage Keys
    storage: {
        urlHistory: 'infinityqr_url_history',
        qrHistory: 'infinityqr_qr_history',
        userPreferences: 'infinityqr_user_prefs',
        authToken: 'infinityqr_auth_token'
    },

    // UI Settings
    ui: {
        animationDuration: 300,
        notificationDuration: 5000,
        maxRetries: 3,
        retryDelay: 1000
    },

    // Feature Flags
    features: {
        analytics: false, // Disabled until backend is implemented
        customDomains: false,
        bulkOperations: false,
        passwordProtection: false
    }
};

// Environment Detection
const environment = {
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isProduction: window.location.hostname.includes('infinityqrurl.com') ||
                  window.location.hostname.includes('github.io') ||
                  window.location.hostname.includes('netlify.app'),
    isStaging: window.location.hostname.includes('staging') || window.location.hostname.includes('dev'),
    isGitHubPages: window.location.hostname.includes('github.io'),
    isNetlify: window.location.hostname.includes('netlify.app')
};

// API Configuration based on environment
const getApiConfig = () => {
    if (environment.isDevelopment) {
        return {
            ...config,
            // Use actual API keys in development
            urlShortener: {
                ...config.urlShortener,
                apiKey: config.urlShortener.apiKey
            },
            qrCode: {
                ...config.qrCode,
                apiKey: config.qrCode.apiKey
            }
        };
    } else if (environment.isProduction) {
        // In production, API keys should come from environment variables
        // Netlify supports environment variables, GitHub Pages uses different approach
        const netlifyConfig = environment.isNetlify ? {
            urlShortener: {
                ...config.urlShortener,
                apiKey: window.ENV?.URL_SHORTENER_API_KEY || config.urlShortener.apiKey
            },
            qrCode: {
                ...config.qrCode,
                apiKey: window.ENV?.QR_CODE_API_KEY || config.qrCode.apiKey
            }
        } : {
            // GitHub Pages - use client-side config (for demo purposes)
            urlShortener: {
                ...config.urlShortener,
                apiKey: config.urlShortener.apiKey
            },
            qrCode: {
                ...config.qrCode,
                apiKey: config.qrCode.apiKey
            }
        };

        return {
            ...config,
            ...netlifyConfig
        };
    }
    return config;
};

// Error Messages
const errorMessages = {
    network: 'Network error. Please check your internet connection.',
    timeout: 'Request timed out. Please try again.',
    invalidUrl: 'Please enter a valid URL.',
    apiError: 'API error occurred. Please try again later.',
    rateLimit: 'Rate limit exceeded. Please wait before trying again.',
    invalidResponse: 'Invalid response from server.',
    unauthorized: 'API key is invalid or missing.',
    customAliasTaken: 'This custom alias is already taken. Please choose another.',
    customAliasInvalid: 'Custom alias must contain only letters, numbers, and hyphens.',
    qrGenerationFailed: 'Failed to generate QR code. Please try again.',
    storageError: 'Failed to save data to local storage.',
    copyFailed: 'Failed to copy to clipboard. Please copy manually.'
};

// Success Messages
const successMessages = {
    urlShortened: 'URL shortened successfully!',
    qrGenerated: 'QR code generated successfully!',
    copiedToClipboard: 'Copied to clipboard!',
    dataSaved: 'Data saved successfully!',
    loginSuccess: 'Login successful!',
    signupSuccess: 'Account created successfully!',
    logoutSuccess: 'Logged out successfully!'
};

// URL Validation Patterns
const patterns = {
    url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    customAlias: /^[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9]$/, // No consecutive hyphens, no leading/trailing hyphens
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Default Settings
const defaultSettings = {
    theme: 'dark',
    language: 'en',
    notifications: true,
    autoCopy: false,
    qrSize: '300',
    qrFormat: 'png',
    showHistory: true
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        config,
        environment,
        getApiConfig,
        errorMessages,
        successMessages,
        patterns,
        defaultSettings
    };
} else {
    window.AppConfig = {
        config,
        environment,
        getApiConfig,
        errorMessages,
        successMessages,
        patterns,
        defaultSettings
    };
}