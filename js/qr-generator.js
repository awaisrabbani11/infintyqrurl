// QR Code Generator Functionality for InfinityQR URL
// Handles QR code generation, customization, and history management

// Global references
const AppConfig = window.AppConfig || {};
const AppUtils = window.AppUtils || {};

/**
 * QR Code Generator Class
 */
class QRCodeGenerator {
    constructor() {
        this.apiKey = AppConfig.getApiConfig().qrCode.apiKey;
        this.baseUrl = AppConfig.getApiConfig().qrCode.baseUrl;
        this.timeout = AppConfig.getApiConfig().qrCode.timeout;
        this.storageKey = AppConfig.config.storage.qrHistory;
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
            qrUrlInput: document.getElementById('qrUrl'),
            qrSizeSelect: document.getElementById('qrSize'),
            qrFormatSelect: document.getElementById('qrFormat'),
            generateButton: document.getElementById('generateQrBtn'),
            resultContainer: document.getElementById('qrResult'),
            qrImage: document.getElementById('qrImage'),
            downloadButton: document.getElementById('downloadQrBtn'),
            copyButton: document.getElementById('copyQrBtn'),
            historyList: document.getElementById('qrHistoryList')
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        if (this.elements.generateButton) {
            this.elements.generateButton.addEventListener('click', () => this.handleGenerate());
        }

        if (this.elements.qrUrlInput) {
            this.elements.qrUrlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleGenerate();
            });

