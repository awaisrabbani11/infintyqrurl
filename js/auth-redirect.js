// Authentication Redirect Script for InfinityQR URL
// Forces redirect of login/signup buttons to dedicated pages

console.log('🔄 Loading authentication redirect system...');

class AuthRedirect {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindEvents());
        } else {
            this.bindEvents();
        }

        // Check for URL parameters
        this.checkURLParams();

        console.log('✅ Auth redirect system initialized');
    }

    bindEvents() {
        // Find all login/signup buttons and force redirect
        const loginButtons = document.querySelectorAll('a[href="#login"], .login-btn, #loginBtn');
        const signupButtons = document.querySelectorAll('a[href="#signup"], .signup-btn, #signupBtn');

        console.log(`Found ${loginButtons.length} login buttons, ${signupButtons.length} signup buttons`);

        // Force redirect login buttons
        loginButtons.forEach((btn, index) => {
            // Remove all event listeners and force redirect
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`🔐 Login button ${index + 1} clicked - redirecting to login page`);
                window.location.href = 'login.html';
            });
        });

        // Force redirect signup buttons
        signupButtons.forEach((btn, index) => {
            // Remove all event listeners and force redirect
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`📝 Signup button ${index + 1} clicked - redirecting to signup page`);
                window.location.href = 'signup.html';
            });
        });

        // Handle dashboard button
        const dashboardButtons = document.querySelectorAll('a[href="#dashboard"], .dashboard-btn, #dashboardBtn');
        dashboardButtons.forEach((btn, index) => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`📊 Dashboard button ${index + 1} clicked`);

                if (this.isLoggedIn()) {
                    this.showDashboard();
                } else {
                    window.location.href = 'login.html';
                }
            });
        });

        console.log('✅ Button redirects bound successfully');
    }

    checkURLParams() {
        const urlParams = new URLSearchParams(window.location.search);

        if (urlParams.get('showDashboard') === 'true') {
            if (this.isLoggedIn()) {
                setTimeout(() => this.showDashboard(), 500);
            }
        }
    }

    isLoggedIn() {
        return localStorage.getItem('currentUser') !== null;
    }

    showDashboard() {
        // Directly create simple dashboard (authSystem was removed)
        this.createSimpleDashboard();
    }

    createSimpleDashboard() {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

        const modalHTML = `
            <div id="simpleDashboardModal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            ">
                <div style="
                    background: #252525;
                    padding: 40px;
                    border-radius: 16px;
                    max-width: 800px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    border: 1px solid #333;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                        <h2 style="color: #fff; margin: 0;">📊 Dashboard</h2>
                        <div style="display: flex; gap: 15px; align-items: center;">
                            <span style="color: #00ff88;">👤 ${user.name || 'User'}</span>
                            <button onclick="document.getElementById('simpleDashboardModal').remove()" style="background: #333; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">×</button>
                            <button onclick="authRedirect.logout()" style="background: #ff4444; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Logout</button>
                        </div>
                    </div>

                    <!-- Adstara Banner 1 -->
                    <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; border: 1px solid #333;">
                        <p style="color: #00ff88; margin: 0;">Adstara Banner 728x90 - Dashboard Top</p>
                        <small style="color: #ccc;">Position: Top of Dashboard</small>
                    </div>

                    <!-- User Stats -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #333;">
                            <h3 style="color: #00ff88; margin: 0; font-size: 24px;">🔗 ${this.getUserStats().totalUrls}</h3>
                            <p style="color: #ccc; margin: 5px 0 0 0;">Total URLs</p>
                        </div>
                        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #333;">
                            <h3 style="color: #00ff88; margin: 0; font-size: 24px;">📈 ${this.getUserStats().totalClicks}</h3>
                            <p style="color: #ccc; margin: 5px 0 0 0;">Total Clicks</p>
                        </div>
                        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #333;">
                            <h3 style="color: #00ff88; margin: 0; font-size: 24px;">📱 ${this.getUserStats().totalQRCodes}</h3>
                            <p style="color: #ccc; margin: 5px 0 0 0;">QR Codes</p>
                        </div>
                        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #333;">
                            <h3 style="color: #00ff88; margin: 0; font-size: 24px;">📊 ${this.getUserStats().conversionRate}%</h3>
                            <p style="color: #ccc; margin: 5px 0 0 0;">Click Rate</p>
                        </div>
                    </div>

                    <!-- Adstara Banner 2 -->
                    <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; border: 1px solid #333;">
                        <p style="color: #00ff88; margin: 0;">Adstara Banner 728x90 - Dashboard Middle</p>
                        <small style="color: #ccc;">Position: Between Stats and Recent Links</small>
                    </div>

                    <h3 style="color: #fff;">🔗 Recent Links</h3>
                    <div id="recentLinks" style="margin-bottom: 30px;">
                        <p style="color: #ccc; text-align: center; padding: 20px;">Loading recent links...</p>
                    </div>

                    <h3 style="color: #fff;">📱 Recent QR Codes</h3>
                    <div id="recentQRCodes">
                        <p style="color: #ccc; text-align: center; padding: 20px;">Loading recent QR codes...</p>
                    </div>

                    <!-- Adstara Banner 3 -->
                    <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin-top: 30px; text-align: center; border: 1px solid #333;">
                        <p style="color: #00ff88; margin: 0;">Adstara Banner 728x90 - Dashboard Bottom</p>
                        <small style="color: #ccc;">Position: Bottom of Dashboard</small>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.loadDashboardData();
    }

    getUserStats() {
        const links = JSON.parse(localStorage.getItem('infinityqr_url_history') || '[]');
        const qrCodes = JSON.parse(localStorage.getItem('infinityqr_qr_history') || '[]');

        const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
        const totalItems = links.length + qrCodes.length;
        const conversionRate = totalItems > 0 ? Math.round((totalClicks / totalItems) * 100) : 0;

        return {
            totalUrls: links.length,
            totalQRCodes: qrCodes.length,
            totalClicks: totalClicks,
            conversionRate: conversionRate
        };
    }

    loadDashboardData() {
        const links = JSON.parse(localStorage.getItem('infinityqr_url_history') || '[]');
        const qrCodes = JSON.parse(localStorage.getItem('infinityqr_qr_history') || '[]');

        // Load recent links
        const linksContainer = document.getElementById('recentLinks');
        if (linksContainer && links.length > 0) {
            const linksHTML = links.slice(0, 5).map(link => `
                <div style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #333;">
                    <div style="color: #00ff88; font-weight: bold;">${link.shortUrl}</div>
                    <div style="color: #ccc; font-size: 14px; margin: 5px 0;">${link.longUrl}</div>
                    <div style="color: #888; font-size: 12px;">👁️ ${link.clicks || 0} clicks • 📅 ${new Date(link.createdAt).toLocaleDateString()}</div>
                </div>
            `).join('');
            linksContainer.innerHTML = linksHTML;
        }

        // Load recent QR codes
        const qrContainer = document.getElementById('recentQRCodes');
        if (qrContainer && qrCodes.length > 0) {
            const qrHTML = qrCodes.slice(0, 5).map(qr => `
                <div style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #333;">
                    <div style="color: #00ff88; font-weight: bold;">QR Code</div>
                    <div style="color: #ccc; font-size: 14px; margin: 5px 0;">${qr.url || 'Unknown URL'}</div>
                    <div style="color: #888; font-size: 12px;">📅 ${new Date(qr.createdAt).toLocaleDateString()}</div>
                </div>
            `).join('');
            qrContainer.innerHTML = qrHTML;
        }
    }

    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('rememberMe');

        // Close modal if open
        const modal = document.getElementById('simpleDashboardModal');
        if (modal) {
            modal.remove();
        }

        alert('You have been logged out successfully.');
        window.location.href = 'index.html';
    }
}

// Initialize auth redirect system
window.addEventListener('DOMContentLoaded', () => {
    window.authRedirect = new AuthRedirect();
});

// Global functions for direct use
window.showLogin = () => {
    window.location.href = 'login.html';
};

window.showSignup = () => {
    window.location.href = 'signup.html';
};

window.showDashboard = () => {
    if (window.authRedirect) {
        window.authRedirect.showDashboard();
    }
};

window.logout = () => {
    if (window.authRedirect) {
        window.authRedirect.logout();
    }
};