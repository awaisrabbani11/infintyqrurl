// Data Management System for InfinityQR URL
// Handles persistent storage of users, links, QR codes, and analytics

console.log('💾 Loading data management system...');

class DataManager {
    constructor() {
        this.dataFolder = 'data';
        this.initializeDataStructure();
        this.bindDirectButtonEvents();
        console.log('✅ Data manager initialized');
    }

    initializeDataStructure() {
        // Create initial data structure if it doesn't exist
        if (!localStorage.getItem('infinityqr_users')) {
            const initialData = {
                users: [],
                links: [],
                qrCodes: [],
                analytics: []
            };
            localStorage.setItem('infinityqr_users', JSON.stringify(initialData));
        }
    }

    // User Management
    async createUser(userData) {
        const users = await this.getUsers();

        // Check if user already exists
        if (users.find(u => u.email === userData.email)) {
            throw new Error('User with this email already exists');
        }

        const newUser = {
            id: 'user_' + Date.now(),
            email: userData.email,
            name: userData.name,
            password: this.hashPassword(userData.password), // Simple hashing for demo
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            plan: 'free',
            stats: {
                totalUrls: 0,
                totalQRCodes: 0,
                totalClicks: 0
            }
        };

        users.push(newUser);
        await this.saveUsers(users);
        return newUser;
    }

    async authenticateUser(email, password) {
        const users = await this.getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            throw new Error('User not found');
        }

        if (!this.verifyPassword(password, user.password)) {
            throw new Error('Invalid password');
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        await this.saveUsers(users);

        return user;
    }

    async getUser(userId) {
        const users = await this.getUsers();
        return users.find(u => u.id === userId);
    }

    // Link Management
    async createLink(userId, linkData) {
        const links = await this.getLinks();

        const newLink = {
            id: 'link_' + Date.now(),
            userId: userId,
            longUrl: linkData.longUrl,
            shortUrl: linkData.shortUrl,
            shortCode: linkData.shortCode,
            customAlias: linkData.customAlias || null,
            createdAt: new Date().toISOString(),
            clicks: 0,
            clicksData: [], // Daily click tracking
            isActive: true
        };

        links.push(newLink);
        await this.saveLinks(links);

        // Update user stats
        await this.updateUserStats(userId, { totalUrls: 1 });

        return newLink;
    }

    async recordLinkClick(linkId) {
        const links = await this.getLinks();
        const link = links.find(l => l.id === linkId);

        if (link) {
            link.clicks++;
            link.clicksData.push({
                timestamp: new Date().toISOString(),
                date: new Date().toISOString().split('T')[0]
            });

            await this.saveLinks(links);

            // Update user stats
            await this.updateUserStats(link.userId, { totalClicks: 1 });

            return link;
        }
        return null;
    }

    async getLinksByUser(userId) {
        const links = await this.getLinks();
        return links.filter(l => l.userId === userId && l.isActive);
    }

    // QR Code Management
    async createQRCode(userId, qrData) {
        const qrCodes = await this.getQRCodes();

        const newQRCode = {
            id: 'qr_' + Date.now(),
            userId: userId,
            url: qrData.url,
            size: qrData.size,
            format: qrData.format,
            imageData: qrData.imageData,
            createdAt: new Date().toISOString(),
            downloads: 0
        };

        qrCodes.push(newQRCode);
        await this.saveQRCodes(qrCodes);

        // Update user stats
        await this.updateUserStats(userId, { totalQRCodes: 1 });

        return newQRCode;
    }

    async getQRCodesByUser(userId) {
        const qrCodes = await this.getQRCodes();
        return qrCodes.filter(q => q.userId === userId);
    }

    // Analytics
    async getUserAnalytics(userId, days = 7) {
        const links = await this.getLinksByUser(userId);
        const qrCodes = await this.getQRCodesByUser(userId);

        const analytics = {
            totalUrls: links.length,
            totalQRCodes: qrCodes.length,
            totalClicks: links.reduce((sum, link) => sum + link.clicks, 0),
            dailyClicks: this.getDailyClicks(links, days),
            topLinks: links.sort((a, b) => b.clicks - a.clicks).slice(0, 5),
            recentActivity: this.getRecentActivity(links, qrCodes)
        };

        return analytics;
    }