            // Auto-fill with shortened URL when available
            this.elements.qrUrlInput.addEventListener('focus', () => this.suggestUrl());
        }

        if (this.elements.downloadButton) {
            this.elements.downloadButton.addEventListener('click', () => this.downloadQR());
        }

        if (this.elements.copyButton) {
            this.elements.copyButton.addEventListener('click', () => this.copyQR());
        }

        if (this.elements.qrSizeSelect || this.elements.qrFormatSelect) {
            [this.elements.qrSizeSelect, this.elements.qrFormatSelect].forEach(element => {
                if (element) {
                    element.addEventListener('change', () => {
                        // Auto-regenerate if we have a current URL
                        if (this.currentUrl && this.elements.qrUrlInput.value.trim()) {
                            this.handleGenerate();
                        }
                    });
                }
            });

            // Clear validation errors on input
            if (this.elements.qrUrlInput) {
                this.elements.qrUrlInput.addEventListener('input', () => {
                    this.clearFieldError(this.elements.qrUrlInput);
                });
            }
        }
    }

    /**
     * Handle QR code generation request
     */
    async handleGenerate() {
        try {
            const url = this.elements.qrUrlInput.value.trim();

            // Validate input
            if (!this.validateInput(url)) {
                return;
            }

            // Show loading state
            this.setLoadingState(true);
            this.hideResult();

            // Normalize URL
            const normalizedUrl = AppUtils.urlUtils.normalize(url);

            // Get QR code options
            const options = this.getQROptions();

            // Generate QR code
            const result = await this.generateQRCode(normalizedUrl, options);

            if (result.success) {
                this.currentUrl = normalizedUrl;
                this.showResult(result.data);
                this.addToHistory(result.data);
                this.showMessage('QR code generated successfully!', 'success');
            } else {
                this.showMessage(result.error || AppConfig.errorMessages.qrGenerationFailed, 'error');
            }

        } catch (error) {
            console.error('QR generation error:', error);
            this.showMessage(this.getErrorMessage(error), 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    /**
     * Validate form input
     * @param {string} url - URL to validate
     * @returns {boolean} - True if input is valid
     */
    validateInput(url) {
        if (!url) {
            this.showFieldError(this.elements.qrUrlInput, 'Please enter a URL');
            return false;
        }

        if (!AppUtils.urlUtils.isValid(url)) {
            this.showFieldError(this.elements.qrUrlInput, 'Please enter a valid URL (e.g., https://example.com)');
            return false;
        }

        return true;
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
     * Suggest URL for QR code generation
     */
    suggestUrl() {
        // If QR URL input is empty and we have a shortened URL, suggest it
        if (!this.elements.qrUrlInput.value.trim() && window.urlShortener) {
            const shortUrlInput = document.getElementById('shortUrl');
            if (shortUrlInput && shortUrlInput.value) {
                this.elements.qrUrlInput.value = shortUrlInput.value;
                this.elements.qrUrlInput.placeholder = `Using: ${shortUrlInput.value}`;
            }
        }
    }

    /**
     * Get QR code generation options
     * @returns {Object} - QR code options
     */
    getQROptions() {
        const size = parseInt(this.elements.qrSizeSelect?.value || '300');
        const format = this.elements.qrFormatSelect?.value || 'png';

        return {
            size,
            format,
            errorCorrection: 'M', // Medium error correction
            margin: 4,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        };
    }

    /**
     * Generate QR code using API
     * @param {string} url - URL to encode
     * @param {Object} options - QR code options
     * @returns {Promise<Object>} - API response
     */
    async generateQRCode(url, options) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            // For demo purposes, we'll use a QR code generation library
            // In production, replace this with actual API call

            // Check if QRServer API is available (free, no auth required)
            const qrData = await this.generateWithQRServer(url, options);

            clearTimeout(timeoutId);

            return {
                success: true,
                data: {
                    id: AppUtils.dateUtils.generateId(),
                    url: url,
                    imageUrl: qrData.imageUrl,
                    size: options.size,
                    format: options.format,
                    createdAt: AppUtils.dateUtils.now(),
                    downloads: 0
                }
            };

            /* Actual API implementation would look like this:
            const response = await fetch(`${this.baseUrl}/qr`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: url,
                    size: `${options.size}x${options.size}`,
                    format: options.format,
                    error_correction: options.errorCorrection,
                    margin: options.margin
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return { success: true, data };
            */

        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new Error(AppConfig.errorMessages.timeout);
            }

            throw error;
        }
    }

    /**
     * Generate QR code using QRServer API (free, no auth)
     * @param {string} url - URL to encode
     * @param {Object} options - QR code options
     * @returns {Promise<Object>} - QR code data
     */
    async generateWithQRServer(url, options) {
        try {
            // Using qr-server.com API (free, no authentication required)
            const params = new URLSearchParams({
                size: `${options.size}x${options.size}`,
                data: url,
                format: options.format,
                margin: options.margin,
                qzone: 1,
                color: options.color.dark.replace('#', ''),
                bgcolor: options.color.light.replace('#', '')
            });

            const imageUrl = `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`;

            // Test if the image loads successfully
            const testImg = new Image();
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('QR code generation timeout'));
                }, 5000);

                testImg.onload = () => {
                    clearTimeout(timeout);
                    resolve();
                };
                testImg.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error('Failed to load QR code image'));
                };
                testImg.src = imageUrl;
            });

            return { imageUrl };
        } catch (error) {
            console.error('QRServer API failed:', error);
            throw error;
        }
    }

    /**
     * Generate QR code client-side as fallback
     * @param {string} url - URL to encode
     * @param {Object} options - QR code options
     * @returns {Promise<Object>} - QR code data
     */
    async generateClientSide(url, options) {
        try {
            // For now, return a placeholder
            // In production, you could use a library like qrcode.js
            const canvas = document.createElement('canvas');
            canvas.width = options.size;
            canvas.height = options.size;
            const ctx = canvas.getContext('2d');

            // Simple placeholder - draw a square pattern
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, options.size, options.size);
            ctx.fillStyle = '#000000';

            // Draw a simple pattern to represent QR code
            const cellSize = Math.floor(options.size / 25);
            for (let i = 0; i < 25; i++) {
                for (let j = 0; j < 25; j++) {
                    if (Math.random() > 0.5) {
                        ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
                    }
                }
            }

            const imageUrl = canvas.toDataURL(`image/${options.format}`);

            return { imageUrl };
        } catch (error) {
            console.error('Client-side QR generation failed:', error);
            throw new Error('Failed to generate QR code');
        }
    }

    /**
     * Show QR code result
     * @param {Object} data - QR code data
     */
    showResult(data) {
        this.elements.qrImage.src = data.imageUrl;
        this.elements.qrImage.alt = `QR Code for ${data.url}`;

        // Set download button
        this.elements.downloadButton.onclick = () => this.downloadQR(data);

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
     * Download QR code image
     * @param {Object} data - QR code data (optional)
     */
    async downloadQR(data = null) {
        try {
            const qrData = data || this.getCurrentQRData();
            if (!qrData) {
                this.showMessage('No QR code to download', 'warning');
                return;
            }

            // Generate filename
            const url = new URL(qrData.url);
            const domain = url.hostname.replace('www.', '');
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `qr-${domain}-${timestamp}.${qrData.format}`;

            if (qrData.imageUrl.startsWith('data:')) {
                // Data URL - download directly
                const blob = AppUtils.downloadUtils.dataUrlToBlob(qrData.imageUrl);
                AppUtils.downloadUtils.downloadBlob(blob, filename);
            } else {
                // Remote URL - download via fetch
                const response = await fetch(qrData.imageUrl);
                const blob = await response.blob();
                AppUtils.downloadUtils.downloadBlob(blob, filename);
            }

            // Update download count
            this.updateDownloadCount(qrData.id);

            this.showMessage('QR code downloaded successfully!', 'success');

        } catch (error) {
            console.error('Download error:', error);
            this.showMessage('Failed to download QR code', 'error');
        }
    }

    /**
     * Copy QR code image to clipboard
     */
    async copyQR() {
        try {
            const qrData = this.getCurrentQRData();
            if (!qrData) {
                this.showMessage('No QR code to copy', 'warning');
                return;
            }

            if (qrData.imageUrl.startsWith('data:')) {
                // For data URLs, try to copy directly
                const response = await fetch(qrData.imageUrl);
                const blob = await response.blob();

                if (navigator.clipboard && window.ClipboardItem) {
                    const item = new ClipboardItem({ [`image/${qrData.format}`]: blob });
                    await navigator.clipboard.write([item]);
                    this.showMessage('QR code copied to clipboard!', 'success');

                    // Temporarily change button text
                    const originalText = this.elements.copyButton.textContent;
                    this.elements.copyButton.textContent = 'Copied!';
                    setTimeout(() => {
                        this.elements.copyButton.textContent = originalText;
                    }, 2000);
                } else {
                    this.showMessage('Clipboard API not supported in your browser', 'warning');
                }
            } else {
                // For remote URLs, we'd need to fetch and convert to blob
                this.showMessage('Copying remote QR codes not supported yet', 'warning');
            }

        } catch (error) {
            console.error('Copy QR error:', error);
            this.showMessage('Failed to copy QR code', 'error');
        }
    }

    /**
     * Get current QR code data
     * @returns {Object|null} - Current QR data or null
     */
    getCurrentQRData() {
        if (!this.elements.qrImage.src) return null;

        return {
            id: this.currentQRId,
            url: this.currentUrl,
            imageUrl: this.elements.qrImage.src,
            size: parseInt(this.elements.qrSizeSelect?.value || '300'),
            format: this.elements.qrFormatSelect?.value || 'png'
        };
    }

    /**
     * Set loading state on button
     * @param {boolean} loading - Whether to show loading state
     */
    setLoadingState(loading) {
        if (loading) {
            this.elements.generateButton.classList.add('loading');
            this.elements.generateButton.disabled = true;
        } else {
            this.elements.generateButton.classList.remove('loading');
            this.elements.generateButton.disabled = false;
        }
    }

    /**
     * Add QR code to history
     * @param {Object} data - QR code data to add
     */
    addToHistory(data) {
        let history = this.getHistory();

        // Remove duplicate if exists
        history = history.filter(item => item.url !== data.url);

        // Add new item to beginning
        history.unshift(data);

        // Limit history size
        history = history.slice(0, this.maxHistoryItems);

        // Save to storage
        if (!AppUtils.storageUtils.set(this.storageKey, history)) {
            console.warn('Failed to save QR history to storage');
        }

        this.currentQRId = data.id;
        this.updateHistoryDisplay();
    }

    /**
     * Get QR code history from storage
     * @returns {Array} - Array of QR code data
     */
    getHistory() {
        return AppUtils.storageUtils.get(this.storageKey, []);
    }

    /**
     * Clear QR code history
     */
    clearHistory() {
        AppUtils.storageUtils.remove(this.storageKey);
        this.updateHistoryDisplay();
        this.showMessage('QR code history cleared', 'success');
    }

    /**
     * Update history display
     */
    updateHistoryDisplay() {
        const history = this.getHistory();

        if (history.length === 0) {
            this.elements.historyList.innerHTML = '<p class="no-history">No QR codes generated yet</p>';
            return;
        }

        const historyHTML = history.map(item => `
            <div class="history-item" data-id="${item.id}">
                <div class="history-info">
                    <div class="history-qr">
                        <img src="${item.imageUrl}" alt="QR Code" style="width: 50px; height: 50px;">
                    </div>
                    <div class="history-details">
                        <div class="history-url">
                            <strong>${item.url}</strong>
                        </div>
                        <div class="history-meta">
                            <span>${item.size}x${item.size} ${item.format.toUpperCase()}</span>
                            <span>•</span>
                            <span>${AppUtils.dateUtils.format(item.createdAt)}</span>
                            <span>•</span>
                            <span>${item.downloads || 0} downloads</span>
                        </div>
                    </div>
                </div>
                <div class="history-actions">
                    <button class="btn btn-secondary btn-small" onclick="qrGenerator.regenerateQR('${item.url}', ${item.size}, '${item.format}')">
                        Regenerate
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="qrGenerator.downloadHistoryQR('${item.id}')">
                        Download
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="qrGenerator.deleteHistoryItem('${item.id}')">
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
     * Regenerate QR code from history
     * @param {string} url - URL to regenerate
     * @param {number} size - QR code size
     * @param {string} format - QR code format
     */
    regenerateQR(url, size, format) {
        this.elements.qrUrlInput.value = url;
        this.elements.qrSizeSelect.value = size.toString();
        this.elements.qrFormatSelect.value = format;
        this.handleGenerate();
    }

    /**
     * Download QR code from history
     * @param {string} id - QR code ID
     */
    async downloadHistoryQR(id) {
        const history = this.getHistory();
        const item = history.find(item => item.id === id);

        if (item) {
            await this.downloadQR(item);
        } else {
            this.showMessage('QR code not found in history', 'error');
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
            this.showMessage('QR code removed from history', 'success');
        } else {
            this.showMessage('Failed to remove QR code', 'error');
        }
    }

    /**
     * Update download count for QR code
     * @param {string} id - QR code ID
     */
    updateDownloadCount(id) {
        let history = this.getHistory();
        const item = history.find(item => item.id === id);

        if (item) {
            item.downloads = (item.downloads || 0) + 1;
            AppUtils.storageUtils.set(this.storageKey, history);
            this.updateHistoryDisplay();
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

        return AppConfig.errorMessages.qrGenerationFailed;
    }
}

// Initialize QR generator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.qrGenerator = new QRCodeGenerator();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QRCodeGenerator;
}