// Data Management System for InfinityQR URL
// Handles persistent storage of users, links, QR codes, and analytics

console.log('💾 Loading data management system...');

class DataManager {
    constructor() {
        this.dataFolder = 'data';
        this.initializeDataStructure();
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