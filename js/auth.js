// Authentication UI Functionality for InfinityQR URL
// Handles login/signup modals, form validation, and UI state management

// Global references
const AppConfig = window.AppConfig || {};
const AppUtils = window.AppUtils || {};

/**
 * Authentication UI Class
 */
class AuthUI {
    constructor() {
        this.storageKey = AppConfig.config.storage.authToken;
        this.currentModal = null;

        this.initializeElements();
        this.bindEvents();
        this.checkAuthState();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.elements = {
            // Buttons
            loginButton: document.getElementById('loginBtn'),
            signupButton: document.getElementById('signupBtn'),
            showLoginLink: document.getElementById('showLogin'),
            showSignupLink: document.getElementById('showSignup'),

            // Modals
            loginModal: document.getElementById('loginModal'),
            signupModal: document.getElementById('signupModal'),

            // Forms
            loginForm: document.getElementById('loginForm'),
            signupForm: document.getElementById('signupForm'),

            // Login inputs
            loginEmailInput: document.getElementById('loginEmail'),
            loginPasswordInput: document.getElementById('loginPassword'),
            rememberMeCheckbox: document.getElementById('rememberMe'),

            // Signup inputs
            signupNameInput: document.getElementById('signupName'),
            signupEmailInput: document.getElementById('signupEmail'),
            signupPasswordInput: document.getElementById('signupPassword'),
            confirmPasswordInput: document.getElementById('confirmPassword'),

            // Close buttons
            modalCloseButtons: document.querySelectorAll('.modal-close')
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Button clicks
        if (this.elements.loginButton) {
            this.elements.loginButton.addEventListener('click', () => this.showLoginModal());
        }

        if (this.elements.signupButton) {
            this.elements.signupButton.addEventListener('click', () => this.showSignupModal());
        }

        if (this.elements.showLoginLink) {
            this.elements.showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToLogin();
            });
        }

