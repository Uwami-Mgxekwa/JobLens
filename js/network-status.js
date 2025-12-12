// Network Status Manager
class NetworkStatus {
    constructor() {
        this.isOnline = navigator.onLine;
        this.statusIndicator = null;
        this.hasShownInitialStatus = false;
        this.lastKnownStatus = null;
        this.init();
    }

    init() {
        this.createStatusIndicator();
        this.registerServiceWorker();
        this.setupEventListeners();
        // Don't show status on initial load - only on changes
        this.lastKnownStatus = this.isOnline;
    }

    createStatusIndicator() {
        // Create network status indicator
        const indicator = document.createElement('div');
        indicator.id = 'networkStatus';
        indicator.className = 'network-status';
        indicator.innerHTML = `
            <div class="status-content">
                <span class="status-icon"></span>
                <span class="status-text"></span>
            </div>
        `;
        
        // Add styles
        const styles = `
            .network-status {
                position: fixed;
                top: 70px;
                right: 20px;
                z-index: 1000;
                padding: 0.75rem 1.5rem;
                border-radius: 25px;
                font-size: 0.9rem;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: all 0.3s ease;
                transform: translateY(-100px);
                opacity: 0;
            }
            
            .network-status.show {
                transform: translateY(0);
                opacity: 1;
            }
            
            .network-status.online {
                background: linear-gradient(135deg, #d4edda, #c3e6cb);
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            
            .network-status.offline {
                background: linear-gradient(135deg, #f8d7da, #f5c6cb);
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            
            .status-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .status-icon {
                font-size: 1rem;
            }
            
            @media (max-width: 768px) {
                .network-status {
                    top: 60px;
                    right: 10px;
                    left: 10px;
                    text-align: center;
                }
            }
        `;
        
        // Add styles to head
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        
        // Add to body
        document.body.appendChild(indicator);
        this.statusIndicator = indicator;
    }

    setupEventListeners() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            const wasOffline = !this.isOnline;
            this.isOnline = true;
            
            // Only show notification if status actually changed
            if (wasOffline) {
                this.updateStatus();
                this.handleOnline();
            }
        });

        window.addEventListener('offline', () => {
            const wasOnline = this.isOnline;
            this.isOnline = false;
            
            // Only show notification if status actually changed
            if (wasOnline) {
                this.updateStatus();
                this.handleOffline();
            }
        });

        // Listen for service worker messages
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'NETWORK_STATUS_UPDATE') {
                    const previousStatus = this.isOnline;
                    this.isOnline = event.data.online;
                    
                    // Only update if status changed
                    if (previousStatus !== this.isOnline) {
                        this.updateStatus();
                    }
                }
            });
        }
    }

    updateStatus() {
        if (!this.statusIndicator) return;

        const icon = this.statusIndicator.querySelector('.status-icon');
        const text = this.statusIndicator.querySelector('.status-text');
        
        if (this.isOnline) {
            this.statusIndicator.className = 'network-status online show';
            icon.textContent = '🟢';
            text.textContent = 'Back online - Live job data';
            
            // Hide after 4 seconds when back online
            setTimeout(() => {
                this.statusIndicator.classList.remove('show');
            }, 4000);
        } else {
            this.statusIndicator.className = 'network-status offline show';
            icon.textContent = '🔴';
            text.textContent = 'No connection - Showing cached jobs';
            
            // Keep showing while offline (don't auto-hide)
        }
    }

    handleOnline() {
        console.log('🟢 Back online - refreshing job data...');
        
        // Trigger data refresh if on results page
        if (window.location.pathname.includes('results.html')) {
            // Refresh jobs data
            if (typeof loadJobs === 'function') {
                loadJobs();
            }
        }
    }

    handleOffline() {
        console.log('🔴 Gone offline - using cached data...');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const styles = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1001;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: slideIn 0.3s ease-out;
            }
            
            .notification.success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            
            .notification.warning {
                background: #fff3cd;
                color: #856404;
                border: 1px solid #ffeaa7;
            }
            
            .notification.info {
                background: #d1ecf1;
                color: #0c5460;
                border: 1px solid #bee5eb;
            }
            
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        
        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'notification-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }
        
        document.body.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered:', registration);
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    console.log('🔄 Service Worker update found');
                    const newWorker = registration.installing;
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showNotification('🔄 App updated! Refresh to get the latest version.', 'info');
                        }
                    });
                });
                
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }

    // Request notification permission
    async requestNotificationPermission() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                console.log('✅ Notification permission granted');
                return true;
            } else {
                console.log('❌ Notification permission denied');
                return false;
            }
        }
        return false;
    }

    // Show push notification
    showPushNotification(title, options = {}) {
        if ('serviceWorker' in navigator && Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(title, {
                    body: options.body || 'New job matches found!',
                    icon: '/assets/logo.jpeg',
                    badge: '/assets/logo.jpeg',
                    vibrate: [200, 100, 200],
                    data: options.data || { url: '/pages/results.html' },
                    ...options
                });
            });
        }
    }
}

// Initialize network status when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.networkStatus = new NetworkStatus();
});

// Export for use in other files
window.NetworkStatus = NetworkStatus;