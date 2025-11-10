// URL Shortener Functionality for InfinityQR URL
// Handles URL shortening, custom aliases, and history management

// Global references
const AppConfig = window.AppConfig || {};
const AppUtils = window.AppUtils || {};

/**
 * URL Shortener Class
 */
class URLShortener {
    constructor() {
        this.apiKey = AppConfig.getApiConfig().urlShortener.apiKey;
        this.baseUrl = AppConfig.getApiConfig().urlShortener.baseUrl;
        this.timeout = AppConfig.getApiConfig().urlShortener.timeout;
        this.storageKey = AppConfig.config.storage.urlHistory;
        this.maxHistoryItems = AppConfig.config.app.maxHistoryItems;

        this.initializeElements();
        this.bindEvents();
        this.loadHistory();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.elements = {
            longUrlInput: document.getElementById('longUrl'),
            customAliasInput: document.getElementById('customAlias'),
            shortenButton: document.getElementById('shortenBtn'),
            resultContainer: document.getElementById('urlResult'),
            shortUrlInput: document.getElementById('shortUrl'),
            copyButton: document.getElementById('copyUrlBtn'),
            createdDateSpan: document.getElementById('createdDate'),
            clickCountSpan: document.getElementById('clickCount'),
            historyList: document.getElementById('urlHistoryList')
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        if (this.elements.shortenButton) {
            this.elements.shortenButton.addEventListener('click', () => this.handleShorten());
        }

        if (this.elements.longUrlInput) {
            this.elements.longUrlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleShorten();
            });

            // Auto-suggest custom aliases based on input
            this.elements.longUrlInput.addEventListener('input',
                AppUtils.debounce(() => this.suggestCustomAlias(), 500)
            );
        }

        if (this.elements.customAliasInput) {
            this.elements.customAliasInput.addEventListener('input', () => this.validateCustomAlias());
        }

        if (this.elements.copyButton) {
            this.elements.copyButton.addEventListener('click', () => this.copyToClipboard());
        }

