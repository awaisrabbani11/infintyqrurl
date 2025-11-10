// Main Application JavaScript for InfinityQR URL
// Coordinates all components and handles global functionality

// Global references
const AppConfig = window.AppConfig || {};
const AppUtils = window.AppUtils || {};

/**
 * Main Application Class
 */
class InfinityQRApp {
    constructor() {
        this.version = AppConfig.config.app.version;
        this.name = AppConfig.config.app.name;
        this.isReady = false;

        this.initializeApp();
    }

    /**
     * Initialize the application
     */
    initializeApp() {
        console.log(`🚀 Initializing ${this.name} v${this.version}`);

        // Check browser compatibility
        if (!this.checkBrowserCompatibility()) {
            this.showCompatibilityWarning();
            return;
        }

        // Initialize core components
        this.initializeCoreFeatures();
        this.bindGlobalEvents();
        this.setupPerformanceMonitoring();
        this.checkForUpdates();

        // Mark app as ready
        this.isReady = true;
        document.dispatchEvent(new CustomEvent('appReady'));

        console.log('✅ InfinityQR URL App initialized successfully');
    }

    /**
     * Check browser compatibility
     * @returns {boolean} - True if browser is compatible
     */
    checkBrowserCompatibility() {
        const requiredFeatures = [
            'fetch',
            'localStorage',
            'sessionStorage',
            'URL',
            'Blob',
            'Promise'
        ];

        for (const feature of requiredFeatures) {
            if (!(feature in window)) {
                console.error(`❌ Browser does not support ${feature}`);
                return false;
            }
        }

        // Check for secure context (required for clipboard API)
        if (!window.isSecureContext) {
            console.warn('⚠️ Running in non-secure context. Some features may not work.');
        }

        return true;
    }

    /**
     * Show compatibility warning
     */
    showCompatibilityWarning() {
        const warningHTML = `
            <div class="compatibility-warning" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #ff4444;
                color: white;
                padding: 1rem;
                text-align: center;
                z-index: 10000;
                font-weight: 500;
            ">
                ⚠️ Your browser is not fully supported. Please update to a modern browser for the best experience.
            </div>
        `;

        document.body.insertAdjacentHTML('afterbegin', warningHTML);
    }

    /**
     * Initialize core application features
     */
    initializeCoreFeatures() {
        // Initialize navigation
        this.initializeNavigation();

        // Initialize message system
        this.initializeMessageSystem();

        // Initialize theme system
        this.initializeThemeSystem();

        // Initialize analytics (if enabled)
        if (AppConfig.config.features.analytics) {
            this.initializeAnalytics();
        }

        // Initialize keyboard shortcuts
        this.initializeKeyboardShortcuts();

        // Initialize smooth scrolling
        this.initializeSmoothScrolling();

        // Initialize mobile menu
        this.initializeMobileMenu();
    }

    /**
     * Initialize navigation functionality
     */
    initializeNavigation() {
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        // Handle navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    this.smoothScrollTo(targetElement);
                }

