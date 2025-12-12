// PWA Installation Manager
class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    init() {
        this.checkInstallation();
        this.setupEventListeners();
        this.createInstallButton();
    }

    checkInstallation() {
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('✅ PWA is installed');
        }
    }

    setupEventListeners() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('📱 PWA install prompt available');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed successfully');
            this.isInstalled = true;
            this.hideInstallButton();
            this.showInstallSuccess();
        });

        // Listen for service worker updates
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('🔄 Service Worker updated');
                this.showUpdateNotification();
            });
        }
    }

    createInstallButton() {
        // Create install button
        const installButton = document.createElement('div');
        installButton.id = 'pwaInstallButton';
        installButton.className = 'pwa-install-button hidden';
        installButton.innerHTML = `
            <div class="install-content">
                <div class="install-icon">📱</div>
                <div class="install-text">
                    <h4>Install JobLens</h4>
                    <p>Get the app for faster access and offline use</p>
                </div>
                <button class="install-btn" id="installBtn">Install</button>
                <button class="close-install" id="closeInstall">×</button>
            </div>
        `;

        // Add styles
        this.addInstallStyles();
        
        // Add to body
        document.body.appendChild(installButton);
        
        // Setup button events
        document.getElementById('installBtn').addEventListener('click', () => this.installApp());
        document.getElementById('closeInstall').addEventListener('click', () => this.hideInstallButton());
    }

    addInstallStyles() {
        const styles = `
            .pwa-install-button {
                position: fixed;
                bottom: 80px;
                left: 20px;
                right: 20px;
                z-index: 999;
                background: linear-gradient(135deg, var(--primary-green), var(--neon-green));
                color: white;
                border-radius: 16px;
                box-shadow: 0 8px 30px rgba(46, 204, 113, 0.4);
                transition: all 0.3s ease;
                transform: translateY(100px);
                opacity: 0;
            }
            
            .pwa-install-button.show {
                transform: translateY(0);
                opacity: 1;
            }
            
            .pwa-install-button.hidden {
                display: none;
            }
            
            .install-content {
                display: flex;
                align-items: center;
                padding: 1rem 1.5rem;
                gap: 1rem;
                position: relative;
            }
            
            .install-icon {
                font-size: 2rem;
                flex-shrink: 0;
            }
            
            .install-text {
                flex: 1;
            }
            
            .install-text h4 {
                margin: 0 0 0.25rem 0;
                font-size: 1.1rem;
                font-weight: 700;
            }
            
            .install-text p {
                margin: 0;
                font-size: 0.9rem;
                opacity: 0.9;
            }
            
            .install-btn {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 2px solid rgba(255, 255, 255, 0.3);
                padding: 0.5rem 1rem;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                flex-shrink: 0;
            }
            
            .install-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                border-color: rgba(255, 255, 255, 0.5);
                transform: scale(1.05);
            }
            
            .close-install {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.3s ease;
            }
            
            .close-install:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            @media (max-width: 768px) {
                .pwa-install-button {
                    bottom: 90px;
                    left: 10px;
                    right: 10px;
                }
                
                .install-content {
                    padding: 1rem;
                    gap: 0.75rem;
                }
                
                .install-text h4 {
                    font-size: 1rem;
                }
                
                .install-text p {
                    font-size: 0.8rem;
                }
                
                .install-btn {
                    padding: 0.4rem 0.8rem;
                    font-size: 0.9rem;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    showInstallButton() {
        if (this.isInstalled) return;
        
        const installButton = document.getElementById('pwaInstallButton');
        if (installButton) {
            installButton.classList.remove('hidden');
            setTimeout(() => {
                installButton.classList.add('show');
            }, 100);
        }
    }

    hideInstallButton() {
        const installButton = document.getElementById('pwaInstallButton');
        if (installButton) {
            installButton.classList.remove('show');
            setTimeout(() => {
                installButton.classList.add('hidden');
            }, 300);
        }
    }

    async installApp() {
        if (!this.deferredPrompt) {
            console.log('❌ No install prompt available');
            return;
        }

        try {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            // Wait for user response
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('✅ User accepted PWA install');
            } else {
                console.log('❌ User dismissed PWA install');
            }
            
            // Clear the prompt
            this.deferredPrompt = null;
            this.hideInstallButton();
            
        } catch (error) {
            console.error('❌ PWA install failed:', error);
        }
    }

    showInstallSuccess() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            right: 20px;
            z-index: 1001;
            background: linear-gradient(135deg, #d4edda, #c3e6cb);
            color: #155724;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideDown 0.3s ease-out;
        `;
        notification.innerHTML = `
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🎉</div>
            <div><strong>JobLens Installed!</strong></div>
            <div style="font-size: 0.9rem; opacity: 0.8;">You can now access JobLens from your home screen</div>
        `;
        
        const keyframes = `
            @keyframes slideDown {
                from { transform: translateY(-100px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = keyframes;
        document.head.appendChild(styleSheet);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1001;
            background: linear-gradient(135deg, #fff3cd, #ffeaa7);
            color: #856404;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
        `;
        notification.innerHTML = `
            <div><strong>🔄 App Updated!</strong></div>
            <div style="font-size: 0.9rem; margin-top: 0.25rem;">Refresh to get the latest features</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Check if device supports PWA installation
    static isInstallSupported() {
        return 'serviceWorker' in navigator && 
               'BeforeInstallPromptEvent' in window;
    }

    // Manual trigger for install prompt (for custom buttons)
    triggerInstall() {
        if (this.deferredPrompt) {
            this.installApp();
        } else {
            console.log('❌ No install prompt available');
        }
    }
}

// Initialize PWA installer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (PWAInstaller.isInstallSupported()) {
        window.pwaInstaller = new PWAInstaller();
    } else {
        console.log('📱 PWA installation not supported on this device');
    }
});

// Export for use in other files
window.PWAInstaller = PWAInstaller;