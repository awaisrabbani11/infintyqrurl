// Functional Authentication System for InfinityQR URL
// Complete login, signup, and dashboard functionality

console.log('🔐 Loading functional authentication system...');

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.authModal = null;
        this.init();
    }

    init() {
        this.checkExistingSession();
        this.createAuthModal();
        this.createDashboard();
        this.bindEvents();
        console.log('✅ Auth system initialized');
    }

    checkExistingSession() {
        const savedUser = localStorage.getItem('infinityqr_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.isLoggedIn = true;
                this.updateUIForLoggedInUser();
                console.log('👤 Found existing session for:', this.currentUser.email);
            } catch (e) {
                console.error('❌ Error parsing saved user session:', e);
                localStorage.removeItem('infinityqr_user');
            }
        }
    }

    createAuthModal() {
        const modalHTML = `
            <div id="authModal" class="auth-modal" style="display: none;">
                <div class="auth-modal-overlay" onclick="authSystem.hideModal()"></div>
                <div class="auth-modal-content">
                    <button class="auth-modal-close" onclick="authSystem.hideModal()">×</button>

                    <div class="auth-tabs">
                        <button class="auth-tab active" onclick="authSystem.switchTab('login')">Login</button>
                        <button class="auth-tab" onclick="authSystem.switchTab('signup')">Sign Up</button>
                    </div>

                    <!-- Login Form -->
                    <div id="loginForm" class="auth-form active">
                        <h2>Welcome Back!</h2>
                        <p class="auth-subtitle">Login to access your dashboard</p>

                        <form onsubmit="authSystem.handleLogin(event)">
                            <div class="form-group">
                                <label for="loginEmail">Email Address</label>
                                <input type="email" id="loginEmail" required placeholder="your@email.com">
                            </div>

                            <div class="form-group">
                                <label for="loginPassword">Password</label>
                                <input type="password" id="loginPassword" required placeholder="••••••••">
                            </div>

                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="rememberMe">
                                    <span class="checkmark"></span>
                                    Remember me
                                </label>
                            </div>

                            <button type="submit" class="auth-btn auth-btn-primary">
                                <span class="btn-text">Login</span>
                                <span class="btn-loader" style="display: none;">Loading...</span>
                            </button>

                            <div class="auth-footer">
                                <p>Don't have an account? <a href="#" onclick="authSystem.switchTab('signup')">Sign up</a></p>
                            </div>
                        </form>
                    </div>

                    <!-- Signup Form -->
                    <div id="signupForm" class="auth-form">
                        <h2>Create Account</h2>
                        <p class="auth-subtitle">Join InfinityQR URL today</p>

                        <form onsubmit="authSystem.handleSignup(event)">
                            <div class="form-group">
                                <label for="signupName">Full Name</label>
                                <input type="text" id="signupName" required placeholder="John Doe">
                            </div>

                            <div class="form-group">
                                <label for="signupEmail">Email Address</label>
                                <input type="email" id="signupEmail" required placeholder="your@email.com">
                            </div>

                            <div class="form-group">
                                <label for="signupPassword">Password</label>
                                <input type="password" id="signupPassword" required placeholder="••••••••" minlength="6">
                            </div>

                            <div class="form-group">
                                <label for="signupConfirmPassword">Confirm Password</label>
                                <input type="password" id="signupConfirmPassword" required placeholder="••••••••">
                            </div>

                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="agreeTerms" required>
                                    <span class="checkmark"></span>
                                    I agree to the <a href="#" onclick="alert('Terms of Service')">Terms of Service</a> and <a href="#" onclick="alert('Privacy Policy')">Privacy Policy</a>
                                </label>
                            </div>

                            <button type="submit" class="auth-btn auth-btn-primary">
                                <span class="btn-text">Create Account</span>
                                <span class="btn-loader" style="display: none;">Loading...</span>
                            </button>

                            <div class="auth-footer">
                                <p>Already have an account? <a href="#" onclick="authSystem.switchTab('login')">Login</a></p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.authModal = document.getElementById('authModal');
    }

    createDashboard() {
        const dashboardHTML = `
            <div id="dashboardModal" class="dashboard-modal" style="display: none;">
                <div class="dashboard-modal-overlay" onclick="authSystem.hideDashboard()"></div>
                <div class="dashboard-modal-content">
                    <div class="dashboard-header">
                        <h2>📊 My Dashboard</h2>
                        <div class="dashboard-user-info">
                            <span id="dashboardUserEmail">user@example.com</span>
                            <button class="btn btn-small btn-secondary" onclick="authSystem.logout()">Logout</button>
                        </div>
                        <button class="dashboard-close" onclick="authSystem.hideDashboard()">×</button>
                    </div>

                    <div class="dashboard-content">
                        <!-- Adstara Banner 1 -->
                        <div class="ad-container ad-dashboard-1">
                            <!-- add ads here - Dashboard Ad Banner 728x90 #1 -->
                            <div class="ad-placeholder">
                                <p>Adstara Banner 728x90 - Analytics Section</p>
                                <small>Position: Top of Dashboard</small>
                            </div>
                        </div>

                        <!-- Stats Cards -->
                        <div class="dashboard-stats">
                            <div class="stat-card">
                                <div class="stat-icon">🔗</div>
                                <div class="stat-content">
                                    <h3 id="totalUrls">0</h3>
                                    <p>Total URLs</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">📈</div>
                                <div class="stat-content">
                                    <h3 id="totalClicks">0</h3>
                                    <p>Total Clicks</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">📱</div>
                                <div class="stat-content">
                                    <h3 id="totalQRCodes">0</h3>
                                    <p>QR Codes</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">📊</div>
                                <div class="stat-content">
                                    <h3 id="conversionRate">0%</h3>
                                    <p>Click Rate</p>
                                </div>
                            </div>
                        </div>

                        <!-- Adstara Banner 2 -->
                        <div class="ad-container ad-dashboard-2">
                            <!-- add ads here - Dashboard Ad Banner 728x90 #2 -->
                            <div class="ad-placeholder">
                                <p>Adstara Banner 728x90 - Middle Section</p>
                                <small>Position: Between Stats and Recent Links</small>
                            </div>
                        </div>

                        <!-- Recent Links -->
                        <div class="dashboard-section">
                            <h3>🔗 Recent Links</h3>
                            <div id="recentLinks" class="dashboard-links">
                                <p class="no-data">No links created yet</p>
                            </div>
                        </div>

                        <!-- Recent QR Codes -->
                        <div class="dashboard-section">
                            <h3>📱 Recent QR Codes</h3>
                            <div id="recentQRCodes" class="dashboard-qr-codes">
                                <p class="no-data">No QR codes generated yet</p>
                            </div>
                        </div>

                        <!-- Adstara Banner 3 -->
                        <div class="ad-container ad-dashboard-3">
                            <!-- add ads here - Dashboard Ad Banner 728x90 #3 -->
                            <div class="ad-placeholder">
                                <p>Adstara Banner 728x90 - Bottom Section</p>
                                <small>Position: Bottom of Dashboard</small>
                            </div>
                        </div>

                        <!-- Analytics Chart -->
                        <div class="dashboard-section">
                            <h3>📈 Click Analytics (Last 7 Days)</h3>
                            <div class="chart-container">
                                <canvas id="analyticsChart" width="400" height="200"></canvas>
                                <div class="chart-placeholder">
                                    <p>📊 Analytics chart will appear here</p>
                                    <small>Track your link performance over time</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', dashboardHTML);
        this.dashboardModal = document.getElementById('dashboardModal');
    }

    bindEvents() {
        // Bind login/signup buttons from main navigation
        const loginBtn = document.querySelector('a[href="#login"]');
        const signupBtn = document.querySelector('a[href="#signup"]');
        const dashboardBtn = document.querySelector('a[href="#dashboard"]');

        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('login');
            });
        }

        if (signupBtn) {
            signupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('signup');
            });
        }

        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDashboard();
            });
        }
    }

    showModal(tab = 'login') {
        if (!this.authModal) return;

        this.switchTab(tab);
        this.authModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        if (!this.authModal) return;

        this.authModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.clearForms();
    }

    showDashboard() {
        if (!this.isLoggedIn) {
            alert('Please login to access your dashboard');
            this.showModal('login');
            return;
        }

        if (!this.dashboardModal) return;

        this.updateDashboardData();
        this.dashboardModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideDashboard() {
        if (!this.dashboardModal) return;

        this.dashboardModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    switchTab(tab) {
        const loginTab = document.querySelector('.auth-tab:nth-child(1)');
        const signupTab = document.querySelector('.auth-tab:nth-child(2)');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');

        if (tab === 'login') {
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
        } else {
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
            signupForm.classList.add('active');
            loginForm.classList.remove('active');
        }
    }

    async handleLogin(event) {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const submitBtn = event.target.querySelector('.auth-btn');

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loader').style.display = 'inline';

        try {
            // Simulate API call (in production, this would be a real API)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create user session (demo)
            this.currentUser = {
                id: 'user_' + Date.now(),
                email: email,
                name: email.split('@')[0],
                createdAt: new Date().toISOString(),
                plan: 'free'
            };

            this.isLoggedIn = true;

            if (rememberMe) {
                localStorage.setItem('infinityqr_user', JSON.stringify(this.currentUser));
            }

            this.hideModal();
            this.updateUIForLoggedInUser();
            alert(`Welcome back, ${this.currentUser.name}! 🎉`);

        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').style.display = 'inline';
            submitBtn.querySelector('.btn-loader').style.display = 'none';
        }
    }

    async handleSignup(event) {
        event.preventDefault();

        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const submitBtn = event.target.querySelector('.auth-btn');

        // Validate passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loader').style.display = 'inline';

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Create user session
            this.currentUser = {
                id: 'user_' + Date.now(),
                email: email,
                name: name,
                createdAt: new Date().toISOString(),
                plan: 'free'
            };

            this.isLoggedIn = true;
            localStorage.setItem('infinityqr_user', JSON.stringify(this.currentUser));

            this.hideModal();
            this.updateUIForLoggedInUser();
            alert(`Welcome to InfinityQR URL, ${name}! 🎉`);

        } catch (error) {
            console.error('Signup error:', error);
            alert('Signup failed. Please try again.');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').style.display = 'inline';
            submitBtn.querySelector('.btn-loader').style.display = 'none';
        }
    }

    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        localStorage.removeItem('infinityqr_user');
        this.hideDashboard();
        this.updateUIForLoggedOutUser();
        alert('You have been logged out successfully.');
    }

    updateUIForLoggedInUser() {
        // Update navigation to show logged in state
        const loginLink = document.querySelector('a[href="#login"]');
        const signupLink = document.querySelector('a[href="#signup"]');
        const dashboardLink = document.querySelector('a[href="#dashboard"]');

        if (loginLink) loginLink.style.display = 'none';
        if (signupLink) signupLink.style.display = 'none';
        if (dashboardLink) dashboardLink.style.display = 'inline-block';

        // Add user info to header
        const headerNav = document.querySelector('.nav-menu');
        if (headerNav && this.currentUser) {
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            userInfo.innerHTML = `
                <span class="user-name">👤 ${this.currentUser.name}</span>
            `;
            headerNav.appendChild(userInfo);
        }
    }

    updateUIForLoggedOutUser() {
        // Reset navigation
        const loginLink = document.querySelector('a[href="#login"]');
        const signupLink = document.querySelector('a[href="#signup"]');
        const dashboardLink = document.querySelector('a[href="#dashboard"]');

        if (loginLink) loginLink.style.display = 'inline-block';
        if (signupLink) signupLink.style.display = 'inline-block';
        if (dashboardLink) dashboardLink.style.display = 'inline-block';

        // Remove user info
        const userInfo = document.querySelector('.user-info');
        if (userInfo) userInfo.remove();
    }

    updateDashboardData() {
        if (!this.currentUser) return;

        // Update user email
        const userEmail = document.getElementById('dashboardUserEmail');
        if (userEmail) {
            userEmail.textContent = this.currentUser.email;
        }

        // Get data from localStorage
        const urlHistory = JSON.parse(localStorage.getItem('infinityqr_url_history') || '[]');
        const qrHistory = JSON.parse(localStorage.getItem('infinityqr_qr_history') || '[]');

        // Update stats
        document.getElementById('totalUrls').textContent = urlHistory.length;
        document.getElementById('totalQRCodes').textContent = qrHistory.length;

        // Calculate total clicks (simulate)
        const totalClicks = urlHistory.reduce((sum, item) => sum + (item.clicks || 0), 0);
        document.getElementById('totalClicks').textContent = totalClicks;

        // Calculate conversion rate
        const conversionRate = totalClicks > 0 ? Math.round((totalClicks / (urlHistory.length + qrHistory.length)) * 100) : 0;
        document.getElementById('conversionRate').textContent = conversionRate + '%';

        // Update recent links
        this.updateRecentLinks(urlHistory.slice(0, 5));

        // Update recent QR codes
        this.updateRecentQRCodes(qrHistory.slice(0, 5));

        // Update chart (simple implementation)
        this.updateAnalyticsChart();
    }

    updateRecentLinks(links) {
        const container = document.getElementById('recentLinks');
        if (!container) return;

        if (links.length === 0) {
            container.innerHTML = '<p class="no-data">No links created yet</p>';
            return;
        }

        const linksHTML = links.map(link => `
            <div class="dashboard-link-item">
                <div class="link-info">
                    <strong>${link.shortUrl}</strong>
                    <br>
                    <small>${link.longUrl}</small>
                </div>
                <div class="link-stats">
                    <span>👁️ ${link.clicks || 0} clicks</span>
                    <span>📅 ${new Date(link.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = linksHTML;
    }

    updateRecentQRCodes(qrCodes) {
        const container = document.getElementById('recentQRCodes');
        if (!container) return;

        if (qrCodes.length === 0) {
            container.innerHTML = '<p class="no-data">No QR codes generated yet</p>';
            return;
        }

        const qrHTML = qrCodes.map(qr => `
            <div class="dashboard-qr-item">
                <div class="qr-info">
                    <strong>${qr.url || 'Unknown'}</strong>
                    <br>
                    <small>${qr.size || '300'}x${qr.size || '300'} ${qr.format || 'PNG'}</small>
                </div>
                <div class="qr-stats">
                    <span>📅 ${new Date(qr.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = qrHTML;
    }

    updateAnalyticsChart() {
        // Simple chart placeholder - in production, you'd use Chart.js or similar
        const chartContainer = document.querySelector('.chart-placeholder');
        if (chartContainer) {
            const last7Days = [];
            const today = new Date();

            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                last7Days.push(date.toLocaleDateString('en', { weekday: 'short' }));
            }

            // Generate random data for demo
            const randomData = last7Days.map(() => Math.floor(Math.random() * 50) + 10);

            chartContainer.innerHTML = `
                <div class="simple-chart">
                    <div class="chart-bars">
                        ${last7Days.map((day, index) => `
                            <div class="chart-bar-container">
                                <div class="chart-bar" style="height: ${randomData[index]}%"></div>
                                <div class="chart-label">${day}</div>
                            </div>
                        `).join('')}
                    </div>
                    <p>📊 Clicks per day: ${randomData.join(', ')}</p>
                </div>
            `;
        }
    }

    clearForms() {
        // Clear all form inputs
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => {
            form.reset();
        });
    }

    // Public methods
    getCurrentUser() {
        return this.currentUser;
    }

    isUserLoggedIn() {
        return this.isLoggedIn;
    }
}