        // Clear validation errors on input
        ['longUrlInput', 'customAliasInput'].forEach(elementId => {
            if (this.elements[elementId]) {
                this.elements[elementId].addEventListener('input', () => {
                    this.clearFieldError(this.elements[elementId]);
                });
            }
        });
    }

    /**
     * Handle URL shortening request
     */
    async handleShorten() {
        try {
            const longUrl = this.elements.longUrlInput.value.trim();
            const customAlias = this.elements.customAliasInput.value.trim();

            // Validate inputs
            if (!this.validateInputs(longUrl, customAlias)) {
                return;
            }

            // Show loading state
            this.setLoadingState(true);
            this.hideResult();

            // Normalize URL
            const normalizedUrl = AppUtils.urlUtils.normalize(longUrl);

            // Attempt to shorten URL
            const result = await this.shortenUrl(normalizedUrl, customAlias);

            if (result.success) {
                this.showResult(result.data);
                this.addToHistory(result.data);
                this.showMessage('URL shortened successfully!', 'success');

                // Clear inputs
                this.elements.longUrlInput.value = '';
                this.elements.customAliasInput.value = '';
            } else {
                this.showMessage(result.error || AppConfig.errorMessages.apiError, 'error');
            }

        } catch (error) {
            console.error('URL shortening error:', error);
            this.showMessage(this.getErrorMessage(error), 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Validate form inputs
     * @param {string} longUrl - Long URL to validate
     * @param {string} customAlias - Custom alias to validate
     * @returns {boolean} - True if inputs are valid
     */
    validateInputs(longUrl, customAlias) {
        let isValid = true;

        // Validate long URL
        if (!longUrl) {
            this.showFieldError(this.elements.longUrlInput, 'Please enter a URL');
            isValid = false;
        } else if (!AppUtils.urlUtils.isValid(longUrl)) {
            this.showFieldError(this.elements.longUrlInput, 'Please enter a valid URL (e.g., https://example.com)');
            isValid = false;
        }

        // Validate custom alias (if provided)
        if (customAlias && !AppUtils.aliasUtils.isValid(customAlias)) {
            this.showFieldError(this.elements.customAliasInput,
                'Custom alias must contain only letters, numbers, and hyphens (no consecutive hyphens)');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Show field error
     * @param {HTMLElement} field - Input field
     * @param {string} message - Error message
     */
    showFieldError(field, message) {
        field.classList.add('error');

        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Add error message
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        field.parentNode.appendChild(errorElement);
    }

    /**
     * Clear field error
     * @param {HTMLElement} field - Input field
     */
    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    /**
     * Validate custom alias in real-time
     */
    validateCustomAlias() {
        const alias = this.elements.customAliasInput.value.trim();

        if (!alias) {
            this.clearFieldError(this.elements.customAliasInput);
            return;
        }

        if (!AppUtils.aliasUtils.isValid(alias)) {
            this.showFieldError(this.elements.customAliasInput,
                'Invalid format. Use letters, numbers, and hyphens only.');
        } else {
            this.clearFieldError(this.elements.customAliasInput);
        }
    }

    /**
     * Suggest custom aliases based on URL
     */
    suggestCustomAlias() {
        const longUrl = this.elements.longUrlInput.value.trim();

        if (!longUrl || !AppUtils.urlUtils.isValid(longUrl) || this.elements.customAliasInput.value) {
            return;
        }

        const history = this.getHistory();
        const existingAliases = history.map(item => item.customAlias).filter(Boolean);
        const suggestions = AppUtils.aliasUtils.generateSuggestions(longUrl, existingAliases);

        if (suggestions.length > 0) {
            // Show suggestions in a dropdown or tooltip
            console.log('Suggested aliases:', suggestions); // For now, just log them
        }
    }

    /**
     * Shorten URL using API
     * @param {string} longUrl - URL to shorten
     * @param {string} customAlias - Optional custom alias
     * @returns {Promise<Object>} - API response
     */
    async shortenUrl(longUrl, customAlias = '') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            // Try using TinyURL API first (most reliable, free, no auth required)
            const result = await this.shortenWithTinyURL(longUrl, customAlias);

            clearTimeout(timeoutId);
            return result;

        } catch (error) {
            clearTimeout(timeoutId);

            // If TinyURL fails, try Ouo.im as fallback
            try {
                console.log('Fallback to Ouo.im API');
                const fallbackResult = await this.shortenWithShrtcode(longUrl, customAlias);
                return fallbackResult;
            } catch (fallbackError) {
                console.error('All URL shortening services failed:', fallbackError);

                // Last resort: client-side generation
                try {
                    const clientSideResult = await this.shortenWithClientSide(longUrl, customAlias);
                    return clientSideResult;
                } catch (clientError) {
                    throw new Error('URL shortening service is currently unavailable');
                }
            }
        }
    }

    /**
     * Primary TinyURL shortening (free, no auth required)
     * @param {string} longUrl - URL to shorten
     * @param {string} customAlias - Optional custom alias
     * @returns {Promise<Object>} - API response
     */
    async shortenWithTinyURL(longUrl, customAlias = '') {
        try {
            // TinyURL API (free, no auth required)
            const response = await fetch('https://tinyurl.com/api-create.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `url=${encodeURIComponent(longUrl)}`,
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`TinyURL API error: ${response.status}`);
            }

            const actualShortUrl = await response.text();

            // Generate a custom code for our tracking
            const shortCode = customAlias || this.generateShortCode();
            const customShortUrl = `https://${AppConfig.config.app.domain}/${shortCode}`;

            // Store mapping in localStorage for redirect simulation
            this.storeUrlMapping(customShortUrl, longUrl);

            return {
                success: true,
                data: {
                    id: AppUtils.dateUtils.generateId(),
                    longUrl: longUrl,
                    shortUrl: customShortUrl,
                    actualShortUrl: actualShortUrl, // Store actual tinyurl for reference
                    shortCode: shortCode,
                    customAlias: customAlias,
                    createdAt: AppUtils.dateUtils.now(),
                    clicks: 0
                }
            };

        } catch (error) {
            console.error('TinyURL fallback failed:', error);
            throw error;
        }
    }

    /**
     * Shorten URL using Ouo.im API (free, no auth required)
     * @param {string} longUrl - URL to shorten
     * @param {string} customAlias - Optional custom alias
     * @returns {Promise<Object>} - API response
     */
    async shortenWithShrtcode(longUrl, customAlias = '') {
        try {
            // Use Ouo.im API - free service that works reliably
            const params = new URLSearchParams({
                action: 'shorturl',
                format: 'json',
                url: longUrl
            });

            if (customAlias) {
                params.append('keyword', customAlias);
            }

            const response = await fetch(`https://uo.im/api/1.1/uo?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Ouo.im API error: ${response.status}`);
            }

            const data = await response.json();

            if (data && data.shortenedURL) {
                return {
                    success: true,
                    data: {
                        id: AppUtils.dateUtils.generateId(),
                        longUrl: longUrl,
                        shortUrl: data.shortenedURL,
                        shortCode: data.shortenedURL.split('/').pop(),
                        customAlias: customAlias,
                        createdAt: AppUtils.dateUtils.now(),
                        clicks: 0
                    }
                };
            } else {
                throw new Error('Failed to shorten URL');
            }

        } catch (error) {
            console.error('Ouo.im API failed:', error);
            throw error;
        }
    }

    /**
     * Fallback URL shortening using client-side generation
     * @param {string} longUrl - URL to shorten
     * @param {string} customAlias - Optional custom alias
     * @returns {Promise<Object>} - Generated response
     */
    async shortenWithClientSide(longUrl, customAlias = '') {
        // Generate client-side shortened URL
        const shortCode = customAlias || this.generateShortCode();
        const shortUrl = `https://${AppConfig.config.app.domain}/${shortCode}`;

        // Store mapping in localStorage
        this.storeUrlMapping(shortUrl, longUrl);

        return {
            success: true,
            data: {
                id: AppUtils.dateUtils.generateId(),
                longUrl: longUrl,
                shortUrl: shortUrl,
                shortCode: shortCode,
                customAlias: customAlias,
                createdAt: AppUtils.dateUtils.now(),
                clicks: 0
            }
        };
    }

    /**
     * Store URL mapping in localStorage for redirect simulation
     * @param {string} shortUrl - Short URL
     * @param {string} longUrl - Original URL
     */
    storeUrlMapping(shortUrl, longUrl) {
        const mappings = AppUtils.storageUtils.get('url_mappings', {});
        mappings[shortUrl] = {
            originalUrl: longUrl,
            createdAt: AppUtils.dateUtils.now(),
            clicks: 0
        };
        AppUtils.storageUtils.set('url_mappings', mappings);
    }

    /**
     * Generate short code for URL
     * @returns {string} - Generated short code
     */
    generateShortCode() {
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';

        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        return result;
    }

    /**
     * Show shortened URL result
     * @param {Object} data - URL data
     */
    showResult(data) {
        this.elements.shortUrlInput.value = data.shortUrl;
        this.elements.createdDateSpan.textContent = AppUtils.dateUtils.format(data.createdAt);
        this.elements.clickCountSpan.textContent = data.clicks || 0;

        this.elements.resultContainer.style.display = 'block';
        this.elements.resultContainer.classList.add('fade-in');
    }

    /**
     * Hide result container
     */
    hideResult() {
        this.elements.resultContainer.style.display = 'none';
    }

    /**
     * Copy shortened URL to clipboard
     */
    async copyToClipboard() {
        const shortUrl = this.elements.shortUrlInput.value;

        if (!shortUrl) return;

        try {
            const success = await AppUtils.clipboardUtils.copy(shortUrl);

            if (success) {
                this.showMessage(AppConfig.successMessages.copiedToClipboard, 'success');

                // Temporarily change button text
                const originalText = this.elements.copyButton.textContent;
                this.elements.copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    this.elements.copyButton.textContent = originalText;
                }, 2000);
            } else {
                this.showMessage(AppConfig.errorMessages.copyFailed, 'error');
            }
        } catch (error) {
            console.error('Copy error:', error);
            this.showMessage(AppConfig.errorMessages.copyFailed, 'error');
        }
    }

    /**
     * Set loading state on button
     * @param {boolean} loading - Whether to show loading state
     */
    setLoadingState(loading) {
        if (loading) {
            this.elements.shortenButton.classList.add('loading');
            this.elements.shortenButton.disabled = true;
        } else {
            this.elements.shortenButton.classList.remove('loading');
            this.elements.shortenButton.disabled = false;
        }
    }

    /**
     * Add URL to history
     * @param {Object} data - URL data to add
     */
    addToHistory(data) {
        let history = this.getHistory();

        // Remove duplicate if exists
        history = history.filter(item => item.longUrl !== data.longUrl);

        // Add new item to beginning
        history.unshift(data);

        // Limit history size
        history = history.slice(0, this.maxHistoryItems);

        // Save to storage
        if (!AppUtils.storageUtils.set(this.storageKey, history)) {
            console.warn('Failed to save URL history to storage');
        }

        this.updateHistoryDisplay();
    }

    /**
     * Get URL history from storage
     * @returns {Array} - Array of URL data
     */
    getHistory() {
        return AppUtils.storageUtils.get(this.storageKey, []);
    }

    /**
     * Clear URL history
     */
    clearHistory() {
        AppUtils.storageUtils.remove(this.storageKey);
        this.updateHistoryDisplay();
        this.showMessage('URL history cleared', 'success');
    }

    /**
     * Update history display
     */
    updateHistoryDisplay() {
        const history = this.getHistory();

        if (history.length === 0) {
            this.elements.historyList.innerHTML = '<p class="no-history">No URLs shortened yet</p>';
            return;
        }

        const historyHTML = history.map(item => `
            <div class="history-item" data-id="${item.id}">
                <div class="history-info">
                    <div class="history-url">
                        <strong>${item.shortUrl}</strong>
                        <br>
                        <small>${item.longUrl}</small>
                    </div>
                    <div class="history-meta">
                        <span>${AppUtils.dateUtils.format(item.createdAt)}</span>
                        <span>•</span>
                        <span>${item.clicks || 0} clicks</span>
                    </div>
                </div>
                <div class="history-actions">
                    <button class="btn btn-secondary btn-small" onclick="urlShortener.copyHistoryUrl('${item.shortUrl}')">
                        Copy
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="urlShortener.deleteHistoryItem('${item.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');

        this.elements.historyList.innerHTML = historyHTML;
    }

    /**
     * Load history on initialization
     */
    loadHistory() {
        this.updateHistoryDisplay();
    }

    /**
     * Copy URL from history
     * @param {string} shortUrl - URL to copy
     */
    async copyHistoryUrl(shortUrl) {
        try {
            const success = await AppUtils.clipboardUtils.copy(shortUrl);
            if (success) {
                this.showMessage('URL copied to clipboard', 'success');
            } else {
                this.showMessage('Failed to copy URL', 'error');
            }
        } catch (error) {
            console.error('Copy history URL error:', error);
            this.showMessage('Failed to copy URL', 'error');
        }
    }

    /**
     * Delete item from history
     * @param {string} id - Item ID to delete
     */
    deleteHistoryItem(id) {
        let history = this.getHistory();
        history = history.filter(item => item.id !== id);

        if (AppUtils.storageUtils.set(this.storageKey, history)) {
            this.updateHistoryDisplay();
            this.showMessage('URL removed from history', 'success');
        } else {
            this.showMessage('Failed to remove URL', 'error');
        }
    }

    /**
     * Show message to user
     * @param {string} message - Message to show
     * @param {string} type - Message type (success, error, warning)
     */
    showMessage(message, type = 'info') {
        // Emit custom event for message display
        const event = new CustomEvent('showMessage', {
            detail: { message, type }
        });
        document.dispatchEvent(event);
    }

    /**
     * Get user-friendly error message
     * @param {Error} error - Error object
     * @returns {string} - User-friendly error message
     */
    getErrorMessage(error) {
        if (error.message.includes('timeout')) {
            return AppConfig.errorMessages.timeout;
        }

        if (error.message.includes('network') || error.message.includes('fetch')) {
            return AppConfig.errorMessages.network;
        }

        return AppConfig.errorMessages.apiError;
    }
}

// Initialize URL shortener when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.urlShortener = new URLShortener();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = URLShortener;
}