        if (this.elements.showSignupLink) {
            this.elements.showSignupLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToSignup();
            });
        }

        // Form submissions
        if (this.elements.loginForm) {
            this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (this.elements.signupForm) {
            this.elements.signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Modal close buttons
        this.elements.modalCloseButtons.forEach(button => {
            button.addEventListener('click', () => this.closeModal());
        });

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });

        // Form field validation
        this.bindFormValidation();
    }

    /**
     * Bind real-time form validation
     */
    bindFormValidation() {
        // Email validation
        [this.elements.loginEmailInput, this.elements.signupEmailInput].forEach(input => {
            if (input) {
                input.addEventListener('blur', () => this.validateEmail(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            }
        });

        // Password validation for signup
        if (this.elements.signupPasswordInput) {
            this.elements.signupPasswordInput.addEventListener('blur', () => this.validatePassword());
            this.elements.signupPasswordInput.addEventListener('input', () => this.clearFieldError(this.elements.signupPasswordInput));
        }

        // Confirm password validation
        if (this.elements.confirmPasswordInput) {
            this.elements.confirmPasswordInput.addEventListener('blur', () => this.validateConfirmPassword());
            this.elements.confirmPasswordInput.addEventListener('input', () => this.clearFieldError(this.elements.confirmPasswordInput));
        }

        // Name validation for signup
        if (this.elements.signupNameInput) {
            this.elements.signupNameInput.addEventListener('blur', () => this.validateName());
            this.elements.signupNameInput.addEventListener('input', () => this.clearFieldError(this.elements.signupNameInput));
        }
    }

    /**
     * Show login modal
     */
    showLoginModal() {
        this.currentModal = this.elements.loginModal;
        this.showModal(this.elements.loginModal);
        this.clearForm(this.elements.loginForm);
        this.elements.loginEmailInput?.focus();
    }

    /**
     * Show signup modal
     */
    showSignupModal() {
        this.currentModal = this.elements.signupModal;
        this.showModal(this.elements.signupModal);
        this.clearForm(this.elements.signupForm);
        this.elements.signupNameInput?.focus();
    }

    /**
     * Show modal with animation
     * @param {HTMLElement} modal - Modal element to show
     */
    showModal(modal) {
        if (!modal) return;

        modal.style.display = 'block';
        // Trigger reflow for animation
        modal.offsetHeight;
        modal.classList.add('fade-in');

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close current modal
     */
    closeModal() {
        if (!this.currentModal) return;

        this.currentModal.style.display = 'none';
        this.currentModal.classList.remove('fade-in');
        this.currentModal = null;

        // Restore body scroll
        document.body.style.overflow = '';

        // Clear any form errors
        this.clearAllErrors();
    }

    /**
     * Switch to login modal
     */
    switchToLogin() {
        this.closeModal();
        setTimeout(() => this.showLoginModal(), 100);
    }

    /**
     * Switch to signup modal
     */
    switchToSignup() {
        this.closeModal();
        setTimeout(() => this.showSignupModal(), 100);
    }

    /**
     * Handle login form submission
     * @param {Event} e - Form submit event
     */
    async handleLogin(e) {
        e.preventDefault();

        try {
            const formData = this.getLoginForm();

            // Validate form
            if (!this.validateLoginForm(formData)) {
                return;
            }

            // Show loading state
            this.setFormLoading(this.elements.loginForm, true);

            // Simulate API call (replace with actual authentication)
            const result = await this.authenticateUser(formData);

            if (result.success) {
                this.handleAuthSuccess(result.data, formData.rememberMe);
                this.closeModal();
                this.showMessage('Login successful! Welcome back.', 'success');
            } else {
                this.showMessage(result.error || 'Login failed. Please check your credentials.', 'error');
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('Login failed. Please try again.', 'error');
        } finally {
            this.setFormLoading(this.elements.loginForm, false);
        }
    }

    /**
     * Handle signup form submission
     * @param {Event} e - Form submit event
     */
    async handleSignup(e) {
        e.preventDefault();

        try {
            const formData = this.getSignupForm();

            // Validate form
            if (!this.validateSignupForm(formData)) {
                return;
            }

            // Show loading state
            this.setFormLoading(this.elements.signupForm, true);

            // Simulate API call (replace with actual registration)
            const result = await this.registerUser(formData);

            if (result.success) {
                this.handleAuthSuccess(result.data, true); // Auto-login after signup
                this.closeModal();
                this.showMessage('Account created successfully! Welcome to InfinityQR URL.', 'success');
            } else {
                this.showMessage(result.error || 'Registration failed. Please try again.', 'error');
            }

        } catch (error) {
            console.error('Signup error:', error);
            this.showMessage('Registration failed. Please try again.', 'error');
        } finally {
            this.setFormLoading(this.elements.signupForm, false);
        }
    }

    /**
     * Get login form data
     * @returns {Object} - Form data
     */
    getLoginForm() {
        return {
            email: this.elements.loginEmailInput?.value.trim() || '',
            password: this.elements.loginPasswordInput?.value || '',
            rememberMe: this.elements.rememberMeCheckbox?.checked || false
        };
    }

    /**
     * Get signup form data
     * @returns {Object} - Form data
     */
    getSignupForm() {
        return {
            name: this.elements.signupNameInput?.value.trim() || '',
            email: this.elements.signupEmailInput?.value.trim() || '',
            password: this.elements.signupPasswordInput?.value || '',
            confirmPassword: this.elements.confirmPasswordInput?.value || ''
        };
    }

    /**
     * Validate login form
     * @param {Object} formData - Form data to validate
     * @returns {boolean} - True if valid
     */
    validateLoginForm(formData) {
        let isValid = true;

        // Validate email
        if (!this.validateEmail(this.elements.loginEmailInput, formData.email)) {
            isValid = false;
        }

        // Validate password
        if (!formData.password) {
            this.showFieldError(this.elements.loginPasswordInput, 'Password is required');
            isValid = false;
        } else if (formData.password.length < 6) {
            this.showFieldError(this.elements.loginPasswordInput, 'Password must be at least 6 characters');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Validate signup form
     * @param {Object} formData - Form data to validate
     * @returns {boolean} - True if valid
     */
    validateSignupForm(formData) {
        let isValid = true;

        // Validate name
        if (!this.validateName(formData.name)) {
            isValid = false;
        }

        // Validate email
        if (!this.validateEmail(this.elements.signupEmailInput, formData.email)) {
            isValid = false;
        }

        // Validate password
        const passwordValidation = this.validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            this.showFieldError(this.elements.signupPasswordInput, passwordValidation.feedback[0]);
            isValid = false;
        }

        // Validate confirm password
        if (!this.validateConfirmPassword(formData.password, formData.confirmPassword)) {
            isValid = false;
        }

        return isValid;
    }

    /**
     * Validate email field
     * @param {HTMLElement} field - Email input field
     * @param {string} email - Email to validate
     * @returns {boolean} - True if valid
     */
    validateEmail(field, email = null) {
        const emailValue = email || field?.value.trim() || '';

        if (!emailValue) {
            this.showFieldError(field, 'Email is required');
            return false;
        }

        if (!AppUtils.validationUtils.isValidEmail(emailValue)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }

        return true;
    }

    /**
     * Validate name field
     * @param {string} name - Name to validate
     * @returns {boolean} - True if valid
     */
    validateName(name = null) {
        const nameValue = name || this.elements.signupNameInput?.value.trim() || '';

        if (!nameValue) {
            this.showFieldError(this.elements.signupNameInput, 'Name is required');
            return false;
        }

        if (nameValue.length < 2) {
            this.showFieldError(this.elements.signupNameInput, 'Name must be at least 2 characters');
            return false;
        }

        if (nameValue.length > 50) {
            this.showFieldError(this.elements.signupNameInput, 'Name must be less than 50 characters');
            return false;
        }

        return true;
    }

    /**
     * Validate password
     * @param {string} password - Password to validate
     * @returns {Object} - Validation result
     */
    validatePassword(password = null) {
        const passwordValue = password || this.elements.signupPasswordInput?.value || '';
        return AppUtils.validationUtils.validatePassword(passwordValue);
    }

    /**
     * Validate confirm password
     * @param {string} password - Original password
     * @param {string} confirmPassword - Confirmation password
     * @returns {boolean} - True if valid
     */
    validateConfirmPassword(password = null, confirmPassword = null) {
        const passwordValue = password || this.elements.signupPasswordInput?.value || '';
        const confirmValue = confirmPassword || this.elements.confirmPasswordInput?.value || '';

        if (!confirmValue) {
            this.showFieldError(this.elements.confirmPasswordInput, 'Please confirm your password');
            return false;
        }

        if (passwordValue !== confirmValue) {
            this.showFieldError(this.elements.confirmPasswordInput, 'Passwords do not match');
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
        if (!field) return;

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
        if (!field) return;

        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    /**
     * Clear all form errors
     */
    clearAllErrors() {
        const errorFields = document.querySelectorAll('.error');
        const errorMessages = document.querySelectorAll('.field-error');

        errorFields.forEach(field => field.classList.remove('error'));
        errorMessages.forEach(message => message.remove());
    }

    /**
     * Clear form fields
     * @param {HTMLFormElement} form - Form to clear
     */
    clearForm(form) {
        if (!form) return;

        form.reset();
        this.clearAllErrors();
    }

    /**
     * Set form loading state
     * @param {HTMLFormElement} form - Form to set loading state
     * @param {boolean} loading - Whether to show loading state
     */
    setFormLoading(form, loading) {
        if (!form) return;

        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            if (loading) {
                submitButton.classList.add('loading');
                submitButton.disabled = true;
                submitButton.textContent = 'Loading...';
            } else {
                submitButton.classList.remove('loading');
                submitButton.disabled = false;
                submitButton.textContent = form.id === 'loginForm' ? 'Login' : 'Sign Up';
            }
        }

        // Disable all inputs during loading
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.disabled = loading;
        });
    }

    /**
     * Simulate user authentication (replace with actual API)
     * @param {Object} credentials - User credentials
     * @returns {Promise<Object>} - Authentication result
     */
    async authenticateUser(credentials) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock authentication (replace with actual API call)
        if (credentials.email === 'demo@infinityqrurl.com' && credentials.password === 'demo123') {
            return {
                success: true,
                data: {
                    id: 'demo-user-id',
                    name: 'Demo User',
                    email: credentials.email,
                    token: 'mock-jwt-token-' + Date.now()
                }
            };
        }

        // For demo purposes, accept any email/password combination
        return {
            success: true,
            data: {
                id: 'user-' + Date.now(),
                name: credentials.email.split('@')[0],
                email: credentials.email,
                token: 'mock-jwt-token-' + Date.now()
            }
        };
    }

    /**
     * Simulate user registration (replace with actual API)
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} - Registration result
     */
    async registerUser(userData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock registration (replace with actual API call)
        return {
            success: true,
            data: {
                id: 'user-' + Date.now(),
                name: userData.name,
                email: userData.email,
                token: 'mock-jwt-token-' + Date.now()
            }
        };
    }

    /**
     * Handle successful authentication
     * @param {Object} userData - User data
     * @param {boolean} rememberMe - Whether to remember user
     */
    handleAuthSuccess(userData, rememberMe = false) {
        const authData = {
            user: userData,
            token: userData.token,
            loginTime: AppUtils.dateUtils.now(),
            rememberMe
        };

        // Store authentication data
        if (rememberMe) {
            AppUtils.storageUtils.set(this.storageKey, authData);
        } else {
            // Use session storage for non-remembered users
            try {
                sessionStorage.setItem(this.storageKey, JSON.stringify(authData));
            } catch (error) {
                console.warn('Failed to store auth data in sessionStorage:', error);
            }
        }

        this.updateAuthUI(userData);
    }

    /**
     * Check authentication state on page load
     */
    checkAuthState() {
        let authData = AppUtils.storageUtils.get(this.storageKey);

        // Check session storage if not found in local storage
        if (!authData) {
            try {
                const sessionData = sessionStorage.getItem(this.storageKey);
                if (sessionData) {
                    authData = JSON.parse(sessionData);
                }
            } catch (error) {
                console.warn('Failed to read auth data from sessionStorage:', error);
            }
        }

        if (authData && authData.token) {
            this.updateAuthUI(authData.user);
        }
    }

    /**
     * Update UI based on authentication state
     * @param {Object} user - User data
     */
    updateAuthUI(user) {
        if (!user) return;

        // Hide login/signup buttons
        if (this.elements.loginButton) {
            this.elements.loginButton.style.display = 'none';
        }
        if (this.elements.signupButton) {
            this.elements.signupButton.style.display = 'none';
        }

        // Show user info (you could add a user menu here)
        this.addUserMenu(user);
    }

    /**
     * Add user menu to navigation
     * @param {Object} user - User data
     */
    addUserMenu(user) {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;

        // Create user menu element
        const userMenuItem = document.createElement('li');
        userMenuItem.className = 'nav-item user-menu';
        userMenuItem.innerHTML = `
            <div class="user-info">
                <span class="user-name">Welcome, ${user.name}</span>
                <button id="logoutBtn" class="btn btn-secondary">Logout</button>
            </div>
        `;

        // Insert before existing login/signup buttons
        const firstAuthButton = navMenu.querySelector('#loginBtn, #signupBtn');
        if (firstAuthButton) {
            navMenu.insertBefore(userMenuItem, firstAuthButton);
        } else {
            navMenu.appendChild(userMenuItem);
        }

        // Bind logout functionality
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    }

    /**
     * Logout user
     */
    logout() {
        // Clear stored auth data
        AppUtils.storageUtils.remove(this.storageKey);
        try {
            sessionStorage.removeItem(this.storageKey);
        } catch (error) {
            console.warn('Failed to remove auth data from sessionStorage:', error);
        }

        // Remove user menu
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.remove();
        }

        // Show login/signup buttons again
        if (this.elements.loginButton) {
            this.elements.loginButton.style.display = 'block';
        }
        if (this.elements.signupButton) {
            this.elements.signupButton.style.display = 'block';
        }

        this.showMessage('Logged out successfully', 'success');
    }

    /**
     * Get current authenticated user
     * @returns {Object|null} - Current user data or null
     */
    getCurrentUser() {
        let authData = AppUtils.storageUtils.get(this.storageKey);

        if (!authData) {
            try {
                const sessionData = sessionStorage.getItem(this.storageKey);
                if (sessionData) {
                    authData = JSON.parse(sessionData);
                }
            } catch (error) {
                console.warn('Failed to read auth data from sessionStorage:', error);
            }
        }

        return authData?.user || null;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} - True if authenticated
     */
    isAuthenticated() {
        return this.getCurrentUser() !== null;
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
}

// Initialize authentication UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authUI = new AuthUI();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthUI;
}