    getDailyClicks(links, days) {
        const dailyData = {};
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dailyData[dateStr] = 0;
        }

        links.forEach(link => {
            link.clicksData.forEach(click => {
                if (dailyData.hasOwnProperty(click.date)) {
                    dailyData[click.date]++;
                }
            });
        });

        return dailyData;
    }

    getRecentActivity(links, qrCodes, limit = 10) {
        const allActivity = [
            ...links.map(l => ({ ...l, type: 'link' })),
            ...qrCodes.map(q => ({ ...q, type: 'qr' }))
        ];

        return allActivity
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }

    // Private helper methods
    async getUsers() {
        const data = localStorage.getItem('infinityqr_users');
        return data ? JSON.parse(data).users || [] : [];
    }

    async saveUsers(users) {
        const currentData = JSON.parse(localStorage.getItem('infinityqr_users') || '{}');
        currentData.users = users;
        localStorage.setItem('infinityqr_users', JSON.stringify(currentData));
    }

    async getLinks() {
        const data = localStorage.getItem('infinityqr_users');
        return data ? JSON.parse(data).links || [] : [];
    }

    async saveLinks(links) {
        const currentData = JSON.parse(localStorage.getItem('infinityqr_users') || '{}');
        currentData.links = links;
        localStorage.setItem('infinityqr_users', JSON.stringify(currentData));
    }

    async getQRCodes() {
        const data = localStorage.getItem('infinityqr_users');
        return data ? JSON.parse(data).qrCodes || [] : [];
    }

    async saveQRCodes(qrCodes) {
        const currentData = JSON.parse(localStorage.getItem('infinityqr_users') || '{}');
        currentData.qrCodes = qrCodes;
        localStorage.setItem('infinityqr_users', JSON.stringify(currentData));
    }

    async updateUserStats(userId, increment) {
        const users = await this.getUsers();
        const user = users.find(u => u.id === userId);

        if (user) {
            Object.keys(increment).forEach(key => {
                user.stats[key] = (user.stats[key] || 0) + increment[key];
            });
            await this.saveUsers(users);
        }
    }

    // Simple password hashing (for demo purposes)
    hashPassword(password) {
        // In production, use a proper hashing library
        return btoa(password + '_infinityqr_salt');
    }

    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }

    // Bind direct button events to fix authentication issues
    bindDirectButtonEvents() {
        console.log('🔧 Binding direct button events...');

        // Wait for DOM to be ready
        const bindEvents = () => {
            // Find all login/signup buttons
            const loginButtons = document.querySelectorAll('a[href="#login"], .login-btn');
            const signupButtons = document.querySelectorAll('a[href="#signup"], .signup-btn');
            const dashboardButtons = document.querySelectorAll('a[href="#dashboard"], .dashboard-btn');

            console.log(`Found ${loginButtons.length} login buttons, ${signupButtons.length} signup buttons, ${dashboardButtons.length} dashboard buttons`);

            // Bind login buttons
            loginButtons.forEach((btn, index) => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log(`🔐 Login button ${index + 1} clicked!`);
                    this.showLoginModal();
                });
            });

            // Bind signup buttons
            signupButtons.forEach((btn, index) => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log(`📝 Signup button ${index + 1} clicked!`);
                    this.showSignupModal();
                });
            });

            // Bind dashboard buttons
            dashboardButtons.forEach((btn, index) => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log(`📊 Dashboard button ${index + 1} clicked!`);
                    this.showDashboard();
                });
            });

            console.log('✅ Button events bound successfully');
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bindEvents);
        } else {
            bindEvents();
        }

        // Also bind events after a short delay to catch dynamically loaded elements
        setTimeout(bindEvents, 1000);
    }

    showLoginModal() {
        if (window.authSystem) {
            window.authSystem.showModal('login');
        } else {
            // Fallback: create simple login modal
            this.createSimpleModal('login');
        }
    }

    showSignupModal() {
        if (window.authSystem) {
            window.authSystem.showModal('signup');
        } else {
            // Fallback: create simple signup modal
            this.createSimpleModal('signup');
        }
    }

    showDashboard() {
        if (window.authSystem) {
            window.authSystem.showDashboard();
        } else {
            alert('Please login first to access your dashboard');
            this.showLoginModal();
        }
    }

    createSimpleModal(type) {
        // Simple fallback modal if authSystem isn't loaded
        const existingModal = document.getElementById('simpleAuthModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div id="simpleAuthModal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            ">
                <div style="
                    background: #252525;
                    padding: 40px;
                    border-radius: 16px;
                    max-width: 400px;
                    width: 90%;
                    border: 1px solid #333;
                ">
                    <h3 style="color: #fff; margin-bottom: 20px;">
                        ${type === 'login' ? 'Login' : 'Sign Up'}
                    </h3>
                    <form onsubmit="dataManager.handleSimpleAuth(event, '${type}')">
                        <div style="margin-bottom: 15px;">
                            <label style="color: #fff; display: block; margin-bottom: 5px;">Email:</label>
                            <input type="email" id="simpleEmail" required style="
                                width: 100%;
                                padding: 10px;
                                background: #1a1a1a;
                                border: 1px solid #333;
                                border-radius: 4px;
                                color: #fff;
                            ">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="color: #fff; display: block; margin-bottom: 5px;">Password:</label>
                            <input type="password" id="simplePassword" required style="
                                width: 100%;
                                padding: 10px;
                                background: #1a1a1a;
                                border: 1px solid #333;
                                border-radius: 4px;
                                color: #fff;
                            ">
                        </div>
                        ${type === 'signup' ? `
                        <div style="margin-bottom: 15px;">
                            <label style="color: #fff; display: block; margin-bottom: 5px;">Name:</label>
                            <input type="text" id="simpleName" required style="
                                width: 100%;
                                padding: 10px;
                                background: #1a1a1a;
                                border: 1px solid #333;
                                border-radius: 4px;
                                color: #fff;
                            ">
                        </div>
                        ` : ''}
                        <button type="submit" style="
                            width: 100%;
                            padding: 12px;
                            background: #00ff88;
                            color: #000;
                            border: none;
                            border-radius: 4px;
                            font-weight: bold;
                            cursor: pointer;
                        ">
                            ${type === 'login' ? 'Login' : 'Sign Up'}
                        </button>
                        <button type="button" onclick="this.closest('#simpleAuthModal').remove()" style="
                            width: 100%;
                            padding: 12px;
                            background: #333;
                            color: #fff;
                            border: none;
                            border-radius: 4px;
                            margin-top: 10px;
                            cursor: pointer;
                        ">
                            Cancel
                        </button>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    async handleSimpleAuth(event, type) {
        event.preventDefault();

        const email = document.getElementById('simpleEmail').value;
        const password = document.getElementById('simplePassword').value;

        try {
            if (type === 'login') {
                const user = await this.authenticateUser(email, password);
                localStorage.setItem('currentUserId', user.id);
                localStorage.setItem('currentUser', JSON.stringify(user));
                alert(`Welcome back, ${user.name}! 🎉`);
                document.getElementById('simpleAuthModal').remove();
                location.reload();
            } else {
                const name = document.getElementById('simpleName').value;
                const user = await this.createUser({ email, password, name });
                localStorage.setItem('currentUserId', user.id);
                localStorage.setItem('currentUser', JSON.stringify(user));
                alert(`Welcome to InfinityQR URL, ${name}! 🎉`);
                document.getElementById('simpleAuthModal').remove();
                location.reload();
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }

    // Get current logged-in user
    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    // Logout user
    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentUserId');
        alert('You have been logged out successfully.');
        location.reload();
    }
}

// Initialize data manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dataManager = new DataManager();
    console.log('✅ Data manager loaded and ready');
});

// Global functions for onclick handlers
window.showLogin = () => window.dataManager?.showLoginModal();
window.showSignup = () => window.dataManager?.showSignupModal();
window.showDashboard = () => window.dataManager?.showDashboard();
window.logoutUser = () => window.dataManager?.logout();