// Initialize auth system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
    console.log('✅ Auth system loaded and ready');
});

// Add styles for authentication system
const authCSS = `
<style>
.auth-modal {
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

.auth-modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.auth-modal-content {
    background: var(--card-bg, #252525);
    border-radius: 16px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    border: 1px solid var(--border-color, #333);
}

.auth-modal-close {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    color: var(--text-secondary, #ccc);
    font-size: 28px;
    cursor: pointer;
    padding: 5px;
    z-index: 1;
}

.auth-tabs {
    display: flex;
    border-bottom: 1px solid var(--border-color, #333);
    margin-bottom: 30px;
}

.auth-tab {
    flex: 1;
    padding: 20px;
    background: none;
    border: none;
    color: var(--text-secondary, #ccc);
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s ease;
    border-bottom: 3px solid transparent;
}

.auth-tab.active {
    color: var(--accent-primary, #00ff88);
    border-bottom-color: var(--accent-primary, #00ff88);
}

.auth-form {
    padding: 0 40px 40px;
    display: none;
}

.auth-form.active {
    display: block;
}

.auth-form h2 {
    color: var(--text-primary, #fff);
    margin-bottom: 10px;
    text-align: center;
}

.auth-subtitle {
    color: var(--text-secondary, #ccc);
    text-align: center;
    margin-bottom: 30px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    color: var(--text-primary, #fff);
    margin-bottom: 8px;
    font-weight: 500;
}

.form-group input[type="email"],
.form-group input[type="text"],
.form-group input[type="password"] {
    width: 100%;
    padding: 12px 16px;
    background: var(--secondary-bg, #1a1a1a);
    border: 1px solid var(--border-color, #333);
    border-radius: 8px;
    color: var(--text-primary, #fff);
    font-size: 16px;
    transition: all 0.3s ease;
}

.form-group input:focus {
    outline: none;
    border-color: var(--accent-primary, #00ff88);
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
}

.checkbox-group {
    margin-bottom: 25px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    color: var(--text-primary, #fff);
    cursor: pointer;
    font-size: 14px;
}

.checkbox-label input[type="checkbox"] {
    margin-right: 10px;
}

.auth-btn {
    width: 100%;
    padding: 14px 24px;
    background: var(--accent-primary, #00ff88);
    color: var(--primary-bg, #0a0a0a);
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.auth-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
}

.auth-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.auth-footer {
    text-align: center;
    margin-top: 20px;
    color: var(--text-secondary, #ccc);
}

.auth-footer a {
    color: var(--accent-primary, #00ff88);
    text-decoration: none;
}

.auth-footer a:hover {
    text-decoration: underline;
}

/* Dashboard Styles */
.dashboard-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
}

.dashboard-modal-content {
    background: var(--card-bg, #252525);
    border-radius: 16px;
    max-width: 1200px;
    width: 95%;
    max-height: 95vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    border: 1px solid var(--border-color, #333);
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30px 40px;
    border-bottom: 1px solid var(--border-color, #333);
}

.dashboard-header h2 {
    color: var(--text-primary, #fff);
    margin: 0;
}

.dashboard-user-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.dashboard-close {
    background: none;
    border: none;
    color: var(--text-secondary, #ccc);
    font-size: 28px;
    cursor: pointer;
    padding: 5px;
}

.dashboard-content {
    padding: 40px;
}

.ad-dashboard-1, .ad-dashboard-2, .ad-dashboard-3 {
    margin: 20px 0;
    padding: 20px;
    background: var(--secondary-bg, #1a1a1a);
    border: 1px solid var(--border-color, #333);
    border-radius: 8px;
    text-align: center;
}

.dashboard-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 30px 0;
}

.stat-card {
    background: var(--secondary-bg, #1a1a1a);
    padding: 25px;
    border-radius: 12px;
    border: 1px solid var(--border-color, #333);
    display: flex;
    align-items: center;
    gap: 15px;
}

.stat-icon {
    font-size: 32px;
}

.stat-content h3 {
    color: var(--accent-primary, #00ff88);
    font-size: 28px;
    margin: 0;
}

.stat-content p {
    color: var(--text-secondary, #ccc);
    margin: 5px 0 0 0;
}

.dashboard-section {
    margin: 40px 0;
}

.dashboard-section h3 {
    color: var(--text-primary, #fff);
    margin-bottom: 20px;
}

.dashboard-link-item,
.dashboard-qr-item {
    background: var(--secondary-bg, #1a1a1a);
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 10px;
    border: 1px solid var(--border-color, #333);
}

.dashboard-link-item strong,
.dashboard-qr-item strong {
    color: var(--accent-primary, #00ff88);
}

.dashboard-link-item small,
.dashboard-qr-item small {
    color: var(--text-secondary, #ccc);
}

.link-stats,
.qr-stats {
    margin-top: 10px;
    display: flex;
    gap: 20px;
}

.link-stats span,
.qr-stats span {
    color: var(--text-secondary, #ccc);
    font-size: 14px;
}

.chart-container {
    background: var(--secondary-bg, #1a1a1a);
    padding: 30px;
    border-radius: 12px;
    border: 1px solid var(--border-color, #333);
}

.simple-chart {
    text-align: center;
}

.chart-bars {
    display: flex;
    justify-content: space-between;
    align-items: end;
    height: 200px;
    margin-bottom: 20px;
}

.chart-bar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
}

.chart-bar {
    width: 30px;
    background: var(--accent-primary, #00ff88);
    border-radius: 4px 4px 0 0;
    min-height: 10px;
    transition: height 0.3s ease;
}

.chart-label {
    color: var(--text-secondary, #ccc);
    font-size: 12px;
    margin-top: 10px;
}

.no-data {
    color: var(--text-secondary, #ccc);
    font-style: italic;
    text-align: center;
    padding: 20px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--text-primary, #fff);
    padding: 10px 15px;
    background: var(--secondary-bg, #1a1a1a);
    border-radius: 8px;
    margin-left: 15px;
}

.user-name {
    font-weight: 500;
}

@media (max-width: 768px) {
    .auth-modal-content,
    .dashboard-modal-content {
        width: 95%;
        margin: 20px;
    }

    .dashboard-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }

    .dashboard-stats {
        grid-template-columns: repeat(2, 1fr);
    }

    .dashboard-content {
        padding: 20px;
    }

    .chart-bars {
        height: 150px;
    }

    .chart-bar {
        width: 20px;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', authCSS);

// Global functions for onclick handlers
window.showLoginModal = () => window.authSystem?.showModal('login');
window.showSignupModal = () => window.authSystem?.showModal('signup');
window.showDashboard = () => window.authSystem?.showDashboard();
window.hideAuthModal = () => window.authSystem?.hideModal();
window.hideDashboardModal = () => window.authSystem?.hideDashboard();