                // Close mobile menu if open
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle?.classList.remove('active');
                }
            });
        });

        // Handle dashboard link (placeholder for future backend)
        const dashboardLink = document.querySelector('a[href="#dashboard"]');
        if (dashboardLink) {
            dashboardLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDashboardPlaceholder();
            });
        }
    }

    /**
     * Initialize mobile menu
     */
    initializeMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            });
        }
    }

    /**
     * Initialize message/notification system
     */
    initializeMessageSystem() {
        this.messageContainer = document.getElementById('messageContainer');
        if (!this.messageContainer) {
            this.messageContainer = document.createElement('div');
            this.messageContainer.id = 'messageContainer';
            this.messageContainer.className = 'message-container';
            document.body.appendChild(this.messageContainer);
        }

        // Listen for message events
        document.addEventListener('showMessage', (e) => {
            this.showMessage(e.detail.message, e.detail.type);
        });
    }

    /**
     * Show message to user
     * @param {string} message - Message to show
     * @param {string} type - Message type (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds (auto-dismiss)
     */
    showMessage(message, type = 'info', duration = AppConfig.config.ui.notificationDuration) {
        if (!this.messageContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${type} slide-in-right`;
        messageElement.innerHTML = `
            <span class="message-icon">${this.getMessageIcon(type)}</span>
            <span class="message-text">${message}</span>
            <button class="message-close" onclick="this.parentElement.remove()">×</button>
        `;

        this.messageContainer.appendChild(messageElement);

        // Auto-dismiss after duration
        if (duration > 0) {
            setTimeout(() => {
                if (messageElement.parentElement) {
                    messageElement.classList.add('slide-out-right');
                    setTimeout(() => messageElement.remove(), 300);
                }
            }, duration);
        }

        // Limit number of messages
        this.limitMessages();
    }

    /**
     * Get message icon based on type
     * @param {string} type - Message type
     * @returns {string} - Icon emoji
     */
    getMessageIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * Limit number of displayed messages
     */
    limitMessages() {
        const messages = this.messageContainer.querySelectorAll('.message');
        if (messages.length > 5) {
            for (let i = 0; i < messages.length - 5; i++) {
                messages[i].remove();
            }
        }
    }

    /**
     * Initialize theme system
     */
    initializeThemeSystem() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = AppUtils.storageUtils.get('theme', 'dark');

        // Apply saved theme or system preference
        this.setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!AppUtils.storageUtils.get('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    /**
     * Set application theme
     * @param {string} theme - Theme name ('dark' or 'light')
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        AppUtils.storageUtils.set('theme', theme);
    }

    /**
     * Initialize analytics (placeholder for future implementation)
     */
    initializeAnalytics() {
        // Placeholder for analytics initialization
        console.log('📊 Analytics would be initialized here');
    }

    /**
     * Initialize keyboard shortcuts
     */
    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only trigger shortcuts when not in input fields
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
                return;
            }

            // Ctrl/Cmd + K: Focus URL input
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const urlInput = document.getElementById('longUrl');
                if (urlInput) {
                    urlInput.focus();
                    urlInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }

            // Ctrl/Cmd + /: Show shortcuts help
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.showKeyboardShortcuts();
            }

            // Escape: Close modals and clear focus
            if (e.key === 'Escape') {
                document.activeElement?.blur();
            }
        });
    }

    /**
     * Initialize smooth scrolling
     */
    initializeSmoothScrolling() {
        // Smooth scrolling is already handled by CSS scroll-behavior: smooth
        // This handles edge cases and programmatic scrolling
    }

    /**
     * Smooth scroll to element
     * @param {HTMLElement} element - Target element
     * @param {number} offset - Offset from top (for fixed headers)
     */
    smoothScrollTo(element, offset = 80) {
        const targetPosition = element.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor page load performance
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const navigation = performance.getEntriesByType('navigation')[0];
                    if (navigation) {
                        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
                        console.log(`⚡ Page load time: ${loadTime}ms`);

                        // Show performance warning for slow loads
                        if (loadTime > 3000) {
                            this.showMessage('Page loading slowly. Check your connection.', 'warning', 5000);
                        }
                    }
                }, 0);
            });
        }

        // Monitor slow connections
        if (AppUtils.performanceUtils.isSlowConnection()) {
            this.showMessage('Slow connection detected. Some features may be slower.', 'warning', 8000);
        }
    }

    /**
     * Check for application updates
     */
    checkForUpdates() {
        // Placeholder for update checking
        // In production, this could check for new versions or features
        console.log('🔄 Update check placeholder');
    }

    /**
     * Show dashboard placeholder
     */
    showDashboardPlaceholder() {
        const currentUser = window.authUI?.getCurrentUser();

        if (!currentUser) {
            this.showMessage('Please login to access your dashboard', 'info');
            window.authUI?.showLoginModal();
            return;
        }

        // Show dashboard placeholder message
        this.showMessage('Dashboard coming soon! User authentication is ready for backend integration.', 'info', 6000);
    }

    /**
     * Show keyboard shortcuts help
     */
    showKeyboardShortcuts() {
        const shortcutsHTML = `
            <div class="keyboard-shortcuts-modal">
                <div class="modal-content">
                    <span class="modal-close" onclick="this.closest('.keyboard-shortcuts-modal').remove()">&times;</span>
                    <h3>Keyboard Shortcuts</h3>
                    <div class="shortcuts-list">
                        <div class="shortcut-item">
                            <kbd>Ctrl</kbd> + <kbd>K</kbd>
                            <span>Focus URL input</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl</kbd> + <kbd>/</kbd>
                            <span>Show shortcuts</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Esc</kbd>
                            <span>Close modals / Clear focus</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Enter</kbd>
                            <span>Submit forms</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', shortcutsHTML);
    }

    /**
     * Bind global event listeners
     */
    bindGlobalEvents() {
        // Handle online/offline status
        window.addEventListener('online', () => {
            this.showMessage('Connection restored', 'success', 3000);
        });

        window.addEventListener('offline', () => {
            this.showMessage('Connection lost. Some features may not work.', 'warning', 5000);
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('🔒 Application hidden');
            } else {
                console.log('👁️ Application visible');
            }
        });

        // Handle window resize with debouncing
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log('📱 Window resized');
                // Handle responsive adjustments if needed
            }, 250);
        });

        // Handle beforeunload (warn user if they have unsaved changes)
        window.addEventListener('beforeunload', (e) => {
            // Check for any forms with unsaved changes
            const forms = document.querySelectorAll('form[data-unsaved="true"]');
            if (forms.length > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    /**
     * Get application information
     * @returns {Object} - Application info
     */
    getInfo() {
        return {
            name: this.name,
            version: this.version,
            isReady: this.isReady,
            environment: AppConfig.environment,
            features: AppConfig.config.features,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Debug method to log application state
     */
    debug() {
        console.group('🔍 InfinityQR URL Debug Information');
        console.log('App Info:', this.getInfo());
        console.log('Config:', AppConfig);
        console.log('Utils:', AppUtils);
        console.log('Storage:', {
            localStorage: Object.keys(localStorage),
            sessionStorage: Object.keys(sessionStorage)
        });
        console.groupEnd();
    }
}

// Global error handler
window.addEventListener('error', (e) => {
    console.error('💥 Global error:', e.error);
    // You could send this to an error reporting service
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
    console.error('💥 Unhandled promise rejection:', e.reason);
    // You could send this to an error reporting service
});

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new InfinityQRApp();

    // Make app available globally for debugging
    window.InfinityQRApp = InfinityQRApp;

    // Add some helpful global functions
    window.debugApp = () => window.app.debug();
    window.showShortcuts = () => window.app.showKeyboardShortcuts();
});

// Additional CSS for dynamically created elements
const additionalCSS = `
<style>
.keyboard-shortcuts-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.keyboard-shortcuts-modal .modal-content {
    background: var(--card-bg);
    padding: 2rem;
    border-radius: 16px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.shortcuts-list {
    margin-top: 1rem;
}

.shortcut-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color);
}

.shortcut-item:last-child {
    border-bottom: none;
}

kbd {
    background: var(--secondary-bg);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 0.2rem 0.4rem;
    font-family: monospace;
    font-size: 0.9rem;
}

.field-error {
    color: var(--error-color);
    font-size: 0.9rem;
    margin-top: 0.25rem;
}

.error {
    border-color: var(--error-color) !important;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-name {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

@media (max-width: 767px) {
    .user-info {
        flex-direction: column;
        gap: 0.5rem;
    }

    .shortcuts-list {
        font-size: 0.9rem;
    }

    .keyboard-shortcuts-modal .modal-content {
        padding: 1rem;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalCSS);